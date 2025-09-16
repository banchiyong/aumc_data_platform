from sqlalchemy import Column, String, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.base import BaseModel


class LogAction(str, enum.Enum):
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVISION_REQUESTED = "REVISION_REQUESTED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    DOWNLOADED = "DOWNLOADED"
    DELETED = "DELETED"


class ApplicationLog(BaseModel):
    __tablename__ = "application_logs"
    
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    action = Column(SQLEnum(LogAction), nullable=False)
    reason = Column(Text)
    details = Column(JSON)
    
    application = relationship("Application", back_populates="logs")
    user = relationship("User", back_populates="logs")