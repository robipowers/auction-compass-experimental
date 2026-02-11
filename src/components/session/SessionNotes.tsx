import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  text: string;
  timestamp: Date;
}

interface SessionNotesProps {
  notes?: Note[];
  onAddNote?: (text: string) => void;
  onDeleteNote?: (id: string) => void;
  className?: string;
}

export function SessionNotes({ notes = [], onAddNote, onDeleteNote, className }: SessionNotesProps) {
  const [newNote, setNewNote] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote?.(newNote.trim());
      setNewNote("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            Quick Notes
            {notes.length > 0 && (
              <span className="text-xs text-muted-foreground">({notes.length})</span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick add */}
        <div className="flex gap-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Quick observation..."
            rows={2}
            className="text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                handleAddNote();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="shrink-0"
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>

        {/* Notes list */}
        {isExpanded && notes.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-2 bg-secondary/50 rounded-lg group"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm flex-1">{note.text}</p>
                  <button
                    onClick={() => onDeleteNote?.(note.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatTime(note.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}

        {isExpanded && notes.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            No notes yet. Add observations during trading.
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          ⌘ + Enter to save
        </p>
      </CardContent>
    </Card>
  );
}
