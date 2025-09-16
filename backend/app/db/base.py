from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime, String, Boolean
from datetime import datetime, timezone, timedelta
import uuid


Base = declarative_base()

# 한국 표준시(KST) 타임존 정의
KST = timezone(timedelta(hours=9))

def get_korean_time():
    """한국 표준시 기준 현재 시간 반환"""
    return datetime.now(KST)


class BaseModel(Base):
    __abstract__ = True
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=get_korean_time, nullable=False)
    updated_at = Column(DateTime, default=get_korean_time, onupdate=get_korean_time, nullable=False)
    dcyn = Column(String(1), default='N', nullable=False)  # 삭제여부: Y=삭제됨, N=활성