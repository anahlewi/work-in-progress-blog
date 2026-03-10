import React from "react";
import type { Note } from "../App";
import { DrawingPinIcon } from "@radix-ui/react-icons";

type NoteCardProps = {
  notes: Note[];
  setSelectedNote: (note: Note | null) => void;
};

const NoteCards: React.FC<NoteCardProps> = ({
  notes,
  setSelectedNote,
}) => {
  const [selected, setSelected] = React.useState<string | null>(null);

  const handleSelect = (note: Note | null) => {
    setSelected(note ? note.title : null);
    setSelectedNote(note);
  };  

  return (
    <ul>
      <section className="space-y-4">
       <h2 className="text-xs font-bold text-muted-foreground mb-2"> <DrawingPinIcon className="inline-block mr-0" /> Pinned</h2>

      {notes.map((note) => (
        <li key={note.id} className="border-b-1 border-muted-border/50 last:border-0">
            <a
              className={`w-full text-left p-2 no-underline rounded mb-2 block ${selected === note.title ? 'bg-selected' : ''}`}
              onClick={() => handleSelect(note)}
            >
            <h2 className=' text-sm text-black dark:text-white font-bold mb-1'>{note.title}</h2>
            <p className="text-xs text-muted-foreground dark:text-white/80 font-normal"> 
              <span className="dark:text-white font-normal">{new Date(note.created_at).toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit',})} </span>
              {note.content}
             </p>
          </a>
        </li> 
      ))}
      </section>
    </ul>
  );
}
  
  

export default NoteCards;