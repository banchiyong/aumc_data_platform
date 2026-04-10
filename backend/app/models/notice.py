from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import BaseModel
from app.schemas.notice import NoticeType


class Notice(BaseModel):
    __tablename__ = "notices"

    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    notice_type = Column(SQLEnum(NoticeType), default=NoticeType.GENERAL, nullable=False)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)

    author = relationship("User")
