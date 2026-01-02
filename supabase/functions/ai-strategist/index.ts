import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert AMT (Auction Market Theory) strategist. Analyze the trader's pre-market plan and provide a comprehensive structural critique.

Your analysis must include these sections in EXACTLY this format:

### 1. Coherence Rating
Rate the alignment between inventory, structure, and value relationship as one of: ALIGNED, CONFLICTED, or NEUTRAL
Provide a 2-3 sentence explanation of why.

### 2. Structural Observations
Describe what yesterday's structure tells us about market participants and how it relates to today's setup. 2-3 sentences.

### 3. Scenarios
Provide exactly 3 scenarios in this exact format:
SCENARIO_1: [Name]|[Type of Move]|[In Play Trigger]|[Line in Sand]|[Expected Behavior]
SCENARIO_2: [Name]|[Type of Move]|[In Play Trigger]|[Line in Sand]|[Expected Behavior]
SCENARIO_3: [Name]|[Type of Move]|[In Play Trigger]|[Line in Sand]|[Expected Behavior]

Example:
SCENARIO_1: Bearish Continuation|Trend type 1TF down|Break VAL with acceptance|VAH|Shorts comfortable, initiative selling resumes

### 4. Primary Risk
Identify the main trap or risk in this setup. 2-3 sentences focusing on what could go wrong.

### 5. Market Context
Brief context about broader market conditions. 1-2 sentences.

### 6. Structural Checklist
Answer these 5 critical questions with specific, actionable answers based on the plan data:

Q1: What is the primary structural conflict or alignment in this setup?
A1: [2-3 sentences describing how inventory, value relationship, and open relation interact]

Q2: What are the critical structural pivots and what do they represent?
A2: [2-3 sentences identifying key levels from overnight range and yesterday's value area]

Q3: What does the inventory position tell us about potential price action?
A3: [2-3 sentences explaining inventory implications and asymmetric risk]

Q4: How does yesterday's structure influence today's auction?
A4: [2-3 sentences connecting yesterday's day type, value relationship, and structure to today's setup]

Q5: What structural development am I most likely to miss?
A5: [2-3 sentences identifying the blind spot or non-obvious setup]

CRITICAL RULES:
- Use specific price levels from the plan data in your answers
- Reference the actual inventory, day type, structure, and open relation
- Make answers actionable, not generic
- Each answer should be 2-3 sentences with specific references to the plan`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan } = await req.json();
    
    console.log("AI Strategist request received:", plan);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const userPrompt = `Analyze this trading plan:

YESTERDAY'S CONTEXT:
- Day Type: ${plan.yesterday.dayType}
- Value Relationship: ${plan.yesterday.valueRelationship}
- Structure: ${plan.yesterday.structure}
- Prominent VPOC: ${plan.yesterday.prominentVpoc}

TODAY'S CONTEXT:
- Inventory: ${plan.today.inventory}
- Open Relation: ${plan.today.openRelation}

REFERENCE LEVELS:
- Overnight High: ${plan.levels.overnightHigh}
- Overnight Low: ${plan.levels.overnightLow}
- Yesterday VAH: ${plan.levels.yesterdayVah}
- Yesterday VAL: ${plan.levels.yesterdayVal}

Provide your complete structural analysis.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || "";
    
    console.log("AI Strategist response:", aiContent.substring(0, 500));

    // Parse the AI response into structured critique
    const critique = parseAICritique(aiContent, plan);
    
    return new Response(JSON.stringify(critique), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Strategist error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function parseAICritique(content: string, plan: any) {
  // Extract coherence
  let coherence: "ALIGNED" | "CONFLICTED" | "NEUTRAL" = "NEUTRAL";
  if (content.includes("ALIGNED")) coherence = "ALIGNED";
  else if (content.includes("CONFLICTED")) coherence = "CONFLICTED";

  // Extract coherence explanation
  const coherenceMatch = content.match(/### 1\. Coherence Rating[\s\S]*?(?=### 2|$)/i);
  const coherenceExplanation = coherenceMatch 
    ? coherenceMatch[0].replace(/### 1\. Coherence Rating/i, '').replace(/ALIGNED|CONFLICTED|NEUTRAL/gi, '').trim()
    : "Analysis of structural coherence between inventory and market context.";

  // Extract structural observations
  const structuralMatch = content.match(/### 2\. Structural Observations[\s\S]*?(?=### 3|$)/i);
  const structuralObservations = structuralMatch
    ? structuralMatch[0].replace(/### 2\. Structural Observations/i, '').trim()
    : "Structural analysis pending.";

  // Extract scenarios
  const scenarios = [];
  const scenarioRegex = /SCENARIO_(\d):\s*([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|(.+?)(?=SCENARIO_|### 4|$)/gi;
  let scenarioMatch;
  
  while ((scenarioMatch = scenarioRegex.exec(content)) !== null) {
    scenarios.push({
      name: scenarioMatch[2].trim(),
      typeOfMove: scenarioMatch[3].trim(),
      inPlay: scenarioMatch[4].trim(),
      lis: scenarioMatch[5].trim(),
      behavior: scenarioMatch[6].trim()
    });
  }

  // If no scenarios found with regex, create defaults based on context
  if (scenarios.length < 3) {
    const inventory = plan.today.inventory;
    const structure = plan.yesterday.structure;
    const vah = plan.levels.yesterdayVah;
    const val = plan.levels.yesterdayVal;
    const onh = plan.levels.overnightHigh;
    const onl = plan.levels.overnightLow;

    const defaultScenarios = [
      {
        name: "Bearish Continuation",
        typeOfMove: "Trend type 1TF down",
        inPlay: `Break ${val} with acceptance`,
        lis: vah,
        behavior: "Initiative selling continues, shorts comfortable"
      },
      {
        name: "Short Squeeze / Bullish Reversal",
        typeOfMove: "Trend type 1TF up",
        inPlay: `Break ${vah} with acceptance`,
        lis: val,
        behavior: inventory === "net_short" ? "Shorts forced to cover, aggressive buying" : "Initiative buying enters"
      },
      {
        name: "Balanced/Rotational",
        typeOfMove: "2TF ranging",
        inPlay: `Rejection at both ${vah} and ${val}`,
        lis: "Acceptance outside value",
        behavior: "Market maintains balance, trade edges of value"
      }
    ];
    
    while (scenarios.length < 3) {
      scenarios.push(defaultScenarios[scenarios.length]);
    }
  }

  // Extract primary risk
  const riskMatch = content.match(/### 4\. Primary Risk[\s\S]*?(?=### 5|$)/i);
  const primaryRisk = riskMatch
    ? riskMatch[0].replace(/### 4\. Primary Risk/i, '').trim()
    : "Monitor for failed breakouts that could reverse quickly.";

  // Extract market context
  const contextMatch = content.match(/### 5\. Market Context[\s\S]*?(?=### 6|$)/i);
  const marketContext = contextMatch
    ? contextMatch[0].replace(/### 5\. Market Context/i, '').trim()
    : "Current market conditions require careful level monitoring.";

  // Extract structural checklist Q&A
  const checklistItems = [];
  const qaRegex = /Q(\d):\s*(.+?)\nA\1:\s*(.+?)(?=Q\d:|$)/gis;
  let qaMatch;
  
  while ((qaMatch = qaRegex.exec(content)) !== null) {
    checklistItems.push({
      question: qaMatch[2].trim(),
      answer: qaMatch[3].trim()
    });
  }

  // If no Q&A found, create defaults based on plan data
  if (checklistItems.length < 5) {
    const inventory = plan.today.inventory === 'net_short' ? 'Net Short' : 
                      plan.today.inventory === 'net_long' ? 'Net Long' : 'Neutral';
    const dayType = plan.yesterday.dayType;
    const structure = plan.yesterday.structure === 'p_shape' ? 'P-Shape' : 
                      plan.yesterday.structure === 'b_shape' ? 'b-Shape' : 'Balanced';
    const openRel = plan.today.openRelation.toUpperCase();
    const vah = plan.levels.yesterdayVah;
    const val = plan.levels.yesterdayVal;
    const onh = plan.levels.overnightHigh;
    const onl = plan.levels.overnightLow;

    const defaultChecklist = [
      {
        question: "What is the primary structural conflict or alignment in this setup?",
        answer: `${inventory} inventory with ${structure} structure creates ${inventory === 'Neutral' ? 'balanced' : 'directional'} setup. ${openRel} open suggests market is testing whether yesterday's structure continues or reverses. Primary dynamic is inventory positioning vs. structural context.`
      },
      {
        question: "What are the critical structural pivots and what do they represent?",
        answer: `VAH at ${vah} is critical resistance - break above with acceptance invalidates bearish continuation. VAL at ${val} is support - break below confirms downside discovery. ONH ${onh} and ONL ${onl} define the overnight range that frames initial price action.`
      },
      {
        question: "What does the inventory position tell us about potential price action?",
        answer: `${inventory} inventory creates ${inventory === 'Net Short' ? 'downside bias but also fuel for short squeeze if selling fails' : inventory === 'Net Long' ? 'upside bias but vulnerability to long liquidation' : 'balanced conditions with no forced positioning'}. If price holds ${inventory === 'Net Short' ? 'above VAH' : 'below VAL'} for 60+ minutes, trapped positions become fuel for reversal.`
      },
      {
        question: "How does yesterday's structure influence today's auction?",
        answer: `Yesterday's ${dayType} day with ${structure} structure shows ${structure === 'b-Shape' ? 'initiative selling dominated' : structure === 'P-Shape' ? 'initiative buying dominated' : 'balanced two-sided activity'}. Today's ${openRel} open tests whether that pressure continues or if market finds acceptance and reverses.`
      },
      {
        question: "What structural development am I most likely to miss?",
        answer: `Overnight range is ${Math.abs(parseFloat(onh) - parseFloat(onl)) < 0.005 ? 'tight' : 'wide'}. ${inventory === 'Net Short' || inventory === 'Net Long' ? `${inventory} inventory with this range creates coiled spring potential. Small catalyst at key level could trigger explosive move.` : 'Balanced inventory means watching for which side shows initiative first.'} Don't assume direction - wait for structural break with volume confirmation.`
      }
    ];
    
    while (checklistItems.length < 5) {
      checklistItems.push(defaultChecklist[checklistItems.length]);
    }
  }

  return {
    coherence,
    coherenceExplanation,
    structuralObservations,
    scenarios: scenarios.slice(0, 3),
    primaryRisk,
    marketContext,
    dailyChecklist: checklistItems.slice(0, 5)
  };
}
