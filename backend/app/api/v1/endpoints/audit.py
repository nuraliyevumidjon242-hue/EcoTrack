from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog
from app.schemas.audit import AuditLogListResponse, AuditLogResponse
from app.services.auth_service import require_roles

router = APIRouter(prefix="/audit", tags=["Audit & Compliance Trail"])


@router.get("", response_model=AuditLogListResponse, summary="View audit logs for compliance tracking")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    size: int = Query(15, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.COMPANY_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.DATA_AUDITOR))
):
    query = select(AuditLog)
    count_query = select(func.count(AuditLog.id))

    if current_user.role != UserRole.SYSTEM_ADMIN and current_user.company_id:
        query = query.where(AuditLog.company_id == current_user.company_id)
        count_query = count_query.where(AuditLog.company_id == current_user.company_id)

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(desc(AuditLog.timestamp)).offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    logs = result.scalars().all()

    pages = (total + size - 1) // size if size > 0 else 1

    return AuditLogListResponse(
        items=[AuditLogResponse.model_validate(l) for l in logs],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )
