from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import uvicorn
import os

app = FastAPI()
load_dotenv()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://resume-builder-frontend-nine.vercel.app","http://localhost:3000"],  # uses default local host on machine
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)

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



# Uncomment the below to run locally (do not use in Vercel's serverless functions)
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)