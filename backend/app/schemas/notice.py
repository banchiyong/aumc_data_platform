from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class NoticeType(str, Enum):
    GENERAL = "GENERAL"      # 일반 공지
    IMPORTANT = "IMPORTANT"  # 중요 공지
    SYSTEM = "SYSTEM"        # 시스템 공지
    MAINTENANCE = "MAINTENANCE"  # 점검 공지


class NoticeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="공지사항 제목")
    content: str = Field(..., min_length=1, description="공지사항 내용")
    notice_type: NoticeType = Field(default=NoticeType.GENERAL, description="공지사항 유형")
    is_pinned: bool = Field(default=False, description="상단 고정 여부")
    is_active: bool = Field(default=True, description="활성화 여부")
    start_date: Optional[datetime] = Field(None, description="공지 시작일시")
    end_date: Optional[datetime] = Field(None, description="공지 종료일시")


class NoticeCreate(NoticeBase):
    pass


class NoticeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    notice_type: Optional[NoticeType] = None
    is_pinned: Optional[bool] = None
    is_active: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class NoticeInDB(NoticeBase):
    id: str
    created_by: str  # 작성자 사용자 ID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Notice(NoticeInDB):
    pass


class NoticeWithAuthor(Notice):
    author_name: str  # 작성자 이름
    
    
class NoticeListItem(BaseModel):
    id: str
    title: str
    notice_type: NoticeType
    is_pinned: bool
    is_active: bool
    created_by: str
    created_at: datetime
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    author_name: str
    
    class Config:
        from_attributes = True