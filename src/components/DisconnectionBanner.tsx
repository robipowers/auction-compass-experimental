import { useState, useEffect } from "react";
import { useMarketData } from "@/contexts/MarketDataContext";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function DisconnectionBanner() {
  const { connect, connectionStatus } = useMarketData();
  const [retryCountdown, setRetryCountdown] = useState(5);

  // Auto-retry countdown
  useEffect(() => {
    if (connectionStatus !== "disconnected") {
      setRetryCountdown(5);
      return;
    }

    const timer = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          connect();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [connectionStatus, connect]);

  if (connectionStatus !== "disconnected") return null;

  return (
    <div className="bg-gradient-to-r from-amber-900/80 to-amber-800/80 border-b border-amber-600 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400" />
        <div>
          <p className="text-sm font-semibold text-amber-200">
            Market Data Disconnected
          </p>
          <p className="text-xs text-amber-300">
            Attempting to reconnect... Retry in{" "}
            <span className="font-mono font-bold">{retryCountdown}s</span>
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={connect}
        className="bg-amber-500 text-black border-amber-400 hover:bg-amber-400"
      >
        Reconnect Now
      </Button>
    </div>
  );
}
