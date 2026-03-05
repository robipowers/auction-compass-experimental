import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertTriangle, 
  MinusCircle, 
  Sparkles, 
  Copy, 
  Check,
  TrendingUp,
  Target,
  Shield,
  BarChart3,
  Crosshair,
  Activity
} from "lucide-react";
import { AICritique as AICritiqueType, Coherence } from "@/types/auction";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface AICritiqueProps {
  critique: AICritiqueType;
  mode?: "premarket" | "live";
}

const coherenceConfig: Record<
  Coherence,
  { icon: React.ElementType; className: string; label: string; borderColor: string }
> = {
  ALIGNED: {
    icon: CheckCircle,
    className: "bg-success/15 text-success border-success/25",
    label: "Aligned",
    borderColor: "border-success/30",
  },
  CONFLICTED: {
    icon: AlertTriangle,
    className: "bg-danger/15 text-danger border-danger/25",
    label: "Conflicted",
    borderColor: "border-danger/30",
  },
  NEUTRAL: {
    icon: MinusCircle,
    className: "bg-muted text-muted-foreground border-border",
    label: "Neutral",
    borderColor: "border-border",
  },
};

// Premium section wrapper component
function AnalysisSection({ 
  title, 
  icon: Icon,
  children, 
  variant = "default",
  className 
}: { 
  title: string; 
  icon?: React.ElementType;
  children: React.ReactNode; 
  variant?: "default" | "primary" | "warning" | "danger" | "success";
  className?: string;
}) {
  const variantStyles = {
    default: "border-white/10 bg-secondary/20",
    primary: "border-primary/25 bg-primary/5",
    warning: "border-amber-500/25 bg-amber-500/5",
    danger: "border-red-500/25 bg-red-500/5",
    success: "border-emerald-500/25 bg-emerald-500/5",
  };

  const titleStyles = {
    default: "text-muted-foreground",
    primary: "text-primary",
    warning: "text-amber-500",
    danger: "text-red-500",
    success: "text-emerald-500",
  };

  return (
    <section className={cn(
      "relative rounded-lg border p-5 transition-all duration-300",
      variantStyles[variant],
      className
    )}>
      <h4 className={cn(
        "mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
        titleStyles[variant]
      )}>
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {title}
      </h4>
      {children}
    </section>
  );
}

// Strip markdown formatting from text
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

// Premium formatted text with better typography
function FormattedText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/(?:---|\\n\\n|(?=The \\d+[\\d.-]*pip))/gi)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length <= 1) {
    return (
      <p className={cn(
        "text-[15px] leading-[1.9] text-foreground/80 font-normal",
        className
      )}>
        {text}
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-[15px] leading-[1.9] text-foreground/80">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function ScenarioCard({ scenario, index }: { scenario: AICritiqueType['scenarios'][0]; index: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-secondary/20 p-5 transition-all hover:border-primary/25">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 text-sm font-bold text-primary">
          {index + 1}
        </span>
        <h4 className="font-bold text-base text-foreground leading-tight pt-0.5">
          {stripMarkdown(scenario.name)}
        </h4>
      </div>
      
      {/* Key Details */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest w-16 shrink-0">Type</span>
          <span className="text-sm text-foreground">{stripMarkdown(scenario.typeOfMove)}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-semibold text-primary uppercase tracking-widest w-16 shrink-0">In Play</span>
          <span className="text-sm font-mono text-foreground">{stripMarkdown(scenario.inPlay)}</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-semibold text-danger uppercase tracking-widest w-16 shrink-0">LIS</span>
          <span className="text-sm font-mono text-foreground">{stripMarkdown(scenario.lis)}</span>
        </div>
      </div>
      
      {/* Behavior */}
      {scenario.behavior && (
        <div className="rounded-md bg-background/50 border border-white/10 p-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Behavior</p>
          <p className="text-sm leading-relaxed text-foreground/90">
            {stripMarkdown(scenario.behavior)}
          </p>
        </div>
      )}
    </div>
  );
}

export function AICritique({ critique, mode = "premarket" }: AICritiqueProps) {
  const [copied, setCopied] = useState(false);
  const coherence = coherenceConfig[critique.coherence];
  const CoherenceIcon = coherence.icon;
  const isLiveMode = mode === "live";

  const formatCritiqueForCopy = () => {
    const lines = [
      "AI STRATEGIST ANALYSIS",
      "=".repeat(50),
      "",
    ];

    if (critique.currentAuctionState) {
      lines.push(
        "CURRENT AUCTION STATE",
        "-".repeat(30),
        "STATE: " + critique.currentAuctionState.state,
        "EXPLANATION: " + critique.currentAuctionState.explanation,
        ""
      );
    }

    lines.push(
      "COHERENCE: " + coherence.label,
      critique.coherenceExplanation,
      "",
      "STRUCTURAL OBSERVATIONS",
      "-".repeat(30),
      critique.structuralObservations,
      "",
      "KEY STRUCTURAL SCENARIOS",
      "-".repeat(30),
      ...critique.scenarios.map((s, i) => 
        (i + 1) + ". " + s.name + "\n   Type: " + s.typeOfMove + "\n   In Play: " + s.inPlay + "\n   LIS: " + s.lis + (s.behavior ? "\n   Behavior: " + s.behavior : "")
      ),
      "",
    );

    if (critique.inventoryRiskAnalysis?.trim()) {
      lines.push("INVENTORY RISK ANALYSIS", "-".repeat(30), critique.inventoryRiskAnalysis, "");
    }

    lines.push(
      "PRIMARY RISK",
      "-".repeat(30),
      critique.primaryRisk,
      "",
      "MARKET CONTEXT",
      "-".repeat(30),
      critique.marketContext,
      "",
      "STRUCTURAL CHECKLIST",
      "-".repeat(30),
      ...critique.dailyChecklist.map((item, i) => (i + 1) + ". Q: " + item.question + "\n   A: " + item.answer)
    );

    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatCritiqueForCopy());
      setCopied(true);
      toast.success("Analysis copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // In Live mode, show only execution-critical sections
  if (isLiveMode) {
    return (
      <Card className="glass-panel animate-fade-in border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                <Sparkles className="h-4 w-4 text-primary" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-bold text-foreground">Execution Summary</span>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">What matters right now</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Primary Risk - Always visible */}
          <AnalysisSection title="Primary Risk" icon={AlertTriangle} variant="danger">
            <FormattedText text={critique.primaryRisk} />
          </AnalysisSection>

          {/* What Must Happen Next */}
          <AnalysisSection title="What Must Happen Next" icon={Target} variant="primary">
            <div className="space-y-2.5">
              {critique.scenarios.map((scenario, index) => (
                <div key={index} className="flex items-start gap-2.5 rounded-md bg-secondary/30 border border-white/10 p-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{scenario.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-semibold text-primary">In Play:</span> {stripMarkdown(scenario.inPlay)} · 
                      <span className="font-semibold text-danger ml-1">LIS:</span> {stripMarkdown(scenario.lis)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AnalysisSection>

          {/* Current Auction State - Compact */}
          {critique.currentAuctionState && (
            <div className="rounded-lg border border-white/10 bg-secondary/20 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current State</span>
                <Badge className="bg-primary/20 text-primary border-primary/30 font-bold">
                  {critique.currentAuctionState.state}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full Premarket mode - show everything with institutional styling
  return (
    <Card className="glass-panel animate-fade-in border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
              <Sparkles className="h-4 w-4 text-primary" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground">AI Strategist Analysis</span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Full structural context</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2 border-white/10 hover:bg-secondary/50 text-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Auction State */}
        {critique.currentAuctionState && (
          <AnalysisSection title="Current Auction State" icon={Activity} variant="primary">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">State</span>
              <Badge className="bg-primary/20 text-primary border-primary/30 font-bold">
                {critique.currentAuctionState.state}
              </Badge>
            </div>
            <FormattedText text={critique.currentAuctionState.explanation} />
          </AnalysisSection>
        )}

        {/* Coherence Analysis */}
        <AnalysisSection 
          title="Coherence Analysis" 
          icon={CoherenceIcon}
        >
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="outline"
              className={cn("gap-1.5 px-2.5 py-1 font-bold text-xs", coherence.className)}
            >
              <CoherenceIcon className="h-3.5 w-3.5" />
              {coherence.label}
            </Badge>
          </div>
          <FormattedText text={critique.coherenceExplanation} />
        </AnalysisSection>

        {/* Structural Observations */}
        <AnalysisSection title="Structural Observations" icon={BarChart3}>
          <FormattedText text={critique.structuralObservations} />
        </AnalysisSection>

        {/* Key Structural Scenarios - Institutional Table */}
        <AnalysisSection title="Key Structural Scenarios" icon={Target}>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-foreground">Scenario</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-foreground">Type of Move</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-primary">In Play</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-danger">LIS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {critique.scenarios.map((scenario, index) => (
                  <tr key={index} className="transition-colors hover:bg-secondary/30 group">
                    <td className="px-4 py-3 font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{scenario.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{stripMarkdown(scenario.typeOfMove)}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-primary text-sm">{stripMarkdown(scenario.inPlay)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-danger text-sm">{stripMarkdown(scenario.lis)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalysisSection>

        {/* Suggested Strategy */}
        <AnalysisSection title="Suggested Strategy" icon={TrendingUp}>
          <div className="grid gap-4 lg:grid-cols-2">
            {critique.scenarios.map((scenario, index) => (
              <ScenarioCard key={index} scenario={scenario} index={index} />
            ))}
          </div>
        </AnalysisSection>

        {/* Inventory Risk Analysis */}
        {critique.inventoryRiskAnalysis && critique.inventoryRiskAnalysis.trim().length > 0 && (
          <AnalysisSection title="Inventory Risk Analysis" icon={Shield} variant="warning">
            <FormattedText text={critique.inventoryRiskAnalysis} />
          </AnalysisSection>
        )}

        {/* Primary Risk */}
        <AnalysisSection title="Primary Risk" icon={AlertTriangle} variant="danger">
          <FormattedText text={critique.primaryRisk} />
        </AnalysisSection>

        {/* Market Context */}
        <AnalysisSection title="Market Context" icon={BarChart3}>
          <FormattedText text={critique.marketContext} />
        </AnalysisSection>

        {/* Structural Checklist Q&A */}
        <AnalysisSection title="Structural Checklist">
          <div className="space-y-3">
            {critique.dailyChecklist.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-white/10 bg-secondary/20 overflow-hidden transition-all duration-300 hover:border-primary/25"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary/15 border border-primary/25 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <p className="font-semibold text-foreground leading-relaxed text-sm pt-0.5">
                      {item.question}
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/10 bg-secondary/30 px-4 py-3">
                  <p className="text-sm leading-relaxed text-foreground/80 pl-9">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AnalysisSection>
      </CardContent>
    </Card>
  );
}
