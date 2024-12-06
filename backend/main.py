from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from openai import OpenAI

import os
from dotenv import load_dotenv

import redis
from celery import Celery

from pymongo import MongoClient
from pymongo.server_api import ServerApi
from contextlib import asynccontextmanager


load_dotenv()

# Load environment variables
redisUrl = os.getenv("REDISCLOUD_URL")
db_password = os.getenv("DB_PASSWORD")
redis_key = os.getenv('REDIS_KEY')
api_key = os.getenv('OPENAI_API_KEY') 
openAIClient = OpenAI(api_key=api_key)



@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        global mongoClient
        # Create MongoDB connection
        uri = f"mongodb+srv://kyleton06:{db_password}@plaintextresumestorage.7wxgt.mongodb.net/?retryWrites=true&w=majority&appName=PlainTextResumeStorage"
        mongoClient = MongoClient(uri, server_api=ServerApi('1'))
        # Test the connection with a ping
        mongoClient.admin.command('ping')
        print("MongoDB connection established and pinged successfully!")
        app.state.mongoClient = mongoClient  # Store client in app state

        yield  # Proceed with app lifespan
    except Exception as e:
        print(f"Error occurred during MongoDB connection: {e}")
        raise HTTPException(status_code=500, detail="Error with MongoDB connection")
    finally:
        # Close the MongoDB connection on shutdown
        mongoClient.close()
        print("MongoDB connection closed!")

app = FastAPI(lifespan=lifespan) # creates instance of FastAPI



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

# Middleware to allow CORS connection from frontend
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

class GoogleToken(BaseModel):
    id_token: str

@app.post("/retrieve_token")
def retrieve_token(id_token: GoogleToken):
    try:
        mongoClient = app.state.mongoClient
        resumeDatabase = mongoClient["PlainTextResumeStorage"]
        resume_collection = resumeDatabase["resume"]
        try:
            standard_data = {"resume" : "Initial Insert"}
            resume_collection.update_one({"_id": id_token.id_token}, {"$set": standard_data}, upsert=True)
            print("Document inserted successfully!")
        except Exception as e:
            print(f"Error occurred during insertion: {e}")
            raise HTTPException(status_code=500, detail=f"Error with MongoDB insertion:{e}")
        return id_token.id_token        
    except Exception as e:
        raise HTTPException(status_code=500, detail= f"Error with Google Token: {e}")


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

