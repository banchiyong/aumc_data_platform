from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.base import BaseModel


class Download(BaseModel):
    __tablename__ = "downloads"
    
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer)
    file_path = Column(String, nullable=False)
    
    application = relationship("Application", back_populates="downloads")
    user = relationship("User", back_populates="downloads")