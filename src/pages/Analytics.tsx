import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Target,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type TimeRange = "7d" | "30d" | "90d" | "ytd" | "all";

interface MetricData {
  value: string | number;
  label: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
}

interface TradeRecord {
  date: string;
  type: string;
  pnl: number;
  rMultiple: number;
}

// Mock data
const mockMetrics: MetricData[] = [
  { value: "+$12,450", label: "Total P&L", change: "↑ 18% vs last month", changeDirection: "up" },
  { value: "68%", label: "Win Rate", change: "↑ 5% vs last month", changeDirection: "up" },
  { value: "2.4", label: "Avg R Multiple", change: "↑ 0.3 vs last month", changeDirection: "up" },
  { value: "42", label: "Total Trades", change: "Same as last month", changeDirection: "neutral" },
  { value: "72%", label: "Scenario Accuracy", change: "↑ 8% vs last month", changeDirection: "up" },
];

const mockBestTrades: TradeRecord[] = [
  { date: "Feb 1", type: "Scenario A", pnl: 1240, rMultiple: 4.2 },
  { date: "Jan 28", type: "Scenario C", pnl: 980, rMultiple: 3.8 },
  { date: "Jan 25", type: "Scenario B", pnl: 850, rMultiple: 3.2 },
];

const mockWorstTrades: TradeRecord[] = [
  { date: "Jan 30", type: "Scenario A", pnl: -420, rMultiple: -2.1 },
  { date: "Jan 22", type: "Scenario B", pnl: -380, rMultiple: -1.9 },
  { date: "Jan 18", type: "Scenario C", pnl: -310, rMultiple: -1.5 },
];

// Simple P&L chart visualization
const mockPnLData = [
  100, 250, 180, 420, 350, 520, 480, 650, 720, 680,
  850, 920, 880, 1050, 980, 1150, 1240, 1180, 1350, 1420,
  1380, 1520, 1600, 1550, 1720, 1850, 1780, 1920, 2050, 2150,
];

function MetricCard({ metric }: { metric: MetricData }) {
  return (
    <Card className="bg-secondary/50">
      <CardContent className="p-5 text-center">
        <div className={cn(
          "text-2xl font-bold",
          typeof metric.value === "string" && metric.value.startsWith("+") && "text-green-400",
          typeof metric.value === "string" && metric.value.startsWith("-") && "text-red-400"
        )}>
          {metric.value}
        </div>
        <div className="text-xs uppercase text-muted-foreground mt-1">{metric.label}</div>
        {metric.change && (
          <div className={cn(
            "text-xs mt-2",
            metric.changeDirection === "up" && "text-green-400",
            metric.changeDirection === "down" && "text-red-400",
            metric.changeDirection === "neutral" && "text-muted-foreground"
          )}>
            {metric.change}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SimplePnLChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  return (
    <div className="h-64 flex items-end gap-1 p-4 bg-secondary/30 rounded-lg">
      {data.map((value, i) => {
        const height = ((value - min) / range) * 100;
        const isPositive = value >= 0;
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-t transition-all hover:opacity-80",
              isPositive ? "bg-primary" : "bg-red-500"
            )}
            style={{ height: `${Math.max(height, 5)}%` }}
            title={`Day ${i + 1}: $${value.toLocaleString()}`}
          />
        );
      })}
    </div>
  );
}

function TradeTable({ trades, variant }: { trades: TradeRecord[]; variant: "best" | "worst" }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {variant === "best" ? (
            <><TrendingUp className="h-4 w-4 text-green-400" /> Best Trades</>
          ) : (
            <><TrendingDown className="h-4 w-4 text-red-400" /> Worst Trades</>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left text-xs uppercase text-muted-foreground">Date</th>
              <th className="py-2 px-4 text-left text-xs uppercase text-muted-foreground">Type</th>
              <th className="py-2 px-4 text-left text-xs uppercase text-muted-foreground">P&L</th>
              <th className="py-2 px-4 text-left text-xs uppercase text-muted-foreground">R Multiple</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-2 px-4 text-sm">{trade.date}</td>
                <td className="py-2 px-4 text-sm">{trade.type}</td>
                <td className={cn(
                  "py-2 px-4 text-sm font-semibold",
                  trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </td>
                <td className="py-2 px-4 text-sm">{trade.rMultiple}R</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function ScenarioAccuracyChart() {
  const scenarios = [
    { name: "Scenario A", winRate: 75, trades: 18 },
    { name: "Scenario B", winRate: 62, trades: 13 },
    { name: "Scenario C", winRate: 58, trades: 11 },
  ];

  return (
    <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
      {scenarios.map((s) => (
        <div key={s.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{s.name}</span>
            <span className="text-muted-foreground">{s.winRate}% ({s.trades} trades)</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${s.winRate}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "90d", label: "90D" },
    { value: "ytd", label: "YTD" },
    { value: "all", label: "All" },
  ];

  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your trading performance over time</p>
        </div>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {mockMetrics.map((metric, i) => (
          <MetricCard key={i} metric={metric} />
        ))}
      </div>

      {/* P&L Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            P&L Curve (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimplePnLChart data={mockPnLData} />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Win Rate by Scenario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScenarioAccuracyChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-end justify-around p-4 bg-secondary/30 rounded-lg">
              {["9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4"].map((hour, i) => {
                const heights = [45, 80, 65, 30, 55, 70, 40];
                return (
                  <div key={hour} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 bg-primary/60 rounded-t hover:bg-primary transition-colors"
                      style={{ height: `${heights[i]}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{hour}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best/Worst Trades */}
      <div className="grid md:grid-cols-2 gap-6">
        <TradeTable trades={mockBestTrades} variant="best" />
        <TradeTable trades={mockWorstTrades} variant="worst" />
      </div>
    </main>
  );
}
