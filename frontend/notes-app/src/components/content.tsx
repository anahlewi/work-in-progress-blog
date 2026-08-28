import React from "react";
import type { Note, Section } from "../App";
import ReactMarkdown from "react-markdown";
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CaretLeftIcon, Share2Icon } from "@radix-ui/react-icons";
import 'highlight.js/styles/github-dark.css';

import { useEffect, useRef } from "react";

const SECTION_LABELS: Record<Section, string> = {
  pinned: "Pinned",
  musings: "Musings",
  tutorials: "Tutorials",
  reviews: "Reviews",
};

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogv|mov)$/i;

// Markdown only has image syntax (`![alt](url)`), so we reuse it for video
// too: if the URL points at a video file, render a real <video> player
// instead of a broken <img>. Same `![...](url)` syntax either way.
function MarkdownMedia({ src, alt }: { src?: string; alt?: string }) {
  if (src && VIDEO_EXTENSIONS.test(new URL(src, window.location.href).pathname)) {
    return (
      <video controls src={src} aria-label={alt} className="max-w-full rounded-lg mx-auto block">
        Your browser can't play this video. <a href={src}>Download it</a> instead.
      </video>
    );
  }
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img src={src} alt={alt} className="max-w-full rounded-lg mx-auto block" />;
}

type NoteContentProps = {
  currentNote: Note | null;
  title: string;
  content: string;
  section: Section | null;
  isEditing: boolean;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setSection: (section: Section | null) => void;
  autosave: () => void;
  onBack?: () => void;
};

const NoteContent: React.FC<NoteContentProps> = ({
  currentNote,
  title,
  content,
  section,
  isEditing,
  setTitle,
  setContent,
  setSection,
  autosave,
  onBack
}) => {

  // Keep the latest autosave in a ref so the debounce timer below only resets
  // on actual typing (title/content), not whenever autosave's identity churns
  // (e.g. because it closes over react-router's navigate).
  const autosaveRef = useRef(autosave);
  useEffect(() => {
    autosaveRef.current = autosave;
  }, [autosave]);

  const autosaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isEditing) return;
    if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    autosaveTimeout.current = setTimeout(() => {
      autosaveRef.current();
    }, 2000);
    return () => {
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    };
  }, [title, content, section, isEditing]);

  const createdAt = currentNote ? new Date(currentNote.created_at).toLocaleString(
    'en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',}) : '';

const shareUrl = currentNote?.slug ? `${window.location.origin}/notes/${currentNote.slug}` : undefined;

const shareData = {
  title: currentNote?.title || title || 'Untitled',
  text: currentNote?.content || content || '',
  url: shareUrl,
};

const handleShare = async () => {
  if (!shareUrl) return;
  try {
    await navigator.share(shareData);
  } catch (err) {
    console.error('Error sharing note:', err);
  }
};

// In a plain <textarea>, Tab moves focus away instead of indenting — a real
// blocker when pasting/writing code blocks. Insert two spaces instead, via
// the browser's native insertText command so cursor placement and the
// resulting input event (which drives our controlled `content` state) are
// both handled by the browser rather than reimplemented by hand.
const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  document.execCommand('insertText', false, '  ');
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
          disabled={!shareUrl}
          className={`text-white transition-opacity ${shareUrl ? 'hover:opacity-70' : 'opacity-30 cursor-not-allowed'}`}
          aria-label="share note"
        >
          <Share2Icon className="w-5 h-5 mt-3" />
        </button>
      </div>
      {/* Content area */}
      <div className="p-4 flex-1 height-screen overflow-y-auto">
        <div>
        <p className="text-xs text-gray-500 text-center">{createdAt}</p>

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <select
              className="border-none bg-transparent mb-2 text-xs text-muted-foreground focus:outline-none w-fit"
              value={section ?? ""}
              onChange={(e) => setSection(e.target.value ? (e.target.value as Section) : null)}
              aria-label="Section"
            >
              <option value="">Unsorted</option>
              {(Object.keys(SECTION_LABELS) as Section[]).map((key) => (
                <option key={key} value={key}>{SECTION_LABELS[key]}</option>
              ))}
            </select>
            <input
              type="text"
              className="border-none bg-transparent mb-5 focus:outline-none"
              placeholder="Add your title here..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="border-none bg-transparent focus:outline-none resize-none rounded"
              placeholder="Add your note here... (use ``` to fence a code block, e.g. ```js)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleContentKeyDown}
            />
          </div>
        ) : (
          <>
            {currentNote?.section && (
              <p className="text-xs text-muted-foreground text-center mb-1">{SECTION_LABELS[currentNote.section]}</p>
            )}
            <h3 className="font-semibold">{currentNote?.title}</h3>
            <article className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkBreaks, remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{ img: MarkdownMedia }}
              >
                {currentNote?.content || ""}
              </ReactMarkdown>
            </article>
          </>
        )}
      </div>
    </div>
  </div>
)};

export default NoteContent;
