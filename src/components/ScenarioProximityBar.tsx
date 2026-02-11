import { cn } from "@/lib/utils";
import { useMarketData } from "@/contexts/MarketDataContext";
import { ValidationStatus } from "@/types/auction";

interface ScenarioProximityBarProps {
  triggerLevel: number;
  status: ValidationStatus;
  showLabel?: boolean;
  className?: string;
}

export function ScenarioProximityBar({
  triggerLevel,
  status,
  showLabel = true,
  className,
}: ScenarioProximityBarProps) {
  const { marketData } = useMarketData();

  if (!marketData) {
    return (
      <div className={cn("space-y-1", className)}>
        {showLabel && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Waiting for data...</span>
          </div>
        )}
        <div className="h-2 bg-secondary rounded-full" />
      </div>
    );
  }

  const currentPrice = marketData.price;
  const distance = currentPrice - triggerLevel;
  const percentage = Math.abs(distance / triggerLevel) * 100;
  const direction = distance >= 0 ? "above" : "below";
  
  // Calculate fill based on proximity (0-100% as we get closer)
  // At 1% away = 90% fill, at 0.1% = 99%, at 0% = 100%
  const proximityFill = Math.max(0, Math.min(100, 100 - percentage * 50));
  
  // Is approaching trigger?
  const isApproaching = proximityFill > 70;
  const isVeryClose = proximityFill > 90;

  const getStatusColor = () => {
    if (status === "validated") return "bg-green-500";
    if (status === "invalidated") return "bg-red-500/50";
    if (status === "partially_validated") return "bg-yellow-500";
    if (isVeryClose) return "bg-primary animate-pulse";
    if (isApproaching) return "bg-primary/80";
    return "bg-primary/50";
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className={cn(
            "font-medium",
            isVeryClose && "text-primary animate-pulse",
            isApproaching && !isVeryClose && "text-primary"
          )}>
            {percentage.toFixed(2)}% {direction}
          </span>
          <span className="text-muted-foreground">
            Trigger: {triggerLevel.toLocaleString()}
          </span>
        </div>
      )}
      <div className={cn(
        "h-2 bg-secondary rounded-full overflow-hidden transition-all",
        isVeryClose && "ring-2 ring-primary/50"
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getStatusColor()
          )}
          style={{ width: `${proximityFill}%` }}
        />
      </div>
    </div>
  );
}
