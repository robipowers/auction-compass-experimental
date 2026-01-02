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
    className: "bg-success/20 text-success border-success/30",
    label: "Aligned",
  },
  CONFLICTED: {
    icon: AlertTriangle,
    className: "bg-danger/20 text-danger border-danger/30",
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
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-sm">
            <Sparkles className="h-4 w-4" />
          </span>
          AI Strategist Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coherence Analysis */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="mb-3 flex items-center gap-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Coherence Analysis
            </h4>
            <Badge
              variant="outline"
              className={cn("gap-1", coherence.className)}
            >
              <CoherenceIcon className="h-3 w-3" />
              {coherence.label}
            </Badge>
          </div>
          <p className="text-sm">{critique.coherenceExplanation}</p>
        </div>

        {/* Structural Observations */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Structural Observations
          </h4>
          <p className="text-sm">{critique.structuralObservations}</p>
        </div>

        {/* Scenarios Table */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">
            Key Structural Scenarios
          </h4>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Scenario</th>
                  <th className="px-4 py-3 text-left font-medium">Type of Move</th>
                  <th className="px-4 py-3 text-left font-medium">In Play</th>
                  <th className="px-4 py-3 text-left font-medium">LIS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {critique.scenarios.map((scenario, index) => (
                  <tr key={index} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{scenario.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {scenario.typeOfMove}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-info">{scenario.inPlay}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-danger">{scenario.lis}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Primary Risk */}
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-danger">
            <AlertTriangle className="h-4 w-4" />
            Primary Risk
          </h4>
          <p className="text-sm">{critique.primaryRisk}</p>
        </div>

        {/* Market Context */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Market Context
          </h4>
          <p className="text-sm">{critique.marketContext}</p>
        </div>

        {/* Structural Checklist Q&A */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">
            Structural Checklist
          </h4>
          <div className="space-y-4">
            {critique.dailyChecklist.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-secondary/20 p-4"
              >
                <div className="mb-2 flex items-start gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                    Q{index + 1}
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {item.question}
                  </p>
                </div>
                <div className="ml-7 rounded-md bg-background/50 p-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
