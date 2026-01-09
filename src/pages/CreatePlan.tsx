import { useState } from "react";
import { AuctionPlanForm } from "@/components/AuctionPlanForm";
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
      const { data, error } = await supabase.functions.invoke('ai-strategist', {
        body: { plan }
      });

      if (error) {
        console.error('AI Strategist error:', error);
        throw new Error(error.message || 'Failed to analyze plan');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const critiqueData: AICritiqueType = {
        id: Date.now().toString(),
        planId: plan.id,
        currentAuctionState: data.currentAuctionState,
        coherence: data.coherence,
        coherenceExplanation: data.coherenceExplanation,
        structuralObservations: data.structuralObservations,
        scenarios: data.scenarios,
        inventoryRiskAnalysis: data.inventoryRiskAnalysis,
        primaryRisk: data.primaryRisk,
        marketContext: data.marketContext,
        dailyChecklist: data.dailyChecklist,
        createdAt: new Date(),
      };

      setCritique(critiqueData);
      setProbabilities([33, 33, 34]);
      toast({
        title: "Analysis Complete",
        description: "AI Strategist has generated your structural critique.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze plan. Please try again.",
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

      // Call the real AI edge function with previous probabilities for fallback
      const { data, error } = await supabase.functions.invoke('trading-coach', {
        body: {
          message: content,
          planContext: {
            yesterday: plan.yesterday,
            today: plan.today,
            levels: plan.levels
          },
          scenarios: critique.scenarios,
          chatHistory,
          previousProbabilities: probabilities
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl py-8 lg:py-12">
        {/* Page Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Create Auction Plan
          </h1>
          <p className="mt-2 text-muted-foreground text-base">
            Build your pre-market analysis for EURUSD
          </p>
        </header>

        <div className="grid gap-10 xl:grid-cols-2">
          {/* Left Column - Form and Analysis */}
          <div className="space-y-8">
            <AuctionPlanForm onSave={handleSavePlan} isLoading={isSaving} />

            {plan && !critique && (
              <div className="flex justify-center py-4">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={handleAnalyzePlan}
                  disabled={isAnalyzing}
                  className="min-w-[260px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Analyze with AI Strategist
                    </>
                  )}
                </Button>
              </div>
            )}

            {critique && (
              <AICritique critique={critique} />
            )}
          </div>

          {/* Right Column - Probability Tracker and Coach */}
          <div className="space-y-8">
            {critique && (
              <>
                <div className="flex justify-end">
                  <Button variant="outline" size="default" onClick={handleExportReport}>
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
    </div>
  );
}