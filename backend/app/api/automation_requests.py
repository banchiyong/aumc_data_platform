from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import json
import shutil
import uuid
from pathlib import Path
from pydantic import ValidationError

from app.db.session import get_db
from app.core.deps import get_current_user, get_current_admin_user
from app.models import (
    User,
    AutomationRequest,
    AutomationRequestStatus,
    AutomationRequesterType,
    AutomationServiceType,
    AutomationRequestLog,
    AutomationLogAction,
)
from app.schemas.automation_request import (
    AutomationRequest as AutomationRequestSchema,
    AutomationRequestCreate,
    AutomationRoiSimulationSave,
    AutomationRequestReview,
    AutomationRequestStatusUpdate,
    AutomationRequestWithUser,
)
from app.schemas.history import HistoryItem

router = APIRouter(prefix="/api/automation-requests", tags=["automation-requests"])

KST = timezone(timedelta(hours=9))


def get_korean_time() -> datetime:
    return datetime.now(KST)


def serialize_for_history(value):
    if isinstance(value, datetime):
        return value.isoformat()
    if hasattr(value, "value"):
        return value.value
    if isinstance(value, list):
        return [serialize_for_history(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize_for_history(val) for key, val in value.items()}
    return value


def build_change_details(before: dict, after: dict) -> dict:
    changes = {}
    for key, before_value in before.items():
        after_value = after.get(key)
        if serialize_for_history(before_value) != serialize_for_history(after_value):
            changes[key] = {
                "before": serialize_for_history(before_value),
                "after": serialize_for_history(after_value),
            }
    return changes


def get_safe_filename(original_filename: str, file_type: str) -> str:
    if "." in original_filename:
        ext = original_filename.rsplit(".", 1)[1].lower()
        allowed_extensions = {"pdf", "doc", "docx", "hwp", "ppt", "pptx", "xls", "xlsx"}
        if ext not in allowed_extensions:
            ext = "pdf"
    else:
        ext = "pdf"

    unique_id = str(uuid.uuid4())
    timestamp = get_korean_time().strftime("%Y%m%d_%H%M%S")
    return f"{file_type}_{timestamp}_{unique_id}.{ext}"


def save_uploaded_file(file: UploadFile, request_id: str, file_type: str) -> dict:
    max_file_size = 10 * 1024 * 1024

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > max_file_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="파일 크기가 10MB를 초과했습니다",
        )

    original_filename = file.filename or "document"
    try:
        original_filename = original_filename.encode("latin-1").decode("utf-8")
    except (UnicodeDecodeError, UnicodeEncodeError):
        pass

    safe_filename = get_safe_filename(original_filename, file_type)
    upload_dir = Path("uploads") / "automation_requests" / request_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    existing_files = list(upload_dir.glob(f"{file_type}_*"))
    for existing_file in existing_files:
        try:
            existing_file.unlink()
        except FileNotFoundError:
            pass

    file_path = upload_dir / safe_filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "original_filename": original_filename,
        "saved_filename": safe_filename,
        "file_path": str(file_path),
        "file_size": file_size,
    }


async def parse_automation_request_create(request: Request) -> tuple[dict, AutomationRequestStatus, UploadFile, Optional[UploadFile]]:
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" not in content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="자동화 서비스 신청은 첨부파일 포함 form-data 형식으로 제출해야 합니다",
        )

    form = await request.form()

    payload = {
        "title": form.get("title"),
        "requester_type": form.get("requester_type"),
        "requester_phone": form.get("requester_phone"),
        "service_type": form.get("service_type"),
        "related_system": form.get("related_system") or None,
        "current_process_summary": form.get("current_process_summary"),
        "functional_requirements": form.get("functional_requirements"),
        "expected_users": form.get("expected_users") or None,
        "special_notes": form.get("special_notes") or None,
        "current_manpower_count": int(form.get("current_manpower_count") or 0),
        "current_worker_annual_salary": int(form.get("current_worker_annual_salary") or 0),
        "current_misc_operating_cost": int(form.get("current_misc_operating_cost") or 0),
        "current_execution_frequency": int(form.get("current_execution_frequency") or 0),
        "current_time_minutes": int(form.get("current_time_minutes") or 0),
        "expected_time_minutes": int(form.get("expected_time_minutes")) if form.get("expected_time_minutes") else None,
        "expected_roi_summary": form.get("expected_roi_summary"),
    }

    status_value = form.get("status") or AutomationRequestStatus.SUBMITTED.value
    try:
        requested_status = AutomationRequestStatus(status_value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"지원하지 않는 자동화 서비스 상태입니다: {status_value}",
        ) from exc

    if requested_status not in [AutomationRequestStatus.DRAFT, AutomationRequestStatus.SUBMITTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="신규 자동화 서비스 요청은 임시저장 또는 제출 상태로만 생성할 수 있습니다",
        )

    process_document = form.get("process_document")
    if not getattr(process_document, "filename", None):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="기존 업무 프로세스 첨부파일은 필수입니다",
        )

    reference_document = form.get("reference_document")
    parsed_reference = reference_document if getattr(reference_document, "filename", None) else None

    return payload, requested_status, process_document, parsed_reference


async def parse_automation_request_update(request: Request) -> tuple[dict, AutomationRequestStatus, Optional[UploadFile], Optional[UploadFile]]:
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" not in content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="자동화 서비스 수정은 form-data 형식으로 제출해야 합니다",
        )

    form = await request.form()
    payload = {
        "title": form.get("title"),
        "requester_type": form.get("requester_type"),
        "requester_phone": form.get("requester_phone"),
        "service_type": form.get("service_type"),
        "related_system": form.get("related_system") or None,
        "current_process_summary": form.get("current_process_summary"),
        "functional_requirements": form.get("functional_requirements"),
        "expected_users": form.get("expected_users") or None,
        "special_notes": form.get("special_notes") or None,
        "current_manpower_count": int(form.get("current_manpower_count") or 0),
        "current_worker_annual_salary": int(form.get("current_worker_annual_salary") or 0),
        "current_misc_operating_cost": int(form.get("current_misc_operating_cost") or 0),
        "current_execution_frequency": int(form.get("current_execution_frequency") or 0),
        "current_time_minutes": int(form.get("current_time_minutes") or 0),
        "expected_time_minutes": int(form.get("expected_time_minutes")) if form.get("expected_time_minutes") else None,
        "expected_roi_summary": form.get("expected_roi_summary"),
    }

    status_value = form.get("status") or AutomationRequestStatus.SUBMITTED.value
    try:
        requested_status = AutomationRequestStatus(status_value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"지원하지 않는 자동화 서비스 상태입니다: {status_value}",
        ) from exc

    if requested_status not in [AutomationRequestStatus.DRAFT, AutomationRequestStatus.SUBMITTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="수정된 자동화 서비스 요청은 임시저장 또는 제출 상태로만 저장할 수 있습니다",
        )

    process_document = form.get("process_document")
    reference_document = form.get("reference_document")

    parsed_process = process_document if getattr(process_document, "filename", None) else None
    parsed_reference = reference_document if getattr(reference_document, "filename", None) else None

    return payload, requested_status, parsed_process, parsed_reference


@router.get("/", response_model=List[AutomationRequestSchema])
async def list_automation_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(AutomationRequest).where(AutomationRequest.dcyn == "N").order_by(AutomationRequest.created_at.desc())

    if current_user.role.value != "ADMIN":
        query = query.where(AutomationRequest.user_id == current_user.id)

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=AutomationRequestSchema)
async def create_automation_request(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        payload, requested_status, process_document, reference_document = await parse_automation_request_create(request)
        automation_request_in = AutomationRequestCreate.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        ) from exc

    request_id = str(uuid.uuid4())

    process_document_info = save_uploaded_file(process_document, request_id, "process_document")
    reference_document_info = (
        save_uploaded_file(reference_document, request_id, "reference_document")
        if reference_document
        else None
    )

    automation_request = AutomationRequest(
        id=request_id,
        **automation_request_in.model_dump(),
        user_id=current_user.id,
        requester_name=current_user.name,
        requester_department=current_user.department or "",
        requester_email=current_user.email,
        process_document_path=process_document_info["file_path"],
        process_document_original_name=process_document_info["original_filename"],
        reference_document_path=reference_document_info["file_path"] if reference_document_info else None,
        reference_document_original_name=reference_document_info["original_filename"] if reference_document_info else None,
        status=requested_status,
        submitted_at=get_korean_time() if requested_status == AutomationRequestStatus.SUBMITTED else None,
    )

    db.add(automation_request)
    await db.commit()
    await db.refresh(automation_request)

    create_log = AutomationRequestLog(
        request_id=automation_request.id,
        user_id=current_user.id,
        action=AutomationLogAction.SUBMITTED if requested_status == AutomationRequestStatus.SUBMITTED else AutomationLogAction.CREATED,
        details={
            "created_fields": {
                "title": automation_request.title,
                "service_type": serialize_for_history(automation_request.service_type),
                "status": serialize_for_history(automation_request.status),
                "process_document_original_name": automation_request.process_document_original_name,
                "reference_document_original_name": automation_request.reference_document_original_name,
            }
        },
    )
    db.add(create_log)
    await db.commit()

    return automation_request


@router.get("/{request_id}", response_model=AutomationRequestWithUser)
async def get_automation_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(AutomationRequest).where(AutomationRequest.id == request_id, AutomationRequest.dcyn == "N")

    if current_user.role.value != "ADMIN":
        query = query.where(AutomationRequest.user_id == current_user.id)

    result = await db.execute(query)
    automation_request = result.scalar_one_or_none()

    if not automation_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation request not found")

    response = AutomationRequestWithUser(**automation_request.__dict__)

    if automation_request.reviewed_by:
        reviewer_result = await db.execute(select(User).where(User.id == automation_request.reviewed_by, User.dcyn == "N"))
        reviewer = reviewer_result.scalar_one_or_none()
        if reviewer:
            response.reviewer_name = reviewer.name

    return response


@router.get("/{request_id}/history", response_model=List[HistoryItem])
async def get_automation_request_history(
    request_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationRequest).where(AutomationRequest.id == request_id, AutomationRequest.dcyn == "N")
    )
    automation_request = result.scalar_one_or_none()

    if not automation_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation request not found")

    logs_result = await db.execute(
        select(AutomationRequestLog).where(AutomationRequestLog.request_id == request_id).order_by(AutomationRequestLog.created_at.desc())
    )
    logs = logs_result.scalars().all()

    items = []
    for log in logs:
        user_result = await db.execute(select(User).where(User.id == log.user_id, User.dcyn == "N"))
        user = user_result.scalar_one_or_none()
        items.append(
            HistoryItem(
                id=log.id,
                action=log.action.value if hasattr(log.action, "value") else str(log.action),
                reason=log.reason,
                details=log.details,
                created_at=log.created_at,
                user_id=log.user_id,
                user_name=user.name if user else None,
                subject_id=automation_request.id,
                subject_title=automation_request.title,
            )
        )

    return items


@router.put("/{request_id}", response_model=AutomationRequestSchema)
async def update_automation_request(
    request_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationRequest).where(
            AutomationRequest.id == request_id,
            AutomationRequest.user_id == current_user.id,
            AutomationRequest.dcyn == "N",
        )
    )
    automation_request = result.scalar_one_or_none()

    if not automation_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation request not found")

    if automation_request.status not in [AutomationRequestStatus.DRAFT, AutomationRequestStatus.REVISION_REQUESTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="현재 상태에서는 자동화 서비스 요청을 수정할 수 없습니다",
        )

    try:
        payload, requested_status, process_document, reference_document = await parse_automation_request_update(request)
        automation_request_in = AutomationRequestCreate.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        ) from exc

    tracked_fields = [
        "title",
        "requester_type",
        "requester_phone",
        "service_type",
        "related_system",
        "current_process_summary",
        "functional_requirements",
        "expected_users",
        "special_notes",
        "current_manpower_count",
        "current_worker_annual_salary",
        "current_misc_operating_cost",
        "current_execution_frequency",
        "current_time_minutes",
        "expected_time_minutes",
        "expected_roi_summary",
        "process_document_original_name",
        "reference_document_original_name",
        "status",
    ]
    before_state = {field: getattr(automation_request, field) for field in tracked_fields}
    update_data = automation_request_in.model_dump()
    for field, value in update_data.items():
        setattr(automation_request, field, value)

    automation_request.status = requested_status
    if requested_status == AutomationRequestStatus.SUBMITTED:
        automation_request.submitted_at = get_korean_time()

    if process_document:
        process_document_info = save_uploaded_file(process_document, automation_request.id, "process_document")
        automation_request.process_document_path = process_document_info["file_path"]
        automation_request.process_document_original_name = process_document_info["original_filename"]

    if not automation_request.process_document_path:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="기존 업무 프로세스 첨부파일은 필수입니다",
        )

    if reference_document:
        reference_document_info = save_uploaded_file(reference_document, automation_request.id, "reference_document")
        automation_request.reference_document_path = reference_document_info["file_path"]
        automation_request.reference_document_original_name = reference_document_info["original_filename"]

    await db.commit()
    await db.refresh(automation_request)
    after_state = {field: getattr(automation_request, field) for field in tracked_fields}

    update_log = AutomationRequestLog(
        request_id=automation_request.id,
        user_id=current_user.id,
        action=AutomationLogAction.SUBMITTED if requested_status == AutomationRequestStatus.SUBMITTED else AutomationLogAction.UPDATED,
        details={"changes": build_change_details(before_state, after_state)},
    )
    db.add(update_log)
    await db.commit()

    return automation_request


@router.post("/{request_id}/review", response_model=AutomationRequestSchema)
async def review_automation_request(
    request_id: str,
    review: AutomationRequestReview,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AutomationRequest).where(AutomationRequest.id == request_id, AutomationRequest.dcyn == "N"))
    automation_request = result.scalar_one_or_none()

    if not automation_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation request not found")

    if automation_request.status not in [AutomationRequestStatus.SUBMITTED, AutomationRequestStatus.UNDER_REVIEW]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="현재 상태에서는 검토할 수 없습니다",
        )

    before_state = {
        "status": automation_request.status,
        "review_reason": automation_request.review_reason,
        "revision_request_reason": automation_request.revision_request_reason,
    }
    automation_request.status = review.status
    automation_request.reviewed_at = get_korean_time()
    automation_request.reviewed_by = current_user.id

    if review.status == AutomationRequestStatus.REJECTED:
        automation_request.review_reason = review.reason
    elif review.status == AutomationRequestStatus.REVISION_REQUESTED:
        automation_request.revision_request_reason = review.reason

    review_action = {
        AutomationRequestStatus.APPROVED: AutomationLogAction.APPROVED,
        AutomationRequestStatus.REJECTED: AutomationLogAction.REJECTED,
        AutomationRequestStatus.REVISION_REQUESTED: AutomationLogAction.REVISION_REQUESTED,
    }.get(review.status, AutomationLogAction.UPDATED)

    db.add(
        AutomationRequestLog(
            request_id=automation_request.id,
            user_id=current_user.id,
            action=review_action,
            reason=review.reason,
            details={
                "changes": build_change_details(
                    before_state,
                    {
                        "status": automation_request.status,
                        "review_reason": automation_request.review_reason,
                        "revision_request_reason": automation_request.revision_request_reason,
                    },
                )
            },
        )
    )

    await db.commit()
    await db.refresh(automation_request)

    return automation_request


@router.post("/{request_id}/roi-simulation", response_model=AutomationRequestSchema)
async def save_automation_roi_simulation(
    request_id: str,
    payload: AutomationRoiSimulationSave,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationRequest).where(AutomationRequest.id == request_id, AutomationRequest.dcyn == "N")
    )
    automation_request = result.scalar_one_or_none()

    if not automation_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation request not found")

    before_state = {
        "roi_basis_json": automation_request.roi_basis_json,
        "roi_result_json": automation_request.roi_result_json,
        "roi_amount_with_dev": automation_request.roi_amount_with_dev,
        "roi_amount_without_dev": automation_request.roi_amount_without_dev,
        "roi_ratio_with_dev": automation_request.roi_ratio_with_dev,
        "roi_ratio_without_dev": automation_request.roi_ratio_without_dev,
        "roi_saved_at": automation_request.roi_saved_at,
    }

    automation_request.roi_basis_json = json.dumps(payload.basis, ensure_ascii=False)
    automation_request.roi_result_json = json.dumps(payload.result, ensure_ascii=False)
    automation_request.roi_amount_with_dev = payload.roi_amount_with_dev
    automation_request.roi_amount_without_dev = payload.roi_amount_without_dev
    automation_request.roi_ratio_with_dev = payload.roi_ratio_with_dev
    automation_request.roi_ratio_without_dev = payload.roi_ratio_without_dev
    automation_request.roi_saved_at = get_korean_time()

    db.add(
        AutomationRequestLog(
            request_id=automation_request.id,
            user_id=current_user.id,
            action=AutomationLogAction.UPDATED,
            details={
                "changes": build_change_details(
                    before_state,
                    {
                        "roi_basis_json": automation_request.roi_basis_json,
                        "roi_result_json": automation_request.roi_result_json,
                        "roi_amount_with_dev": automation_request.roi_amount_with_dev,
                        "roi_amount_without_dev": automation_request.roi_amount_without_dev,
                        "roi_ratio_with_dev": automation_request.roi_ratio_with_dev,
                        "roi_ratio_without_dev": automation_request.roi_ratio_without_dev,
                        "roi_saved_at": automation_request.roi_saved_at,
                    },
                ),
                "roi_saved": True,
            },
        )
    )

    await db.commit()
    await db.refresh(automation_request)

    return automation_request


@router.put("/{request_id}/status", response_model=AutomationRequestSchema)
async def update_automation_request_status(
    request_id: str,
    status_update: AutomationRequestStatusUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AutomationRequest).where(AutomationRequest.id == request_id, AutomationRequest.dcyn == "N"))
    automation_request = result.scalar_one_or_none()

    if not automation_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation request not found")

    valid_transitions = {
        AutomationRequestStatus.APPROVED: [AutomationRequestStatus.IN_PROGRESS, AutomationRequestStatus.COMPLETED],
        AutomationRequestStatus.IN_PROGRESS: [AutomationRequestStatus.COMPLETED],
    }

    if automation_request.status not in valid_transitions or status_update.status not in valid_transitions[automation_request.status]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="유효하지 않은 자동화 서비스 상태 변경입니다",
        )

    before_status = automation_request.status
    automation_request.status = status_update.status
    if status_update.status == AutomationRequestStatus.IN_PROGRESS:
        automation_request.in_progress_at = get_korean_time()
    if status_update.status == AutomationRequestStatus.COMPLETED:
        automation_request.completed_at = get_korean_time()

    status_action = {
        AutomationRequestStatus.IN_PROGRESS: AutomationLogAction.IN_PROGRESS,
        AutomationRequestStatus.COMPLETED: AutomationLogAction.COMPLETED,
    }.get(status_update.status, AutomationLogAction.UPDATED)

    db.add(
        AutomationRequestLog(
            request_id=automation_request.id,
            user_id=current_user.id,
            action=status_action,
            details={
                "changes": {
                    "status": {
                        "before": before_status.value,
                        "after": status_update.status.value,
                    }
                }
            },
        )
    )

    await db.commit()
    await db.refresh(automation_request)

    return automation_request


@router.get("/{request_id}/download/{file_type}")
async def download_automation_request_file(
    request_id: str,
    file_type: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(AutomationRequest).where(AutomationRequest.id == request_id, AutomationRequest.dcyn == "N")

    if current_user.role.value != "ADMIN":
        query = query.where(AutomationRequest.user_id == current_user.id)

    result = await db.execute(query)
    automation_request = result.scalar_one_or_none()

    if not automation_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Automation request not found")

    if file_type == "process-document":
        file_path = automation_request.process_document_path
        file_prefix = "자동화서비스_업무프로세스"
    elif file_type == "reference-document":
        file_path = automation_request.reference_document_path
        file_prefix = "자동화서비스_참고자료"
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")

    if not file_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    file_path_obj = Path(file_path)
    if not file_path_obj.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on disk")

    created_date = automation_request.created_at.strftime("%Y%m%d")
    title = automation_request.title[:20].replace("/", "_").replace("\\", "_")
    download_filename = f"{file_prefix}_{title}_{created_date}{file_path_obj.suffix}"

    return FileResponse(
        path=str(file_path_obj),
        filename=download_filename,
        media_type="application/octet-stream",
    )
