import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    registration_number = Column(String(100), unique=True, nullable=False, index=True)
    country = Column(String(100), default="Germany", nullable=False)
    city = Column(String(100), nullable=False)
    industry_type = Column(String(100), default="Manufacturing", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    metrics = relationship("EnergyMetric", back_populates="company", cascade="all, delete-orphan")
