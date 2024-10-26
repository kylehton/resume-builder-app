from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from generate.apiCall import process_message  # Import the process_message function
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from chatAPI import process_message
import uvicorn
import os

app = FastAPI()
load_dotenv()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://resume-builder-frontend-nine.vercel.app/","http://localhost:3000"],  # uses default local host on machine
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.post("/chat")
async def chat(message: MessageRequest):
    try:
        response = await process_message(message)
        print("Response from process_message:", response)  # Debugging print
        return response

    except Exception as e:
        print(f"Error: {e}")  
        raise HTTPException(status_code=500, detail="Error with OpenAI API")

# Define request model
class ResumeRequest(BaseModel):
    resume_text: str

# test function for embedding resume
@app.post("/improve-resume")
async def improve_resume(request: ResumeRequest):
    try:
        # Send the resume text to OpenAI for suggestions
        response = openai.Completion.create(
            model="gpt-3.5-turbo",
            prompt=f"Suggest improvements for this resume:\n\n{request.resume_text}",
            max_tokens=50
        )

        # Extract the suggestion text
        suggestions = response.choices[0].text.strip()
        return {"suggestions": suggestions}

    except Exception as e:
        raise HTTPException(status_code=500, detail="Error with OpenAI API")

# initial server screen
@app.get("/")
async def root():
    return {"message": "testing access"}

# API endpoint for uploading a resume file to database
@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    # Process the resume file, parse it for text
    # Embed it in the vector database
    return {"message": "Resume uploaded and embedded"}

# API endpoint for parsing the uploaded resume
@app.get("/parse_resume/{user_id}")
async def parse_resume(user_id: int):
    # Retrieve the embedded resume, extract info (e.g., name, skills)
    return {"parsed_data": "Relevant info extracted"}

# API endpoint for generating suggestions based on the parsed resume
# this is in the case of pre-user-input suggestions (if we choose to do so)
@app.post("/generate_suggestions/{user_id}")
async def generate_suggestions(user_id: int):
    # Run parsed resume data through a generative AI model (e.g., OpenAI API)
    suggestions = "Generated suggestions based on resume"
    return {"suggestions": suggestions}

# API endpoint for fetching the suggestions
@app.get("/suggestions/{user_id}")
async def get_suggestions(user_id: int):
    # Fetch the suggestions from the database or cache
    return {"suggestions": "AI suggestions for the resume"}

# Uncomment the below to run locally (do not use in Vercel's serverless functions)
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)