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
        description="AES로 암호화된 비밀번호 (클라이언트에서 암호화 후 전송)",
        example="U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y="
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
        description="AES로 암호화된 사용자 이메일 (클라이언트에서 암호화 후 전송)",
        example="U2FsdGVkX194+gNiIuZjy95pCOHkGOIp+Pgn/0hh/zg="
    )
    password: str = Field(
        ...,
        description="AES로 암호화된 비밀번호 (클라이언트에서 암호화 후 전송)",
        example="U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y="
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "U2FsdGVkX194+gNiIuZjy95pCOHkGOIp+Pgn/0hh/zg=",
                "password": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y="
            }
        }