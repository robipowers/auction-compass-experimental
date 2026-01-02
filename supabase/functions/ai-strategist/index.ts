import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert institutional trader specializing in Auction Market Theory. Provide detailed structural analysis focusing on market context, inventory positioning, and value relationships. Do not critique missing execution fields - focus purely on structural setup and risk assessment.`;

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

    const tradingDate = new Date().toISOString().split('T')[0];
    
    const userPrompt = `You are an institutional Auction Market Theory (AMT) trading strategist. Analyze the following EURUSD market structure analysis and provide a comprehensive structural critique.

MARKET STRUCTURE ANALYSIS:

Date: ${tradingDate}

REARVIEW MIRROR (Yesterday's Context):
- Day Type: ${plan.yesterday.dayType}
- Value Relationship: ${plan.yesterday.valueRelationship}
- Structure: ${plan.yesterday.structure}
- Prominent VPOC: ${plan.yesterday.prominentVpoc}

WINDSHIELD (Current State):
- Inventory: ${plan.today.inventory}
- Open Relation: ${plan.today.openRelation}

REFERENCE LEVELS:
- Overnight High: ${plan.levels.overnightHigh}
- Overnight Low: ${plan.levels.overnightLow}
- Yesterday VAH: ${plan.levels.yesterdayVah}
- Yesterday VAL: ${plan.levels.yesterdayVal}

Provide your analysis in the following structured format:

### 1. Market Context

Analyze the structural imbalance, positional overextension, and auction stage. Identify if this is a discovery phase, value acceptance, or rejection scenario based on the day type, value relationship, and structure.

### 2. Structural Observations

Identify inventory traps, P-shape/b-shape vulnerabilities, and convergence vs. divergence between value, inventory, and open relation. Explain how yesterday's structure sets up today's potential auction behavior.

### 3. Key Structural Scenarios (Hypotheses)

Provide exactly 3 scenarios in the following structured format:

**Scenario 1: [Name]**
Type of Move: [e.g., "Trend type 1TF up", "2TF ranging", "Fast 1TF down", "Rotational", "Liquidation"]
In Play: [Specific trigger level or condition, e.g., "Break 1.17958 (VAH)"]
LIS: [Invalidation level, e.g., "1.17748 (VAL)"]
Behavior: [Brief description of expected price action]

**Scenario 2: [Name]**
Type of Move: [e.g., "Trend type 1TF up", "2TF ranging", "Fast 1TF down", "Rotational", "Liquidation"]
In Play: [Specific trigger level or condition]
LIS: [Invalidation level]
Behavior: [Brief description]

**Scenario 3: [Name]**
Type of Move: [e.g., "Trend type 1TF up", "2TF ranging", "Fast 1TF down", "Rotational", "Liquidation"]
In Play: [Specific trigger level or condition]
LIS: [Invalidation level]
Behavior: [Brief description]

Reference the overnight range and yesterday's VAH/VAL as critical pivots.

### 4. Inventory Risk Analysis

Explain how the current inventory position (Net Long vs Net Short) interacts with the open relation and yesterday's structure. What does the market need to do to resolve this inventory imbalance?

### 5. Coherence Rating

Rate the structural setup as ALIGNED (clear directional bias from all factors), CONFLICTED (contradictory signals between inventory/value/structure), or NEUTRAL (balanced, awaiting catalyst) with explanation.

### 6. Primary Structural Risk

Identify the single greatest structural threat based on this setup (e.g., overnight flush, inventory-driven reversal, gap fill mechanics, value rejection).

### 7. Structural Checklist

Answer these 5 critical questions about the market structure:

Q1: What is the primary structural conflict or alignment in this setup?
A: [Describe how inventory, value relationship, and open relation interact - e.g., "Net Short Inventory + OIV open creates balanced setup - market needs either aggressive new selling to continue bearish structure OR lack of selling triggers short squeeze rally"]

Q2: What are the critical structural pivots and what do they represent?
A: [Identify key levels from overnight range and yesterday's value area - e.g., "VAH at 1.04950 is critical pivot. Break above + acceptance = structural shift from bearish to neutral/bullish. ONH at 1.05020 is secondary resistance. VAL at 1.04650 is support - break below confirms bearish continuation"]

Q3: What does the inventory position tell us about potential price action?
A: [Explain inventory implications - e.g., "Net Short inventory means market is positioned for downside. However, if selling doesn't materialize in first 60 minutes, shorts become fuel for rally back to VAH or higher. Inventory creates asymmetric risk"]

Q4: How does yesterday's structure influence today's auction?
A: [Connect yesterday's day type, value relationship, and structure to today's setup - e.g., "Yesterday's Liquidation Day with Lower Value created bearish structure. Today's OIV open suggests continuation IF selling pressure resumes. P-shape structure shows short covering - vulnerable to further squeeze if buyers return"]

Q5: What structural development am I most likely to miss?
A: [Identify blind spot - e.g., "Overnight range is narrow (40 pips). Easy to miss that tight range + Net Short inventory = coiled spring. Small catalyst could trigger explosive move in either direction. Don't assume direction - wait for structural break of ONH or ONL"]

Be direct, specific, and institutional in your analysis. Focus on structural relationships, not trade execution. Reference the provided price levels (overnight range, VAH/VAL, VPOC) in your analysis.`;

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
  // Extract coherence from Section 5
  let coherence: "ALIGNED" | "CONFLICTED" | "NEUTRAL" = "NEUTRAL";
  const coherenceSection = content.match(/### 5\. Coherence Rating[\s\S]*?(?=### 6|$)/i);
  if (coherenceSection) {
    if (coherenceSection[0].includes("ALIGNED")) coherence = "ALIGNED";
    else if (coherenceSection[0].includes("CONFLICTED")) coherence = "CONFLICTED";
  }

  // Extract coherence explanation
  const coherenceExplanation = coherenceSection 
    ? coherenceSection[0].replace(/### 5\. Coherence Rating/i, '').replace(/\*\*.*?\*\*/g, '').replace(/ALIGNED|CONFLICTED|NEUTRAL/gi, '').trim().substring(0, 600)
    : "Analysis of structural coherence between inventory and market context.";

  // Extract market context (Section 1)
  const contextMatch = content.match(/### 1\. Market Context[\s\S]*?(?=### 2|$)/i);
  const marketContext = contextMatch
    ? contextMatch[0].replace(/### 1\. Market Context/i, '').replace(/\*\*.*?\*\*/g, '').trim()
    : "Current market conditions require careful level monitoring.";

  // Extract structural observations (Section 2)
  const structuralMatch = content.match(/### 2\. Structural Observations[\s\S]*?(?=### 3|$)/i);
  const structuralObservations = structuralMatch
    ? structuralMatch[0].replace(/### 2\. Structural Observations/i, '').replace(/\*\*.*?\*\*/g, '').trim()
    : "Structural analysis pending.";

  // Extract scenarios (Section 3) - new format
  const scenarios = [];
  const scenarioRegex = /\*\*Scenario \d+:\s*([^*]+)\*\*[\s\S]*?Type of Move:\s*([^\n]+)[\s\S]*?In Play:\s*([^\n]+)[\s\S]*?LIS:\s*([^\n]+)[\s\S]*?Behavior:\s*([^\n]+(?:\n(?!\*\*Scenario)[^\n#]*)*)/gi;
  let scenarioMatch;
  
  while ((scenarioMatch = scenarioRegex.exec(content)) !== null) {
    scenarios.push({
      name: scenarioMatch[1].trim(),
      typeOfMove: scenarioMatch[2].trim(),
      inPlay: scenarioMatch[3].trim(),
      lis: scenarioMatch[4].trim(),
      behavior: scenarioMatch[5].trim().replace(/\n/g, ' ').substring(0, 300)
    });
  }

  // If no scenarios found, create context-aware defaults
  if (scenarios.length < 3) {
    const inventory = plan.today.inventory;
    const structure = plan.yesterday.structure;
    const valueRel = plan.yesterday.valueRelationship;
    const vah = plan.levels.yesterdayVah;
    const val = plan.levels.yesterdayVal;
    const onh = plan.levels.overnightHigh;
    const onl = plan.levels.overnightLow;

    const isBullish = valueRel.includes('higher') || inventory === 'net_long';
    const isBearish = valueRel.includes('lower') || inventory === 'net_short';

    const defaultScenarios = isBullish ? [
      {
        name: "Bullish Continuation",
        typeOfMove: "Trend type 1TF up",
        inPlay: `Acceptance above ONH ${onh}`,
        lis: `VAH ${vah}`,
        behavior: "Initiative buying continues, longs comfortable. Move accelerates as shorts cover."
      },
      {
        name: "Inventory Liquidation",
        typeOfMove: "Fast 1TF down",
        inPlay: `Failure at ONH ${onh} with break below VAH ${vah}`,
        lis: `ONH ${onh}`,
        behavior: "Net Long inventory becomes liquidation fuel. Speed and violence to downside as positioned longs exit."
      },
      {
        name: "Rotational Acceptance",
        typeOfMove: "2TF ranging",
        inPlay: `Rejection at ONH ${onh} but holding VAL ${val}`,
        lis: "Break of either overnight extreme with acceptance",
        behavior: "Market builds value, awaits catalyst. Trade edges of developing range."
      }
    ] : [
      {
        name: "Bearish Continuation",
        typeOfMove: "Trend type 1TF down",
        inPlay: `Acceptance below ONL ${onl}`,
        lis: `VAL ${val}`,
        behavior: "Initiative selling resumes, shorts comfortable. Downside discovery accelerates."
      },
      {
        name: "Short Squeeze Rally",
        typeOfMove: "Fast 1TF up",
        inPlay: `Failure at ONL ${onl} with break above VAH ${vah}`,
        lis: `ONL ${onl}`,
        behavior: "Net Short inventory becomes squeeze fuel. Speed and violence to upside as shorts cover."
      },
      {
        name: "Rotational Acceptance",
        typeOfMove: "2TF ranging",
        inPlay: `Rejection at ONL ${onl} but capped at VAH ${vah}`,
        lis: "Break of either overnight extreme with acceptance",
        behavior: "Market builds value, awaits catalyst. Trade edges of developing range."
      }
    ];
    
    while (scenarios.length < 3) {
      scenarios.push(defaultScenarios[scenarios.length]);
    }
  }

  // Extract primary risk (Section 6)
  const riskMatch = content.match(/### 6\. Primary Structural Risk[\s\S]*?(?=### 7|$)/i);
  const primaryRisk = riskMatch
    ? riskMatch[0].replace(/### 6\. Primary Structural Risk/i, '').replace(/\*\*.*?\*\*/g, '').trim().substring(0, 500)
    : "Monitor for failed breakouts that could reverse quickly with speed and violence.";

  // Extract structural checklist Q&A (Section 7)
  const checklistItems = [];
  const checklistSection = content.match(/### 7\. Structural Checklist[\s\S]*$/i);
  
  if (checklistSection) {
    const qaRegex = /Q(\d):\s*([^\n]+)\s*\nA:\s*([^\n]+(?:\n(?!Q\d:)[^\n#]*)*)/gi;
    let qaMatch;
    
    while ((qaMatch = qaRegex.exec(checklistSection[0])) !== null) {
      checklistItems.push({
        question: qaMatch[2].trim(),
        answer: qaMatch[3].trim().replace(/\n/g, ' ').substring(0, 400)
      });
    }
  }

  // If no Q&A found, create context-aware defaults
  if (checklistItems.length < 5) {
    const inventory = plan.today.inventory === 'net_short' ? 'Net Short' : 
                      plan.today.inventory === 'net_long' ? 'Net Long' : 'Neutral';
    const dayType = plan.yesterday.dayType;
    const structure = plan.yesterday.structure === 'p_shape' ? 'P-Shape' : 
                      plan.yesterday.structure === 'b_shape' ? 'b-Shape' : 'Balanced';
    const valueRel = plan.yesterday.valueRelationship;
    const openRel = plan.today.openRelation.toUpperCase();
    const vah = plan.levels.yesterdayVah;
    const val = plan.levels.yesterdayVal;
    const onh = plan.levels.overnightHigh;
    const onl = plan.levels.overnightLow;
    
    const isBullish = valueRel.includes('higher');
    const isBearish = valueRel.includes('lower');
    const direction = isBullish ? 'bullish' : isBearish ? 'bearish' : 'neutral';

    const defaultChecklist = [
      {
        question: "What is the primary structural conflict or alignment in this setup?",
        answer: `Primary alignment: ${valueRel} Value + ${openRel} = ${direction} context. ${inventory !== 'Neutral' ? `Primary conflict: ${inventory} inventory + ${structure} creates ${inventory === 'Net Long' ? 'liquidation' : 'squeeze'} vulnerability if ${inventory === 'Net Long' ? 'ONH' : 'ONL'} fails.` : 'Neutral inventory allows two-sided potential without forced positioning.'}`
      },
      {
        question: "What are the critical structural pivots and what do they represent?",
        answer: `ONH ${onh} = breakout confirmation. VAH ${vah} = value acceptance test. VAL ${val} = structural support. ONL ${onl} = breakdown confirmation. ${isBullish ? `Key test is ONH - break above confirms bulls, failure triggers liquidation.` : `Key test is ONL - break below confirms bears, failure triggers squeeze.`}`
      },
      {
        question: "What does the inventory position tell us about potential price action?",
        answer: `${inventory} inventory creates asymmetric risk: ${inventory === 'Net Long' ? 'muted upside (already positioned), violent downside (liquidation fuel). If ONH fails, liquidation accelerates decline.' : inventory === 'Net Short' ? 'muted downside (already positioned), violent upside (squeeze fuel). If ONL fails, short squeeze accelerates rally.' : 'balanced conditions with no forced positioning. Watch for which side initiates first.'}`
      },
      {
        question: "How does yesterday's structure influence today's auction?",
        answer: `Yesterday's ${dayType} day with ${structure} structure = ${structure === 'P-Shape' ? 'short covering move (corrective, not conviction buying)' : structure === 'b-Shape' ? 'long liquidation (initiative selling)' : 'balanced two-sided activity'}. ${valueRel} Value ${isBullish ? 'supports continuation IF buying resumes' : isBearish ? 'supports continuation IF selling resumes' : 'awaits directional catalyst'}. Today must prove sustainability.`
      },
      {
        question: "What structural development am I most likely to miss?",
        answer: `Overnight range (${onh} to ${onl}) ${inventory !== 'Neutral' ? `+ ${inventory} inventory = coiled spring potential. Easy to miss speed and violence of ${inventory === 'Net Long' ? 'liquidation if ONH fails' : 'squeeze if ONL fails'}. Explosive move likely once direction confirmed.` : '+ Neutral inventory means watching for which side shows initiative first. Easy to miss early signs of directional commitment.'}`
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
