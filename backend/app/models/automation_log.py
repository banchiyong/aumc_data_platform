from sqlalchemy import Column, String, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.base import BaseModel


class AutomationLogAction(str, enum.Enum):
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVISION_REQUESTED = "REVISION_REQUESTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DOWNLOADED = "DOWNLOADED"


class AutomationRequestLog(BaseModel):
    __tablename__ = "automation_request_logs"

    request_id = Column(String, ForeignKey("automation_requests.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    action = Column(SQLEnum(AutomationLogAction), nullable=False)
    reason = Column(Text)
    details = Column(JSON)

    request = relationship("AutomationRequest", back_populates="logs")
