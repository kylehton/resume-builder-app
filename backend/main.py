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

load_dotenv()

# Load environment variables
redisUrl = os.getenv("REDISCLOUD_URL")
db_password = os.getenv("DB_PASSWORD")
GOOGLE_CLIENT_ID = os.getenv("REACT_APP_GOOGLE_CLIENT_ID").strip()  # Google Client ID from .env

# FastAPI lifespan to manage MongoDB connection
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Create MongoDB connection
        uri = f"mongodb+srv://kyleton06:{db_password}@plaintextresumestorage.7wxgt.mongodb.net/?retryWrites=true&w=majority&appName=PlainTextResumeStorage"
        mongo_client = MongoClient(uri, server_api=ServerApi('1'))
        # Test the connection with a ping
        mongo_client.admin.command('ping')
        print("MongoDB connection established and pinged successfully!")
        app.state.mongo_client = mongo_client  # Store client in app state
        yield
    except Exception as e:
        print(f"Error occurred during MongoDB connection: {e}")
        raise HTTPException(status_code=500, detail="Error with MongoDB connection")
    finally:
        # Close the MongoDB connection on shutdown
        if hasattr(app.state, "mongo_client"):
            app.state.mongo_client.close()
            print("MongoDB connection closed!")

# Create FastAPI app
app = FastAPI(lifespan=lifespan)

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

@app.get("/")
async def root():
    return {"message": "testing access"}
