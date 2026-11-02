from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.db.init_db import init_db_and_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data if not present
    await init_db_and_seed()
    yield
    # Shutdown logic if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
### EcoTrack – Enterprise SaaS API for German SMEs (KMU)
Automated CO2 Footprint & Energy Accounting complying with **EU Green Taxonomy** and **Umweltbundesamt (UBA)** guidelines.

* **Authentication & RBAC**: JWT Access tokens, Role-Based Access Control (`SYSTEM_ADMIN`, `COMPANY_MANAGER`, `DATA_AUDITOR`).
* **UBA Engine**: Automated CO2 equivalent calculations based on German grid emission factors.
* **Predictive AI**: Machine learning forecast for upcoming monthly consumption trends.
* **Compliance**: Audit logging and one-click audit-ready PDF/CSV reports.
    """,
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for development / containers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "system": "EcoTrack SaaS",
        "environment": settings.ENVIRONMENT,
        "standard": "EU Green Taxonomy & German UBA"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
