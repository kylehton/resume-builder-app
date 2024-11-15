# Resume Builder App README

Hello all, this is our application for the PM Accelerator Internship/Bootcamp.

It is a Resume Builder App, that intakes a resume as a PDF, vectorizes and embeds it, and uses 
Retrieval-Augmented Generation to gather the appropriate section, in which it is sent into a GPT,
improving it through relevant keywords and phrases, and inserted back into a basic resume template.
The version can then be downloaded as a PDF format.

Both the front-end React App and back-end FastAPI server are deployed through vercel
Front: https://resume-builder-frontend-nine.vercel.app/
Back-end/Server: https://resume-builder-backend-mu.vercel.app/

We are using Heroku, alongside Redis to host an asynchronous task worker with a task queue.



# Backend Process

Installation Manager: pip install ...

Dependencies: fastapi==0.115.2, uvicorn==0.32.0, python-dotenv==1.0.1, openai==1.52.2, 
pydantic==2.9.2, openai==1.52.2, pdfplumber==0.11.4, fpdf==1.7.2, celery==5.4.0
redis==5.2.0

Additional Comment - requirements.txt in root directory is for Heroku usage, while the one in 
'/backend' directory is for Vercel back-end deployment

- Uses Celery worker to run tasks that are added to a queue; currently uses the Free tier, so the 
worker goes to sleep after 30 minutes (new task added to queue will wake it up, but will be 
presented with a small delay)
- Leverages OpenAI API GPT-3.5-Turbo to get resume suggestions from text via a chatbot integration,
in which it edits the resume section for us as plain text
- new section is then vectorized and replaces its previous section within the vector database
- retrieves and stores embeddings of sections of a resume for usage in API call and suggestion 
changes



# Frontend Process

Installation Manager: npm install ...

Dependencies: 
Material UI, Google OAuth, Framer Motion, PDFjs,

Homepage:
- Contains Google Sign In feature, User Google ID used for database storage key for individualized
collection containment
- After Sign-in, routes to a Dashboard page, with the main component being a button to route to 
resume customization section as well as previous resume saves
- Resume customization section contains a chatbox with a virtual assistant as well as a rendered
model of the resume. Render updates based on suggestion from chatbot. 
- Resume rendering is saved through a SQL database