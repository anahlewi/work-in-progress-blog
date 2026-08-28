# Work in Progress (Notes App)

A full-stack notes app — a running, editable journal/blog rendered as markdown. Deployed at `work-in-progress-blog.vercel.app`.

## Structure

- `frontend/notes-app` — React + TypeScript + Vite app. Displays notes as a card list grouped into sections (Pinned/Musings/Tutorials/Reviews) with a searchable sidebar, a markdown content view (GitHub-flavored markdown, syntax-highlighted code blocks, embedded images/videos), and autosave-on-edit.
- `backend` — FastAPI service backed by [Supabase](https://supabase.com/) for both the database and file storage.

## Backend

### Endpoints

| Method | Path              | Description                                              |
| ------ | ----------------- | --------------------------------------------------------- |
| GET    | `/notes`          | Fetch all notes                                            |
| GET    | `/notes/{slug}`   | Fetch a single note by its slug (for share links)          |
| POST   | `/notes`          | Create a note or post (`title`, `content`, `type`, `section`) |
| PATCH  | `/notes/{note_id}`| Update an existing note's `title`/`content`/`section`      |
| POST   | `/upload`         | Upload an image/video to Supabase Storage, returns its public URL |

Notes have:
- a `type` of `"note"` or `"post"`
- a unique `slug` generated from the title on creation — this is what direct/shared note links use (`/notes/<slug>`)
- an optional `section` of `"pinned"`, `"musings"`, `"tutorials"`, or `"reviews"` (or unset/unsorted), used to group the sidebar

Run the migrations in [`backend/migrations`](backend/migrations) against your Supabase database in order before deploying this version:
[`001_add_slug_and_type.sql`](backend/migrations/001_add_slug_and_type.sql), then
[`002_add_section.sql`](backend/migrations/002_add_section.sql).

Uploaded media is stored in a public Supabase Storage bucket named `media` (50MB file size limit). Content can embed both images and videos with the same markdown syntax — `![alt text](url)` — the renderer picks `<img>` or `<video>` based on the file extension.

### Running locally

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Requires a `.env` with `SUPABASE_URL` and `SUPABASE_KEY`.

## Frontend

### Running locally

```bash
cd frontend/notes-app
npm install
npm run dev
```

## Stack

- React 19, TypeScript, Vite, Tailwind CSS, Radix UI, React Router
- react-markdown + remark-gfm + remark-breaks + rehype-highlight (tables, code fences with syntax highlighting)
- FastAPI, Supabase (Python) — Postgres + Storage
- Deployed on Vercel
