import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspaceBuilder } from '@/components/workspace';
import { cn } from '@/lib/utils';
import { createMarketDataService, ConnectionStatus, PriceUpdate } from '@/services/MarketDataService';

export default function WorkspaceLive() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [latency, setLatency] = useState(0);
  const [priceData, setPriceData] = useState<Map<string, PriceUpdate>>(new Map());

  useEffect(() => {
    const service = createMarketDataService({
      instruments: ['NQ', 'ES'],
      updateIntervalMs: 1000,
      enableMockData: true,
    });

    // Subscribe to updates
    const unsubStatus = service.onStatusChange((s, l) => {
      setStatus(s);
      setLatency(l);
    });

    const unsubPrice = service.onPriceUpdate((update) => {
      setPriceData(prev => new Map(prev).set(update.instrument, update));
    });

    // Connect
    service.connect();

    return () => {
      unsubStatus();
      unsubPrice();
      service.disconnect();
    };
  }, []);

  const nqData = priceData.get('NQ');

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/plan')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plan
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-lg font-semibold">Live Workspace</h1>
          
          {nqData && (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">
                {nqData.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className={cn(
                "text-sm font-medium",
                nqData.change >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {nqData.change >= 0 ? '+' : ''}{nqData.change.toFixed(2)} ({nqData.changePercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
        
        {/* Connection Status */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
          status === 'live' && "bg-green-500/20 text-green-400",
          status === 'pre-market' && "bg-blue-500/20 text-blue-400",
          status === 'connecting' && "bg-yellow-500/20 text-yellow-400",
          status === 'disconnected' && "bg-red-500/20 text-red-400",
        )}>
          {status === 'live' ? (
            <>
              <Wifi className="h-4 w-4" />
              Live
              <span className="text-xs opacity-70">{latency}ms</span>
            </>
          ) : status === 'pre-market' ? (
            <>
              <Clock className="h-4 w-4" />
              Pre-Market
            </>
          ) : status === 'connecting' ? (
            <>
              <Wifi className="h-4 w-4 animate-pulse" />
              Connecting...
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              Disconnected
            </>
          )}
        </div>
      </div>
      
      {/* Workspace */}
      <div className="flex-1 overflow-hidden bg-background">
        <WorkspaceBuilder />
      </div>
    </div>
  );
}
