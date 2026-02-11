import { useMemo } from 'react';
import { GlossaryTooltip } from './GlossaryTooltip';
import { useGlossaryTerms } from '@/hooks/use-knowledge';

interface AMTTermHighlighterProps {
  text: string;
  className?: string;
}

export function AMTTermHighlighter({ text, className }: AMTTermHighlighterProps) {
  const { data: glossaryTerms = [] } = useGlossaryTerms();

  const highlightedContent = useMemo(() => {
    if (!glossaryTerms.length) {
      return [{ type: 'text' as const, content: text }];
    }

    // Sort terms by length (longest first) to match longer phrases before shorter ones
    const sortedTerms = [...glossaryTerms].sort((a, b) => b.term.length - a.term.length);
    
    // Create a regex pattern for all terms (case-insensitive, word boundaries)
    const pattern = new RegExp(
      `\\b(${sortedTerms.map(t => escapeRegex(t.term)).join('|')})\\b`,
      'gi'
    );

    const parts: Array<{ type: 'text' | 'term'; content: string; term?: typeof glossaryTerms[0] }> = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      
      // Find the matching term (case-insensitive)
      const matchedTerm = glossaryTerms.find(
        t => t.term.toLowerCase() === match[0].toLowerCase()
      );
      
      if (matchedTerm) {
        parts.push({ type: 'term', content: match[0], term: matchedTerm });
      } else {
        parts.push({ type: 'text', content: match[0] });
      }
      
      lastIndex = pattern.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  }, [text, glossaryTerms]);

  return (
    <span className={className}>
      {highlightedContent.map((part, index) => {
        if (part.type === 'term' && part.term) {
          return (
            <GlossaryTooltip key={index} term={part.term}>
              {part.content}
            </GlossaryTooltip>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
