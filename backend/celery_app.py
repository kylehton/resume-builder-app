from celery import Celery
import os

celery = Celery(
     "tasks",
     broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),  # Update this URL if Redis is running elsewhere
     backend=os.getenv("REDIS_URL", "redis://localhost:6379/0")
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)