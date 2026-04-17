from app.tasks.celery_app import celery
from app.db.session import SessionLocal
from app.db.models.worker import Worker
from app.tasks.trigger_tasks import trigger_task


@celery.task
def monitor_task():
    db = SessionLocal()

    workers = db.query(Worker).all()
    print(f"[MONITOR] Found {len(workers)} workers")

    for w in workers:
        print(f"[MONITOR] Sending trigger for worker {w.worker_id}")
        trigger_task.delay(w.worker_id)

    db.close()
    return "monitor completed"