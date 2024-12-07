from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from contextlib import asynccontextmanager
from openai import OpenAI
import redis
from celery import Celery

load_dotenv()

# Load environment variables
redisUrl = os.getenv("REDISCLOUD_URL")
db_password = os.getenv("DB_PASSWORD")
GOOGLE_CLIENT_ID = os.getenv("REACT_APP_GOOGLE_CLIENT_ID").strip()  # Google Client ID from .env
redis_key = os.getenv('REDIS_KEY')
api_key = os.getenv('OPENAI_API_KEY') 
openAIClient = OpenAI(api_key=api_key)

app = FastAPI()
mongo_client = None  # Global variable for MongoDB client

# MongoDB connection initialization on startup
@app.on_event("startup")
async def startup_mongo():
    global mongo_client
    if mongo_client is None:
        try:
            print("Starting MongoDB connection...")
            uri = f"mongodb+srv://kyleton06:{db_password}@plaintextresumestorage.7wxgt.mongodb.net/?retryWrites=true&w=majority&appName=PlainTextResumeStorage"
            mongo_client = MongoClient(uri, server_api=ServerApi('1'))
            mongo_client.admin.command('ping')
            print("MongoDB connection established and pinged successfully!")
        except Exception as e:
            print(f"MongoDB initialization failed: {e}")
            raise HTTPException(status_code=500, detail="MongoDB initialization failed")

@app.on_event("shutdown")
async def shutdown_mongo():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("MongoDB connection closed during shutdown.")

# creates instance of Celery 
celery = Celery(
    "tasks",
    broker=redisUrl,
    backend=redisUrl
)

# Celery configuration
celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)


# Connect to Redis via Heroku-Redis add-on
r = redis.from_url(redisUrl)

# Middleware to allow CORS
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

# Request body model for retrieving token
class GoogleToken(BaseModel):
    id_token: str

@app.post("/retrieve_token")
async def retrieve_token(data: GoogleToken):
    try:
        # Verify the Google ID Token
        idinfo = id_token.verify_oauth2_token(data.id_token, requests.Request(), GOOGLE_CLIENT_ID)

        # Extract user info
        user_id = idinfo["sub"]  # User's Google ID
        email = idinfo.get("email")
        name = idinfo.get("name")

        # Access MongoDB
        mongo_client = app.state.mongo_client
        resume_db = mongo_client["PlainTextResumeStorage"]
        resume_collection = resume_db["resume"]

        # Store or update user in MongoDB
        user_data = {"_id": user_id, "email": email, "name": name}
        resume_collection.update_one({"_id": user_id}, {"$set": user_data}, upsert=True)

        print(f"User verified: {name} ({email}), ID: {user_id}")
        return {"message": "User verified and stored successfully", "user_id": user_id}
    except ValueError as e:
        # Token verification failed
        print(f"Invalid ID token: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid ID token: {e}")
    except Exception as e:
        print(f"Error during token processing: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {e}")

# Define the request body for the chat endpoint
class MessageRequest(BaseModel):
    message: str

# Create endpoint for API call to OpenAI and run it as a Celery task
@celery.task(name="main.process_message")
def process_message(request_message: str):
    try:
        response = openAIClient.chat.completions.create(
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

# Create endpoint for chat API
@app.post("/chat")
def chat(message: MessageRequest):
    try:
        task = process_message.delay(message.message) # Use .delay() to run the task asynchronously
        return {"task_id": task.id}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error with OpenAI API")
    

# Create endpoint to get the result of the chat API for state logging
@app.get("/result/{task_id}")
def get_result(task_id: str):
    result = celery.AsyncResult(task_id)  # Get the result of the task
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

# Health check endpoint for mongo_client global connection
@app.get("/health")
async def health_check():
    if mongo_client is None:
        return {"status": "error", "message": "MongoDB client not initialized"}
    return {"status": "ok", "message": "MongoDB client is initialized"}

