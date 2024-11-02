from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

redisUrl=os.getenv("REDIS_URL")

celery = Celery(
     "tasks",
     broker=(redisUrl),  
     backend=(redisUrl)
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)