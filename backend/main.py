from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import os
import redis
from celery import Celery
import asyncio

app = FastAPI()
load_dotenv()

redisUrl = os.getenv("REDISCLOUD_URL")

celery = Celery(
    "tasks",
    broker=redisUrl,
    backend=redisUrl
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

celery.autodiscover_tasks(['main'])  # Ensures tasks in 'main' are discovered

redis_key = os.getenv('REDIS_KEY')
api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)

r = redis.from_url(redisUrl)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://resume-builder-frontend-nine.vercel.app/resume",
        "https://resume-builder-frontend-nine.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    message: str

@celery.task
def process_message(request_message: str):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are going to help with resume suggestions"},
                {"role": "user", "content": request_message}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error occurred during processing of message: {e}")
        return {"error": str(e)}

@app.post("/chat")
def chat(message: MessageRequest):
    try:
        task = process_message.delay(message.message)
        return {"task_id": task.id}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error with OpenAI API")

@app.get("/result/{task_id}")
def get_result(task_id: str):
    result = celery.AsyncResult(task_id)  # Use celery.AsyncResult instead
    print(f"Task ID: {task_id}, Status: {result.state}")
    if result.state == 'PENDING':
        return {"status": result.state}
    elif result.state == 'FAILURE':
        print(f"Task Failed: {result.info}")
        return {"status": result.state, "error": str(result.info)}
    else:
        print(f"Task Completed: {result.result}")
        return {"status": result.state, "result": result.result}

@app.get("/")
async def root():
    return {"message": "testing access"}

async def get_openai_suggestion(section_text, section_name):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are going to help with resume suggestions"},
                {"role": "user", "content": f"Improve the {section_name} section of my resume:\n\n{section_text}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error occurred during processing: {e}")
