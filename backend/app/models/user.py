from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.db.base import BaseModel


class UserRole(str, enum.Enum):
    RESEARCHER = "RESEARCHER"
    ADMIN = "ADMIN"


class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.RESEARCHER, nullable=False)
    department = Column(String)
    position = Column(String)
    phone = Column(String)
    is_active = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime)
    
    applications = relationship("Application", back_populates="user", foreign_keys="Application.user_id")
    reviewed_applications = relationship("Application", back_populates="reviewer", foreign_keys="Application.reviewed_by")
    logs = relationship("ApplicationLog", back_populates="user")
    downloads = relationship("Download", back_populates="user")
    refresh_tokens = relationship("RefreshToken", back_populates="user")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user")