from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardSummary, PredictionResult
from app.services.auth_service import get_current_user
from app.services.metric_service import get_dashboard_summary
from app.services.prediction_service import predict_next_month_consumption

router = APIRouter(prefix="/dashboard", tags=["Visual Analytics & Predictions"])


@router.get("/summary", response_model=DashboardSummary, summary="Get high-level dashboard KPIs and monthly trends")
async def get_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_dashboard_summary(db, company_id=current_user.company_id)


@router.get("/predictions", response_model=PredictionResult, summary="Predict next month consumption with Linear Regression")
async def get_predictions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await predict_next_month_consumption(db, company_id=current_user.company_id)
