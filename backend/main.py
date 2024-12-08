from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi
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

# Global variable to cache the client connection
_mongo_client = None

def get_mongo_client():
    global _mongo_client
    
    # If client doesn't exist or is closed, create a new one
    if _mongo_client is None:
        try:
            uri = os.getenv("MONGO_URI")
            if not uri:
                raise ValueError("MongoDB URI not found in environment variables")
            
            print("Initializing MongoDB connection...")
            _mongo_client = MongoClient(uri, server_api=ServerApi('1'))
            
            # Verify connection
            _mongo_client.admin.command('ping')
            print("MongoDB connection established successfully!")
        
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            raise HTTPException(status_code=500, detail=f"MongoDB connection failed: {str(e)}")
    
    return _mongo_client

# In your main FastAPI file
app = FastAPI()

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


# Security scheme to handle bearer tokens
security = HTTPBearer()

# Dependency for user authentication
@app.get("/current_user")
async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        # Log the received credentials
        print(f"Authorization Header Received: {credentials.credentials}")

        # Verify the Google ID Token
        idinfo = id_token.verify_oauth2_token(
            credentials.credentials,
            requests.Request(),
            os.getenv("REACT_APP_GOOGLE_CLIENT_ID")
        )

        # Log the decoded token information
        print(f"Decoded Token Info: {idinfo}")

        # Extract and return the user ID
        user_id = idinfo["sub"]
        print(f"Authenticated User ID: {user_id}")
        return user_id

    except ValueError as e:
        # Log error details if token verification fails
        print(f"Token verification error: {e}")
        raise HTTPException(
            status_code=401,
            detail=f"Could not validate credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"}
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
        mongo_client = get_mongo_client()
        resume_db = mongo_client["PlainTextResumeStorage"]
        resume_collection = resume_db["resume"]

        # Store or update user in MongoDB
        user_data = {"_id": user_id, "email": email, "name": name, "update": "4" ,"credentials": data.id_token}
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
        print(response.choices[0].message.content)
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error occurred during processing of message: {e}")
        return {"error": str(e)}










class ResumeImprovementRequest(BaseModel):
    improvement_instruction: str

# Modify the Celery task to handle resume improvement
@celery.task(name="main.improve_resume")
def improve_resume(user_id: str, improvement_instruction: str):
    try:
        # Get MongoDB client
        mongo_client = get_mongo_client()
        resume_db = mongo_client["PlainTextResumeStorage"]
        resume_collection = resume_db["resume"]

        # Retrieve the user's resume
        resume_doc = resume_collection.find_one({"_id": user_id})
        
        if not resume_doc:
            return {"error": "Resume not found"}

        # Prepare the prompt for OpenAI with current resume and improvement instruction
        current_resume = resume_doc.get('content', '')
        
        # Construct the prompt
        prompt = f"""
        Current Resume:
        {current_resume}

        Improvement Instruction: {improvement_instruction}

        Please provide an improved version of the resume based on the instruction above.
        """

        # Call OpenAI to improve the resume
        response = openAIClient.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional resume editor. Provide detailed, precise improvements to the resume."},
                {"role": "user", "content": prompt }
            ]
        )

        # Get the improved resume content
        print(response.choices[0].message.content)
        improved_resume = response.choices[0].message.content

        # Update the resume in the database
        resume_collection.update_one(
            {"_id": user_id},
            {"$set": {
                "content": improved_resume,
                "last_improved": improvement_instruction
            }}
        )

        return {
            "improved_resume": improved_resume,
            "improvement_instruction": improvement_instruction
        }
    
    except Exception as e:
        print(f"Error occurred during resume improvement: {e}")
        return {"error": str(e)}








# Create endpoint for resume improvement
@app.post("/improve_resume")
def improve_resume_endpoint(
    request: ResumeImprovementRequest,
    user_id: str = Depends(get_current_user)
):
    try:
        # Trigger the Celery task for resume improvement
        task = improve_resume.delay(user_id, request.improvement_instruction)
        
        return {
            "task_id": task.id,
            "message": "Resume improvement task initiated"
        }
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error initiating resume improvement")












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
    try:
        client = get_mongo_client()
        client.admin.command('ping')
        return {"status": "ok", "message": "MongoDB client is initialized and responsive"}
    except Exception as e:
        return {"status": "error", "message": f"MongoDB connection failed: {str(e)}"}
