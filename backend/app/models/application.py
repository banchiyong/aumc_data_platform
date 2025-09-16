from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Date, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
import enum
from app.db.base import BaseModel


class ApplicationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVISION_REQUESTED = "REVISION_REQUESTED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"


class ServiceType(str, enum.Enum):
    STRUCTURED_EXTRACTION = "STRUCTURED_EXTRACTION"  # 정형 추출
    UNSTRUCTURED_EXTRACTION = "UNSTRUCTURED_EXTRACTION"  # 비정형 추출
    PSEUDONYMIZATION = "PSEUDONYMIZATION"  # 가명화
    EXTERNAL_LINKAGE = "EXTERNAL_LINKAGE"  # 타기관 결합


class Application(BaseModel):
    __tablename__ = "applications"
    
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # 기본 정보
    project_name = Column(String, nullable=False)  # 연구과제명
    applicant_name = Column(String, nullable=False)  # 신청자 성함 (신청 시점 저장)
    applicant_department = Column(String, nullable=False)  # 소속 (신청 시점 저장)
    applicant_phone = Column(String, nullable=False)  # 연락처
    applicant_email = Column(String, nullable=False)  # 이메일 (신청 시점 저장)
    principal_investigator = Column(String, nullable=False)  # 연구 책임자 성함
    pi_department = Column(String, nullable=False)  # 연구 책임자 소속
    irb_number = Column(String, nullable=False)  # IRB 승인번호
    desired_completion_date = Column(Date)  # 희망 완료일자
    
    # 데이터 상세 내용
    service_types = Column(JSON, nullable=False)  # 서비스 유형 (체크박스 다중 선택)
    unstructured_data_type = Column(Text)  # 비정형 데이터 유형
    target_patients = Column(Text, nullable=False)  # 대상환자
    
    # 요청 상세 내용
    request_details = Column(Text, nullable=False)  # 요청 상세 내용
    
    # 첨부파일
    irb_document_path = Column(String)  # IRB 통지서 파일 경로
    irb_document_original_name = Column(String)  # IRB 통지서 원본 파일명
    research_plan_path = Column(String)  # 연구계획서 파일 경로
    research_plan_original_name = Column(String)  # 연구계획서 원본 파일명
    
    # 시스템 필드
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.DRAFT, nullable=False)
    rejection_reason = Column(Text)
    revision_request_reason = Column(Text)
    submitted_at = Column(DateTime)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(String, ForeignKey("users.id"))
    completed_at = Column(DateTime)
    rejected_at = Column(DateTime)
    deleted_at = Column(DateTime)
    deleted_by = Column(String, ForeignKey("users.id"))
    deletion_reason = Column(Text)
    dcyn = Column(String(1), default='N', nullable=False)
    
    user = relationship("User", back_populates="applications", foreign_keys=[user_id])
    reviewer = relationship("User", back_populates="reviewed_applications", foreign_keys=[reviewed_by])
    logs = relationship("ApplicationLog", back_populates="application", cascade="all, delete-orphan")
    downloads = relationship("Download", back_populates="application", cascade="all, delete-orphan")