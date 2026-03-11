
/// <reference types="vite/client" />

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function fetchNotes() {
  const res = await fetch(`${BASE_URL}/notes`);
  return res.json();
}

export async function fetchNote(title: string) {
  const res = await fetch(`${BASE_URL}/note?title=${title}`);
  const data = await res.json();
  return data[0];
}

export async function createNote(title: string, content: string) {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  return res.json();
}
