from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status, Depends
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.audit_log import AuditLog
from app.schemas.auth import UserRegisterWithCompany, UserLogin, Token, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token, oauth2_scheme
from app.db.session import get_db


async def register_company_and_manager(db: AsyncSession, data: UserRegisterWithCompany, ip_address: Optional[str] = None) -> Token:
    # Check if registration number or email already exists
    existing_comp = await db.execute(select(Company).where(Company.registration_number == data.registration_number))
    if existing_comp.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Company registration number already registered in Germany registry.")

    existing_user = await db.execute(select(User).where(User.email == data.email))
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email address is already in use.")

    # Create Company
    company = Company(
        name=data.company_name,
        registration_number=data.registration_number,
        city=data.city,
        country=data.country,
        industry_type=data.industry_type,
    )
    db.add(company)
    await db.flush()

    # Create Manager User
    user = User(
        company_id=company.id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=UserRole.COMPANY_MANAGER,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    # Log action
    audit = AuditLog(
        user_id=user.id,
        company_id=company.id,
        action="COMPANY_REGISTERED",
        details=f"Company {company.name} and Manager {user.email} registered.",
        ip_address=ip_address,
    )
    db.add(audit)
    await db.commit()

    token_str = create_access_token(subject=user.id, role=user.role.value, company_id=company.id)
    return Token(
        access_token=token_str,
        user_id=user.id,
        role=user.role.value,
        first_name=user.first_name,
        last_name=user.last_name,
        company_id=company.id,
        company_name=company.name,
    )


async def authenticate_user(db: AsyncSession, data: UserLogin, ip_address: Optional[str] = None) -> Token:
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account has been deactivated.")

    # Fetch company if any
    company_name = None
    if user.company_id:
        comp_res = await db.execute(select(Company).where(Company.id == user.company_id))
        comp = comp_res.scalar_one_or_none()
        if comp:
            company_name = comp.name

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        company_id=user.company_id,
        action="USER_LOGIN",
        details=f"User {user.email} successfully logged in.",
        ip_address=ip_address,
    )
    db.add(audit)
    await db.commit()

    token_str = create_access_token(subject=user.id, role=user.role.value, company_id=user.company_id)
    return Token(
        access_token=token_str,
        user_id=user.id,
        role=user.role.value,
        first_name=user.first_name,
        last_name=user.last_name,
        company_id=user.company_id,
        company_name=company_name,
    )


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    payload = decode_token(token)
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload.")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive.")
    return user


def require_roles(*roles: UserRole):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles and current_user.role != UserRole.SYSTEM_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {[r.value for r in roles]}"
            )
        return current_user
    return role_checker
