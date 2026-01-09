import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, XCircle, Clock, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scenario, ValidationStatus, ScenarioValidation } from "@/types/auction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScenarioValidationTrackerProps {
  scenarios: Scenario[];
  validations: ScenarioValidation[];
  previousValidations?: ScenarioValidation[];
}

const statusConfig: Record<ValidationStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  not_validated: { 
    label: "NOT VALIDATED", 
    className: "bg-muted text-muted-foreground border border-border",
    icon: Circle
  },
  partially_validated: { 
    label: "PARTIALLY VALIDATED", 
    className: "bg-warning/15 text-warning border border-warning/30",
    icon: Clock
  },
  validated: { 
    label: "VALIDATED", 
    className: "bg-success/15 text-success border border-success/30",
    icon: CheckCircle2
  },
  invalidated: { 
    label: "INVALIDATED", 
    className: "bg-danger/15 text-danger border border-danger/30",
    icon: XCircle
  },
};

export function ScenarioValidationTracker({
  scenarios,
  validations,
  previousValidations,
}: ScenarioValidationTrackerProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [validations]);

  return (
    <Card variant="premium" className="animate-fade-in">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25">
            <ClipboardCheck className="h-5 w-5 text-white" />
          </span>
          <span className="text-xl">Scenario Validation Tracker</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {scenarios.map((scenario, index) => {
          const validation = validations[index] || {
            status: "not_validated" as ValidationStatus,
            validatedConditions: [],
            pendingConditions: ["Awaiting price action update"],
            invalidationCondition: scenario.lis || "N/A"
          };
          const config = statusConfig[validation.status];
          const StatusIcon = config.icon;

          return (
            <motion.div 
              key={`${index}-${animationKey}`}
              initial={{ opacity: 0.8, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]"
            >
              {/* Scenario Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-foreground">
                      {scenario.name}
                    </h4>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {scenario.typeOfMove}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn("h-4 w-4", 
                    validation.status === "validated" && "text-success",
                    validation.status === "partially_validated" && "text-warning",
                    validation.status === "invalidated" && "text-danger",
                    validation.status === "not_validated" && "text-muted-foreground"
                  )} />
                  <span
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-xs font-semibold",
                      config.className
                    )}
                  >
                    {config.label}
                  </span>
                </div>
              </div>

              {/* Conditions Sections */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                {/* Validated Conditions */}
                {validation.validatedConditions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-success uppercase tracking-wide">
                      Validated Conditions
                    </span>
                    <ul className="space-y-1">
                      {validation.validatedConditions.map((condition, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pending Conditions */}
                {validation.pendingConditions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-warning uppercase tracking-wide">
                      Pending Conditions
                    </span>
                    <ul className="space-y-1">
                      {validation.pendingConditions.map((condition, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Invalidation Condition */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-danger uppercase tracking-wide">
                    Invalidation
                  </span>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
                    <span>{validation.invalidationCondition}</span>
                  </div>
                </div>
              </div>

              {/* Reference Levels */}
              <div className="flex gap-6 text-xs pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">In Play:</span>
                  <span className="font-medium text-info">{scenario.inPlay}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">LIS:</span>
                  <span className="font-medium text-danger">{scenario.lis}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
