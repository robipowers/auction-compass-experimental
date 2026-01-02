import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
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
    <Card variant="elevated" className="flex h-[500px] flex-col animate-fade-in">
      <CardHeader className="flex-shrink-0 border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/60 text-sm">
            💬
          </span>
          Trading Coach
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Bot className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2 text-sm">
                  Ask about current price action and I'll analyze the structure
                </p>
                <p className="mt-1 text-xs opacity-70">
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
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                    message.role === "user"
                      ? "bg-primary/20"
                      : "bg-accent/20"
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
                    "max-w-[80%] rounded-lg px-4 py-3 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.probabilities && (
                    <div className="mt-2 flex gap-2 border-t border-border/50 pt-2 text-xs">
                      <span className="text-muted-foreground">Probabilities:</span>
                      <span className="font-mono">
                        {message.probabilities.join("% / ")}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <div className="rounded-lg bg-secondary px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
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
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the current price action..."
              className="min-h-[44px] max-h-32 resize-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0"
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
