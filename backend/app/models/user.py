import uuid
from datetime import datetime
import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base


class UserRole(str, enum.Enum):
    SYSTEM_ADMIN = "SYSTEM_ADMIN"
    COMPANY_MANAGER = "COMPANY_MANAGER"
    DATA_AUDITOR = "DATA_AUDITOR"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.DATA_AUDITOR, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="users")
    metrics = relationship("EnergyMetric", back_populates="recorded_by_user")
    audit_logs = relationship("AuditLog", back_populates="user")
