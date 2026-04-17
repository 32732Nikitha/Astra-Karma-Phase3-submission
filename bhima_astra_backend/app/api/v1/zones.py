from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.zone_service import compute_zone_live_data

router = APIRouter(prefix="/zones", tags=["Zones"])


# @router.get("/{zone_id}/live")
# def get_zone_live(zone_id: str, db: Session = Depends(get_db)):
#     return compute_zone_live_data(db, zone_id)

from app.services.zone_service import get_zone_live_cached


@router.get("/{zone_id}/live")
def get_zone_live(zone_id: str, db: Session = Depends(get_db)):
    return get_zone_live_cached(db, zone_id)

from app.services.zone_service import get_zone_forecast


@router.get("/forecast")
def zone_forecast(zone_id: str, db: Session = Depends(get_db)):
    return get_zone_forecast(db, zone_id)

from app.services.zone_service import get_zone_history


@router.get("/history")
def zone_history(
    zone_id: str,
    days: int = 7,
    db: Session = Depends(get_db)
):
    return get_zone_history(db, zone_id, days)

from app.services.zone_service import get_zone_dashboard
@router.get("/zones/dashboard")
def zone_dashboard(zone_id: str, db: Session = Depends(get_db)):
    return get_zone_dashboard(db, zone_id)