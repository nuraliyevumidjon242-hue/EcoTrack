from typing import List, Dict, Optional
from pydantic import BaseModel


class MonthlyResourceBreakdown(BaseModel):
    month: str  # e.g., "2026-01"
    electricity_kwh: float
    electricity_co2: float
    gas_kwh: float
    gas_co2: float
    water_m3: float
    water_co2: float
    waste_kg: float
    waste_co2: float
    total_co2_kg: float


class ResourceSummaryItem(BaseModel):
    type: str
    total_raw: float
    unit: str
    total_co2_kg: float
    percentage_of_total: float
    factor_used: float


class DashboardSummary(BaseModel):
    company_name: str
    year_to_date_co2_kg: float
    carbon_budget_limit_kg: float
    carbon_budget_usage_percent: float
    current_status: str  # "OPTIMAL", "WARNING", "CRITICAL"
    total_logs_count: int
    by_resource: List[ResourceSummaryItem]
    monthly_trend: List[MonthlyResourceBreakdown]


class PredictionResult(BaseModel):
    next_month: str
    predicted_co2_kg: float
    predicted_electricity_kwh: float
    predicted_gas_kwh: float
    trend_direction: str  # "UPWARD", "DOWNWARD", "STABLE"
    confidence_score: float
    reduction_advice_de: str
    reduction_advice_en: str
