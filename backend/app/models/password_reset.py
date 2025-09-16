from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import secrets
from app.db.base import BaseModel


class PasswordResetToken(BaseModel):
    __tablename__ = "password_reset_tokens"
    
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    
    user = relationship("User", back_populates="password_reset_tokens")
    
    @classmethod
    def generate_token(cls, user_id: str, expires_hours: int = 1):
        """Generate a secure password reset token"""
        return cls(
            user_id=user_id,
            token=secrets.token_urlsafe(32),
            expires_at=datetime.utcnow() + timedelta(hours=expires_hours),
            used=False
        )
    
    def is_valid(self) -> bool:
        """Check if token is still valid"""
        return (
            not self.used and 
            self.expires_at > datetime.utcnow() and
            self.dcyn == 'N'
        )