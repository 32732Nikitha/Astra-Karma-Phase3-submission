from app.utils.cache_manager import AdminStatsCache
from sqlalchemy import text


# 🔥 1. KPI DATA
def get_kpis(db):
    cached = AdminStatsCache.get_kpis()
    if cached is not None:
        return cached
    result = db.execute(
        text("""
        SELECT
            (SELECT COUNT(*) FROM policy_claims WHERE policy_status = 'active') AS active_policies,
            (SELECT COALESCE(SUM(amount),0) FROM payout_transactions WHERE DATE(created_at) = CURRENT_DATE) AS payouts_today,
            (SELECT COUNT(*) FROM policy_claims WHERE fraud_flag = true) AS fraud_holds,
            (SELECT 0.55) AS loss_ratio,
            (SELECT COUNT(*) FROM workers) AS total_workers
    """)
    ).fetchone()

    data = {
        "active_policies": result.active_policies,
        "payouts_today": float(result.payouts_today),
        "fraud_holds": result.fraud_holds,
        "loss_ratio": float(result.loss_ratio),
        "total_workers": result.total_workers,
    }
    AdminStatsCache.set_kpis(data)
    return data


# 🔥 2. HEATMAP DATA
def get_heatmap(db):
    result = db.execute(
        text("""
        SELECT *
        FROM zone_live_cache
    """)
    ).fetchall()

    return [
        {
            "zone_id": r.zone_id,
            "rainfall": r.rainfall,
            "temperature": r.temperature,
            "aqi": r.aqi,
            "traffic_index": r.traffic_index,
            "composite_score": r.composite_score,
            "updated_at": r.updated_at,
        }
        for r in result
    ]


# 🔥 3. AGENT STATUS
def get_agent_status(db):
    result = db.execute(
        text("""
        SELECT *
        FROM agent_state
    """)
    ).fetchall()

    return {
        "agents": [
            {"agent_name": r.agent_name, "status": r.status, "last_run": r.last_run}
            for r in result
        ]
    }
