import * as React from "react";
import { Pencil2Icon, ReaderIcon } from "@radix-ui/react-icons";
import type { Note } from "../App";

type ToolBarProps = {
  createNewNote: (note: Note | null) => void;
  scrolled?: boolean;
};

const ToolBar: React.FC<ToolBarProps> = ({ createNewNote, scrolled }) => {
    const draft = (type: Note["type"]): Note => ({
        title: "",
        content: "",
        id: "",
        slug: "",
        type,
        section: null,
        created_at: new Date().toISOString(),
    });
    return (
        <div className={`sticky top-0 w-full dark:bg-muted mb-2 z-100 ${scrolled ? 'shadow-lg' : ''}`}>
            <div className="justify-end p-2 bg-transparent flex gap-1">
                <button onClick={() => createNewNote(draft("post"))} className="flex items-center justify-center bg-muted hover:bg-muted-foreground/10 w-7 h-7 p-none rounded" aria-label="New post">
                <ReaderIcon className="pointer-events-none inline font-bold text-muted-foreground w-4 h-4" />
                </button>
                <button onClick={() => createNewNote(draft("note"))} className="flex items-center justify-center bg-muted hover:bg-muted-foreground/10 w-7 h-7 p-none rounded" aria-label="New note">
                <Pencil2Icon className="pointer-events-none inline font-bold text-muted-foreground w-4 h-4" />
                </button>
            </div>
        </div>
);

}

export default ToolBar;
