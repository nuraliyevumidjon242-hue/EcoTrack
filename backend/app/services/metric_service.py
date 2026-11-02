from datetime import date
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status
from app.models.metric import EnergyMetric, ResourceType
from app.models.user import User
from app.models.company import Company
from app.models.audit_log import AuditLog
from app.schemas.metric import MetricCreate, MetricUpdate, MetricListResponse, MetricResponse
from app.schemas.dashboard import DashboardSummary, ResourceSummaryItem, MonthlyResourceBreakdown
from app.core.uba_engine import calculate_co2_emission, get_unit_for_type, get_emission_factor, UBA_FACTORS


async def create_metric(db: AsyncSession, user: User, data: MetricCreate, ip_address: Optional[str] = None) -> EnergyMetric:
    if not user.company_id:
        raise HTTPException(status_code=400, detail="User is not associated with any company.")

    co2_kg = calculate_co2_emission(data.type.value, data.value_kwh_or_m3)
    unit_str = get_unit_for_type(data.type.value)

    metric = EnergyMetric(
        company_id=user.company_id,
        recorded_by=user.id,
        type=data.type,
        value_kwh_or_m3=data.value_kwh_or_m3,
        unit=unit_str,
        co2_emissions_kg=co2_kg,
        billing_period_start=data.billing_period_start,
        billing_period_end=data.billing_period_end,
    )
    db.add(metric)
    await db.flush()

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        company_id=user.company_id,
        action="METRIC_CREATED",
        details=f"Added {data.type.value} reading: {data.value_kwh_or_m3} {unit_str} -> {co2_kg} kg CO2e.",
        ip_address=ip_address,
    )
    db.add(audit)
    await db.commit()
    await db.refresh(metric)
    return metric


async def list_metrics(
    db: AsyncSession,
    company_id: str,
    page: int = 1,
    size: int = 10,
    resource_type: Optional[ResourceType] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> MetricListResponse:
    query = select(EnergyMetric).where(EnergyMetric.company_id == company_id)
    count_query = select(func.count(EnergyMetric.id)).where(EnergyMetric.company_id == company_id)

    if resource_type:
        query = query.where(EnergyMetric.type == resource_type)
        count_query = count_query.where(EnergyMetric.type == resource_type)
    if start_date:
        query = query.where(EnergyMetric.billing_period_start >= start_date)
        count_query = count_query.where(EnergyMetric.billing_period_start >= start_date)
    if end_date:
        query = query.where(EnergyMetric.billing_period_end <= end_date)
        count_query = count_query.where(EnergyMetric.billing_period_end <= end_date)

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(desc(EnergyMetric.billing_period_start)).offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    items = result.scalars().all()

    pages = (total + size - 1) // size if size > 0 else 1

    return MetricListResponse(
        items=[MetricResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


async def update_metric(
    db: AsyncSession,
    metric_id: str,
    user: User,
    data: MetricUpdate,
    ip_address: Optional[str] = None
) -> EnergyMetric:
    res = await db.execute(select(EnergyMetric).where(EnergyMetric.id == metric_id))
    metric = res.scalar_one_or_none()

    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found.")

    if metric.company_id != user.company_id and user.role != "SYSTEM_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to edit this company's metric.")

    old_val = metric.value_kwh_or_m3
    old_type = metric.type.value

    if data.type is not None:
        metric.type = data.type
        metric.unit = get_unit_for_type(data.type.value)
    if data.value_kwh_or_m3 is not None:
        metric.value_kwh_or_m3 = data.value_kwh_or_m3
    if data.billing_period_start is not None:
        metric.billing_period_start = data.billing_period_start
    if data.billing_period_end is not None:
        metric.billing_period_end = data.billing_period_end

    # Recalculate CO2
    metric.co2_emissions_kg = calculate_co2_emission(metric.type.value, metric.value_kwh_or_m3)

    audit = AuditLog(
        user_id=user.id,
        company_id=user.company_id,
        action="METRIC_UPDATED",
        details=f"Updated metric {metric.id}: Changed from ({old_type}: {old_val}) to ({metric.type.value}: {metric.value_kwh_or_m3} {metric.unit}, CO2: {metric.co2_emissions_kg} kg).",
        ip_address=ip_address,
    )
    db.add(audit)
    await db.commit()
    await db.refresh(metric)
    return metric


async def delete_metric(
    db: AsyncSession,
    metric_id: str,
    user: User,
    ip_address: Optional[str] = None
) -> bool:
    res = await db.execute(select(EnergyMetric).where(EnergyMetric.id == metric_id))
    metric = res.scalar_one_or_none()

    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found.")

    if metric.company_id != user.company_id and user.role != "SYSTEM_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to delete this company's metric.")

    audit = AuditLog(
        user_id=user.id,
        company_id=user.company_id,
        action="METRIC_DELETED",
        details=f"Deleted metric {metric.id} ({metric.type.value}: {metric.value_kwh_or_m3} {metric.unit}).",
        ip_address=ip_address,
    )
    db.add(audit)
    await db.delete(metric)
    await db.commit()
    return True


async def get_dashboard_summary(db: AsyncSession, company_id: str) -> DashboardSummary:
    comp_res = await db.execute(select(Company).where(Company.id == company_id))
    company = comp_res.scalar_one_or_none()
    company_name = company.name if company else "SME Partner GmbH"

    # Fetch all metrics
    result = await db.execute(
        select(EnergyMetric)
        .where(EnergyMetric.company_id == company_id)
        .order_by(EnergyMetric.billing_period_start.asc())
    )
    metrics = result.scalars().all()

    total_co2 = sum(m.co2_emissions_kg for m in metrics)
    total_logs_count = len(metrics)

    # Budget calculation (German SME average benchmark: 50,000 kg CO2 / year)
    carbon_budget_limit_kg = 50000.0
    usage_percent = round((total_co2 / carbon_budget_limit_kg) * 100, 1) if carbon_budget_limit_kg > 0 else 0.0

    if usage_percent < 70:
        status_str = "OPTIMAL"
    elif usage_percent < 90:
        status_str = "WARNING"
    else:
        status_str = "CRITICAL"

    # Breakdown by resource
    resource_sums = {
        "ELECTRICITY": {"raw": 0.0, "co2": 0.0, "unit": "kWh"},
        "NATURAL_GAS": {"raw": 0.0, "co2": 0.0, "unit": "kWh"},
        "WATER": {"raw": 0.0, "co2": 0.0, "unit": "m³"},
        "WASTE": {"raw": 0.0, "co2": 0.0, "unit": "kg"},
    }

    monthly_map = {}

    for m in metrics:
        t = m.type.value
        if t in resource_sums:
            resource_sums[t]["raw"] += m.value_kwh_or_m3
            resource_sums[t]["co2"] += m.co2_emissions_kg

        m_key = m.billing_period_start.strftime("%Y-%m")
        if m_key not in monthly_map:
            monthly_map[m_key] = {
                "electricity_kwh": 0.0,
                "electricity_co2": 0.0,
                "gas_kwh": 0.0,
                "gas_co2": 0.0,
                "water_m3": 0.0,
                "water_co2": 0.0,
                "waste_kg": 0.0,
                "waste_co2": 0.0,
                "total_co2_kg": 0.0,
            }
        
        if t == "ELECTRICITY":
            monthly_map[m_key]["electricity_kwh"] += m.value_kwh_or_m3
            monthly_map[m_key]["electricity_co2"] += m.co2_emissions_kg
        elif t == "NATURAL_GAS":
            monthly_map[m_key]["gas_kwh"] += m.value_kwh_or_m3
            monthly_map[m_key]["gas_co2"] += m.co2_emissions_kg
        elif t == "WATER":
            monthly_map[m_key]["water_m3"] += m.value_kwh_or_m3
            monthly_map[m_key]["water_co2"] += m.co2_emissions_kg
        elif t == "WASTE":
            monthly_map[m_key]["waste_kg"] += m.value_kwh_or_m3
            monthly_map[m_key]["waste_co2"] += m.co2_emissions_kg
        
        monthly_map[m_key]["total_co2_kg"] += m.co2_emissions_kg

    by_resource_list = []
    for r_type, data in resource_sums.items():
        pct = round((data["co2"] / total_co2 * 100), 1) if total_co2 > 0 else 0.0
        by_resource_list.append(ResourceSummaryItem(
            type=r_type,
            total_raw=round(data["raw"], 2),
            unit=data["unit"],
            total_co2_kg=round(data["co2"], 2),
            percentage_of_total=pct,
            factor_used=get_emission_factor(r_type),
        ))

    monthly_trend_list = []
    for m_key in sorted(monthly_map.keys()):
        d = monthly_map[m_key]
        monthly_trend_list.append(MonthlyResourceBreakdown(
            month=m_key,
            electricity_kwh=round(d["electricity_kwh"], 2),
            electricity_co2=round(d["electricity_co2"], 2),
            gas_kwh=round(d["gas_kwh"], 2),
            gas_co2=round(d["gas_co2"], 2),
            water_m3=round(d["water_m3"], 2),
            water_co2=round(d["water_co2"], 2),
            waste_kg=round(d["waste_kg"], 2),
            waste_co2=round(d["waste_co2"], 2),
            total_co2_kg=round(d["total_co2_kg"], 2),
        ))

    return DashboardSummary(
        company_name=company_name,
        year_to_date_co2_kg=round(total_co2, 2),
        carbon_budget_limit_kg=carbon_budget_limit_kg,
        carbon_budget_usage_percent=usage_percent,
        current_status=status_str,
        total_logs_count=total_logs_count,
        by_resource=by_resource_list,
        monthly_trend=monthly_trend_list,
    )
