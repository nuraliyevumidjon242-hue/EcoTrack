from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.metric import ResourceType


class MetricBase(BaseModel):
    type: ResourceType
    value_kwh_or_m3: float = Field(..., gt=0, description="Raw consumption value (must be > 0)")
    billing_period_start: date
    billing_period_end: date


class MetricCreate(MetricBase):
    pass


class MetricUpdate(BaseModel):
    type: Optional[ResourceType] = None
    value_kwh_or_m3: Optional[float] = Field(None, gt=0)
    billing_period_start: Optional[date] = None
    billing_period_end: Optional[date] = None


class MetricResponse(MetricBase):
    id: str
    company_id: str
    recorded_by: Optional[str] = None
    unit: str
    co2_emissions_kg: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MetricListResponse(BaseModel):
    items: List[MetricResponse]
    total: int
    page: int
    size: int
    pages: int
