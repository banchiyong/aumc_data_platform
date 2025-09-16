from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, date
from app.models.application import ApplicationStatus, ServiceType


class ApplicationBase(BaseModel):
    # 기본 정보
    project_name: str = Field(..., min_length=1, description="연구과제명")
    applicant_phone: str = Field(..., min_length=1, description="연락처")
    principal_investigator: str = Field(..., min_length=1, description="연구 책임자 성함")
    pi_department: str = Field(..., min_length=1, description="연구 책임자 소속")
    irb_number: str = Field(..., min_length=1, description="IRB 승인번호")
    desired_completion_date: Optional[date] = Field(None, description="희망 완료일자")
    
    # 데이터 상세 내용
    service_types: List[ServiceType] = Field(..., min_items=1, description="서비스 유형")
    unstructured_data_type: Optional[str] = Field(None, description="비정형 데이터 유형")
    target_patients: str = Field(..., min_length=10, description="대상환자")
    
    # 요청 상세 내용
    request_details: str = Field(..., min_length=20, description="요청 상세 내용")
    
    @field_validator('service_types')
    def validate_service_types(cls, v):
        if not v or len(v) == 0:
            raise ValueError("최소 1개 이상의 서비스 유형을 선택해야 합니다")
        return v
    
    @field_validator('unstructured_data_type')
    def validate_unstructured_data_type(cls, v, values):
        if 'service_types' in values.data:
            service_types = values.data.get('service_types', [])
            if ServiceType.UNSTRUCTURED_EXTRACTION in service_types and not v:
                raise ValueError("비정형 추출 선택 시 비정형 데이터 유형은 필수입니다")
        return v
    
    @field_validator('desired_completion_date')
    def validate_completion_date(cls, v):
        if v:
            from datetime import timedelta
            min_date = date.today() + timedelta(days=7)
            if v < min_date:
                raise ValueError("희망 완료일자는 신청일로부터 최소 1주일 이후여야 합니다")
        return v


class ApplicationCreate(ApplicationBase):
    # 첨부파일은 별도 엔드포인트로 처리
    pass


class ApplicationUpdate(BaseModel):
    # 기본 정보 (수정 가능)
    project_name: Optional[str] = Field(None, min_length=1)
    applicant_phone: Optional[str] = Field(None, min_length=1)
    principal_investigator: Optional[str] = Field(None, min_length=1)
    pi_department: Optional[str] = Field(None, min_length=1)
    irb_number: Optional[str] = Field(None, min_length=1)
    desired_completion_date: Optional[date] = None
    
    # 데이터 상세 내용 (수정 가능)
    service_types: Optional[List[ServiceType]] = Field(None, min_items=1)
    unstructured_data_type: Optional[str] = None
    target_patients: Optional[str] = Field(None, min_length=10)
    
    # 요청 상세 내용 (수정 가능)
    request_details: Optional[str] = Field(None, min_length=20)


class ApplicationReview(BaseModel):
    status: ApplicationStatus
    reason: Optional[str] = None


class ApplicationDelete(BaseModel):
    reason: str = Field(..., min_length=1, description="삭제 사유")


class ApplicationInDB(BaseModel):
    id: str
    user_id: str
    
    # 기본 정보
    project_name: str
    applicant_phone: str
    principal_investigator: str
    pi_department: str
    irb_number: str
    desired_completion_date: Optional[date] = None
    
    # 데이터 상세 내용
    service_types: List[ServiceType]
    unstructured_data_type: Optional[str] = None
    target_patients: str
    
    # 요청 상세 내용
    request_details: str
    
    # 신청 시점 사용자 정보
    applicant_name: str
    applicant_department: str
    applicant_email: str
    
    # 첨부파일 경로
    irb_document_path: Optional[str] = None
    irb_document_original_name: Optional[str] = None
    research_plan_path: Optional[str] = None
    research_plan_original_name: Optional[str] = None
    
    # 시스템 필드
    status: ApplicationStatus
    rejection_reason: Optional[str] = None
    revision_request_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[str] = None
    deletion_reason: Optional[str] = None
    dcyn: str = 'N'
    
    class Config:
        from_attributes = True


class Application(BaseModel):
    id: str
    user_id: str
    
    # 기본 정보
    project_name: str
    applicant_phone: str
    principal_investigator: str
    pi_department: str
    irb_number: str
    desired_completion_date: Optional[date] = None
    
    # 데이터 상세 내용
    service_types: List[ServiceType]
    unstructured_data_type: Optional[str] = None
    target_patients: str
    
    # 요청 상세 내용
    request_details: str
    
    # 신청 시점 사용자 정보
    applicant_name: str
    applicant_department: str
    applicant_email: str
    
    # 첨부파일 경로
    irb_document_path: Optional[str] = None
    irb_document_original_name: Optional[str] = None
    research_plan_path: Optional[str] = None
    research_plan_original_name: Optional[str] = None
    
    # 시스템 필드
    status: ApplicationStatus
    rejection_reason: Optional[str] = None
    revision_request_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[str] = None
    deletion_reason: Optional[str] = None
    dcyn: str = 'N'
    
    class Config:
        from_attributes = True


class ApplicationWithUser(Application):
    user_name: str
    user_email: str
    reviewer_name: Optional[str] = None


class ApplicationListItem(BaseModel):
    id: str
    project_name: str
    applicant_name: str
    principal_investigator: str
    irb_number: str
    status: ApplicationStatus
    service_types: List[ServiceType]
    created_at: datetime
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[str] = None
    deletion_reason: Optional[str] = None
    
    class Config:
        from_attributes = True