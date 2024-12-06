from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv()

db_password = os.getenv("DB_PASSWORD")

#replace <db_password> with my password for login
uri = f"mongodb+srv://kyleton06:{db_password}@plaintextresumestorage.7wxgt.mongodb.net/?retryWrites=true&w=majority&appName=PlainTextResumeStorage"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

