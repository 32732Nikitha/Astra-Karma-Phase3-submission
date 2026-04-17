import logging
import random
from datetime import datetime, timedelta

from app.db.models.policy_claim import PolicyClaim
from app.services.ml_service import calculate_premium
from app.utils.cache_manager import PolicyCache
from sqlalchemy.orm import Session

logger = logging.getLogger("bhima.services.policy_service")


# 🔹 Plans config
PLAN_CONFIG = {
    "Basic": {"events": 2},
    "Standard": {"events": 2},
    "Premium": {"events": 2},
}


def generate_policy_id():
    return random.randint(10000, 99999)


# 🔥 Activate Policy
def activate_policy(db: Session, worker_id: int, plan_tier: str):
    # 1. Cancel all previously active policies for this worker
    existing_active = (
        db.query(PolicyClaim)
        .filter(
            PolicyClaim.worker_id == worker_id,
            PolicyClaim.policy_status == "active",
        )
        .all()
    )
    for old in existing_active:
        old.policy_status = "cancelled"
    if existing_active:
        db.flush()
        logger.info(
            f"[POLICY] Cancelled {len(existing_active)} old active policies for worker {worker_id}"
        )

    # 2. Calculate personalised premium
    ml_data = calculate_premium(db, worker_id)
    weekly_premium = ml_data.get(
        "personalized_premium", ml_data.get("base_premium", 79.0)
    )

    # 3. Determine dates — weekly policy is 7 days
    today = datetime.utcnow().date()
    expiry = today + timedelta(days=7)

    # 4. Create the new active policy
    policy = PolicyClaim(
        claim_id=random.randint(100000, 999999),
        worker_id=worker_id,
        policy_id=generate_policy_id(),
        plan_tier=plan_tier,
        weekly_premium=weekly_premium,
        activation_date=today,
        last_active_date=expiry,
        policy_status="active",
        eligibility_flag=True,
        events_used=0,
        events_remaining=PLAN_CONFIG[plan_tier]["events"],
        renewal_count=0,
        claim_auto_created=False,
        claim_valid_flag=False,
        payout_status="no_claim",
    )

    db.add(policy)
    db.commit()
    db.refresh(policy)

    # 5. Invalidate policy cache so the next GET /policies/me returns fresh data
    PolicyCache.invalidate_policy(worker_id)
    logger.info(
        f"[POLICY] Worker {worker_id} activated {plan_tier} plan "
        f"(premium={weekly_premium:.2f}, expires={expiry})"
    )

    return policy


# 🔹 Get Active Policy
def get_active_policy(db: Session, worker_id: int):
    # 🔥 CHECK CACHE FIRST (30 min TTL - policy changes infrequently)
    cached_policy = PolicyCache.get_active_policy(worker_id)
    if cached_policy:
        logger.info(f"[CACHE HIT] Active policy cache hit for worker {worker_id}")
        return cached_policy

    policy = (
        db.query(PolicyClaim)
        .filter(
            PolicyClaim.worker_id == worker_id, PolicyClaim.policy_status == "active"
        )
        .order_by(PolicyClaim.activation_date.desc())
        .first()
    )

    # 🔥 CACHE THE ACTIVE POLICY — serialize to dict first
    if policy:
        try:
            policy_dict = {
                "plan_tier": policy.plan_tier,
                "weekly_premium": float(policy.weekly_premium)
                if policy.weekly_premium is not None
                else None,
                "events_remaining": policy.events_remaining,
                "events_used": policy.events_used,
                "policy_status": policy.policy_status,
                "activation_date": str(policy.activation_date)
                if policy.activation_date is not None
                else None,
                "last_active_date": str(policy.last_active_date)
                if policy.last_active_date is not None
                else None,
                "policy_id": policy.policy_id,
            }
            PolicyCache.set_active_policy(worker_id, policy_dict)
        except Exception as e:
            logger.debug(f"[CACHE] Failed to cache policy: {e}")

    return policy


# 🔹 Policy History
def get_policy_history(db: Session, worker_id: int):
    return (
        db.query(PolicyClaim)
        .filter(PolicyClaim.worker_id == worker_id)
        .order_by(PolicyClaim.activation_date.desc())
        .all()
    )


def get_policy_by_id(db: Session, policy_id: int):
    return db.query(PolicyClaim).filter(PolicyClaim.policy_id == policy_id).first()
