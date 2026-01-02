import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
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
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-warning to-warning/60 text-sm">
            📊
          </span>
          Probability Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <div key={index} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">
                      {scenario.name}
                    </h4>
                    {trend !== "neutral" && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full",
                          trend === "up" ? "bg-success/20" : "bg-danger/20"
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
                  <p className="text-xs text-muted-foreground">
                    {scenario.typeOfMove}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.span
                    key={probability}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold tabular-nums"
                  >
                    {probability}%
                  </motion.span>
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-medium",
                      config.className
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              </div>

              <div className="probability-bar overflow-hidden rounded-full bg-secondary">
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

              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">In Play:</span>
                  <span className="font-medium text-info">{scenario.inPlay}</span>
                </div>
                <div className="flex items-center gap-1">
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
