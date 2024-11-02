from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import uvicorn
import os
import redis
from celery import Celery

app = FastAPI()
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

api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)

r = redis.Redis(
  host='redis-17933.c289.us-west-1-2.ec2.redns.redis-cloud.com',
  port=17933,
  password=redis_key)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://resume-builder-frontend-nine.vercel.app/resume", 
        "https://resume-builder-frontend-nine.vercel.app",
        "http://localhost:3000"],  # uses default local host on machine
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class MessageRequest(BaseModel):
    message: str

@celery.task
async def process_message(request: MessageRequest):
    try:
        # Call OpenAI API to process the message
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are going to help with resume suggestions"},
                {"role": "user", "content": request.message}
            ]
        )
        return {"response": response.choices[0].message.content}  # Return the response content
    except Exception as e:
        print(f"Error occured during processing of message: {e}")


@app.post("/chat")
async def chat(message: MessageRequest):
    try:
        response = await process_message(message)
        print("Response from process_message:", response)  # Debugging print
        return response

    except Exception as e:
        print(f"Error: {e}")  
        raise HTTPException(status_code=500, detail="Error with OpenAI API")


# initial server screen
@app.get("/")
async def root():
    return {"message": "testing access"}



async def get_openai_suggestion(section_text, section_name):
    try:
        # Call OpenAI API to process the message
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are going to help with resume suggestions"},
                {"role": "user", "content": f"Improve the {section_name} section of my resume:\n\n{section_text}"}
            ]
        )
        return response.choices[0].message.content  # Return the response content
    except Exception as e:
        print(f"Error occured during processing: {e}")


# Uncomment the below to run locally (do not use in Vercel's serverless functions)
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)