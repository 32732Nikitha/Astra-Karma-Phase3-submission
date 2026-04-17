"""
Fraud Detection Service - 4-Stage Cascade

Routes to actual fraud_inference.py which implements:
Stage 1: Deterministic rules
Stage 2: Behavioral LSTM
Stage 3: Graph clustering (Louvain)
Stage 4: Adaptive percentile decisioning
"""

from sqlalchemy.orm import Session
from app.db.models.policy_claim import PolicyClaim
from app.ml.fraud_inference import run_fraud_check as ml_run_fraud_check


def run_fraud_check(db: Session, claim_id: int):
    """
    Run complete 4-stage fraud detection cascade on a claim.
    
    Uses actual trained models and sophisticated signal processing:
    - XGBoost fraud classifier
    - LSTM behavioral analysis
    - Louvain ring fraud detection
    - Adaptive percentile decisioning
    
    Returns complete fraud check result with detailed breakdown.
    """
    result = ml_run_fraud_check(db, claim_id)
    return result


def process_fraud_check(db: Session, claim_id: int):
    """
    Alias for run_fraud_check - maintained for backward compatibility.
    """
    return run_fraud_check(db, claim_id)