import { useState } from "react";
import { AuctionPlanForm } from "@/components/AuctionPlanForm";
import { TradingViewChart } from "@/components/TradingViewChart";
import { ProbabilityTracker } from "@/components/ProbabilityTracker";
import { TradingCoach } from "@/components/TradingCoach";
import { AICritique } from "@/components/AICritique";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
      // Build chat history for context (exclude current message)
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Call the real AI edge function
      const { data, error } = await supabase.functions.invoke('trading-coach', {
        body: {
          message: content,
          planContext: {
            yesterday: plan.yesterday,
            today: plan.today,
            levels: plan.levels
          },
          scenarios: critique.scenarios,
          chatHistory
        }
      });

      if (error) {
        console.error('Trading Coach error:', error);
        throw new Error(error.message || 'Failed to get coach response');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const responseContent = data?.content || '';
      const newProbabilities: [number, number, number] = data?.probabilities || [33, 33, 34];
      
      // Strip probability tag from displayed content
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
      console.error('Coach error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get coach response. Please try again.",
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
