import { useExecutionMode, ExecutionMode } from "@/contexts/ExecutionModeContext";
import { cn } from "@/lib/utils";
import { BookOpen, Zap } from "lucide-react";

export function ExecutionModeToggle() {
  const { mode, setMode } = useExecutionMode();

  const modes: { value: ExecutionMode; label: string; sublabel: string; icon: typeof BookOpen }[] = [
    { 
      value: "premarket", 
      label: "Premarket Context", 
      sublabel: "Context & Structure",
      icon: BookOpen 
    },
    { 
      value: "live", 
      label: "Live Execution", 
      sublabel: "Conditions & Validation",
      icon: Zap 
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Mode</span>
      </div>
      <div className="inline-flex rounded-xl border border-border bg-secondary/50 p-1">
        {modes.map(({ value, label, sublabel, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
              mode === value
                ? value === "premarket"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-accent text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Icon className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">{label}</span>
              <span className={cn(
                "text-[10px] font-normal",
                mode === value ? "opacity-80" : "opacity-60"
              )}>
                {sublabel}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
