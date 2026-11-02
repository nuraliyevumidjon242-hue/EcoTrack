from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.auth import UserRegisterWithCompany, UserLogin, Token, UserResponse
from app.services.auth_service import register_company_and_manager, authenticate_user, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


@router.post("/register", response_model=Token, summary="Register a new SME company and manager account")
async def register(data: UserRegisterWithCompany, request: Request, db: AsyncSession = Depends(get_db)):
    ip = request.client.host if request.client else "127.0.0.1"
    return await register_company_and_manager(db, data, ip_address=ip)


@router.post("/login", response_model=Token, summary="Authenticate and obtain JWT bearer token")
async def login(data: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    ip = request.client.host if request.client else "127.0.0.1"
    return await authenticate_user(db, data, ip_address=ip)


@router.get("/me", response_model=UserResponse, summary="Get current logged in user details")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
