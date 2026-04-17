from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.services.admin_live_service import (
    get_live_triggers,
    get_fraud_alerts,
    get_recent_activity
)
from app.schemas.admin_live import (
    TriggerEvent,
    FraudAlert,
    AuditEvent
)

router = APIRouter(prefix="/admin/live", tags=["Admin Live"])


# 🔴 TRIGGERS
@router.get("/triggers", response_model=List[TriggerEvent])
def fetch_triggers(db: Session = Depends(get_db)):
    return get_live_triggers(db)


# 🚨 FRAUD ALERTS
@router.get("/fraud-alerts", response_model=List[FraudAlert])
def fetch_fraud_alerts(db: Session = Depends(get_db)):
    return get_fraud_alerts(db)


# 📜 ACTIVITY FEED
@router.get("/recent-activity", response_model=List[AuditEvent])
def fetch_activity(db: Session = Depends(get_db)):
    return get_recent_activity(db)