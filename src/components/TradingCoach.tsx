import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CoachMessage } from "@/types/auction";

interface TradingCoachProps {
  messages: CoachMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

export function TradingCoach({ messages, onSendMessage, isLoading }: TradingCoachProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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
    <Card variant="premium" className="flex h-[520px] flex-col animate-fade-in">
      <CardHeader className="flex-shrink-0 border-b border-border pb-4">
        <CardTitle className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/25">
            <MessageSquare className="h-5 w-5 text-white" />
          </span>
          <span className="text-xl">Trading Coach</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-xs">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                  <Bot className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Ask about current price action
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  I'll analyze the structure and update scenario probabilities
                </p>
                <p className="mt-3 text-xs text-muted-foreground/70 italic">
                  Example: "Price at VAL, seeing rejection"
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
                    message.role === "user"
                      ? "bg-primary/15"
                      : "bg-accent/15"
                  )}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <Bot className="h-4 w-4 text-accent" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-md"
                      : "bg-secondary rounded-tl-md"
                  )}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  {message.probabilities && (
                    <div className="mt-3 flex gap-2 border-t border-foreground/10 pt-2.5 text-xs">
                      <span className="text-current/70">Probabilities:</span>
                      <span className="font-mono font-medium">
                        {message.probabilities.join("% / ")}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-secondary px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="flex-shrink-0 border-t border-border p-4"
        >
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the current price action..."
              className="min-h-[48px] max-h-32 resize-none rounded-xl text-sm"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 h-12 w-12 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}