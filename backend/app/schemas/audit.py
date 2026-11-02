from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    company_id: Optional[str] = None
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    items: List[AuditLogResponse]
    total: int
    page: int
    size: int
    pages: int
