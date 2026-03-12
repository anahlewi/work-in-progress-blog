import * as React from "react";
import NoteCards from "./NoteCards";
import type { Note } from "../App";
import SearchBar from "./Searchbar";
import ToolBar from "./ToolBar";
import { useEffect, useRef } from "react";

type NoteCardsContainerProps = {
  notes: Note[];
  setSelectedNote: (note: Note | null) => void;
};

const NoteCardsContainer: React.FC<NoteCardsContainerProps> = ({
  notes,
  setSelectedNote,
}) => {
  const [query, setQuery] = React.useState("");
  const [scrolled, setScrolled] = React.useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setScrolled(contentRef.current.scrollTop > 0);
      }
      };
      const node = contentRef.current;
      if (node) node.addEventListener('scroll', handleScroll);
      return () => {
        if (node) node.removeEventListener('scroll', handleScroll);
      };
  }, []);
  
  return (
    <nav ref={contentRef} className="w-full h-full dark:bg-muted overflow-y-auto border-r border-muted-border/50 flex flex-col">
      <ToolBar scrolled={scrolled} createNewNote={setSelectedNote} />
      <div className="p-1.5 flex-1 overflow-y-auto">
        <SearchBar query={query} setQuery={setQuery} />
        <NoteCards notes={notes} setSelectedNote={setSelectedNote} />
      </div>
    </nav>
  );
}
  
export default NoteCardsContainer;