import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, XCircle, Clock, ClipboardCheck, Eye, EyeOff, ChevronDown, ChevronRight, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scenario, ValidationStatus, ScenarioValidation, VALIDATION_STATUS_PRIORITY } from "@/types/auction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ScenarioValidationTrackerProps {
  scenarios: Scenario[];
  validations: ScenarioValidation[];
  previousValidations?: ScenarioValidation[];
}

const statusConfig: Record<ValidationStatus, { 
  label: string; 
  shortLabel: string;
  className: string; 
  icon: typeof CheckCircle2;
  legendColor: string;
  legendLabel: string;
}> = {
  inactive: { 
    label: "INACTIVE", 
    shortLabel: "Ignore",
    className: "bg-muted/50 text-muted-foreground/60 border border-border/50",
    icon: EyeOff,
    legendColor: "bg-muted text-muted-foreground",
    legendLabel: "Grey = Ignore (inactive)"
  },
  in_play: { 
    label: "IN PLAY", 
    shortLabel: "Monitor",
    className: "bg-info/10 text-info border border-info/30",
    icon: Eye,
    legendColor: "bg-info/20 text-info",
    legendLabel: "Blue = Monitor (in play)"
  },
  partially_validated: { 
    label: "PARTIALLY VALIDATED", 
    shortLabel: "Developing",
    className: "bg-warning/15 text-warning border border-warning/30",
    icon: Clock,
    legendColor: "bg-warning/20 text-warning",
    legendLabel: "Orange = Developing (partial)"
  },
  validated: { 
    label: "VALIDATED", 
    shortLabel: "Accepted",
    className: "bg-success/15 text-success border border-success/30",
    icon: CheckCircle2,
    legendColor: "bg-success/20 text-success",
    legendLabel: "Green = Accepted (validated)"
  },
  invalidated: { 
    label: "INVALIDATED", 
    shortLabel: "Invalidated",
    className: "bg-danger/15 text-danger border border-danger/30",
    icon: XCircle,
    legendColor: "bg-danger/20 text-danger",
    legendLabel: "Red = Invalidated"
  },
};

function ValidationLegend() {
  return (
    <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
      <p className="text-xs font-medium text-muted-foreground mb-2">How to use this:</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40"></span>
          <span className="text-muted-foreground">Grey = Ignore</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-info"></span>
          <span className="text-muted-foreground">Blue = Monitor</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning"></span>
          <span className="text-muted-foreground">Orange = Developing</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span className="text-muted-foreground">Green = Accepted</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-danger"></span>
          <span className="text-muted-foreground">Red = Invalidated</span>
        </span>
      </div>
    </div>
  );
}

export function ScenarioValidationTracker({
  scenarios,
  validations,
  previousValidations,
}: ScenarioValidationTrackerProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const [collapsedStates, setCollapsedStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [validations]);

  // Find the primary focus scenario (highest priority status)
  const primaryFocusIndex = useMemo(() => {
    let maxPriority = -2;
    let maxIndex = -1;
    
    validations.forEach((validation, index) => {
      const priority = VALIDATION_STATUS_PRIORITY[validation.status];
      if (priority > maxPriority) {
        maxPriority = priority;
        maxIndex = index;
      }
    });
    
    return maxIndex;
  }, [validations]);

  // Determine if any scenario is validated or partially validated
  const hasActiveScenario = useMemo(() => {
    return validations.some(v => 
      v.status === "validated" || v.status === "partially_validated"
    );
  }, [validations]);

  const toggleCollapse = (index: number) => {
    setCollapsedStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Determine default collapsed state based on status
  const isCollapsedByDefault = (status: ValidationStatus) => {
    return status === "inactive" || status === "invalidated";
  };

  const isCollapsed = (index: number, status: ValidationStatus) => {
    if (collapsedStates[index] !== undefined) {
      return collapsedStates[index];
    }
    return isCollapsedByDefault(status);
  };

  return (
    <Card variant="premium" className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25">
            <ClipboardCheck className="h-5 w-5 text-white" />
          </span>
          <span className="text-xl">Scenario Validation Tracker</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ValidationLegend />
        
        {scenarios.map((scenario, index) => {
          const validation = validations[index] || {
            status: "in_play" as ValidationStatus,
            validatedConditions: [],
            pendingConditions: ["Awaiting price action update"],
            invalidationCondition: scenario.lis || "N/A"
          };
          const config = statusConfig[validation.status];
          const StatusIcon = config.icon;
          const isPrimaryFocus = primaryFocusIndex === index && 
            (validation.status === "validated" || validation.status === "partially_validated" || validation.status === "in_play");
          const shouldDim = hasActiveScenario && 
            (validation.status === "inactive" || validation.status === "invalidated");
          const collapsed = isCollapsed(index, validation.status);

          return (
            <motion.div 
              key={`${index}-${animationKey}`}
              initial={{ opacity: 0.8, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                "rounded-xl border transition-all duration-300",
                // Status-specific styling
                validation.status === "inactive" && "bg-muted/20 border-border/40 opacity-60",
                validation.status === "in_play" && "bg-card border-info/30",
                validation.status === "partially_validated" && "bg-warning/5 border-warning/40 shadow-[0_0_15px_-5px] shadow-warning/20",
                validation.status === "validated" && "bg-success/5 border-success/40 shadow-[0_0_20px_-5px] shadow-success/30 ring-1 ring-success/20",
                validation.status === "invalidated" && "bg-muted/10 border-border/30 opacity-50",
                // Dim when other scenarios are active
                shouldDim && "opacity-40",
                // Primary focus enhancement
                isPrimaryFocus && "ring-2 ring-primary/30"
              )}
            >
              <Collapsible open={!collapsed} onOpenChange={() => toggleCollapse(index)}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-start justify-between gap-4 p-5">
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2.5">
                        {collapsed ? (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                          validation.status === "validated" && "bg-success/20 text-success",
                          validation.status === "partially_validated" && "bg-warning/20 text-warning",
                          validation.status === "in_play" && "bg-info/20 text-info",
                          validation.status === "inactive" && "bg-muted text-muted-foreground",
                          validation.status === "invalidated" && "bg-danger/20 text-danger line-through"
                        )}>
                          {index + 1}
                        </span>
                        <h4 className={cn(
                          "font-semibold",
                          validation.status === "invalidated" && "line-through text-muted-foreground",
                          validation.status === "inactive" && "text-muted-foreground"
                        )}>
                          {scenario.name}
                        </h4>
                        {isPrimaryFocus && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wide">
                            <Target className="h-3 w-3" />
                            Primary Focus
                          </span>
                        )}
                      </div>
                      {collapsed && (
                        <p className="mt-1 ml-7 text-xs text-muted-foreground">
                          {validation.status === "inactive" && "Not in play – price not near trigger levels"}
                          {validation.status === "invalidated" && `Invalidated at ${validation.invalidationCondition}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusIcon className={cn("h-4 w-4", 
                        validation.status === "validated" && "text-success",
                        validation.status === "partially_validated" && "text-warning",
                        validation.status === "in_play" && "text-info",
                        validation.status === "invalidated" && "text-danger",
                        validation.status === "inactive" && "text-muted-foreground/60"
                      )} />
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap",
                          config.className
                        )}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-5 pb-5">
                    {/* Type of Move */}
                    <p className="text-xs text-muted-foreground mb-3 ml-7">
                      {scenario.typeOfMove}
                    </p>

                    {/* Status-specific messaging */}
                    {validation.status === "in_play" && (
                      <div className="mb-3 ml-7 flex items-center gap-2 px-3 py-2 rounded-lg bg-info/10 border border-info/20">
                        <AlertCircle className="h-4 w-4 text-info" />
                        <span className="text-xs text-info font-medium">Monitoring: awaiting trigger</span>
                      </div>
                    )}

                    {validation.status === "validated" && (
                      <div className="mb-3 ml-7 flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-xs text-success font-medium">
                          Action permitted only if your execution rules align
                        </span>
                      </div>
                    )}

                    {/* Conditions Sections */}
                    <div className="space-y-3 pt-2 ml-7 border-t border-border/50">
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
                      {validation.pendingConditions.length > 0 && validation.status !== "inactive" && (
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
                    <div className="flex gap-6 text-xs pt-3 mt-3 ml-7 border-t border-border/50">
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
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}