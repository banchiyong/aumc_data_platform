from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HistoryItem(BaseModel):
    id: str
    action: str
    reason: Optional[str] = None
    details: Optional[dict] = None
    created_at: datetime
    user_id: str
    user_name: Optional[str] = None
    subject_id: Optional[str] = None
    subject_title: Optional[str] = None

    class Config:
        from_attributes = True
