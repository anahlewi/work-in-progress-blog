const API_URL = "http://localhost:8000";


export async function fetchNotes() {
  const res = await fetch(`${API_URL}/notes`);
  return res.json();
}

export async function fetchNote(title: string) {
  const res = await fetch(`${API_URL}/note?title=${title}`);
  const data = await res.json();
  return data[0];
}

export async function createNote(title: string, content: string) {
  const res = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  return res.json();
}
