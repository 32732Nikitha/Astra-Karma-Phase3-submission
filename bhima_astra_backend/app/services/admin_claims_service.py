from sqlalchemy import text


# 🔍 ALL CLAIMS
def get_all_claims(db):
    result = db.execute(text("""
        SELECT claim_id, worker_id, trigger_type, trigger_level,
               claim_timestamp, claim_valid_flag,
               payout_status, payout_amount
        FROM policy_claims
        ORDER BY claim_timestamp DESC
        LIMIT 50
    """)).fetchall()

    return [dict(r._mapping) for r in result]


# 🔍 CLAIM DETAIL
def get_claim_detail(db, claim_id):
    result = db.execute(text("""
        SELECT *
        FROM policy_claims
        WHERE claim_id = :claim_id
    """), {"claim_id": claim_id}).fetchone()

    return dict(result._mapping) if result else None


# ✅ APPROVE CLAIM
def approve_claim(db, claim_id):
    db.execute(text("""
        UPDATE policy_claims
        SET payout_status = 'approved'
        WHERE claim_id = :claim_id
    """), {"claim_id": claim_id})

    db.commit()
    
    return {"status": "claim approved"}


# ❌ REJECT CLAIM
def reject_claim(db, claim_id):
    db.execute(text("""
        UPDATE policy_claims
        SET payout_status = 'rejected'
        WHERE claim_id = :claim_id
    """), {"claim_id": claim_id})

    db.commit()
    return {"status": "claim rejected"}


# 💰 PENDING PAYOUTS
def get_pending_payouts(db):
    result = db.execute(text("""
        SELECT claim_id, worker_id, payout_amount
        FROM policy_claims
        WHERE payout_status = 'approved'
    """)).fetchall()

    return [dict(r._mapping) for r in result]


from sqlalchemy import text


def release_payout(db, claim_id):

    # 🔍 Check current status
    claim = db.execute(text("""
        SELECT payout_status
        FROM policy_claims
        WHERE claim_id = :claim_id
    """), {"claim_id": claim_id}).fetchone()

    if not claim:
        return {"status": "claim not found"}

    if claim.payout_status != "approved":
        return {"status": f"cannot release payout (status: {claim.payout_status})"}
    if claim.payout_status == "paid":
        return {"status": "already paid"}
    # 💸 Release payout
    db.execute(text("""
        UPDATE policy_claims
        SET payout_status = 'paid',
            payout_timestamp = NOW()
        WHERE claim_id = :claim_id
    """), {"claim_id": claim_id})

    db.commit()
    
    # Send websocket event to all connected clients
    import asyncio
    from app.utils.ws_helper import send_ws_event_sync
    
    send_ws_event_sync({
        "type": "PAYOUT_RELEASED",
        "claim_id": claim_id,
        "message": f"Payout released for claim {claim_id}"
    })

    return {"status": "payout released successfully"}