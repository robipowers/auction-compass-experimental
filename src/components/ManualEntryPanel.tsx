import { useState } from "react";
import { useMarketData } from "@/contexts/MarketDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Target, 
  FileText, 
  MessageSquare, 
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ManualEntry {
  id: string;
  type: "price" | "trade" | "note";
  content: string;
  timestamp: Date;
  synced: boolean;
}

interface ManualEntryPanelProps {
  className?: string;
}

export function ManualEntryPanel({ className }: ManualEntryPanelProps) {
  const { connectionStatus, marketData } = useMarketData();
  const [manualPrice, setManualPrice] = useState("");
  const [entries, setEntries] = useState<ManualEntry[]>([]);

  const isOffline = connectionStatus === "disconnected";

  const addEntry = (type: ManualEntry["type"], content: string) => {
    const entry: ManualEntry = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      synced: !isOffline,
    };
    setEntries((prev) => [entry, ...prev]);
    
    if (isOffline) {
      toast.info("Entry saved locally", {
        description: "Will sync when connection is restored",
      });
    }
  };

  const handlePriceUpdate = () => {
    if (!manualPrice) return;
    addEntry("price", `Price manually updated to ${manualPrice}`);
    setManualPrice("");
    toast.success("Manual price recorded");
  };

  const featureStatus = [
    { icon: BarChart3, label: "Real-time Charts", status: isOffline ? "Disabled" : "Active" },
    { icon: Target, label: "Scenario Automation", status: isOffline ? "Paused" : "Active" },
    { icon: FileText, label: "Trade Logging", status: "Active" },
    { icon: MessageSquare, label: "Notes & Journal", status: "Active" },
  ];

  const getEntryIcon = (type: ManualEntry["type"]) => {
    switch (type) {
      case "price":
        return BarChart3;
      case "trade":
        return Target;
      case "note":
        return MessageSquare;
    }
  };

  return (
    <Card className={cn("border-amber-500/30 bg-amber-950/10", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            {isOffline ? "Manual Entry Mode" : "Quick Entry"}
          </CardTitle>
          {isOffline && (
            <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50">
              OFFLINE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manual Price Update */}
        <div className="space-y-2">
          <Label htmlFor="manual-price" className="text-xs text-muted-foreground">
            Manual Price Update
          </Label>
          <div className="flex gap-2">
            <Input
              id="manual-price"
              type="number"
              placeholder={marketData?.price.toFixed(2) || "18465.25"}
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
              className="flex-1 h-9"
            />
            <Button 
              size="sm" 
              variant={isOffline ? "default" : "outline"}
              onClick={handlePriceUpdate}
              className={isOffline ? "bg-amber-600 hover:bg-amber-500" : ""}
            >
              Update
            </Button>
          </div>
        </div>

        <Separator />

        {/* Feature Status */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Feature Status</Label>
          <div className="space-y-1.5">
            {featureStatus.map((feature, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <feature.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{feature.label}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5",
                    feature.status === "Active" && "bg-green-500/20 text-green-400 border-green-500/50",
                    feature.status === "Disabled" && "bg-red-500/20 text-red-400 border-red-500/50",
                    feature.status === "Paused" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                  )}
                >
                  {feature.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Recent Entries */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              {isOffline ? "Pending Sync" : "Recent Entries"}
            </Label>
            {entries.filter(e => !e.synced).length > 0 && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-400">
                {entries.filter(e => !e.synced).length} pending
              </Badge>
            )}
          </div>
          
          <ScrollArea className="h-32">
            <div className="space-y-2 pr-2">
              {entries.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No entries yet
                </p>
              ) : (
                entries.map((entry) => {
                  const Icon = getEntryIcon(entry.type);
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "p-2 rounded-md text-xs",
                        entry.synced 
                          ? "bg-secondary/50" 
                          : "bg-amber-500/10 border border-amber-500/30"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="h-3 w-3 mt-0.5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{entry.content}</p>
                          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" />
                            <span className="text-[10px]">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                            {entry.synced ? (
                              <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-2.5 w-2.5 text-amber-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
