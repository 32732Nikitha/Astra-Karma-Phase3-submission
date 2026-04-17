from app.core.deps import get_current_worker
from app.db.session import get_db
from app.services.policy_service import (
    activate_policy,
    get_active_policy,
    get_policy_history,
)
from app.utils.cache_manager import PlanComparisonCache
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/policies", tags=["Policies"])


# 🔹 Compare Plans
@router.get("/plans/compare")
def compare_plans(city: str = "Mumbai", db: Session = Depends(get_db)):
    from app.ml.premium_inference import BASE_PREMIUMS, PAYOUT_RATES_BASE
    from app.ml.risk_inference import (
        CITY_TIER_MULTIPLIERS,
        SEVERITY_MULTIPLIERS,
        get_city_tier,
    )

    city_tier = get_city_tier(city)

    # Cache check
    cached = PlanComparisonCache.get(city_tier)
    if cached is not None:
        return cached

    city_mult = CITY_TIER_MULTIPLIERS.get(city_tier, 1.0)
    severity_mult = SEVERITY_MULTIPLIERS.get(city_tier, 1.0) if city_tier > 1 else 1.0

    plans = []
    for plan_name in ["basic", "standard", "premium"]:
        base_premium = BASE_PREMIUMS[plan_name]
        adjusted_premium = round(base_premium * city_mult, 2)
        payouts = PAYOUT_RATES_BASE[plan_name]
        plans.append(
            {
                "tier": plan_name,
                "weekly_premium": adjusted_premium,
                "base_premium": base_premium,
                "city_multiplier": city_mult,
                "payout_l1": round(payouts["L1"] * city_mult * severity_mult, 2),
                "payout_l2": round(payouts["L2"] * city_mult * severity_mult, 2),
                "payout_l3": round(payouts["L3"] * city_mult * severity_mult, 2),
                "max_events": 2,
            }
        )

    result = {
        "city": city.title(),
        "city_tier": city_tier,
        "tier_label": f"tier{city_tier}",
        "multiplier": city_mult,
        "plans": plans,
        "cached": False,
    }
    PlanComparisonCache.set(city_tier, result)
    return result


# 🔥 Activate Policy
@router.post("/activate")
def activate(
    req: dict, db: Session = Depends(get_db), current_worker=Depends(get_current_worker)
):
    plan = req.get("plan_tier")

    if plan not in ["Basic", "Standard", "Premium"]:
        raise HTTPException(status_code=400, detail="Invalid plan")

    return activate_policy(db, current_worker.worker_id, plan)


# 🔹 Get Active Policy
@router.get("/me")
def get_my_policy(
    db: Session = Depends(get_db), current_worker=Depends(get_current_worker)
):
    policy = get_active_policy(db, current_worker.worker_id)

    if not policy:
        return {"message": "No active policy"}

    return policy


# 🔹 History
@router.get("/history")
def history(db: Session = Depends(get_db), current_worker=Depends(get_current_worker)):
    return get_policy_history(db, current_worker.worker_id)


from app.services.policy_service import get_policy_by_id


@router.get("/{policy_id}")
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = get_policy_by_id(db, policy_id)

    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    return policy
