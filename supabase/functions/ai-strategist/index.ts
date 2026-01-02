import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert institutional trader specializing in Auction Market Theory (AMT). You will receive market structure data and provide detailed structural analysis. Follow the AMT principles and terminology provided in the instructions.`;

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
    
    const userPrompt = `You are analyzing a EURUSD pre-market setup using Auction Market Theory (AMT). First, understand these core AMT concepts:

═══════════════════════════════════════════════════════════════
AMT CORE CONCEPTS (CRITICAL - READ CAREFULLY):
═══════════════════════════════════════════════════════════════

1. DAY TYPES:
   - Liquidation: Strong directional move, initiative activity dominates
   - Trend: Sustained directional move with conviction
   - Normal/Variation: Balanced auction, two-sided trade, rotation within range
   - Neutral: Confusion, no clear direction

2. VALUE RELATIONSHIP (Yesterday vs. Previous Day):
   - Higher Value: Yesterday's value area moved higher (bullish)
   - Lower Value: Yesterday's value area moved lower (bearish)
   - Inside/Unchanged: Yesterday's value overlapped previous day (balance)

3. STRUCTURE (Profile Shape):
   - P-Shape: Upper distribution, initiative buying THEN balance = SHORT COVERING (corrective move, not conviction)
   - b-Shape: Lower distribution, initiative selling THEN balance = LONG LIQUIDATION (aggressive selling)
   - Balanced: Normal distribution, two-sided trade
   
   **CRITICAL UNDERSTANDING:**
   - P-Shape = SHORT COVERING (not strong buying) → vulnerable to reversal if buyers don't follow through
   - b-Shape = LONG LIQUIDATION (initiative selling) → vulnerable to short squeeze if sellers don't follow through

4. INVENTORY POSITIONING:
   - Net Long: Market participants positioned LONG (above settlement) → positioned for upside
   - Net Short: Market participants positioned SHORT (below settlement) → positioned for downside
   
   **ASYMMETRIC RISK:**
   - Net Long inventory = MUTED upside (already positioned), VIOLENT downside (liquidation fuel)
   - Net Short inventory = MUTED downside (already positioned), VIOLENT upside (short squeeze fuel)

5. OPEN RELATION:
   - OIV (Open Inside Value): Opened within yesterday's value area → testing ground, two-sided potential
   - OAV (Open Above Value): Opened above yesterday's VAH → bullish continuation attempt
   - OBV (Open Below Value): Opened below yesterday's VAL → bearish continuation attempt
   - GAP (Open Outside Range): Gap open → strong directional bias

6. REFERENCE LEVELS:
   - VAH (Value Area High): Top 70% of volume, key resistance
   - VAL (Value Area Low): Bottom 70% of volume, key support
   - VPOC (Volume Point of Control): Highest volume price, fair value
   - ONH (Overnight High): Overnight session high
   - ONL (Overnight Low): Overnight session low

7. STRUCTURAL LOGIC:
   - ALIGNMENT: Value Relationship + Open Relation point same direction
   - CONFLICT: Inventory + Structure create vulnerability opposite to alignment
   - Example: Higher Value + OAV = bullish alignment, BUT Net Long + P-Shape = liquidation vulnerability

8. COILED SPRING EFFECT:
   - Tight overnight range + Positioned inventory = Explosive potential
   - Small catalyst → violent move due to compressed energy

═══════════════════════════════════════════════════════════════
Now analyze this specific setup:

MARKET STRUCTURE ANALYSIS:

Date: ${tradingDate}

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

═══════════════════════════════════════════════════════════════
ANALYSIS FRAMEWORK:
═══════════════════════════════════════════════════════════════

### 1. Market Context

Analyze the structural imbalance, positional overextension, and auction stage.

**Required elements:**
- Auction stage: Discovery (seeking new value), Acceptance (confirming value), or Rejection (denying value)
- Positional overextension: Is inventory already positioned for the expected move?
- Structural imbalance: What's creating tension in the setup?

**Write 2-3 detailed paragraphs** explaining the current market state.

### 2. Structural Observations

Identify inventory traps, P-shape/b-shape vulnerabilities, and convergence vs. divergence.

**Required elements:**
- P-Shape/b-Shape implications (remember: P-Shape = short covering, b-Shape = long liquidation)
- Inventory vulnerability (asymmetric risk profile)
- Convergence (what aligns?) vs. Divergence (what conflicts?)

**Write 2-3 detailed paragraphs** with specific observations.

### 3. Key Structural Scenarios (Hypotheses)

Provide exactly 3 scenarios with CONTEXT-SPECIFIC NAMES (not generic templates).

**Scenario 1: [Context-Specific Name]**
Type of Move: [e.g., "Trend type 1TF up", "Fast 1TF down", "2TF ranging"]
In Play: [Specific trigger with price, e.g., "Acceptance above ONH 1.04524"]
LIS: [Invalidation level with price, e.g., "Yesterday VAH 1.04428"]
Behavior: [2-3 sentences explaining what happens if this plays out, including who gets trapped and why]

**Scenario 2: [Context-Specific Name]**
Type of Move: [...]
In Play: [...]
LIS: [...]
Behavior: [...]

**Scenario 3: [Context-Specific Name]**
Type of Move: [...]
In Play: [...]
LIS: [...]
Behavior: [...]

**NAMING GUIDELINES:**
- Use "Bullish Continuation" when Higher Value + bullish open align
- Use "Inventory Liquidation" when positioned inventory is at risk (e.g., Net Long failing = Long Liquidation)
- Use "Short Squeeze Rally" when Net Short inventory vulnerable to upside
- Use "Rotational Acceptance" for balanced/ranging scenarios
- Use "Value Rejection" when testing value area boundaries

### 4. Inventory Risk Analysis

Explain how inventory interacts with structure and open relation.

**Required elements:**
- Asymmetric risk profile (which direction is muted? which is violent?)
- Resolution mechanism (what needs to happen to resolve the imbalance?)
- Time factor (how long can the imbalance persist?)

**Write 2-3 detailed paragraphs.**

### 5. Coherence Rating

Rate as ALIGNED, CONFLICTED, or NEUTRAL.

**CRITICAL LOGIC:**

ALIGNED:
- Value Relationship + Open Relation point same direction AND
- Inventory + Structure support that direction
- Example: Higher Value + OAV + Net Long + P-Shape = all bullish = ALIGNED

CONFLICTED:
- Value/Open point one direction BUT Inventory/Structure create vulnerability
- Example: Higher Value + OAV (bullish) BUT Net Long + P-Shape (liquidation risk if fails) = CONFLICTED
- **MUST separate what ALIGNS from what CONFLICTS**

NEUTRAL:
- No clear directional bias, balanced, awaiting catalyst

**Format:**
Rating: [ALIGNED/CONFLICTED/NEUTRAL]
Explanation: [2-3 sentences. If CONFLICTED, clearly state: "Primary alignment: [X]. Primary conflict: [Y]."]

### 6. Primary Structural Risk

Identify the single greatest threat with specific mechanism.

**Required elements:**
- Name the risk (e.g., "Inventory-Driven Reversal", "Gap Fill Trap", "Coiled Spring Explosion")
- Explain the mechanism (trigger → cascade → outcome)
- Emphasize "speed and violence" if applicable

**Write 2-3 detailed sentences.**

### 7. Structural Checklist

Answer these 5 questions with SPECIFIC, ACTIONABLE answers (2-3 sentences each):

Q1: What is the primary structural conflict or alignment in this setup?
A: [Separate what ALIGNS from what CONFLICTS. Example: "Primary alignment: Higher Value + OAV = bullish. Primary conflict: Net Long + P-Shape = liquidation vulnerability if ONH fails. Market requires immediate follow-through to validate long positioning."]

Q2: What are the critical structural pivots and what do they represent?
A: [List 3-4 key levels with prices and meanings. Example: "ONH 1.04524 = breakout confirmation. VAH 1.04428 = value acceptance test. VPOC 1.04285 = fair value magnet. VAL 1.04153 = structural support. Key test is ONH - acceptance confirms bulls, failure triggers liquidation."]

Q3: What does the inventory position tell us about potential price action?
A: [Explain asymmetric risk. Example: "Net Long inventory creates asymmetric risk: muted upside (already positioned), violent downside (liquidation fuel). If ONH fails, long liquidation accelerates decline as profitable positions exit. If ONH holds, move may be slow as inventory already committed."]

Q4: How does yesterday's structure influence today's auction?
A: [Connect day type, value relationship, and structure. Example: "Yesterday's P-Shape Normal Day with Higher Value = short covering move, not conviction buying. Today must prove move is sustainable, not just correction. OAV open tests whether new buyers enter or if shorts re-establish."]

Q5: What structural development am I most likely to miss?
A: [Identify blind spot with specific mechanism. Example: "Tight overnight range (26 pips) + Net Long inventory = coiled spring effect. Easy to miss the speed and violence of potential liquidation if ONH fails. Compressed range masks explosive potential - small catalyst triggers violent move in either direction."]

═══════════════════════════════════════════════════════════════
TONE & STYLE REQUIREMENTS:
- Institutional, precise, nuanced (like a hedge fund morning brief)
- Use AMT terminology correctly (refer to concepts above)
- Identify asymmetric risk profiles explicitly
- Use metaphors: "coiled spring", "fuel for reversal", "trapped inventory"
- Be specific with price levels and mechanisms
- Write in complete, detailed paragraphs (not bullet points)
- Emphasize "speed and violence" when describing liquidation scenarios

EXAMPLES OF GOOD ANALYSIS:

✅ "Net Long inventory ALIGNS with Higher Value and OAV open (all bullish), BUT creates vulnerability if ONH fails. The P-Shape structure indicates yesterday's move was short covering (corrective), not conviction buying. This means the market is positioned for upside but lacks strong commitment. If the ONH (1.04524) fails to hold, the liquidation of these profitable longs will accelerate the decline, creating asymmetric risk: muted upside (already positioned), violent downside (liquidation fuel)."

✅ "The tight overnight range (26 pips) combined with Net Short inventory creates a coiled spring effect. The compressed range masks the explosive potential - a small catalyst at either extreme (ONH or ONL) could trigger a violent move. Easy to miss the speed and violence of this setup because the range appears calm."

✅ "Yesterday's b-Shape Liquidation Day with Lower Value established clear bearish structure through initiative selling. Today's OIV open just below VAH tests whether yesterday's sellers will defend or if shorts will cover. The Net Short inventory provides fuel for a short squeeze if VAH breaks with acceptance."

Now provide your complete analysis following this framework.`;

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
