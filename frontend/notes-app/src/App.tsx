
import { useState, useEffect, useCallback } from 'react';
import { fetchNotes, createNote, fetchNote } from '../api/notes';
import NoteCardsContainer from './components/NoteCardsContainer';
import NoteContent from './components/content';

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

  useEffect(() => {
    // Calling fetchNotes and fetchNote to populate initial state
    fetchNotes().then(notes => setNotes([...notes]));
    fetchNote("about me").then(setSelectedNote);
  }, []);
  
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
      <div className='flex-1 flex flex-col'>
        <NoteCardsContainer notes={notes} setSelectedNote={setSelectedNote} />
      </div>
      <div className="flex-2 h-screen overflow-y-auto">
        <NoteContent
          currentNote={selectedNote}
          title={title}
          content={content}
          setTitle={setTitle}
          setContent={setContent}
          autosave={autosave}
        />
      </div>
    </div>
  );
}

