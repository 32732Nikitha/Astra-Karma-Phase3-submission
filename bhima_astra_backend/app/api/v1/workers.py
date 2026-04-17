from typing import List

from app.core.deps import get_current_worker
from app.db.session import get_db
from app.schemas.worker import (
    DailyOperationResponse,
    EarningsEstimateResponse,
    PayoutItemResponse,
    WorkerProfileResponse,
    WorkerUpdateRequest,
)
from app.services.worker_service import (
    get_worker_daily_ops,
    get_worker_earnings_estimate,
    get_worker_payouts,
    get_worker_profile,
    update_worker_profile,
)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/workers", tags=["Workers"])


@router.get("/me/profile", response_model=WorkerProfileResponse)
def profile(current_worker=Depends(get_current_worker), db: Session = Depends(get_db)):
    worker = get_worker_profile(db, current_worker.worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker


@router.get("/me/daily-operations", response_model=List[DailyOperationResponse])
def daily_ops(
    current_worker=Depends(get_current_worker), db: Session = Depends(get_db)
):
    ops = get_worker_daily_ops(db, current_worker.worker_id)
    return [
        {
            "date": str(op.date) if op.date is not None else None,
            "daily_income": op.daily_income,
            "income_loss": op.income_loss,
            "composite_score": op.composite_score,
            "disruption_flag": op.disruption_flag,
        }
        for op in ops
    ]


@router.get("/me/payouts", response_model=List[PayoutItemResponse])
def payouts(current_worker=Depends(get_current_worker), db: Session = Depends(get_db)):
    claims = get_worker_payouts(db, current_worker.worker_id)
    return [
        {
            "claim_id": c.claim_id,
            "worker_id": c.worker_id,
            "plan_tier": c.plan_tier,
            "trigger_type": c.trigger_type,
            "trigger_level": c.trigger_level,
            "trigger_value": c.trigger_value,
            "payout_status": c.payout_status,
            "payout_amount": c.payout_amount,
            "fraud_score": c.fraud_score,
            "fraud_flag": c.fraud_flag,
            "fraud_reason": c.fraud_reason,
            "income_loss": c.income_loss,
            "claim_timestamp": str(c.claim_timestamp)
            if c.claim_timestamp is not None
            else None,
            "payout_timestamp": str(c.payout_timestamp)
            if c.payout_timestamp is not None
            else None,
        }
        for c in claims
    ]


@router.get("/me/earnings-estimate", response_model=EarningsEstimateResponse)
def earnings(current_worker=Depends(get_current_worker), db: Session = Depends(get_db)):
    result = get_worker_earnings_estimate(db, current_worker.worker_id)
    avg = float(result.get("avg_income", 0) or 0)  # type: ignore[arg-type]
    return {
        "avg_income": avg,
        "expected_income": round(avg * 7, 2),
        "actual_income_today": round(avg * 0.65, 2),
        "income_gap": round(avg * 0.35, 2),
        "expected_orders": 18,
    }


@router.put("/{worker_id}/profile")
def update_profile(
    worker_id: int,
    req: WorkerUpdateRequest,
    db: Session = Depends(get_db),
):
    worker = update_worker_profile(db, worker_id, req.model_dump(exclude_unset=True))
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return {"message": "Profile updated"}
