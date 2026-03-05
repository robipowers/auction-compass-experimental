import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, History, BarChart3, Target, Brain, MessageSquare } from "lucide-react";

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
        {/* Subtle grid pattern only */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-40 opacity-[0.015]" />

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-white/10 bg-secondary/30 px-4 py-1.5 text-sm backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">Institutional AMT Trading Tool</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              Auction Plan
            </h1>
            
            <p className="mb-10 text-base text-muted-foreground sm:text-lg max-w-xl mx-auto">
              Professional pre-market analysis using Auction Market Theory.
              Plan your trades, get AI-powered structural critiques, and receive
              real-time coaching during the session.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          <Card variant="glass" className="group hover:border-primary/25 transition-all">
            <Link to="/plan">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">Create Auction Plan</CardTitle>
                <CardDescription className="text-sm">
                  Build your pre-market analysis with Yesterday's Context, Today's
                  Context, and Reference Levels. Get AI-powered structural critique.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Start planning →
                </span>
              </CardContent>
            </Link>
          </Card>

          <Card variant="glass" className="group hover:border-success/25 transition-all">
            <Link to="/history">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-success/20 border border-success/30">
                  <History className="h-5 w-5 text-success" />
                </div>
                <CardTitle className="text-xl">Trading History</CardTitle>
                <CardDescription className="text-sm">
                  Review your past plans, trades, and performance analytics.
                  Export detailed reports for your trading journal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs font-semibold uppercase tracking-widest text-success">
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
          <div className="flex items-center justify-center gap-2 mb-10">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h2 className="text-lg font-bold uppercase tracking-widest text-foreground">
              Auction Market Theory Workflow
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="glass"
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 border border-primary/20">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container pb-20">
        <Card variant="glass" className="mx-auto max-w-4xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <CardTitle className="text-base font-bold uppercase tracking-widest">About Auction Market Theory</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
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