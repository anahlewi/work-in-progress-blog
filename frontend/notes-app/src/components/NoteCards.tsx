import React from "react";
import type { Note, Section } from "../App";
import { DrawingPinIcon, KeyboardIcon, CrumpledPaperIcon, StarIcon, FileIcon } from "@radix-ui/react-icons";
import ReactMarkdown from "react-markdown";

type NoteCardProps = {
  notes: Note[];
  selectedNoteId: string | null;
  setSelectedNote: (note: Note | null) => void;
};

const SECTION_GROUPS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: "pinned", label: "Pinned", icon: <DrawingPinIcon className="inline-block mr-0" /> },
  { key: "musings", label: "Musings", icon: <CrumpledPaperIcon className="inline-block mr-0" /> },
  { key: "tutorials", label: "Tutorials", icon: <KeyboardIcon className="inline-block mr-0" /> },
  { key: "reviews", label: "Reviews", icon: <StarIcon className="inline-block mr-0" /> },
];

const NoteCards: React.FC<NoteCardProps> = ({
  notes,
  selectedNoteId,
  setSelectedNote,
}) => {
  const renderCard = (note: Note) => (
    <li key={note.id} className="border-b-1 border-muted-border/50 last:border-0">
        <a
          className={`w-full text-left p-2 no-underline rounded mb-2 block ${selectedNoteId === note.id ? 'bg-selected' : ''}`}
          onClick={() => setSelectedNote(note)}
        >
        <h2 className=' text-sm text-black dark:text-white font-bold mb-1'>{note.title}</h2>
        <p className="text-xs text-muted-foreground dark:text-white/80 font-normal">
          <span className="dark:text-white font-normal">{new Date(note.created_at).toLocaleString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit',})} </span>
          <div className="line-clamp-1 truncate-ellipsis">
            <ReactMarkdown children={(note.content || "").replace(/&nbsp;|\s+/g, ' ').trim()} />
          </div>
         </p>
      </a>
    </li>
  );

  const unsorted = notes.filter((note) => !note.section);

  return (
    <ul>
      {SECTION_GROUPS.map(({ key, label, icon }) => {
        const inSection = notes.filter((note) => note.section === key);
        if (inSection.length === 0) return null;
        return (
          <section key={key} className="space-y-4 mb-4">
            <h2 className="text-xs font-bold text-muted-foreground mb-2"> {icon} {label}</h2>
            {inSection.map(renderCard)}
          </section>
        );
      })}
      {unsorted.length > 0 && (
        <section className="space-y-4 mb-4">
          <h2 className="text-xs font-bold text-muted-foreground mb-2"> <FileIcon className="inline-block mr-0" /> Unsorted</h2>
          {unsorted.map(renderCard)}
        </section>
      )}
    </ul>
  );
}



export default NoteCards;
