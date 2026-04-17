from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ClaimResponse(BaseModel):
    claim_id: int
    worker_id: int
    trigger_type: Optional[str]   # ✅ FIX
    trigger_level: Optional[str]  # ✅ FIX
    claim_timestamp: Optional[datetime]  # ✅ FIX
    claim_valid_flag: bool
    payout_status: str
    payout_amount: Optional[float]  # ✅ FIX


class ClaimDetailResponse(BaseModel):
    claim_id: int
    worker_id: int
    trigger_type: Optional[str]
    trigger_level: Optional[str]
    trigger_value: Optional[float]
    income_loss: Optional[float]
    fraud_score: Optional[float]
    fraud_flag: Optional[bool]
    claim_valid_flag: bool
    payout_status: str
    payout_amount: Optional[float]
    claim_timestamp: Optional[datetime]


class ActionResponse(BaseModel):
    status: str