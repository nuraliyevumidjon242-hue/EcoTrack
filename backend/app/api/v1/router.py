from fastapi import APIRouter
from app.api.v1.endpoints import auth, metrics, dashboard, reports, audit

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(metrics.router)
api_router.include_router(dashboard.router)
api_router.include_router(reports.router)
api_router.include_router(audit.router)
