import re
import uuid
from os import getenv
from os.path import splitext
from typing import Literal

from fastapi import FastAPI, HTTPException, UploadFile, File
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
    "https://work-in-progress-blog.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NoteType = Literal["note", "post"]
Section = Literal["pinned", "musings", "tutorials", "reviews"]

MEDIA_BUCKET = "media"
ALLOWED_UPLOAD_TYPES = {
    "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml",
    "video/mp4", "video/webm", "video/quicktime",
}
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50MB, matches the bucket's file size limit

# Pydantic model for a note
class Note(BaseModel):
    title: str
    content: str
    type: NoteType = "note"
    section: Section | None = None

class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    section: Section | None = None


def slugify(text: str) -> str:
    """Convert a title into a URL-safe slug."""
    slug = re.sub(r"[^a-z0-9]+", "-", text.strip().lower()).strip("-")
    return slug or "untitled"


def unique_slug(base_slug: str) -> str:
    """Ensure the slug doesn't collide with an existing note's slug."""
    existing = (
        supabase.table("notes")
        .select("slug")
        .like("slug", f"{base_slug}%")
        .execute()
    )
    taken = {row["slug"] for row in existing.data}
    if base_slug not in taken:
        return base_slug
    suffix = 2
    while f"{base_slug}-{suffix}" in taken:
        suffix += 1
    return f"{base_slug}-{suffix}"


@app.get("/notes")
def get_notes():
    """Fetch all notes from Supabase."""
    response = supabase.table("notes").select("*").order("created_at", desc=True).execute()
    return response.data

@app.get("/notes/{slug}")
def get_note_by_slug(slug: str):
    """Fetch a single note from Supabase by its slug."""
    response = supabase.table("notes").select("*").eq("slug", slug).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    return response.data[0]

@app.post("/notes")
def create_note(note: Note):
    """Insert a new note into Supabase."""
    slug = unique_slug(slugify(note.title))
    response = supabase.table("notes").insert({
        "title": note.title,
        "content": note.content,
        "type": note.type,
        "section": note.section,
        "slug": slug,
    }).execute()
    return response.data

@app.patch("/notes/{note_id}")
def update_note(note_id: str, note: NoteUpdate):
    """Update an existing note's title/content in Supabase."""
    updates = note.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    response = supabase.table("notes").update(updates).eq("id", note_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Note not found")
    return response.data

@app.post("/upload")
async def upload_media(file: UploadFile = File(...)):
    """Upload an image/video to Supabase Storage and return its public URL."""
    if file.content_type not in ALLOWED_UPLOAD_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large (50MB max)")

    ext = splitext(file.filename or "")[1]
    path = f"{uuid.uuid4()}{ext}"
    supabase.storage.from_(MEDIA_BUCKET).upload(
        path, data, {"content-type": file.content_type}
    )
    public_url = supabase.storage.from_(MEDIA_BUCKET).get_public_url(path)
    return {"url": public_url}
