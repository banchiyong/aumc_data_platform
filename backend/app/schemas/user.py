from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    email: str
    name: str
    department: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(
        ...,
        description="사용자 비밀번호",
        example="password123!"
    )


class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None


class UserInDB(UserBase):
    id: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class User(UserInDB):
    pass


class UserLogin(BaseModel):
    email: str = Field(
        ...,
        description="사용자 이메일",
        example="user@aumc.ac.kr"
    )
    password: str = Field(
        ...,
        description="사용자 비밀번호",
        example="password123!"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@aumc.ac.kr",
                "password": "password123!"
            }
        }
