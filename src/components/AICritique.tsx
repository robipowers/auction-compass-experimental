import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, MinusCircle, Sparkles, Copy, Check, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { AICritique as AICritiqueType, Coherence } from "@/types/auction";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface AICritiqueProps {
  critique: AICritiqueType;
}

const coherenceConfig: Record<
  Coherence,
  { icon: React.ElementType; className: string; label: string }
> = {
  ALIGNED: {
    icon: CheckCircle,
    className: "bg-success/20 text-success border-success/40",
    label: "Aligned",
  },
  CONFLICTED: {
    icon: AlertTriangle,
    className: "bg-danger/20 text-danger border-danger/40",
    label: "Conflicted",
  },
  NEUTRAL: {
    icon: MinusCircle,
    className: "bg-muted text-muted-foreground border-border",
    label: "Neutral",
  },
};

// AMT terms to highlight
const AMT_TERMS = [
  'acceptance', 'rejection', 'initiative', 'responsive', 'liquidation',
  'value area', 'VAH', 'VAL', 'VPOC', 'POC', 'range extension',
  'balance', 'imbalance', 'excess', 'poor high', 'poor low',
  'single prints', 'TPO', 'overnight', 'gap', 'OIV', 'OAV', 'OBV',
  'rotation', 'trend', 'breakout', 'breakdown', 'failed auction'
];

// Helper to highlight AMT terms and format text
function FormattedText({ text, className }: { text: string; className?: string }) {
  // Split by common paragraph indicators
  const paragraphs = text
    .split(/(?:---|\n\n|Paragraph \d+[:\s-]+|(?=According to|Per the|Mind Over Markets|Steidlmayer|The \d+[\d.-]*pip))/gi)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const highlightTerms = (content: string) => {
    let result = content;
    
    // Highlight price levels (numbers with decimals)
    result = result.replace(
      /(\d+\.\d{2,5})/g,
      '<code class="price-level">$1</code>'
    );
    
    // Bold AMT terms
    AMT_TERMS.forEach(term => {
      const regex = new RegExp(`\\b(${term})\\b`, 'gi');
      result = result.replace(regex, '<strong class="amt-term">$1</strong>');
    });
    
    return result;
  };

  if (paragraphs.length <= 1) {
    return (
      <p 
        className={cn("text-[15px] leading-relaxed-plus text-foreground/90", className)}
        dangerouslySetInnerHTML={{ __html: highlightTerms(text) }}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.map((paragraph, index) => (
        <p 
          key={index} 
          className="text-[15px] leading-relaxed-plus text-foreground/90"
          dangerouslySetInnerHTML={{ __html: highlightTerms(paragraph) }}
        />
      ))}
    </div>
  );
}

// Helper to determine scenario type
function getScenarioType(name: string, typeOfMove: string): 'bullish' | 'bearish' | 'rotational' {
  const lowerName = name.toLowerCase();
  const lowerType = typeOfMove.toLowerCase();
  
  if (lowerName.includes('bull') || lowerType.includes('bull') || 
      lowerName.includes('long') || lowerType.includes('higher') ||
      lowerName.includes('upside') || lowerType.includes('rally')) {
    return 'bullish';
  }
  if (lowerName.includes('bear') || lowerType.includes('bear') || 
      lowerName.includes('short') || lowerType.includes('lower') ||
      lowerName.includes('downside') || lowerType.includes('sell')) {
    return 'bearish';
  }
  return 'rotational';
}

function ScenarioIcon({ type }: { type: 'bullish' | 'bearish' | 'rotational' }) {
  if (type === 'bullish') return <TrendingUp className="h-5 w-5 text-bullish" />;
  if (type === 'bearish') return <TrendingDown className="h-5 w-5 text-bearish" />;
  return <RefreshCw className="h-5 w-5 text-rotational" />;
}

export function AICritique({ critique }: AICritiqueProps) {
  const [copied, setCopied] = useState(false);
  const coherence = coherenceConfig[critique.coherence];
  const CoherenceIcon = coherence.icon;

  const formatCritiqueForCopy = () => {
    const lines = [
      "AI STRATEGIST ANALYSIS",
      "=".repeat(50),
      "",
      `COHERENCE: ${coherence.label}`,
      critique.coherenceExplanation,
      "",
      "STRUCTURAL OBSERVATIONS",
      "-".repeat(30),
      critique.structuralObservations,
      "",
      "KEY STRUCTURAL SCENARIOS",
      "-".repeat(30),
      ...critique.scenarios.map((s, i) => 
        `${i + 1}. ${s.name}\n   Type: ${s.typeOfMove}\n   In Play: ${s.inPlay}\n   LIS: ${s.lis}${s.behavior ? `\n   Behavior: ${s.behavior}` : ""}`
      ),
      "",
    ];

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
      ...critique.dailyChecklist.map((item, i) => `${i + 1}. Q: ${item.question}\n   A: ${item.answer}`)
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

  return (
    <Card className="animate-fade-in border-border bg-card">
      <CardHeader className="pb-6 border-b border-border">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-teal">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="text-xl font-semibold text-foreground">AI Strategist Analysis</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {/* Coherence Analysis */}
        <section className="terminal-section">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="terminal-section-header mb-0">
              Coherence Analysis
            </h4>
            <Badge
              variant="outline"
              className={cn("gap-1.5 px-3 py-1.5 font-medium text-sm", coherence.className)}
            >
              <CoherenceIcon className="h-4 w-4" />
              {coherence.label}
            </Badge>
          </div>
          <FormattedText text={critique.coherenceExplanation} />
        </section>

        {/* Structural Observations */}
        <section className="terminal-section">
          <h4 className="terminal-section-header">
            Structural Observations
          </h4>
          <FormattedText text={critique.structuralObservations} />
        </section>

        {/* Scenario Cards - 3 column grid */}
        <section>
          <h4 className="terminal-section-header mb-4 pl-1">
            Key Structural Scenarios
          </h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {critique.scenarios.map((scenario, index) => {
              const scenarioType = getScenarioType(scenario.name, scenario.typeOfMove);
              return (
                <div
                  key={index}
                  className={cn(
                    "scenario-card",
                    scenarioType === 'bullish' && "scenario-card-bullish",
                    scenarioType === 'bearish' && "scenario-card-bearish",
                    scenarioType === 'rotational' && "scenario-card-rotational"
                  )}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <ScenarioIcon type={scenarioType} />
                    <h5 className="font-semibold text-foreground">{scenario.name}</h5>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-[50px]">Type:</span>
                      <span className="text-foreground/90">{scenario.typeOfMove}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-[50px]">In Play:</span>
                      <span className="text-primary font-medium">{scenario.inPlay}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground min-w-[50px]">LIS:</span>
                      <span className="text-danger font-medium">{scenario.lis}</span>
                    </div>
                  </div>
                  
                  {scenario.behavior && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {scenario.behavior}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Inventory Risk Analysis */}
        {critique.inventoryRiskAnalysis && critique.inventoryRiskAnalysis.trim().length > 0 && (
          <section className="terminal-section" style={{ borderLeftColor: 'hsl(var(--warning))' }}>
            <h4 className="terminal-section-header" style={{ color: 'hsl(var(--warning))' }}>
              Inventory Risk Analysis
            </h4>
            <FormattedText text={critique.inventoryRiskAnalysis} />
          </section>
        )}

        {/* Primary Risk */}
        <section className="terminal-section" style={{ borderLeftColor: 'hsl(var(--danger))' }}>
          <h4 className="terminal-section-header flex items-center gap-2" style={{ color: 'hsl(var(--danger))' }}>
            <AlertTriangle className="h-4 w-4" />
            Primary Risk
          </h4>
          <FormattedText text={critique.primaryRisk} />
        </section>

        {/* Market Context */}
        <section className="terminal-section">
          <h4 className="terminal-section-header">
            Market Context
          </h4>
          <FormattedText text={critique.marketContext} />
        </section>

        {/* Structural Checklist Q&A */}
        <section>
          <h4 className="terminal-section-header mb-4 pl-1">
            Structural Checklist
          </h4>
          <div className="space-y-3">
            {critique.dailyChecklist.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-secondary/30 p-4"
              >
                <div className="mb-2 flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-primary/20 text-xs font-bold text-primary mono">
                    {index + 1}
                  </span>
                  <p className="font-medium text-foreground leading-snug">
                    {item.question}
                  </p>
                </div>
                <div className="ml-9">
                  <p className="text-sm leading-relaxed-plus text-foreground/80">
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