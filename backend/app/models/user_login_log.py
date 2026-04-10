from sqlalchemy import Column, String, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class UserLoginLog(BaseModel):
    __tablename__ = "user_login_logs"

    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    email = Column(String, nullable=False)
    success = Column(Boolean, nullable=False, default=False)
    ip_address = Column(String)
    user_agent = Column(Text)
    failure_reason = Column(Text)

    user = relationship("User", back_populates="login_logs")
