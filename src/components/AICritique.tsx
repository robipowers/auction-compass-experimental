import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, MinusCircle, Sparkles } from "lucide-react";
import { AICritique as AICritiqueType, Coherence } from "@/types/auction";
import { cn } from "@/lib/utils";

interface AICritiqueProps {
  critique: AICritiqueType;
}

const coherenceConfig: Record<
  Coherence,
  { icon: React.ElementType; className: string; label: string }
> = {
  ALIGNED: {
    icon: CheckCircle,
    className: "bg-success/15 text-success border-success/25",
    label: "Aligned",
  },
  CONFLICTED: {
    icon: AlertTriangle,
    className: "bg-danger/15 text-danger border-danger/25",
    label: "Conflicted",
  },
  NEUTRAL: {
    icon: MinusCircle,
    className: "bg-muted text-muted-foreground border-border",
    label: "Neutral",
  },
};

export function AICritique({ critique }: AICritiqueProps) {
  const coherence = coherenceConfig[critique.coherence];
  const CoherenceIcon = coherence.icon;

  return (
    <Card variant="premium" className="animate-fade-in">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <span className="text-xl">AI Strategist Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Coherence Analysis */}
        <section className="rounded-xl border border-border bg-secondary/30 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Coherence Analysis
            </h4>
            <Badge
              variant="outline"
              className={cn("gap-1.5 px-3 py-1 font-medium", coherence.className)}
            >
              <CoherenceIcon className="h-3.5 w-3.5" />
              {coherence.label}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{critique.coherenceExplanation}</p>
        </section>

        {/* Structural Observations */}
        <section>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Structural Observations
          </h4>
          <p className="text-sm leading-relaxed text-foreground/90">{critique.structuralObservations}</p>
        </section>

        {/* Scenarios Table */}
        <section>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Key Structural Scenarios
          </h4>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scenario</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type of Move</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">In Play</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">LIS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {critique.scenarios.map((scenario, index) => (
                  <tr key={index} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4 font-medium text-foreground">{scenario.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {scenario.typeOfMove}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-info">{scenario.inPlay}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-danger">{scenario.lis}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Suggested Strategy */}
        <section>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested Strategy
          </h4>
          <div className="space-y-4">
            {critique.scenarios.map((scenario, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-foreground">{scenario.name}</p>
                </div>
                <div className="mb-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="text-foreground">{scenario.typeOfMove}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">In Play:</span>
                    <span className="font-medium text-info">{scenario.inPlay}</span>
                  </div>
                  <div className="flex gap-2 sm:col-span-2">
                    <span className="text-muted-foreground">LIS:</span>
                    <span className="font-medium text-danger">{scenario.lis}</span>
                  </div>
                </div>
                {scenario.behavior && (
                  <div className="rounded-lg bg-secondary/40 p-4">
                    <p className="text-sm leading-relaxed text-foreground/90">
                      <span className="font-semibold text-foreground">Behavior: </span>
                      {scenario.behavior}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Inventory Risk Analysis */}
        {critique.inventoryRiskAnalysis && critique.inventoryRiskAnalysis.trim().length > 0 && (
          <section>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Inventory Risk Analysis
            </h4>
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{critique.inventoryRiskAnalysis}</p>
            </div>
          </section>
        )}

        {/* Primary Risk */}
        <section className="rounded-xl border border-danger/30 bg-danger/5 p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-danger">
            <AlertTriangle className="h-4 w-4" />
            Primary Risk
          </h4>
          <p className="text-sm leading-relaxed text-foreground/90">{critique.primaryRisk}</p>
        </section>

        {/* Market Context */}
        <section>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Market Context
          </h4>
          <p className="text-sm leading-relaxed text-foreground/90">{critique.marketContext}</p>
        </section>

        {/* Structural Checklist Q&A */}
        <section>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Structural Checklist
          </h4>
          <div className="space-y-4">
            {critique.dailyChecklist.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-sm)]"
              >
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <p className="font-medium text-foreground leading-snug">
                    {item.question}
                  </p>
                </div>
                <div className="ml-9 rounded-lg bg-secondary/40 p-4">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}