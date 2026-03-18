import React from "react";
import type { Note } from "../App";
import ReactMarkdown from "react-markdown";
import remarkBreaks from 'remark-breaks';
import { CaretLeftIcon, Share2Icon } from "@radix-ui/react-icons";

import { useEffect, useRef } from "react";

type NoteContentProps = {
  currentNote: Note | null;
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  autosave: () => void;
  onBack?: () => void;
};

const NoteContent: React.FC<NoteContentProps> = ({
  currentNote,
  title,
  content,
  setTitle,
  setContent,
  autosave,
  onBack
}) => {

  const autosaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    autosaveTimeout.current = setTimeout(() => {
      autosave();
    }, 2000);
    return () => {
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    };
  }, [title, content, autosave]);

  const createdAt = currentNote ? new Date(currentNote.created_at).toLocaleString(
    'en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',}) : '';
  
const shareData = {
  title: title,
  text: content,
  url: 'https://example.com'
};

const handleShare = async () => {
  try {
    await navigator.share(shareData);
    console.log('Webpage shared successfully');
  } catch (err) {
    console.error('Error sharing webpage:', err);
  }
};

  return (
    <div className="w-full h-full flex flex-col">
      {/* Back button - only visible on mobile */}
      <div className="md:hidden flex items-center justify-between p-2">
        <button
          onClick={onBack}
          className="text-white hover:opacity-70 transition-opacity"
          aria-label="Back to notes"
        >
          <CaretLeftIcon className="w-8 h-8 mt-3" />
        </button>
        <button
          onClick={handleShare}
          className="text-white hover:opacity-70 transition-opacity"
          aria-label="share note"
        >
          <Share2Icon className="w-5 h-5 mt-3" />
        </button>
      </div>
      {/* Content area */}
      <div className="p-4 flex-1 height-screen overflow-y-auto">
        <div>
        <p className="text-xs text-gray-500 text-center">{createdAt}</p>

        {/* <ul className="mb-6 space-y-4">
            <li key={currentNote?.id} className="pb-2">
              <h3 className="font-semibold">{currentNote?.title}</h3>
              <p>{currentNote?.content}</p>
            </li>
        </ul> */}
        
        <h3 className="font-semibold">{currentNote?.title}</h3>
        <article>
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
          {currentNote?.content || ""}
        </ReactMarkdown>
        </article>
      
        {(currentNote?.title === "" && currentNote?.content === "") && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              className="border-none bg-transparent mb-5 focus:outline-none"
              placeholder="Add your title here..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="border-none bg-transparent focus:outline-none resize-none rounded"
              placeholder="Add your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  </div>
)};

export default NoteContent;