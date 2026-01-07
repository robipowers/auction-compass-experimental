import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scenario, getProbabilityStatus, ProbabilityStatus } from "@/types/auction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProbabilityTrackerProps {
  scenarios: Scenario[];
  probabilities: [number, number, number];
  previousProbabilities?: [number, number, number];
}

const statusConfig: Record<ProbabilityStatus, { label: string; className: string }> = {
  confirmed: { label: "CONFIRMED", className: "bg-prob-confirmed text-success-foreground" },
  strengthening: { label: "Strengthening", className: "bg-prob-strengthening text-warning-foreground" },
  balanced: { label: "Balanced", className: "bg-prob-balanced text-primary-foreground" },
  weakening: { label: "Weakening", className: "bg-prob-weakening text-warning-foreground" },
  invalidated: { label: "INVALIDATED", className: "bg-prob-invalidated text-danger-foreground" },
};

const barColors: Record<ProbabilityStatus, string> = {
  confirmed: "bg-prob-confirmed",
  strengthening: "bg-prob-strengthening",
  balanced: "bg-prob-balanced",
  weakening: "bg-prob-weakening",
  invalidated: "bg-prob-invalidated",
};

export function ProbabilityTracker({
  scenarios,
  probabilities,
  previousProbabilities,
}: ProbabilityTrackerProps) {
  // Track animation key to force re-render on probability changes
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Trigger animation when probabilities change
    setAnimationKey((prev) => prev + 1);
  }, [probabilities]);

  return (
    <Card variant="premium" className="animate-fade-in overflow-hidden">
      <CardHeader className="pb-5">
        <CardTitle className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-warning to-orange-400 shadow-lg shadow-warning/20">
            <BarChart3 className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold">Probability Tracker</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scenarios.map((scenario, index) => {
          const probability = probabilities[index];
          const previousProb = previousProbabilities?.[index];
          const status = getProbabilityStatus(probability);
          const config = statusConfig[status];

          const trend =
            previousProb !== undefined
              ? probability > previousProb
                ? "up"
                : probability < previousProb
                ? "down"
                : "neutral"
              : "neutral";

          return (
            <div key={index} className="space-y-3 rounded-2xl border border-border/40 bg-white/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-foreground truncate">
                      {scenario.name}
                    </h4>
                    {trend !== "neutral" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full",
                          trend === "up" ? "bg-success/15" : "bg-danger/15"
                        )}
                      >
                        {trend === "up" ? (
                          <TrendingUp className="h-3 w-3 text-success" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-danger" />
                        )}
                      </motion.div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {scenario.typeOfMove}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <motion.span
                    key={probability}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold tabular-nums mono"
                  >
                    {probability}%
                  </motion.span>
                  <span
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-semibold",
                      config.className
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              </div>

              <div className="probability-bar overflow-hidden rounded-full bg-secondary h-3">
                <motion.div
                  key={`${index}-${animationKey}`}
                  className={cn(
                    "h-full rounded-full transition-colors duration-300",
                    barColors[status]
                  )}
                  initial={{ width: previousProb !== undefined ? `${previousProb}%` : 0 }}
                  animate={{ width: `${probability}%` }}
                  transition={{ 
                    duration: 0.8, 
                    ease: [0.4, 0, 0.2, 1],
                    delay: index * 0.1 
                  }}
                />
              </div>

              <div className="flex gap-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">In Play:</span>
                  <span className="font-medium text-info">{scenario.inPlay}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">LIS:</span>
                  <span className="font-medium text-danger">{scenario.lis}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}