from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.automation_request import (
    AutomationRequestStatus,
    AutomationRequesterType,
    AutomationServiceType,
)


class AutomationRequestBase(BaseModel):
    title: str = Field(..., min_length=2, description="요청 제목")
    requester_type: AutomationRequesterType
    requester_phone: str = Field(..., min_length=1, description="연락처")

    service_type: AutomationServiceType
    related_system: Optional[str] = None
    current_process_summary: str = Field(..., min_length=20, description="기존 업무 프로세스 설명")
    functional_requirements: str = Field(..., min_length=20, description="기능 요구사항")
    expected_users: Optional[str] = None
    special_notes: Optional[str] = Field(None, description="긴급성 또는 필요 사유")

    current_manpower_count: int = Field(..., ge=1, description="기존 작업 투입 인력")
    current_worker_annual_salary: int = Field(..., ge=1, description="작업자 평균 연봉")
    current_misc_operating_cost: int = Field(0, ge=0, description="기존 운영시 연간 기타 잡비")
    current_execution_frequency: int = Field(..., ge=1, description="기존 작업 빈도(월 기준)")
    current_time_minutes: int = Field(..., ge=1, description="기존 작업 소요 시간(분)")
    expected_time_minutes: Optional[int] = Field(None, ge=0, description="자동화 후 예상 소요 시간(분)")
    expected_roi_summary: str = Field(..., min_length=10, description="ROI 및 기대 효과")


class AutomationRequestCreate(AutomationRequestBase):
    pass


class AutomationRequestReview(BaseModel):
    status: AutomationRequestStatus
    reason: Optional[str] = None


class AutomationRequestStatusUpdate(BaseModel):
    status: AutomationRequestStatus


class AutomationRoiSimulationSave(BaseModel):
    basis: dict
    result: dict
    roi_amount_with_dev: int = Field(..., description="개발비용 포함 ROI 금액")
    roi_amount_without_dev: int = Field(..., description="개발비용 제외 ROI 금액")
    roi_ratio_with_dev: float = Field(..., description="개발비용 포함 ROI 비율")
    roi_ratio_without_dev: float = Field(..., description="개발비용 제외 ROI 비율")


class AutomationRequest(BaseModel):
    id: str
    user_id: str

    title: str
    requester_type: AutomationRequesterType
    requester_name: str
    requester_department: str
    requester_email: str
    requester_phone: str

    service_type: AutomationServiceType
    related_system: Optional[str] = None
    current_process_summary: str
    functional_requirements: str
    expected_users: Optional[str] = None
    special_notes: Optional[str] = None

    current_manpower_count: int
    current_worker_annual_salary: Optional[int] = None
    current_misc_operating_cost: int = 0
    current_execution_frequency: int
    current_time_minutes: int
    expected_time_minutes: Optional[int] = None
    expected_roi_summary: str

    process_document_path: Optional[str] = None
    process_document_original_name: Optional[str] = None
    reference_document_path: Optional[str] = None
    reference_document_original_name: Optional[str] = None

    status: AutomationRequestStatus
    review_reason: Optional[str] = None
    revision_request_reason: Optional[str] = None
    roi_basis_json: Optional[str] = None
    roi_result_json: Optional[str] = None
    roi_amount_with_dev: Optional[int] = None
    roi_amount_without_dev: Optional[int] = None
    roi_ratio_with_dev: Optional[float] = None
    roi_ratio_without_dev: Optional[float] = None
    roi_saved_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    in_progress_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    dcyn: str = "N"

    class Config:
        from_attributes = True


class AutomationRequestWithUser(AutomationRequest):
    reviewer_name: Optional[str] = None
