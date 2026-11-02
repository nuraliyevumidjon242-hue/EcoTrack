from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole = UserRole.DATA_AUDITOR


class UserCreate(UserBase):
    password: str
    company_id: Optional[str] = None


class UserRegisterWithCompany(BaseModel):
    # Company info
    company_name: str
    registration_number: str
    city: str
    country: str = "Germany"
    industry_type: str = "Manufacturing"
    # Manager info
    first_name: str
    last_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    first_name: str
    last_name: str
    company_id: Optional[str] = None
    company_name: Optional[str] = None


class UserResponse(UserBase):
    id: str
    company_id: Optional[str] = None
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)
