from typing import List, Optional

from app.core.deps import get_current_user
from app.db.session import get_db
from app.schemas.manager import (
    CreateFlagRequest,
    FlagResponse,
    ManagerDashboardStats,
    ManagerProfile,
    MessageResponse,
    TriggerEventResponse,
    WorkerInZone,
)
from app.services.manager_service import (
    create_disruption_flag_full,
    create_flag,
    get_manager_dashboard_stats,
    get_manager_flags,
    get_manager_flags_all,
    get_manager_profile,
    get_workers_in_zone,
    get_zone_trigger_events,
)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

router = APIRouter(prefix="/manager", tags=["Manager"])


# ── Profile & auth-bound endpoints ──────────────────────────────────────────


@router.get("/me/profile")
def manager_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get authenticated manager's profile and assigned zones."""
    manager_id = current_user.manager_id
    if not manager_id:
        raise HTTPException(status_code=403, detail="Manager access only")
    profile = get_manager_profile(db, manager_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Manager not found")
    return profile


@router.get("/me/stats")
def manager_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dashboard stats for all zones assigned to this manager."""
    manager_id = current_user.manager_id
    if not manager_id:
        raise HTTPException(status_code=403, detail="Manager access only")
    return get_manager_dashboard_stats(db, manager_id)


@router.get("/me/flags")
def manager_flags_me(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """All disruption flags submitted by this manager."""
    manager_id = current_user.manager_id
    if not manager_id:
        raise HTTPException(status_code=403, detail="Manager access only")
    return get_manager_flags_all(db, manager_id)


# ── Zone-scoped endpoints ────────────────────────────────────────────────────


@router.get("/zones/{zone_id}/workers")
def zone_workers(
    zone_id: str,
    status: Optional[str] = Query(None),
    fraud_risk: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """All workers in a zone with policy status. Filterable by status and fraud_risk."""
    return get_workers_in_zone(
        db, zone_id, status_filter=status, risk_filter=fraud_risk
    )


@router.get("/zones/{zone_id}/triggers")
def zone_triggers(
    zone_id: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Recent trigger events for a zone."""
    return get_zone_trigger_events(db, zone_id, limit=limit)


# ── Flag endpoints ───────────────────────────────────────────────────────────


@router.post("/flag-disruption")
def flag_disruption(
    request: CreateFlagRequest,
    db: Session = Depends(get_db),
):
    """Submit a social disruption flag with full detail (route, evidence, times)."""
    result = create_disruption_flag_full(
        db,
        manager_id=request.manager_id,
        zone_id=request.zone_id,
        disruption_type=request.disruption_type,
        description=request.description,
        evidence_url=request.evidence_url,
        estimated_start=request.estimated_start,
        estimated_end=request.estimated_end,
    )
    if "error" in result:
        raise HTTPException(status_code=403, detail=result["error"])
    return result


@router.post("/flag", response_model=MessageResponse)
def create_disruption_flag(
    request: CreateFlagRequest,
    db: Session = Depends(get_db),
):
    """Legacy flag endpoint (simple). Use /flag-disruption for full detail."""
    if request.disruption_type not in [
        "strike",
        "protest",
        "curfew",
        "road_blockage",
        "zone_shutdown",
    ]:
        raise HTTPException(status_code=400, detail="Invalid disruption type")
    return create_flag(
        db,
        request.manager_id,
        request.zone_id,
        request.disruption_type,
        request.description,
    )


@router.get("/flags")
def fetch_flags(manager_id: int, db: Session = Depends(get_db)):
    """Get flags by manager_id (legacy, no auth required)."""
    return get_manager_flags(db, manager_id)
