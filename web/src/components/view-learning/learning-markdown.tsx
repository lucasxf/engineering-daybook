"use client";

import React from "react";

interface LearningMarkdownProps {
  content: string;
}

/**
 * Renders markdown content as readable prose.
 * Supports: bold, italic, inline code, fenced code blocks, bullet lists, blockquotes, headings.
 * No editing chrome — clean reading surface with generous line height.
 */
export function LearningMarkdown({ content }: LearningMarkdownProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let elementIndex = 0; // Unique key counter to avoid duplicates

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.replace(/```/, "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre
          key={`code-${elementIndex}`}
          className="my-4 overflow-x-auto rounded-lg border border-card-border bg-muted p-4 text-sm leading-relaxed"
        >
          {lang && (
            <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground opacity-60">
              {lang}
            </div>
          )}
          <code className="font-mono prose-body">
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      elementIndex++;
      i++;
      continue;
    }

    // Heading h3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${elementIndex}`} className="mb-2 mt-6 font-heading text-base font-semibold text-foreground">
          {parseInline(line.slice(4))}
        </h3>
      );
      elementIndex++;
      i++;
      continue;
    }

    // Heading h2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${elementIndex}`} className="mb-2 mt-6 font-heading text-lg font-semibold text-foreground">
          {parseInline(line.slice(3))}
        </h2>
      );
      elementIndex++;
      i++;
      continue;
    }

    // Heading h1
    if (line.startsWith("# ")) {
      elements.push(
        <h2 key={`h1-${elementIndex}`} className="mb-3 mt-6 font-heading text-xl font-semibold text-foreground">
          {parseInline(line.slice(2))}
        </h2>
      );
      elementIndex++;
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`blockquote-${elementIndex}`}
          className="my-3 border-l-4 border-[var(--color-primary)] pl-4 italic text-muted-foreground"
        >
          {parseInline(line.slice(2))}
        </blockquote>
      );
      elementIndex++;
      i++;
      continue;
    }

    // Bullet list — collect consecutive list items
    if (line.startsWith("- ")) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`list-${elementIndex}`} className="my-3 ml-5 list-disc space-y-1">
          {listItems.map((item, idx) => (
            <li key={`list-item-${elementIndex}-${idx}`} className="prose-body leading-[1.7]">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      elementIndex++;
      continue;
    }

    // Empty line — paragraph break
    if (line.trim() === "") {
      elements.push(<div key={`spacer-${elementIndex}`} className="h-3" aria-hidden="true" />);
      elementIndex++;
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`para-${elementIndex}`} className="leading-[1.7] prose-body">
        {parseInline(line)}
      </p>
    );
    elementIndex++;
    i++;
  }

  return <div className="font-sans text-sm sm:text-base">{elements}</div>;
}

/** Parse inline markdown: **bold**, *italic*, `code` */
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Combined regex for bold, italic, inline code
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let matchIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold
      parts.push(<strong key={`bold-${matchIndex}`} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3]) {
      // Italic
      parts.push(<em key={`italic-${matchIndex}`} className="italic">{match[4]}</em>);
    } else if (match[5]) {
      // Inline code
      parts.push(
        <code
          key={`code-inline-${matchIndex}`}
          className="rounded bg-[#2B4A78]/50 px-1.5 py-0.5 font-mono text-[0.85em] text-[#D4854A]"
        >
          {match[6]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
    matchIndex++;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
