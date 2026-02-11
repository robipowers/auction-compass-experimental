import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Download, TrendingUp, Calendar, Filter } from "lucide-react";
import {
  DAY_TYPE_LABELS,
  INVENTORY_LABELS,
  DayType,
  Inventory,
} from "@/types/auction";

interface HistoryEntry {
  id: string;
  date: string;
  instrument: string;
  dayType: DayType;
  inventory: Inventory;
  outcome?: "scenario_1" | "scenario_2" | "scenario_3";
  pnl?: number;
}

// Mock data
const mockHistory: HistoryEntry[] = [
  {
    id: "1",
    date: "2026-01-02",
    instrument: "EURUSD",
    dayType: "normal",
    inventory: "net_short",
    outcome: "scenario_2",
    pnl: 45.5,
  },
  {
    id: "2",
    date: "2026-01-01",
    instrument: "EURUSD",
    dayType: "trend",
    inventory: "net_long",
    outcome: "scenario_1",
    pnl: -22.3,
  },
  {
    id: "3",
    date: "2025-12-31",
    instrument: "EURUSD",
    dayType: "neutral",
    inventory: "neutral",
    outcome: "scenario_3",
    pnl: 12.0,
  },
  {
    id: "4",
    date: "2025-12-30",
    instrument: "EURUSD",
    dayType: "normal_variation",
    inventory: "net_short",
  },
  {
    id: "5",
    date: "2025-12-29",
    instrument: "EURUSD",
    dayType: "double_distribution",
    inventory: "net_long",
    outcome: "scenario_1",
    pnl: 67.8,
  },
];

export default function History() {
  const [history] = useState<HistoryEntry[]>(mockHistory);

  const getOutcomeLabel = (outcome?: string) => {
    if (!outcome) return null;
    const labels: Record<string, string> = {
      scenario_1: "Scenario 1",
      scenario_2: "Scenario 2",
      scenario_3: "Scenario 3",
    };
    return labels[outcome];
  };

  const totalPnl = history.reduce((sum, entry) => sum + (entry.pnl || 0), 0);
  const winRate =
    history.filter((e) => e.pnl && e.pnl > 0).length /
    history.filter((e) => e.pnl !== undefined).length;

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading History</h1>
          <p className="mt-2 text-muted-foreground">
            Review your past plans and performance
          </p>
        </div>
        <Button asChild variant="hero">
          <Link to="/plan">
            <TrendingUp className="mr-2 h-4 w-4" />
            New Plan
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{history.length}</div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                totalPnl >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {totalPnl >= 0 ? "+" : ""}
              {totalPnl.toFixed(1)} pips
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(winRate * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Plan History
          </CardTitle>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Day Type</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.instrument}</Badge>
                    </TableCell>
                    <TableCell>{DAY_TYPE_LABELS[entry.dayType]}</TableCell>
                    <TableCell>{INVENTORY_LABELS[entry.inventory]}</TableCell>
                    <TableCell>
                      {entry.outcome ? (
                        <Badge
                          variant="secondary"
                          className="bg-primary/20 text-primary"
                        >
                          {getOutcomeLabel(entry.outcome)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.pnl !== undefined ? (
                        <span
                          className={
                            entry.pnl >= 0 ? "text-success" : "text-danger"
                          }
                        >
                          {entry.pnl >= 0 ? "+" : ""}
                          {entry.pnl.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {history.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No trading plans yet.</p>
              <Button asChild variant="link" className="mt-2">
                <Link to="/plan">Create your first plan</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
