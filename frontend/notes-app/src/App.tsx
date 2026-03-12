
import { useState, useEffect, useCallback } from 'react';
import { fetchNotes, createNote, fetchNote } from './api/notes.ts';
import NoteCardsContainer from './components/NoteCardsContainer.tsx';
import NoteContent from './components/content.tsx';

export type Note = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
};

export function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lastSavedNoteId, setLastSavedNoteId] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Calling fetchNotes and fetchNote to populate initial state
    fetchNotes().then(notes => setNotes([...notes]));
    fetchNote("about me").then(setSelectedNote);
  }, []);
  
  const handleSelectNote = (note: Note | null) => {
    setSelectedNote(note);
    setShowContent(true);
  };

  const handleBackToList = () => {
    setShowContent(false);
  };

  const autosave = useCallback(() => {
    if (!title && !content) return;
    // Prevent duplicate autosave for the same note
    if (selectedNote && selectedNote.id === lastSavedNoteId) {
      return;
    }
    createNote(title, content)
      .then(saved => {
        const savedNote: Note = Array.isArray(saved) ? saved[0] : saved;
        setNotes(prev => [...prev, savedNote]);
        if (savedNote && savedNote.id) {
          console.log('New note created with id:', 
          savedNote.id);
          setSelectedNote(savedNote);
          setLastSavedNoteId(savedNote.id);
        }
      })
      .catch(err => {
        console.error('Autosave failed', err);
      });
  }, [title, content, selectedNote, lastSavedNoteId]);

  return (
    <div className='flex flex-row h-screen w-screen'>
      {/* Cards Container - full width on mobile when content not shown, fixed width on desktop */}
      <div className={`${showContent ? 'hidden md:flex' : 'flex'} flex-col md:w-72 w-full transition-all`}>
        <NoteCardsContainer notes={notes} setSelectedNote={handleSelectNote} />
      </div>
      {/* Content View - full width on mobile when shown, flex on desktop */}
      <div className={`${showContent ? 'flex' : 'hidden md:flex'} flex-col flex-1 h-screen overflow-y-auto`}>
        <NoteContent
          currentNote={selectedNote}
          title={title}
          content={content}
          setTitle={setTitle}
          setContent={setContent}
          autosave={autosave}
          onBack={handleBackToList}
        />
      </div>
    </div>
  );
}

