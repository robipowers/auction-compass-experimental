import { useState, useEffect, useCallback } from "react";

interface SessionTimerProps {
  isActive: boolean;
  onPause?: () => void;
  onResume?: () => void;
  className?: string;
}

export function SessionTimer({ isActive, onPause, onResume, className }: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      onResume?.();
    } else {
      setIsPaused(true);
      onPause?.();
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <div className="font-mono text-lg font-semibold tabular-nums">
          {formatTime(seconds)}
        </div>
        {isActive && (
          <button
            onClick={handleTogglePause}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}
      </div>
      {isPaused && (
        <div className="text-xs text-amber-400 mt-1">Session Paused</div>
      )}
    </div>
  );
}

// Hook for accessing session timer state
export function useSessionTimer() {
  const [startTime] = useState<Date>(new Date());
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const start = useCallback(() => setIsActive(true), []);
  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
  }, []);

  return {
    startTime,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
  };
}
