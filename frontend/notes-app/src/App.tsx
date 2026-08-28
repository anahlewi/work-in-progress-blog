
import { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { fetchNotes, createNote, updateNote, fetchNoteBySlug } from './api/notes.ts';
import NoteCardsContainer from './components/NoteCardsContainer.tsx';
import NoteContent from './components/content.tsx';

export type NoteType = 'note' | 'post';
export type Section = 'pinned' | 'musings' | 'tutorials' | 'reviews';

export type Note = {
  id: string;
  title: string | null;
  content: string | null;
  slug: string;
  type: NoteType;
  section: Section | null;
  created_at: string;
};

function makeDraft(type: NoteType): Note {
  return { id: '', title: '', content: '', slug: '', type, section: null, created_at: new Date().toISOString() };
}

function parseSlug(pathname: string): string | undefined {
  const match = pathname.match(/^\/notes\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

function NotesShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isComposingRoute = location.pathname === '/new';
  const slug = parseSlug(location.pathname);
  const draftType: NoteType = searchParams.get('type') === 'post' ? 'post' : 'note';

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [section, setSection] = useState<Section | null>(null);
  const [showContent, setShowContent] = useState(isComposingRoute || !!slug);
  const [isEditing, setIsEditing] = useState(false);

  // id of the note the current edit session should update once it exists; null until the first save
  const editingIdRef = useRef<string | null>(null);
  // set right before an internal navigate() so the slug-view effect below doesn't clobber the note we just saved
  const skipNextSlugLoadRef = useRef(false);
  // last title/content/section actually persisted, so a redundant autosave call is a no-op instead of a wasted request
  const lastSavedRef = useRef<{ title: string; content: string; section: Section | null } | null>(null);
  // mirrors `notes` for the slug-view effect below, so it can look up a cached note without
  // depending on `notes` directly (a save updating `notes` shouldn't re-trigger that effect)
  const notesRef = useRef<Note[]>(notes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    fetchNotes().then(setNotes);
  }, []);

  // Start a fresh compose session
  useEffect(() => {
    if (!isComposingRoute) return;
    editingIdRef.current = null;
    lastSavedRef.current = null;
    setSelectedNote(makeDraft(draftType));
    setTitle("");
    setContent("");
    setSection(null);
    setShowContent(true);
    setIsEditing(true);
  }, [isComposingRoute, draftType]);

  // View a note by slug (shared/direct link, or picked from the sidebar)
  useEffect(() => {
    if (!slug) return;
    setShowContent(true);
    if (skipNextSlugLoadRef.current) {
      skipNextSlugLoadRef.current = false;
      return;
    }
    setIsEditing(false);
    const cached = notesRef.current.find(n => n.slug === slug);
    if (cached) {
      setSelectedNote(cached);
    } else {
      fetchNoteBySlug(slug).then(note => note && setSelectedNote(note));
    }
  }, [slug]);

  // Default landing note at "/"
  useEffect(() => {
    if (slug || isComposingRoute || selectedNote) return;
    if (notes.length) {
      setSelectedNote(notes.find(n => n.slug === 'about-me') ?? notes[0]);
    }
  }, [notes, slug, isComposingRoute, selectedNote]);

  const handleSelectNote = (note: Note | null) => {
    if (!note) return;
    if (!note.id) {
      navigate(`/new?type=${note.type}`);
      return;
    }
    setIsEditing(false);
    navigate(`/notes/${note.slug}`);
  };

  const handleBackToList = () => {
    setShowContent(false);
    navigate('/');
  };

  const autosave = useCallback(() => {
    if (!title && !content) return;
    if (
      lastSavedRef.current &&
      lastSavedRef.current.title === title &&
      lastSavedRef.current.content === content &&
      lastSavedRef.current.section === section
    ) {
      return;
    }

    if (editingIdRef.current) {
      const id = editingIdRef.current;
      updateNote(id, { title, content, section })
        .then(updated => {
          const savedNote: Note = Array.isArray(updated) ? updated[0] : updated;
          if (!savedNote) return;
          lastSavedRef.current = { title, content, section };
          setNotes(prev => prev.map(n => (n.id === savedNote.id ? savedNote : n)));
          setSelectedNote(prev => (prev && prev.id === savedNote.id ? savedNote : prev));
        })
        .catch(err => console.error('Autosave failed', err));
      return;
    }

    createNote(title, content, draftType, section)
      .then(saved => {
        const savedNote: Note = Array.isArray(saved) ? saved[0] : saved;
        if (savedNote && savedNote.id) {
          editingIdRef.current = savedNote.id;
          lastSavedRef.current = { title, content, section };
          setNotes(prev => [savedNote, ...prev]);
          setSelectedNote(savedNote);
          skipNextSlugLoadRef.current = true;
          navigate(`/notes/${savedNote.slug}`, { replace: true });
        }
      })
      .catch(err => console.error('Autosave failed', err));
  }, [title, content, section, draftType, navigate]);

  return (
    <div className='flex flex-row h-screen w-screen'>
      {/* Cards Container - full width on mobile when content not shown, fixed width on desktop */}
      <div className={`${showContent ? 'hidden md:flex' : 'flex'} flex-col md:w-72 w-full transition-all`}>
        <NoteCardsContainer notes={notes} selectedNoteId={selectedNote?.id ?? null} setSelectedNote={handleSelectNote} />
      </div>
      {/* Content View - full width on mobile when shown, flex on desktop */}
      <div className={`${showContent ? 'flex' : 'hidden md:flex'} flex-col flex-1 h-screen overflow-y-auto`}>
        <NoteContent
          currentNote={selectedNote}
          title={title}
          content={content}
          section={section}
          isEditing={isEditing}
          setTitle={setTitle}
          setContent={setContent}
          setSection={setSection}
          autosave={autosave}
          onBack={handleBackToList}
        />
      </div>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/*" element={<NotesShell />} />
    </Routes>
  );
}
