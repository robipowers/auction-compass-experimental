import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, History, BarChart3, Target, Brain, MessageSquare, Activity } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Context Analysis",
    description: "Capture Yesterday's structure, Today's inventory, and key reference levels",
  },
  {
    icon: Brain,
    title: "AI Strategist",
    description: "Get AI-powered structural critique with 3 scenario hypotheses",
  },
  {
    icon: Target,
    title: "Probability Tracking",
    description: "Monitor scenario probabilities with real-time updates",
  },
  {
    icon: MessageSquare,
    title: "Trading Coach",
    description: "Real-time AMT coaching as price action unfolds",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-40 opacity-[0.02]" />
        
        {/* Green Glow Orbs */}
        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-20 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            {/* Status Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm backdrop-blur-sm">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-primary font-medium">Institutional AMT Trading Tool</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">Auction Plan</span>
            </h1>
            
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              Professional pre-market analysis using Auction Market Theory.
              Plan your trades, get AI-powered structural critiques, and receive
              real-time coaching during the session.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild variant="hero" size="xl">
                <Link to="/plan">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Create Auction Plan
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/history">
                  <History className="mr-2 h-5 w-5" />
                  View History
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Cards */}
      <section className="container pb-20">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <Card variant="interactive" className="group">
            <Link to="/plan">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent transition-all group-hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] group-hover:scale-110">
                  <TrendingUp className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Create Auction Plan</CardTitle>
                <CardDescription className="text-base">
                  Build your pre-market analysis with Yesterday's Context, Today's
                  Context, and Reference Levels. Get AI-powered structural critique.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                  Start planning →
                </span>
              </CardContent>
            </Link>
          </Card>

          <Card variant="interactive" className="group">
            <Link to="/history">
              <CardHeader>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-info to-accent transition-all group-hover:shadow-[0_0_40px_hsl(var(--info)/0.5)] group-hover:scale-110">
                  <History className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Trading History</CardTitle>
                <CardDescription className="text-base">
                  Review your past plans, trades, and performance analytics.
                  Export detailed reports for your trading journal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-info group-hover:text-info/80 transition-colors">
                  View history →
                </span>
              </CardContent>
            </Link>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container pb-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-bold sm:text-3xl">
            Auction Market Theory <span className="text-primary">Workflow</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="glass"
                className="animate-fade-in hover:border-primary/30 transition-all"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container pb-20">
        <Card variant="neon" className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              About Auction Market Theory
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <p>
              Auction Market Theory (AMT) is a framework for understanding market
              dynamics through the lens of supply and demand. It focuses on how
              markets auction to find fair value, analyzing the interaction between
              initiative and responsive participants.
            </p>
            <p>
              This tool helps you systematically analyze the prior session's
              structure, assess current market inventory, identify key reference
              levels, and develop probabilistic scenarios for the trading day ahead.
              Combined with AI-powered analysis, you get objective structural
              critiques to improve your trading decisions.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}