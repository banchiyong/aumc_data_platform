from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import os
import shutil
import uuid
from pathlib import Path

from app.db.session import get_db
from app.core.deps import get_current_user, get_current_admin_user
from app.models import User, Application, ApplicationStatus, ApplicationLog, LogAction
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationReview,
    Application as ApplicationSchema,
    ApplicationWithUser,
    ApplicationListItem
)

router = APIRouter(prefix="/api/applications", tags=["applications"])

# 한국 표준시(KST) 타임존 정의
KST = timezone(timedelta(hours=9))

def get_korean_time() -> datetime:
    """한국 표준시 기준 현재 시간 반환"""
    return datetime.now(KST)

def get_safe_filename(original_filename: str, file_type: str) -> str:
    """안전한 파일명 생성"""
    # 파일 확장자 추출
    if '.' in original_filename:
        ext = original_filename.rsplit('.', 1)[1].lower()
        # 허용된 확장자인지 확인
        allowed_extensions = {'pdf', 'doc', 'docx', 'hwp'}
        if ext not in allowed_extensions:
            ext = 'pdf'  # 기본값
    else:
        ext = 'pdf'
    
    # UUID를 사용한 고유 파일명 생성
    unique_id = str(uuid.uuid4())
    timestamp = get_korean_time().strftime('%Y%m%d_%H%M%S')
    
    return f"{file_type}_{timestamp}_{unique_id}.{ext}"


def save_uploaded_file(file: UploadFile, application_id: str, file_type: str) -> dict:
    """파일을 안전하게 저장"""
    # 파일 크기 제한 (10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    # 파일 크기 확인 (실제로는 FastAPI에서 먼저 체크됨)
    file.file.seek(0, 2)  # 파일 끝으로 이동
    file_size = file.file.tell()
    file.file.seek(0)  # 파일 시작으로 다시 이동
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="파일 크기가 10MB를 초과했습니다"
        )
    
    # 파일명 인코딩 문제 해결
    # FastAPI UploadFile의 filename은 Latin-1로 잘못 인코딩될 수 있음
    original_filename = file.filename or 'document'
    try:
        # Latin-1로 인코딩된 UTF-8 바이트를 복원
        original_filename = original_filename.encode('latin-1').decode('utf-8')
    except (UnicodeDecodeError, UnicodeEncodeError):
        # 인코딩 변환이 실패하면 원본 그대로 사용 (ASCII 파일명인 경우)
        pass
    
    # 안전한 파일명 생성
    safe_filename = get_safe_filename(original_filename, file_type)
    
    # 저장 디렉토리 생성
    upload_dir = Path("uploads") / "applications" / application_id
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # 기존 파일이 있다면 삭제
    existing_files = list(upload_dir.glob(f"{file_type}_*"))
    for existing_file in existing_files:
        try:
            existing_file.unlink()
        except FileNotFoundError:
            pass
    
    # 새 파일 저장
    file_path = upload_dir / safe_filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "original_filename": original_filename,
        "saved_filename": safe_filename,
        "file_path": str(file_path),
        "file_size": file_size
    }


@router.get("/", response_model=List[ApplicationSchema])
async def get_applications(
    status: Optional[ApplicationStatus] = Query(None),
    include_deleted: bool = Query(False, description="삭제된 항목도 포함 (관리자 전용)"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 기본적으로 삭제되지 않은 항목만 조회
    if include_deleted and current_user.role.value == "ADMIN":
        # 관리자이고 include_deleted가 True인 경우 모든 항목 조회
        query = select(Application)
    else:
        # 일반 사용자이거나 include_deleted가 False인 경우 삭제되지 않은 항목만 조회
        query = select(Application).where(Application.dcyn == 'N')
    
    if current_user.role.value != "ADMIN":
        query = query.where(Application.user_id == current_user.id)
    
    if status:
        query = query.where(Application.status == status)
    
    query = query.offset(skip).limit(limit).order_by(Application.created_at.desc())
    
    result = await db.execute(query)
    applications = result.scalars().all()
    
    return applications


@router.post("/", response_model=ApplicationSchema)
async def create_application(
    application_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 신청 시점의 사용자 정보 저장
    application_data = application_in.dict()
    application_data.update({
        'user_id': current_user.id,
        'applicant_name': current_user.name,
        'applicant_department': current_user.department or '',
        'applicant_email': current_user.email,
        'service_types': [st.value for st in application_in.service_types],  # Enum을 문자열로 변환
        'status': ApplicationStatus.SUBMITTED,  # 신청 완료 상태로 설정
        'submitted_at': get_korean_time()  # 제출 시간 기록 (한국 표준시)
    })
    
    application = Application(**application_data)
    
    db.add(application)
    await db.commit()
    await db.refresh(application)
    
    log = ApplicationLog(
        application_id=application.id,
        user_id=current_user.id,
        action=LogAction.SUBMITTED
    )
    db.add(log)
    await db.commit()
    
    return application


@router.get("/{application_id}", response_model=ApplicationWithUser)
async def get_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 기본 쿼리 - application_id만 조건
    query = select(Application).where(Application.id == application_id)
    
    # 일반 사용자는 삭제되지 않은 자신의 신청서만 조회 가능
    if current_user.role.value != "ADMIN":
        query = query.where(
            Application.user_id == current_user.id,
            Application.dcyn == 'N'  # 일반 사용자는 삭제된 항목 조회 불가
        )
    # 관리자는 삭제된 데이터도 조회 가능 (dcyn 조건 없음)
    
    result = await db.execute(query)
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    result = await db.execute(
        select(User).where(
            and_(
                User.id == application.user_id,
                User.dcyn == 'N'
            )
        )
    )
    user = result.scalar_one()
    
    response = ApplicationWithUser(
        **application.__dict__,
        user_name=user.name,
        user_email=user.email
    )
    
    if application.reviewed_by:
        result = await db.execute(
            select(User).where(
                and_(
                    User.id == application.reviewed_by,
                    User.dcyn == 'N'
                )
            )
        )
        reviewer = result.scalar_one_or_none()
        if reviewer:
            response.reviewer_name = reviewer.name
    
    return response


@router.put("/{application_id}", response_model=ApplicationSchema)
async def update_application(
    application_id: str,
    application_update: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(
            and_(
                Application.id == application_id,
                Application.user_id == current_user.id
            )
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status not in [ApplicationStatus.DRAFT, ApplicationStatus.REVISION_REQUESTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update application in current status"
        )
    
    update_data = application_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    log = ApplicationLog(
        application_id=application.id,
        user_id=current_user.id,
        action=LogAction.UPDATED
    )
    db.add(log)
    
    await db.commit()
    await db.refresh(application)
    
    return application


@router.post("/{application_id}/submit", response_model=ApplicationSchema)
async def submit_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Application).where(
            and_(
                Application.id == application_id,
                Application.user_id == current_user.id
            )
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status not in [ApplicationStatus.DRAFT, ApplicationStatus.REVISION_REQUESTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot submit application in current status"
        )
    
    application.status = ApplicationStatus.SUBMITTED
    application.submitted_at = get_korean_time()
    
    log = ApplicationLog(
        application_id=application.id,
        user_id=current_user.id,
        action=LogAction.SUBMITTED
    )
    db.add(log)
    
    await db.commit()
    await db.refresh(application)
    
    return application


@router.post("/{application_id}/review", response_model=ApplicationSchema)
async def review_application(
    application_id: str,
    review: ApplicationReview,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Application).where(Application.id == application_id))
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status not in [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot review application in current status"
        )
    
    application.status = review.status
    application.reviewed_at = get_korean_time()
    application.reviewed_by = current_user.id
    
    if review.status == ApplicationStatus.REJECTED:
        application.rejection_reason = review.reason
        action = LogAction.REJECTED
    elif review.status == ApplicationStatus.REVISION_REQUESTED:
        application.revision_request_reason = review.reason
        action = LogAction.REVISION_REQUESTED
    elif review.status == ApplicationStatus.APPROVED:
        action = LogAction.APPROVED
    else:
        action = LogAction.UPDATED
    
    log = ApplicationLog(
        application_id=application.id,
        user_id=current_user.id,
        action=action,
        reason=review.reason
    )
    db.add(log)
    
    await db.commit()
    await db.refresh(application)
    
    return application

# 파일 업로드 엔드포인트
@router.post("/{application_id}/upload/irb")
async def upload_irb_document(
    application_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """IRB 통지서 업로드"""
    result = await db.execute(
        select(Application).where(
            and_(
                Application.id == application_id,
                Application.user_id == current_user.id
            )
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status not in [ApplicationStatus.DRAFT, ApplicationStatus.REVISION_REQUESTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload files in current status"
        )
    
    try:
        # 안전한 파일 저장
        file_info = save_uploaded_file(file, application_id, "irb")
        
        # DB 업데이트
        application.irb_document_path = file_info["file_path"]
        application.irb_document_original_name = file_info["original_filename"]
        await db.commit()
        
        return {
            "message": "IRB 문서가 성공적으로 업로드되었습니다",
            "original_filename": file_info["original_filename"],
            "file_size": file_info["file_size"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"파일 업로드 중 오류가 발생했습니다: {str(e)}"
        )


@router.post("/{application_id}/upload/research-plan")
async def upload_research_plan(
    application_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """연구계획서 업로드"""
    result = await db.execute(
        select(Application).where(
            and_(
                Application.id == application_id,
                Application.user_id == current_user.id
            )
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status not in [ApplicationStatus.DRAFT, ApplicationStatus.REVISION_REQUESTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload files in current status"
        )
    
    try:
        # 안전한 파일 저장
        file_info = save_uploaded_file(file, application_id, "research_plan")
        
        # DB 업데이트
        application.research_plan_path = file_info["file_path"]
        application.research_plan_original_name = file_info["original_filename"]
        await db.commit()
        
        return {
            "message": "연구계획서가 성공적으로 업로드되었습니다",
            "original_filename": file_info["original_filename"],
            "file_size": file_info["file_size"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"파일 업로드 중 오류가 발생했습니다: {str(e)}"
        )


@router.delete("/{application_id}/delete-file/{file_type}")
async def delete_file(
    application_id: str,
    file_type: str,  # 'irb' or 'research-plan'
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """파일 삭제 (논리 삭제)"""
    result = await db.execute(
        select(Application).where(
            and_(
                Application.id == application_id,
                Application.user_id == current_user.id,
                Application.dcyn == 'N'
            )
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status not in [ApplicationStatus.DRAFT, ApplicationStatus.REVISION_REQUESTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete files in current status"
        )
    
    # 파일 경로를 null로 설정 (물리적 파일은 유지)
    if file_type == "irb":
        application.irb_document_path = None
        application.irb_document_original_name = None
    elif file_type == "research-plan":
        application.research_plan_path = None
        application.research_plan_original_name = None
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type"
        )
    
    # 로그 기록
    log = ApplicationLog(
        application_id=application.id,
        user_id=current_user.id,
        action=LogAction.UPDATED,
        reason=f"{file_type} 파일 삭제"
    )
    db.add(log)
    
    await db.commit()
    
    return {"message": "파일이 삭제되었습니다"}


@router.get("/{application_id}/download/{file_type}")
async def download_file(
    application_id: str,
    file_type: str,  # 'irb' or 'research-plan'
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """첨부파일 다운로드"""
    # 신청서 조회 및 권한 확인
    query = select(Application).where(
        Application.id == application_id,
        Application.dcyn == 'N'  # 삭제되지 않은 항목만 조회
    )
    
    # 일반 사용자는 본인 신청서만, 관리자는 모든 신청서 접근 가능
    if current_user.role.value != "ADMIN":
        query = query.where(Application.user_id == current_user.id)
    
    result = await db.execute(query)
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # 파일 경로 확인
    if file_type == "irb":
        file_path = application.irb_document_path
        file_prefix = "IRB_통지서"
    elif file_type == "research-plan":
        file_path = application.research_plan_path
        file_prefix = "연구계획서"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type"
        )
    
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # 파일 존재 여부 확인
    file_path_obj = Path(file_path)
    if not file_path_obj.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    # 파일 확장자 추출
    file_extension = file_path_obj.suffix
    
    # 다운로드용 파일명 생성 (한글 + 프로젝트명 + 날짜)
    created_date = application.created_at.strftime("%Y%m%d")
    project_name = application.project_name[:20].replace("/", "_").replace("\\", "_")  # 파일명에 사용할 수 없는 문자 제거
    download_filename = f"{file_prefix}_{project_name}_{created_date}{file_extension}"
    
    return FileResponse(
        path=str(file_path_obj),
        filename=download_filename,
        media_type="application/octet-stream"
    )


# 상태 업데이트 엔드포인트 (관리자용)
@router.put("/{application_id}/status", response_model=ApplicationSchema)
async def update_application_status(
    application_id: str,
    request: dict,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """신청서 상태 업데이트 (관리자만 가능)"""
    result = await db.execute(
        select(Application).where(Application.id == application_id)
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    new_status = request.get("status")
    if not new_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status is required"
        )
    
    try:
        new_status_enum = ApplicationStatus(new_status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {new_status}"
        )
    
    # 현재 상태에서 변경 가능한 상태인지 검증
    valid_transitions = {
        ApplicationStatus.APPROVED: [ApplicationStatus.PROCESSING, ApplicationStatus.COMPLETED],
        ApplicationStatus.PROCESSING: [ApplicationStatus.COMPLETED],
    }
    
    if application.status not in valid_transitions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot change status from {application.status}"
        )
    
    if new_status_enum not in valid_transitions[application.status]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from {application.status} to {new_status}"
        )
    
    # 상태 변경
    old_status = application.status
    application.status = new_status_enum
    
    # 완료 시간 설정
    if new_status_enum == ApplicationStatus.COMPLETED:
        application.completed_at = get_korean_time()
    
    # 로그 기록
    if new_status_enum == ApplicationStatus.PROCESSING:
        log_action = LogAction.PROCESSING
    elif new_status_enum == ApplicationStatus.COMPLETED:
        log_action = LogAction.COMPLETED
    else:
        log_action = LogAction.UPDATED
    
    log = ApplicationLog(
        application_id=application.id,
        user_id=current_user.id,
        action=log_action,
        details={
            "old_status": old_status.value,
            "new_status": new_status_enum.value,
            "changed_by_admin": True
        }
    )
    db.add(log)
    
    await db.commit()
    await db.refresh(application)
    
    return application
