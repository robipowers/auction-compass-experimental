import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketData } from "@/contexts/MarketDataContext";
import { RealTimePriceWidget } from "@/components/RealTimePriceWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BarChart3, 
  Plus, 
  X, 
  Settings, 
  Activity,
  TrendingUp,
  Layers,
  ListChecks,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DisconnectionBanner } from "@/components/DisconnectionBanner";

type PanelType = "chart" | "orderflow" | "profile" | "scenarios" | "price";

interface WorkspacePanel {
  id: string;
  type: PanelType;
  title: string;
}

const panelOptions: { type: PanelType; label: string; icon: typeof BarChart3 }[] = [
  { type: "chart", label: "Price Chart", icon: BarChart3 },
  { type: "orderflow", label: "Order Flow", icon: Activity },
  { type: "profile", label: "Volume Profile", icon: Layers },
  { type: "scenarios", label: "Scenarios", icon: ListChecks },
  { type: "price", label: "Price Widget", icon: TrendingUp },
];

export default function LiveSession() {
  const navigate = useNavigate();
  const { connectionStatus, marketData, connect } = useMarketData();
  const [overlays, setOverlays] = useState({
    volumeProfile: true,
    orderFlow: false,
    cumulativeDelta: false,
  });
  
  const [panels, setPanels] = useState<WorkspacePanel[]>([
    { id: "main-chart", type: "chart", title: "NQ - Price Chart" },
    { id: "scenarios", type: "scenarios", title: "Scenario Tracker" },
  ]);

  const addPanel = (type: PanelType) => {
    const option = panelOptions.find(p => p.type === type);
    if (!option) return;
    
    setPanels(prev => [
      ...prev,
      { 
        id: `${type}-${Date.now()}`, 
        type, 
        title: option.label 
      }
    ]);
  };

  const removePanel = (id: string) => {
    setPanels(prev => prev.filter(p => p.id !== id));
  };

  const toggleOverlay = (overlay: keyof typeof overlays) => {
    setOverlays(prev => ({ ...prev, [overlay]: !prev[overlay] }));
  };

  const renderPanelContent = (panel: WorkspacePanel) => {
    switch (panel.type) {
      case "chart":
        return (
          <div className="h-full flex flex-col">
            {/* Overlay Controls */}
            <div className="flex gap-2 p-2 border-b border-border">
              {[
                { key: "volumeProfile", label: "Volume Profile" },
                { key: "orderFlow", label: "Order Flow" },
                { key: "cumulativeDelta", label: "Cumulative Delta" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleOverlay(key as keyof typeof overlays)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md transition-colors",
                    overlays[key as keyof typeof overlays]
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Chart Placeholder */}
            <div className="flex-1 flex items-center justify-center bg-background/50 m-2 rounded-lg border border-dashed border-border">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">TradingView Chart</p>
                <p className="text-xs mt-1">Integration point for live charts</p>
                {overlays.volumeProfile && (
                  <p className="text-xs text-primary mt-2">+ Volume Profile overlay</p>
                )}
                {overlays.orderFlow && (
                  <p className="text-xs text-primary">+ Order Flow overlay</p>
                )}
                {overlays.cumulativeDelta && (
                  <p className="text-xs text-primary">+ Cumulative Delta overlay</p>
                )}
              </div>
            </div>
          </div>
        );
      
      case "orderflow":
        return (
          <div className="h-full flex items-center justify-center bg-background/50 m-2 rounded-lg">
            <div className="text-center text-muted-foreground">
              <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Cumulative Delta</p>
              <div className="flex gap-0.5 mt-4 mx-auto items-end h-16 w-32">
                {[60, 75, 90, 100, 85, 70, 50, 65].map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-sm",
                      h > 60 ? "bg-green-500/60" : "bg-red-500/60"
                    )}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      
      case "profile":
        return (
          <div className="h-full flex items-center justify-center bg-background/50 m-2 rounded-lg">
            <div className="text-center text-muted-foreground">
              <Layers className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Volume Profile</p>
              <div className="space-y-1 mt-4 w-40 mx-auto">
                {[40, 80, 100, 70, 50].map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] w-12 text-right">
                      {(18480 - i * 20).toLocaleString()}
                    </span>
                    <div
                      className={cn(
                        "h-4 rounded-sm",
                        i === 2 ? "bg-amber-500" : "bg-primary/60"
                      )}
                      style={{ width: `${w}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "scenarios":
        return (
          <div className="p-4 space-y-3">
            {["S1: Gap Fill Rotation", "S2: Breakout Extension", "S3: Failed Auction"].map((name, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-lg border",
                  i === 0 && "border-green-500/50 bg-green-500/10",
                  i === 1 && "border-yellow-500/50 bg-yellow-500/10",
                  i === 2 && "border-muted"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{name}</span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    i === 0 && "bg-green-500/20 text-green-400",
                    i === 1 && "bg-yellow-500/20 text-yellow-400",
                    i === 2 && "bg-muted text-muted-foreground"
                  )}>
                    {i === 0 ? "IN PLAY" : i === 1 ? "PARTIAL" : "INACTIVE"}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      i === 0 && "bg-green-500",
                      i === 1 && "bg-yellow-500",
                      i === 2 && "bg-muted-foreground"
                    )}
                    style={{ width: i === 0 ? "85%" : i === 1 ? "40%" : "10%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      
      case "price":
        return (
          <div className="p-2">
            <RealTimePriceWidget />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Disconnection Banner */}
      {connectionStatus === "disconnected" && <DisconnectionBanner />}
      
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/plan")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plan
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-lg font-semibold">Live Session</h1>
          {marketData && (
            <span className="text-2xl font-bold">
              {marketData.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Panel
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {panelOptions.map((option) => (
                <DropdownMenuItem key={option.type} onClick={() => addPanel(option.type)}>
                  <option.icon className="h-4 w-4 mr-2" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {connectionStatus === "disconnected" && (
            <Button size="sm" onClick={connect}>
              Connect
            </Button>
          )}
        </div>
      </div>
      
      {/* Workspace */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {panels.map((panel, index) => (
            <div key={panel.id} className="contents">
              {index > 0 && <ResizableHandle withHandle />}
              <ResizablePanel defaultSize={100 / panels.length} minSize={20}>
                <Card className="h-full rounded-none border-0 border-r border-border">
                  <CardHeader className="py-2 px-3 flex-row items-center justify-between space-y-0 border-b border-border">
                    <CardTitle className="text-sm font-medium">{panel.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => removePanel(panel.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 h-[calc(100%-41px)] overflow-auto">
                    {renderPanelContent(panel)}
                  </CardContent>
                </Card>
              </ResizablePanel>
            </div>
          ))}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
