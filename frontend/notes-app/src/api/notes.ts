import type { NoteType, Section } from "../App";

export async function fetchNotes() {
  const res = await fetch('/api/notes');
  return res.json();
}

export async function fetchNoteBySlug(slug: string) {
  const res = await fetch(`/api/notes/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createNote(title: string, content: string, type: NoteType = "note", section: Section | null = null) {
  const res = await fetch('/api/notes', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, type, section }),
  });
  return res.json();
}

export async function updateNote(id: string, updates: { title?: string; content?: string; section?: Section | null }) {
  const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}
