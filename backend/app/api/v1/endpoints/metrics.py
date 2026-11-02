from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Request, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.metric import ResourceType
from app.schemas.metric import MetricCreate, MetricUpdate, MetricResponse, MetricListResponse
from app.services.auth_service import get_current_user, require_roles
from app.services.metric_service import create_metric, list_metrics, update_metric, delete_metric

router = APIRouter(prefix="/metrics", tags=["Energy & Resource Metrics"])


@router.post("", response_model=MetricResponse, status_code=status.HTTP_201_CREATED, summary="Add a new energy/resource reading")
async def add_metric(
    data: MetricCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.DATA_AUDITOR, UserRole.COMPANY_MANAGER, UserRole.SYSTEM_ADMIN))
):
    ip = request.client.host if request.client else "127.0.0.1"
    return await create_metric(db, current_user, data, ip_address=ip)


@router.get("", response_model=MetricListResponse, summary="List energy metrics with filtering and pagination")
async def get_metrics(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    resource_type: Optional[ResourceType] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await list_metrics(
        db=db,
        company_id=current_user.company_id,
        page=page,
        size=size,
        resource_type=resource_type,
        start_date=start_date,
        end_date=end_date,
    )


@router.put("/{metric_id}", response_model=MetricResponse, summary="Modify a metric (Manager role required, audited)")
async def modify_metric(
    metric_id: str,
    data: MetricUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.COMPANY_MANAGER, UserRole.SYSTEM_ADMIN))
):
    ip = request.client.host if request.client else "127.0.0.1"
    return await update_metric(db, metric_id, current_user, data, ip_address=ip)


@router.delete("/{metric_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a metric (Manager role required, audited)")
async def remove_metric(
    metric_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.COMPANY_MANAGER, UserRole.SYSTEM_ADMIN))
):
    ip = request.client.host if request.client else "127.0.0.1"
    await delete_metric(db, metric_id, current_user, ip_address=ip)
    return None
