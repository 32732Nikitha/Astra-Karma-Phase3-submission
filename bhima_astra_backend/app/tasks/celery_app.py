# from celery import Celery
# from celery.schedules import crontab
# from app.config import settings

# # 🔹 Create Celery instance
# celery = Celery(
#     "bhima_astra",
#     broker=settings.REDIS_URL,
#     backend=settings.REDIS_URL,
# )

# # 🔹 Auto-discover tasks
# celery.autodiscover_tasks(["app.tasks"])

# # 🔹 IMPORTANT: Use single default queue (fixes your issue)
# celery.conf.task_default_queue = "celery"

# # 🔹 Optional (future scaling — safe to keep)
# celery.conf.task_queues = {
#     "celery": {
#         "exchange": "celery",
#         "routing_key": "celery",
#     }
# }

# # 🔹 Beat Scheduler (Monitor Agent every 5 mins)
# celery.conf.beat_schedule = {
#     "run-monitor-every-5-min": {
#         "task": "app.tasks.monitor_tasks.monitor_task",
#         "schedule": crontab(minute="*/5"),
#     }
# }

# # 🔹 Timezone (important for production)
# celery.conf.timezone = "Asia/Kolkata"

# # 🔹 Optional: Reliability settings (recommended)
# celery.conf.update(
#     task_serializer="json",
#     accept_content=["json"],
#     result_serializer="json",
#     worker_prefetch_multiplier=1,   # avoids task overload
#     task_acks_late=True,            # safer execution
# )

# celery.conf.beat_schedule.update({
#     "refresh-zone-cache": {
#         "task": "app.tasks.zone_tasks.refresh_zone_cache",
#         "schedule": crontab(minute="*/5"),
#     }
# })
from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery = Celery(
    "bhima_astra",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

# 🔥 EXPLICIT IMPORT (MANDATORY)
import app.tasks.monitor_tasks
import app.tasks.trigger_tasks
import app.tasks.fraud_tasks
import app.tasks.payout_tasks
import app.tasks.zone_tasks   # <-- IMPORTANT (new)

# 🔹 Queue config
celery.conf.task_default_queue = "celery"
celery.autodiscover_tasks([
    "app.tasks"
])
# 🔹 Beat schedule
celery.conf.beat_schedule = {
    "run-monitor-every-5-min": {
        "task": "app.tasks.monitor_tasks.monitor_task",
        "schedule": crontab(minute="*/5"),
    },
    "refresh-zone-cache": {
        "task": "app.tasks.zone_tasks.refresh_zone_cache",
        "schedule": crontab(minute="*/5"),
    }
}

# 🔹 Timezone
celery.conf.timezone = "Asia/Kolkata"

# 🔹 Reliability
celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

from celery.schedules import crontab
import app.tasks.zone_orchestrator_tasks
celery.conf.beat_schedule = {
    "run-monitor-every-5-min": {
        "task": "app.tasks.monitor_tasks.monitor_task",
        "schedule": crontab(minute="*/5"),
    },
    "refresh-zone-cache": {
        "task": "app.tasks.zone_tasks.refresh_zone_cache",
        "schedule": crontab(minute="*/5"),
    },
    "zone-orchestrator": {
        "task": "app.tasks.zone_orchestrator_tasks.zone_orchestrator_task",
        "schedule": crontab(minute="*/2"),
    }
}