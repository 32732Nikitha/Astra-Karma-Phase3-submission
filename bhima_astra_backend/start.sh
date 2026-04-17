#!/bin/bash

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== BHIMA ASTRA Startup ===${NC}"

# Step 1: Run database migrations
echo -e "${YELLOW}[1/4] Running database migrations...${NC}"
alembic upgrade head
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Migration failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Migrations complete${NC}"

# Step 2: Start Celery worker
echo -e "${YELLOW}[2/4] Starting Celery worker...${NC}"
celery -A app.core.celery_app worker --loglevel=info &
WORKER_PID=$!
echo -e "${GREEN}✅ Celery worker started (PID: $WORKER_PID)${NC}"

# Step 3: Start Celery Beat (scheduler)
echo -e "${YELLOW}[3/4] Starting Celery Beat scheduler...${NC}"
celery -A app.core.celery_app beat --loglevel=info &
BEAT_PID=$!
echo -e "${GREEN}✅ Celery Beat started (PID: $BEAT_PID)${NC}"

# Step 4: Start FastAPI server
echo -e "${YELLOW}[4/4] Starting FastAPI server...${NC}"
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:10000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info

echo -e "${GREEN}✅ FastAPI server running on http://0.0.0.0:10000${NC}"
echo -e "${GREEN}📚 API docs available at: http://0.0.0.0:10000/docs${NC}"

# Trap signals to gracefully shutdown
trap "kill $WORKER_PID $BEAT_PID; exit 0" SIGTERM SIGINT
wait
