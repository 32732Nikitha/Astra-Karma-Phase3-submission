from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.services.admin_claims_service import *
from app.schemas.admin_claims import *

router = APIRouter(prefix="/admin", tags=["Admin Claims"])


# 🔍 ALL CLAIMS
@router.get("/claims", response_model=List[ClaimResponse])
def fetch_claims(db: Session = Depends(get_db)):
    return get_all_claims(db)


# 🔍 CLAIM DETAIL
@router.get("/claims/{claim_id}", response_model=ClaimDetailResponse)
def fetch_claim_detail(claim_id: int, db: Session = Depends(get_db)):
    data = get_claim_detail(db, claim_id)
    if not data:
        raise HTTPException(status_code=404, detail="Claim not found")
    return data


# ✅ APPROVE
@router.post("/claims/{claim_id}/approve", response_model=ActionResponse)
def approve(claim_id: int, db: Session = Depends(get_db)):
    return approve_claim(db, claim_id)


# ❌ REJECT
@router.post("/claims/{claim_id}/reject", response_model=ActionResponse)
def reject(claim_id: int, db: Session = Depends(get_db)):
    return reject_claim(db, claim_id)


# 💰 PENDING PAYOUTS
@router.get("/payouts/pending")
def pending_payouts(db: Session = Depends(get_db)):
    return get_pending_payouts(db)


# 💸 RELEASE PAYOUT
@router.post("/payouts/{claim_id}/release", response_model=ActionResponse)
async def release(claim_id: int, db: Session = Depends(get_db)):
    return release_payout(db, claim_id)