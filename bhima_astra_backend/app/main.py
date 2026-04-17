import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger("bhima.startup")

# ============================================================================
# LIFESPAN CONTEXT MANAGER - Load ML Models on Startup
# ============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager to load all ML models at startup.

    Models loaded:
    - income_model.pkl (Random Forest)
    - disruption_realtime_model.pkl (XGBoost)
    - premium_model.pkl (Ridge)
    - fraud_model.pkl (XGBoost)
    + all encoders and feature specs
    """
    # Startup: Load models
    logger.info("🚀 Application startup - Loading ML models...")
    from app.ml.model_loader import initialize_all_models

    success = initialize_all_models()
    if success:
        logger.info("✅ All ML models loaded successfully")
    else:
        logger.warning("⚠️ Some ML models failed to load - check MODEL_DIR path")

    yield

    # Shutdown: Cleanup (optional)
    logger.info("👋 Application shutdown")


# ============================================================================
# FASTAPI APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title="BHIMA ASTRA - GigShield API",
    description="AI-Powered Parametric Insurance for Gig Workers",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routers
from app.api.v1 import auth

app.include_router(auth.router)

from app.api.v1 import workers

app.include_router(workers.router)

from app.api.v1 import ml

app.include_router(ml.router)

from app.api.v1 import policies

app.include_router(policies.router)

from app.api.v1 import internal

app.include_router(internal.router)

from app.api.v1 import payouts

app.include_router(payouts.router)

from app.api.v1 import zones

app.include_router(zones.router)

from app.api.v1 import manager

app.include_router(manager.router)

from app.api.v1 import admin

app.include_router(admin.router)

from app.api.v1 import admin_dashboard

app.include_router(admin_dashboard.router)

from app.api.v1 import admin_live

app.include_router(admin_live.router)

from app.api.v1 import admin_claims

app.include_router(admin_claims.router)

from app.api.v1 import ws

app.include_router(ws.router)

from app.api.v1 import chat

app.include_router(chat.router)
