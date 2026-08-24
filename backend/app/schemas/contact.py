"""
Pydantic sxemalari — kiruvchi va chiquvchi ma'lumotlarni qat'iy tekshiradi.
"""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class ContactCreate(BaseModel):
    """Frontend'dan keladigan xabar formasi uchun validatsiya."""
    name: str = Field(min_length=2, max_length=120, examples=["Aziz Karimov"])
    email: EmailStr = Field(examples=["aziz@example.com"])
    message: str = Field(min_length=5, max_length=3000, examples=["Loyiha haqida gaplashsak..."])


class ContactRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactResponse(BaseModel):
    success: bool
    detail: str
    data: ContactRead
