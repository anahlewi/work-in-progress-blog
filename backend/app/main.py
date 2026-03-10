from os import getenv
from fastapi import FastAPI
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

url = getenv("SUPABASE_URL")
key = getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Initialize FastAPI app
app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic model for a note
class Note(BaseModel):
    title: str
    content: str


@app.get("/notes")
def get_notes():
    """Fetch all notes from Supabase."""
    response = supabase.table("notes").select("*").execute()
    return response.data

@app.get("/note")
def get_note(title: str):
    """Fetch a single note from Supabase."""
    response = supabase.table("notes").select("*").eq("title", title).execute()
    return response.data

@app.post("/notes")
def create_note(note: Note):
    """Insert a new note into Supabase."""
    response = supabase.table("notes").insert({"title": note.title, "content": note.content}).execute()
    return response.data