import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CoachMessage } from "@/types/auction";

interface TradingCoachProps {
  messages: CoachMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export function TradingCoach({ messages, onSendMessage, isLoading, disabled = false }: TradingCoachProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    const message = input.trim();
    setInput("");
    await onSendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn("flex flex-col h-full glass-panel", disabled && "opacity-60")}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border",
              disabled 
                ? "bg-secondary border-white/10" 
                : "bg-primary/20 border-primary/30"
            )}>
              <MessageSquare className={cn("h-4 w-4", disabled ? "text-muted-foreground" : "text-primary")} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">Coach's Corner</span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                {disabled ? "Live mode only" : "Real-time AMT coaching"}
              </span>
            </div>
          </div>
          {disabled && (
            <span className="rounded-full bg-secondary/50 border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              PREMARKET
            </span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
        {disabled ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-[220px]">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary border border-white/10">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Premarket Mode Active
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Trading Coach activates in Live Execution mode.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-[220px]">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary border border-white/10">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Describe current price action
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                I'll analyze acceptance, rejection, and validate scenarios
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70 italic">
                Example: "30 mins below VAL, volume building"
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2.5 animate-fade-in",
                message.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border",
                  message.role === "user"
                    ? "bg-primary/15 border-primary/25"
                    : "bg-secondary border-white/10"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[78%] rounded-md px-3 py-2.5 text-sm",
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-secondary/60 border border-white/10 text-foreground"
                )}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-secondary border-white/10">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="rounded-md bg-secondary/60 border border-white/10 px-3 py-2.5">
              <div className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 border-t border-white/10 p-3 bg-secondary/20"
      >
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Switch to Live Execution mode..." : "Describe the current price action..."}
            className="min-h-[44px] max-h-28 resize-none rounded-md text-sm bg-background/60 border-white/10 placeholder:text-muted-foreground/50"
            disabled={isLoading || disabled}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading || disabled}
            className="flex-shrink-0 h-11 w-11 rounded-md bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}