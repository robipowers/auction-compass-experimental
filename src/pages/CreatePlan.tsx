import { useState } from "react";
import { AuctionPlanForm } from "@/components/AuctionPlanForm";
import { TradingViewChart } from "@/components/TradingViewChart";
import { ProbabilityTracker } from "@/components/ProbabilityTracker";
import { TradingCoach } from "@/components/TradingCoach";
import { AICritique } from "@/components/AICritique";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Download, Loader2 } from "lucide-react";
import {
  YesterdayContext,
  TodayContext,
  ReferenceLevels,
  AuctionPlan,
  AICritique as AICritiqueType,
  CoachMessage,
  Scenario,
} from "@/types/auction";

// Mock AI critique for demo
const mockCritique: AICritiqueType = {
  id: "1",
  planId: "1",
  coherence: "ALIGNED",
  coherenceExplanation:
    "Net Short inventory with inside previous value relationship and balanced structure creates a coherent setup. The market is positioned for potential short covering or continuation lower, depending on how price interacts with yesterday's value area.",
  structuralObservations:
    "Yesterday's balanced structure within inside value suggests equilibrium. The market closed near the middle of the range, indicating neither buyers nor sellers were in control by the close. Net Short inventory creates asymmetric potential for upside if shorts need to cover.",
  scenarios: [
    {
      name: "Bearish Continuation",
      typeOfMove: "Trend type 1TF down",
      inPlay: "Break VAL 1.17053",
      lis: "VAH 1.17528",
      behavior:
        "Shorts comfortable, new initiative selling enters. Target: prior week low.",
    },
    {
      name: "Short Squeeze",
      typeOfMove: "Trend type 1TF up",
      inPlay: "Break VAH 1.17528 with acceptance",
      lis: "VAL 1.17053",
      behavior:
        "Net Short inventory forced to cover. Aggressive move higher possible.",
    },
    {
      name: "Balanced/Rotational",
      typeOfMove: "2TF ranging",
      inPlay: "Rejection at both VAH and VAL",
      lis: "Acceptance outside value",
      behavior:
        "Market continues yesterday's balance. Trade edges of value for rotational plays.",
    },
  ],
  primaryRisk:
    "The main trap is a false break of value that reverses. Given Net Short inventory, a failed break below VAL could trigger aggressive short covering. Watch for acceptance vs. rejection at key levels before committing.",
  marketContext:
    "EURUSD showing consolidation after recent directional move. Inside value suggests market participants seeking fair value. Key focus on inventory resolution and whether balance continues or breaks.",
  dailyChecklist: [
    "Is overnight range contained within yesterday's value?",
    "How does price react to yesterday's VAH/VAL in the first 30 minutes?",
    "Is there initiative activity (volume and momentum) at key levels?",
    "Are shorts being squeezed or adding to positions?",
    "Is the VPOC from yesterday attracting price?",
    "Watch for excess formation at extremes as potential reversal signals",
    "Monitor for single prints that could fill as value is discovered",
  ],
  createdAt: new Date(),
};

export default function CreatePlan() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [plan, setPlan] = useState<AuctionPlan | null>(null);
  const [critique, setCritique] = useState<AICritiqueType | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [probabilities, setProbabilities] = useState<[number, number, number]>([
    33, 33, 34,
  ]);
  const [previousProbabilities, setPreviousProbabilities] = useState<
    [number, number, number] | undefined
  >();
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  const handleSavePlan = async (data: {
    yesterday: YesterdayContext;
    today: TodayContext;
    levels: ReferenceLevels;
  }) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newPlan: AuctionPlan = {
        id: Date.now().toString(),
        instrument: "EURUSD",
        yesterday: data.yesterday,
        today: data.today,
        levels: data.levels,
        createdAt: new Date(),
      };

      setPlan(newPlan);
      toast({
        title: "Plan Saved",
        description: "Your auction plan has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzePlan = async () => {
    if (!plan) return;

    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setCritique(mockCritique);
      setProbabilities([33, 33, 34]);
      toast({
        title: "Analysis Complete",
        description: "AI Strategist has generated your structural critique.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Extract probabilities from AI response using [PROBABILITIES: X, Y, Z] format
  const extractProbabilities = (content: string): [number, number, number] | null => {
    const match = content.match(/\[PROBABILITIES:\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]/i);
    
    if (!match) {
      console.warn('No probabilities found in AI response');
      return null;
    }
    
    const probs: [number, number, number] = [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10)
    ];
    
    // Validate they sum to 100
    const sum = probs.reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      console.warn(`Probabilities sum to ${sum}, normalizing to 100`);
      const normalized: [number, number, number] = [
        Math.round((probs[0] / sum) * 100),
        Math.round((probs[1] / sum) * 100),
        Math.round((probs[2] / sum) * 100)
      ];
      // Fix rounding errors
      const diff = 100 - normalized.reduce((a, b) => a + b, 0);
      normalized[0] += diff;
      return normalized;
    }
    
    return probs;
  };

  // Strip probability tag from displayed content
  const stripProbabilityTag = (content: string): string => {
    return content.replace(/\[PROBABILITIES:\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\]/gi, '').trim();
  };

  const handleSendMessage = async (content: string) => {
    if (!critique || !plan) return;

    const userMessage: CoachMessage = {
      id: Date.now().toString(),
      planId: plan.id,
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsCoachLoading(true);

    try {
      // Simulate AI response with structured probability updates
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const lowerContent = content.toLowerCase();
      const scenario1 = critique.scenarios[0];
      const scenario2 = critique.scenarios[1];
      const scenario3 = critique.scenarios[2];
      
      let responseContent = "";

      // VAL rejection pattern
      if (lowerContent.includes("val") && (lowerContent.includes("rejection") || lowerContent.includes("reject"))) {
        responseContent = `**Structural Read:**

VAL rejection with ${plan.today.inventory} inventory is structurally significant. This aligns with **${scenario2.name}** as the rejection at ${plan.levels.yesterdayVal} suggests buyers are defending the lower extreme of yesterday's value area.

**Key Observations:**
- Rejection at VAL ${plan.levels.yesterdayVal} indicates responsive buying
- ${plan.today.inventory} inventory creates asymmetric squeeze potential if VAL holds
- Watch for acceptance back above the overnight low ${plan.levels.overnightLow}

**Scenario Update:**
- **${scenario1.name}** is weakening as VAL holds against initiative selling
- **${scenario2.name}** gains probability with structural support evident
- **${scenario3.name}** remains possible if we rotate back to mid-value

**Next Steps:**
If price breaks above ONH ${plan.levels.overnightHigh} with volume, ${scenario2.name} strengthens significantly. Monitor for acceptance vs. rejection at key structural levels.

[PROBABILITIES: 25, 50, 25]`;
      }
      // VAH break pattern
      else if (lowerContent.includes("break") && lowerContent.includes("vah")) {
        responseContent = `**Structural Read:**

VAH break with acceptance is a significant structural shift. **${scenario2.name} is now CONFIRMED.** Initiative buying has emerged, and ${plan.today.inventory} inventory is being forced to cover.

**Key Observations:**
- Initiative break of VAH ${plan.levels.yesterdayVah} confirms upside bias
- ${plan.today.inventory} positions are likely covering, adding fuel to the move
- Price discovery higher is now in play toward prior structural targets

**Scenario Update:**
- **${scenario1.name}** is effectively INVALIDATED - LIS ${scenario1.lis} broken
- **${scenario2.name}** is now primary with high confidence
- **${scenario3.name}** no longer applicable with trend developing

**Invalidation:**
LIS for continuation higher is now VAL ${plan.levels.yesterdayVal}. Price acceptance below this level would invalidate the squeeze.

[PROBABILITIES: 5, 85, 10]`;
      }
      // VAL break pattern
      else if (lowerContent.includes("break") && lowerContent.includes("val")) {
        responseContent = `**Structural Read:**

VAL break confirms initiative selling pressure. **${scenario1.name} is strengthening.** The break below ${plan.levels.yesterdayVal} shows sellers are in control.

**Key Observations:**
- Initiative break of VAL ${plan.levels.yesterdayVal} confirms bearish bias
- ${plan.today.inventory} participants may be adding to positions
- Price discovery lower is now in play

**Scenario Update:**
- **${scenario1.name}** gains significant probability with structural confirmation
- **${scenario2.name}** is weakening as key support breaks
- **${scenario3.name}** less likely with directional move developing

**Next Steps:**
Watch for acceptance below VAL. If price holds below with time, expect continuation toward prior structural support. Quick reversal back above VAL would trap new shorts.

[PROBABILITIES: 70, 15, 15]`;
      }
      // ONL break pattern
      else if (lowerContent.includes("break") && (lowerContent.includes("onl") || lowerContent.includes("overnight low"))) {
        responseContent = `**Structural Read:**

Breaking overnight low ${plan.levels.overnightLow} with volume shows initiative selling. **${scenario1.name} is now CONFIRMED.** Price discovery lower is active.

**Key Observations:**
- Initiative break of ONL confirms bearish price discovery
- Overnight range failed to contain price - expansion expected
- Next structural target is VAL ${plan.levels.yesterdayVal}, then prior swing lows

**Scenario Update:**
- **${scenario1.name}** is now high probability with structural confirmation
- **${scenario2.name}** largely invalidated by ONL break
- **${scenario3.name}** no longer applicable

**Invalidation:**
LIS remains VAH ${plan.levels.yesterdayVah}. Price acceptance above VAH would invalidate bearish scenario.

[PROBABILITIES: 80, 10, 10]`;
      }
      // Rotation/balance pattern
      else if (lowerContent.includes("rotat") || lowerContent.includes("balance") || lowerContent.includes("inside")) {
        responseContent = `**Structural Read:**

Price rotating inside value suggests **${scenario3.name}** is developing. Neither buyers nor sellers have taken control.

**Key Observations:**
- Price contained between VAH ${plan.levels.yesterdayVah} and VAL ${plan.levels.yesterdayVal}
- Balance day developing with rotational trade opportunities
- Watch for initiative activity at range extremes

**Scenario Update:**
- **${scenario1.name}** remains possible but needs VAL break for confirmation
- **${scenario2.name}** needs VAH break with acceptance
- **${scenario3.name}** is primary while price stays inside value

**Trading Implications:**
Fade extremes of the range. Look for rejection candles at VAH/VAL. Break and acceptance outside value changes the scenario.

[PROBABILITIES: 25, 25, 50]`;
      }
      // Default contextual response
      else {
        responseContent = `**Structural Read:**

Analyzing your observation in context of today's ${plan.today.inventory} inventory and ${plan.today.openRelation} open relation. The ${plan.yesterday.structure} structure from yesterday provides the backdrop.

**Current Context:**
- **Yesterday:** ${plan.yesterday.dayType} day with ${plan.yesterday.valueRelationship} value relationship
- **Structure:** ${plan.yesterday.structure} suggests ${plan.yesterday.structure.includes("b-Shape") ? "initiative selling pressure" : plan.yesterday.structure.includes("P-Shape") ? "initiative buying pressure" : "balanced activity"}
- **VPOC:** ${plan.yesterday.prominentVpoc} is a key reference for fair value

**Reference Levels:**
- ONH: ${plan.levels.overnightHigh} | ONL: ${plan.levels.overnightLow}
- VAH: ${plan.levels.yesterdayVah} | VAL: ${plan.levels.yesterdayVal}

**Scenario Status:**
- **${scenario1.name}**: In Play if ${scenario1.inPlay} | LIS: ${scenario1.lis}
- **${scenario2.name}**: In Play if ${scenario2.inPlay} | LIS: ${scenario2.lis}
- **${scenario3.name}**: In Play if ${scenario3.inPlay} | LIS: ${scenario3.lis}

**Next Steps:**
Describe specific price action at key levels (e.g., "VAL rejection with wicks" or "broke ONL with volume") for targeted scenario assessment.

[PROBABILITIES: 33, 33, 34]`;
      }

      // Extract and update probabilities
      const extractedProbs = extractProbabilities(responseContent);
      const newProbabilities: [number, number, number] = extractedProbs || probabilities;
      const displayContent = stripProbabilityTag(responseContent);

      setPreviousProbabilities([...probabilities]);
      setProbabilities(newProbabilities);

      const assistantMessage: CoachMessage = {
        id: (Date.now() + 1).toString(),
        planId: plan.id,
        role: "assistant",
        content: displayContent,
        probabilities: newProbabilities,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get coach response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCoachLoading(false);
    }
  };

  const handleExportReport = () => {
    const report = generateMarkdownReport();
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auction-plan-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Your daily trading journal has been downloaded.",
    });
  };

  const generateMarkdownReport = () => {
    const date = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let report = `# Auction Plan Report\n\n`;
    report += `**Date:** ${date}\n`;
    report += `**Instrument:** ${plan?.instrument || "EURUSD"}\n\n`;

    if (plan) {
      report += `## Yesterday's Context\n\n`;
      report += `- **Day Type:** ${plan.yesterday.dayType}\n`;
      report += `- **Value Relationship:** ${plan.yesterday.valueRelationship}\n`;
      report += `- **Structure:** ${plan.yesterday.structure}\n`;
      report += `- **Prominent VPOC:** ${plan.yesterday.prominentVpoc}\n\n`;

      report += `## Today's Context\n\n`;
      report += `- **Inventory:** ${plan.today.inventory}\n`;
      report += `- **Open Relation:** ${plan.today.openRelation}\n\n`;

      report += `## Reference Levels\n\n`;
      report += `- **Overnight High:** ${plan.levels.overnightHigh}\n`;
      report += `- **Overnight Low:** ${plan.levels.overnightLow}\n`;
      report += `- **Yesterday VAH:** ${plan.levels.yesterdayVah}\n`;
      report += `- **Yesterday VAL:** ${plan.levels.yesterdayVal}\n\n`;
    }

    if (critique) {
      report += `## AI Analysis\n\n`;
      report += `### Coherence: ${critique.coherence}\n\n`;
      report += `${critique.coherenceExplanation}\n\n`;

      report += `### Scenarios\n\n`;
      critique.scenarios.forEach((s, i) => {
        report += `**${i + 1}. ${s.name}**\n`;
        report += `- Type: ${s.typeOfMove}\n`;
        report += `- In Play: ${s.inPlay}\n`;
        report += `- LIS: ${s.lis}\n\n`;
      });

      report += `### Primary Risk\n\n${critique.primaryRisk}\n\n`;
    }

    if (messages.length > 0) {
      report += `## Trading Coach Session\n\n`;
      messages.forEach((m) => {
        const time = m.createdAt.toLocaleTimeString();
        report += `**[${time}] ${m.role === "user" ? "Trader" : "Coach"}:**\n`;
        report += `${m.content}\n\n`;
      });
    }

    report += `---\n\n## Post-Session Notes\n\n`;
    report += `*Add your observations here after the session...*\n`;

    return report;
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Auction Plan</h1>
        <p className="mt-2 text-muted-foreground">
          Build your pre-market analysis for EURUSD
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        {/* Left Column - Form and Chart */}
        <div className="space-y-8">
          <AuctionPlanForm onSave={handleSavePlan} isLoading={isSaving} />

          {plan && !critique && (
            <div className="flex justify-center">
              <Button
                variant="hero"
                size="lg"
                onClick={handleAnalyzePlan}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze with AI Strategist
                  </>
                )}
              </Button>
            </div>
          )}

          {critique && (
            <AICritique critique={critique} />
          )}

          <TradingViewChart />
        </div>

        {/* Right Column - Probability Tracker and Coach */}
        <div className="space-y-8">
          {critique && (
            <>
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleExportReport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>

              <ProbabilityTracker
                scenarios={critique.scenarios}
                probabilities={probabilities}
                previousProbabilities={previousProbabilities}
              />

              <TradingCoach
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isCoachLoading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
