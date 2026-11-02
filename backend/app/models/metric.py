import uuid
from datetime import datetime, date
import enum
from sqlalchemy import Column, String, Float, DateTime, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base


class ResourceType(str, enum.Enum):
    ELECTRICITY = "ELECTRICITY"
    NATURAL_GAS = "NATURAL_GAS"
    WATER = "WATER"
    WASTE = "WASTE"


class EnergyMetric(Base):
    __tablename__ = "energy_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    type = Column(Enum(ResourceType), nullable=False, index=True)
    value_kwh_or_m3 = Column(Float, nullable=False)
    unit = Column(String(10), nullable=False)
    co2_emissions_kg = Column(Float, nullable=False)
    billing_period_start = Column(Date, nullable=False)
    billing_period_end = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="metrics")
    recorded_by_user = relationship("User", back_populates="metrics")
