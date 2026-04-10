from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.base import BaseModel


class AutomationRequestStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVISION_REQUESTED = "REVISION_REQUESTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class AutomationRequesterType(str, enum.Enum):
    RESEARCHER = "RESEARCHER"
    STAFF = "STAFF"


class AutomationServiceType(str, enum.Enum):
    FORM_DRAFT = "FORM_DRAFT"
    ROUTINE_AUTOMATION = "ROUTINE_AUTOMATION"
    CONSULTING = "CONSULTING"


class AutomationRequest(BaseModel):
    __tablename__ = "automation_requests"

    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    requester_type = Column(SQLEnum(AutomationRequesterType), nullable=False)
    requester_name = Column(String, nullable=False)
    requester_department = Column(String, nullable=False)
    requester_email = Column(String, nullable=False)
    requester_phone = Column(String, nullable=False)

    service_type = Column(SQLEnum(AutomationServiceType), nullable=False)
    related_system = Column(String)
    current_process_summary = Column(Text, nullable=False)
    functional_requirements = Column(Text, nullable=False)
    expected_users = Column(String)
    special_notes = Column(Text)

    current_manpower_count = Column(Integer, nullable=False)
    current_worker_annual_salary = Column(Integer)
    current_misc_operating_cost = Column(Integer, nullable=False, default=0, server_default="0")
    current_execution_frequency = Column(Integer, nullable=False)
    current_time_minutes = Column(Integer, nullable=False)
    expected_time_minutes = Column(Integer)
    expected_roi_summary = Column(Text, nullable=False)

    process_document_path = Column(String, nullable=False)
    process_document_original_name = Column(String, nullable=False)
    reference_document_path = Column(String)
    reference_document_original_name = Column(String)

    status = Column(SQLEnum(AutomationRequestStatus), default=AutomationRequestStatus.SUBMITTED, nullable=False)
    review_reason = Column(Text)
    revision_request_reason = Column(Text)
    roi_basis_json = Column(Text)
    roi_result_json = Column(Text)
    roi_amount_with_dev = Column(Integer)
    roi_amount_without_dev = Column(Integer)
    roi_ratio_with_dev = Column(Float)
    roi_ratio_without_dev = Column(Float)
    roi_saved_at = Column(DateTime)
    submitted_at = Column(DateTime)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(String, ForeignKey("users.id"))
    in_progress_at = Column(DateTime)
    completed_at = Column(DateTime)

    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    logs = relationship("AutomationRequestLog", back_populates="request", cascade="all, delete-orphan")
