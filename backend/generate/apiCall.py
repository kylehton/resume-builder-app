from dotenv import load_dotenv
from openai import OpenAI
from fastapi import FastAPI, HTTPException
import os
from pydantic import BaseModel

load_dotenv()

# Define your FastAPI app for this module
app = FastAPI()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class MessageRequest(BaseModel):
    message: str

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



