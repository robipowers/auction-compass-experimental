import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, MinusCircle, Sparkles, TrendingDown, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { AICritique as AICritiqueType, Coherence } from "@/types/auction";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

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

// Utility to detect and format AMT terms
const formatAMTText = (text: string): React.ReactNode[] => {
  const amtTerms = [
    'P-shape', 'b-shape', 'D-shape', 'B-shape',
    'acceptance', 'rejection', 'initiative', 'responsive',
    'excess', 'single prints', 'poor highs', 'poor lows',
    'value area', 'POC', 'VPOC', 'VAH', 'VAL',
    'TPO', 'IB', 'initial balance', 'range extension',
    'composite', 'developing', 'balance', 'imbalance',
    'liquidation', 'short covering', 'long liquidation',
    'rotational', 'trending', 'bracketing',
    'coiled spring', 'speed and violence',
    'inventory', 'asymmetric', 'convergence', 'divergence'
  ];
  
  // Price pattern: numbers with decimals (e.g., 1.0850, 20450.50)
  const pricePattern = /\b\d{1,5}\.?\d{2,4}\b/g;
  
  let result = text;
  
  // Create unique markers for replacements
  const replacements: { marker: string; element: React.ReactNode }[] = [];
  
  // Replace prices first
  let priceIndex = 0;
  result = result.replace(pricePattern, (match) => {
    const marker = `__PRICE_${priceIndex++}__`;
    replacements.push({
      marker,
      element: <span key={marker} className="price-level">{match}</span>
    });
    return marker;
  });
  
  // Replace AMT terms
  amtTerms.forEach((term, termIndex) => {
    const regex = new RegExp(`\\b(${term})\\b`, 'gi');
    result = result.replace(regex, (match) => {
      const marker = `__TERM_${termIndex}_${Math.random().toString(36).substr(2, 9)}__`;
      replacements.push({
        marker,
        element: <span key={marker} className="amt-term">{match}</span>
      });
      return marker;
    });
  });
  
  // Split and reconstruct
  const parts: React.ReactNode[] = [];
  let remaining = result;
  
  replacements.forEach(({ marker, element }) => {
    const index = remaining.indexOf(marker);
    if (index !== -1) {
      if (index > 0) {
        parts.push(remaining.substring(0, index));
      }
      parts.push(element);
      remaining = remaining.substring(index + marker.length);
    }
  });
  
  if (remaining) {
    parts.push(remaining);
  }
  
  return parts.length > 0 ? parts : [text];
};

// Parse structural observations into subsections
const parseStructuralObservations = (text: string): { title: string; content: string; type: 'convergence' | 'divergence' | 'neutral' }[] => {
  const subsections = [
    { title: 'Profile Shape Implications', keywords: ['profile', 'shape', 'p-shape', 'b-shape', 'd-shape', 'distribution'] },
    { title: 'Inventory Vulnerability', keywords: ['inventory', 'trapped', 'vulnerable', 'liquidation', 'asymmetric'] },
    { title: 'Convergence & Divergence', keywords: ['converge', 'diverge', 'align', 'conflict', 'confirm'] }
  ];
  
  const paragraphs = text.split(/\n\n|\n/).filter(p => p.trim());
  
  if (paragraphs.length >= 3) {
    return subsections.map((sub, i) => ({
      title: sub.title,
      content: paragraphs[i] || '',
      type: sub.keywords.some(k => (paragraphs[i] || '').toLowerCase().includes('converge') || (paragraphs[i] || '').toLowerCase().includes('align')) 
        ? 'convergence' 
        : sub.keywords.some(k => (paragraphs[i] || '').toLowerCase().includes('diverge') || (paragraphs[i] || '').toLowerCase().includes('conflict'))
          ? 'divergence'
          : 'neutral'
    }));
  }
  
  // Fallback: split into roughly equal parts
  const chunkSize = Math.ceil(text.length / 3);
  return subsections.map((sub, i) => ({
    title: sub.title,
    content: text.substring(i * chunkSize, (i + 1) * chunkSize).trim(),
    type: 'neutral' as const
  }));
};

// Detect scenario type
const getScenarioType = (name: string): 'bearish' | 'bullish' | 'rotational' => {
  const lower = name.toLowerCase();
  if (lower.includes('bear') || lower.includes('down') || lower.includes('short') || lower.includes('sell')) {
    return 'bearish';
  }
  if (lower.includes('bull') || lower.includes('up') || lower.includes('long') || lower.includes('buy')) {
    return 'bullish';
  }
  return 'rotational';
};

const ScenarioIcon = ({ type }: { type: 'bearish' | 'bullish' | 'rotational' }) => {
  switch (type) {
    case 'bearish':
      return <TrendingDown className="h-4 w-4 text-danger" />;
    case 'bullish':
      return <TrendingUp className="h-4 w-4 text-success" />;
    case 'rotational':
      return <RefreshCw className="h-4 w-4 text-info" />;
  }
};

export function AICritique({ critique }: AICritiqueProps) {
  const coherence = coherenceConfig[critique.coherence];
  const CoherenceIcon = coherence.icon;
  
  const structuralSections = useMemo(() => 
    parseStructuralObservations(critique.structuralObservations), 
    [critique.structuralObservations]
  );

  return (
    <Card variant="elevated" className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <span className="font-semibold tracking-tight">AI Strategist Analysis</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="report-prose space-y-0">
        {/* Coherence Analysis */}
        <section className="report-section">
          <div className="rounded-lg border border-border bg-secondary/30 p-5">
            <div className="mb-4 flex items-center gap-3">
              <h4 className="report-subsection-header text-sm uppercase tracking-wide text-muted-foreground">
                Coherence Analysis
              </h4>
              <Badge
                variant="outline"
                className={cn("gap-1.5 px-3 py-1", coherence.className)}
              >
                <CoherenceIcon className="h-3.5 w-3.5" />
                {coherence.label}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {formatAMTText(critique.coherenceExplanation)}
            </p>
          </div>
        </section>

        {/* Market Context */}
        <section className="report-section">
          <h4 className="report-subsection-header mb-3 text-sm uppercase tracking-wide text-muted-foreground">
            Market Context
          </h4>
          <p className="text-sm leading-relaxed text-foreground/80">
            {formatAMTText(critique.marketContext)}
          </p>
        </section>

        <div className="report-divider" />

        {/* Structural Observations with Subsections */}
        <section className="report-section">
          <h4 className="report-subsection-header mb-4 text-sm uppercase tracking-wide text-muted-foreground">
            Structural Observations
          </h4>
          
          <div className="space-y-5">
            {structuralSections.map((section, index) => (
              <div key={index}>
                <div className="mb-2 flex items-center gap-2">
                  {section.type === 'convergence' && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  {section.type === 'divergence' && (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  )}
                  <h5 className="text-sm font-semibold text-foreground">
                    {section.title}
                  </h5>
                </div>
                <div className="accent-border-left">
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {formatAMTText(section.content)}
                  </p>
                </div>
                {index < structuralSections.length - 1 && (
                  <div className="report-divider opacity-50" />
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="report-divider" />

        {/* Scenarios Table */}
        <section className="report-section">
          <h4 className="report-subsection-header mb-4 text-sm uppercase tracking-wide text-muted-foreground">
            Key Structural Scenarios
          </h4>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scenario</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type of Move</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">In Play</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">LIS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {critique.scenarios.map((scenario, index) => {
                  const type = getScenarioType(scenario.name);
                  return (
                    <tr 
                      key={index} 
                      className={cn(
                        "transition-colors",
                        type === 'bearish' && "scenario-bearish",
                        type === 'bullish' && "scenario-bullish",
                        type === 'rotational' && "scenario-rotational"
                      )}
                      style={{ height: '3rem' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ScenarioIcon type={type} />
                          <span className="font-medium text-foreground">{scenario.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        {scenario.typeOfMove}
                      </td>
                      <td className="px-4 py-3">
                        <span className="price-level">{scenario.inPlay}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium text-danger">{scenario.lis}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Suggested Strategy */}
        <section className="report-section">
          <h4 className="report-subsection-header mb-4 text-sm uppercase tracking-wide text-muted-foreground">
            Suggested Strategy
          </h4>
          <div className="space-y-4">
            {critique.scenarios.map((scenario, index) => {
              const type = getScenarioType(scenario.name);
              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg border p-5 transition-all",
                    type === 'bearish' && "scenario-bearish border-danger/20",
                    type === 'bullish' && "scenario-bullish border-success/20",
                    type === 'rotational' && "scenario-rotational border-info/20"
                  )}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <ScenarioIcon type={type} />
                    <p className="font-semibold text-foreground">
                      Scenario {index + 1}: {scenario.name}
                    </p>
                  </div>
                  
                  <div className="mb-4 grid gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-md bg-background/60 p-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type of Move</span>
                      <p className="mt-1 font-medium text-foreground">{scenario.typeOfMove}</p>
                    </div>
                    <div className="rounded-md bg-background/60 p-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">In Play</span>
                      <p className="mt-1"><span className="price-level">{scenario.inPlay}</span></p>
                    </div>
                    <div className="rounded-md bg-background/60 p-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">LIS</span>
                      <p className="mt-1 font-mono font-medium text-danger">{scenario.lis}</p>
                    </div>
                  </div>
                  
                  <div className="rounded-md border border-border/50 bg-background/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Behavior
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {formatAMTText(scenario.behavior || '')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="report-divider" />

        {/* Inventory Risk Analysis */}
        {critique.inventoryRiskAnalysis && critique.inventoryRiskAnalysis.trim().length > 0 && (
          <section className="report-section">
            <h4 className="report-subsection-header mb-4 text-sm uppercase tracking-wide text-muted-foreground">
              Inventory Risk Analysis
            </h4>
            <div className="accent-border-left space-y-4 rounded-r-lg bg-secondary/20 p-4">
              {critique.inventoryRiskAnalysis.split(/\n\n|\n/).filter(p => p.trim()).map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-foreground/80">
                  {formatAMTText(paragraph)}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Primary Risk */}
        <section className="report-section">
          <div className="callout-warning">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Primary Structural Risk
            </h4>
            <p className="text-sm leading-relaxed text-amber-900/80">
              {formatAMTText(critique.primaryRisk)}
            </p>
          </div>
        </section>

        <div className="report-divider" />

        {/* Structural Checklist Q&A */}
        <section className="report-section">
          <h4 className="report-subsection-header mb-4 text-sm uppercase tracking-wide text-muted-foreground">
            Structural Checklist
          </h4>
          <div className="space-y-4">
            {critique.dailyChecklist.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/20"
              >
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">
                    {item.question}
                  </p>
                </div>
                <div className="ml-9 rounded-md bg-secondary/30 p-3">
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {formatAMTText(item.answer)}
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
