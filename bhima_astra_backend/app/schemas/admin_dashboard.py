from pydantic import BaseModel
from typing import List
from datetime import datetime

# ✅ KPI Response
class KPIResponse(BaseModel):
    active_policies: int
    payouts_today: float
    fraud_holds: int
    loss_ratio: float
    total_workers: int


# ✅ Heatmap Zone
class HeatmapZone(BaseModel):
    zone_id: str
    rainfall: float
    temperature: float
    aqi: int
    traffic_index: float
    composite_score: float
    updated_at: datetime


# ✅ Agent Status
class AgentStatus(BaseModel):
    agent_name: str
    status: str
    last_run: datetime


# ✅ Agent List
class AgentStatusResponse(BaseModel):
    agents: List[AgentStatus]