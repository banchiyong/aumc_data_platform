from pydantic import BaseModel, Field
from typing import Dict, Any


class EncryptRequest(BaseModel):
    email: str = Field(
        ...,
        description="암호화할 이메일 주소",
        example="researcher@aumc.ac.kr"
    )
    password: str = Field(
        ...,
        description="암호화할 비밀번호",
        example="myPassword123!"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "researcher@aumc.ac.kr",
                "password": "myPassword123!"
            }
        }


class EncryptResponse(BaseModel):
    encrypted_email: str = Field(
        ...,
        description="AES로 암호화된 이메일",
        example="U2FsdGVkX1+abc123encrypted_email_here"
    )
    encrypted_password: str = Field(
        ...,
        description="AES로 암호화된 비밀번호",
        example="U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y="
    )
    message: str = Field(
        ...,
        description="안내 메시지",
        example="암호화된 값들을 로그인 API에서 사용하세요"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "encrypted_email": "U2FsdGVkX1+abc123encrypted_email_here",
                "encrypted_password": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=",
                "message": "암호화된 값들을 로그인 API에서 사용하세요"
            }
        }


class DecryptRequest(BaseModel):
    encrypted_text: str = Field(
        ...,
        description="복호화할 암호화된 텍스트",
        example="U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y="
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "encrypted_text": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y="
            }
        }


class DecryptResponse(BaseModel):
    decrypted_text: str = Field(
        ...,
        description="복호화된 원본 텍스트",
        example="myPassword123!"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "decrypted_text": "myPassword123!"
            }
        }