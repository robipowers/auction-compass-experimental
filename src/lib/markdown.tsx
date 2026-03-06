import React from "react";

/**
 * Renders inline markdown (bold, italic, code) as React elements.
 * Supports: **bold**, *italic*, `code`
 * Does NOT strip formatting — it renders it properly.
 */
export function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Pattern matches **bold**, *italic*, or `code` — in that order of priority
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Add any plain text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] !== undefined) {
      // **bold**
      nodes.push(
        <strong key={match.index} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[3] !== undefined) {
      // *italic*
      nodes.push(
        <em key={match.index}>{match[3]}</em>
      );
    } else if (match[4] !== undefined) {
      // `code`
      nodes.push(
        <code
          key={match.index}
          className="rounded bg-secondary/50 px-1 py-0.5 text-xs font-mono text-foreground"
        >
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining plain text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

/**
 * Renders a block of text with markdown support.
 * Splits on double newlines for paragraphs, renders inline markdown within each.
 * Also handles numbered lists (lines starting with "1.", "2.", etc.)
 */
export function renderMarkdownBlock(text: string): React.ReactNode {
  // Split into paragraphs on double newlines or --- separators
  const paragraphs = text
    .split(/(?:\n\n|---|\\n\\n)/g)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length <= 1) {
    // Check if single paragraph has line breaks (numbered list, bullet points)
    const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
    if (lines.length > 1) {
      return (
        <div className="space-y-1.5">
          {lines.map((line, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground/80">
              {renderInlineMarkdown(line.trim())}
            </p>
          ))}
        </div>
      );
    }
    return (
      <p className="text-sm leading-relaxed text-foreground/80">
        {renderInlineMarkdown(text)}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, index) => {
        // Check if paragraph contains line breaks (sub-list)
        const lines = paragraph.split(/\n/).filter((l) => l.trim().length > 0);
        if (lines.length > 1) {
          return (
            <div key={index} className="space-y-1.5">
              {lines.map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/80">
                  {renderInlineMarkdown(line.trim())}
                </p>
              ))}
            </div>
          );
        }
        return (
          <p key={index} className="text-sm leading-relaxed text-foreground/80">
            {renderInlineMarkdown(paragraph)}
          </p>
        );
      })}
    </div>
  );
}
