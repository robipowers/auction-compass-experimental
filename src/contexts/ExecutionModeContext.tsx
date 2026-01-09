import { createContext, useContext, useState, ReactNode } from "react";

export type ExecutionMode = "premarket" | "live";

interface ExecutionModeContextType {
  mode: ExecutionMode;
  setMode: (mode: ExecutionMode) => void;
  isPremarket: boolean;
  isLive: boolean;
}

const ExecutionModeContext = createContext<ExecutionModeContextType | undefined>(undefined);

export function ExecutionModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ExecutionMode>("premarket");

  return (
    <ExecutionModeContext.Provider
      value={{
        mode,
        setMode,
        isPremarket: mode === "premarket",
        isLive: mode === "live",
      }}
    >
      {children}
    </ExecutionModeContext.Provider>
  );
}

export function useExecutionMode() {
  const context = useContext(ExecutionModeContext);
  if (!context) {
    throw new Error("useExecutionMode must be used within an ExecutionModeProvider");
  }
  return context;
}
