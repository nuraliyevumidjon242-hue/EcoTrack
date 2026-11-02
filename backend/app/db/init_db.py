from datetime import date, datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import engine, Base, AsyncSessionLocal
from app.models.company import Company
from app.models.user import User, UserRole
from app.models.metric import EnergyMetric, ResourceType
from app.models.audit_log import AuditLog
from app.core.config import settings
from app.core.security import get_password_hash
from app.core.uba_engine import calculate_co2_emission, get_unit_for_type


async def init_db_and_seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if settings.ENVIRONMENT.lower() == "production":
        return

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        res = await db.execute(select(Company).where(Company.registration_number == "HRB-789012"))
        if res.scalar_one_or_none():
            return

        # 1. Create German Demo SME
        company = Company(
            name="Müller Präzisionstechnik GmbH",
            registration_number="HRB-789012",
            country="Germany",
            city="Frankfurt am Main",
            industry_type="Automotive & CNC Manufacturing"
        )
        db.add(company)
        await db.flush()

        # 2. Create Users with different roles
        manager = User(
            company_id=company.id,
            first_name="Klaus",
            last_name="Müller",
            email="manager@mueller-tech.de",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.COMPANY_MANAGER,
            is_active=True
        )
        auditor = User(
            company_id=company.id,
            first_name="Greta",
            last_name="Schneider",
            email="auditor@mueller-tech.de",
            password_hash=get_password_hash("Password123!"),
            role=UserRole.DATA_AUDITOR,
            is_active=True
        )
        admin = User(
            company_id=None,
            first_name="Hans",
            last_name="Bauer",
            email="admin@ecotrack.de",
            password_hash=get_password_hash("AdminSecret123!"),
            role=UserRole.SYSTEM_ADMIN,
            is_active=True
        )
        db.add_all([manager, auditor, admin])
        await db.flush()

        # 3. Seed Realistic Historical Energy & Carbon Records
        historical_records = [
            # 2025-10
            (ResourceType.ELECTRICITY, 9800.0, date(2025, 10, 1), date(2025, 10, 31)),
            (ResourceType.NATURAL_GAS, 6400.0, date(2025, 10, 1), date(2025, 10, 31)),
            (ResourceType.WATER, 180.0, date(2025, 10, 1), date(2025, 10, 31)),
            (ResourceType.WASTE, 520.0, date(2025, 10, 1), date(2025, 10, 31)),
            # 2025-11
            (ResourceType.ELECTRICITY, 10400.0, date(2025, 11, 1), date(2025, 11, 30)),
            (ResourceType.NATURAL_GAS, 8200.0, date(2025, 11, 1), date(2025, 11, 30)),
            (ResourceType.WATER, 195.0, date(2025, 11, 1), date(2025, 11, 30)),
            (ResourceType.WASTE, 580.0, date(2025, 11, 1), date(2025, 11, 30)),
            # 2025-12
            (ResourceType.ELECTRICITY, 11200.0, date(2025, 12, 1), date(2025, 12, 31)),
            (ResourceType.NATURAL_GAS, 10500.0, date(2025, 12, 1), date(2025, 12, 31)),
            (ResourceType.WATER, 160.0, date(2025, 12, 1), date(2025, 12, 31)),
            (ResourceType.WASTE, 610.0, date(2025, 12, 1), date(2025, 12, 31)),
            # 2026-01
            (ResourceType.ELECTRICITY, 10800.0, date(2026, 1, 1), date(2026, 1, 31)),
            (ResourceType.NATURAL_GAS, 9800.0, date(2026, 1, 1), date(2026, 1, 31)),
            (ResourceType.WATER, 175.0, date(2026, 1, 1), date(2026, 1, 31)),
            (ResourceType.WASTE, 490.0, date(2026, 1, 1), date(2026, 1, 31)),
            # 2026-02
            (ResourceType.ELECTRICITY, 9500.0, date(2026, 2, 1), date(2026, 2, 28)),
            (ResourceType.NATURAL_GAS, 7900.0, date(2026, 2, 1), date(2026, 2, 28)),
            (ResourceType.WATER, 165.0, date(2026, 2, 1), date(2026, 2, 28)),
            (ResourceType.WASTE, 440.0, date(2026, 2, 1), date(2026, 2, 28)),
        ]

        for r_type, val, start_d, end_d in historical_records:
            co2_kg = calculate_co2_emission(r_type.value, val)
            unit_str = get_unit_for_type(r_type.value)
            metric = EnergyMetric(
                company_id=company.id,
                recorded_by=auditor.id,
                type=r_type,
                value_kwh_or_m3=val,
                unit=unit_str,
                co2_emissions_kg=co2_kg,
                billing_period_start=start_d,
                billing_period_end=end_d,
            )
            db.add(metric)

        # 4. Seed Audit Logs
        db.add(AuditLog(
            user_id=manager.id,
            company_id=company.id,
            action="SYSTEM_INIT",
            details="EcoTrack initialized with German SME baseline parameters and UBA standards.",
            ip_address="127.0.0.1"
        ))

        await db.commit()
