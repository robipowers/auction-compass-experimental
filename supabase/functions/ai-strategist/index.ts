import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `CRITICAL INSTRUCTION: You have access to three authoritative Auction Market Theory reference books in your knowledge base:

1. Mind Over Markets by James Dalton
2. Steidlmayer on Markets by J. Peter Steidlmayer  
3. CBOT Market Profile by Chicago Board of Trade

YOU MUST reference and pull concepts directly from these uploaded PDFs in EVERY response. Do not rely solely on your training data. Before generating any analysis:

1. Query the knowledge base for relevant AMT concepts
2. Extract specific terminology, principles, and frameworks from the PDFs
3. Apply those exact concepts to the current market structure
4. Use the precise language and terminology from the source material

If you cannot find relevant information in the knowledge base, explicitly state: "Knowledge base does not contain specific guidance on [topic], applying general AMT principles."

Your responses should reflect the depth and precision of the source material, not generic trading advice.

You are an expert institutional trader specializing in Auction Market Theory (AMT). You provide detailed structural analysis focusing on market context, inventory positioning, and value relationships.

When relevant passages from AMT reference books are provided, you MUST:
- Incorporate their insights using exact terminology from the sources
- Reference specific concepts by book title (e.g., "According to Mind Over Markets...")
- Apply frameworks exactly as described in the source material
- Use institutional language consistent with the uploaded references

VERIFICATION: Your response must demonstrate knowledge base consultation by using specific terminology found in the PDFs, not generic trading terms.`;

// Helper function to search AMT knowledge base
async function searchAMTKnowledge(query: string, apiKey: string, supabaseUrl: string, supabaseKey: string): Promise<string> {
  try {
    // Generate embedding for the query
    const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/text-embedding-004",
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      console.warn('Failed to generate embedding for knowledge search');
      return '';
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data?.[0]?.embedding;

    if (!queryEmbedding) {
      return '';
    }

    // Search for similar chunks
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: chunks, error } = await supabase.rpc('search_amt_knowledge', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: 0.65,
      match_count: 4,
    });

    if (error || !chunks || chunks.length === 0) {
      console.log('No relevant knowledge found');
      return '';
    }

    // Get document titles
    const documentIds = [...new Set(chunks.map((c: any) => c.document_id))];
    const { data: docs } = await supabase
      .from('amt_documents')
      .select('id, title')
      .in('id', documentIds);
    
    const docTitles: Record<string, string> = (docs || []).reduce((acc: Record<string, string>, doc: any) => {
      acc[doc.id] = doc.title;
      return acc;
    }, {});

    // Format knowledge context
    const knowledgeContext = chunks.map((chunk: any) => {
      const source = docTitles[chunk.document_id] || 'AMT Reference';
      return `[From "${source}"]: ${chunk.content}`;
    }).join('\n\n---\n\n');

    console.log(`Found ${chunks.length} relevant knowledge chunks`);
    return knowledgeContext;
  } catch (error) {
    console.error('Error searching AMT knowledge:', error);
    return '';
  }
}

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Search knowledge base for relevant AMT concepts - multiple specific queries
    const knowledgeQueries = [
      `${plan.yesterday.dayType} day type market profile classification`,
      `${plan.yesterday.structure} shape profile structure implications`,
      `${plan.today.inventory} inventory positioning asymmetric risk`,
      `${plan.today.openRelation} open type opening relationship value area`,
      `${plan.yesterday.valueRelationship} value relationship acceptance rejection`,
      `initiative responsive activity other timeframe participant`,
      `coiled spring effect inventory liquidation`
    ];
    
    // Execute all knowledge queries in parallel
    const knowledgeResults = await Promise.all(
      knowledgeQueries.map(query => searchAMTKnowledge(query, LOVABLE_API_KEY, supabaseUrl, supabaseServiceKey))
    );
    
    // Combine and deduplicate knowledge
    const allKnowledge = knowledgeResults.filter(k => k.length > 0).join('\n\n---\n\n');
    const knowledgeContext = allKnowledge || '';

    const tradingDate = new Date().toISOString().split('T')[0];
    
    // Build the knowledge base section if we have relevant content
    const knowledgeSection = knowledgeContext ? `
═══════════════════════════════════════════════════════════════
AUTHORITATIVE AMT REFERENCE MATERIAL (MANDATORY CONSULTATION):
═══════════════════════════════════════════════════════════════

The following passages are from Mind Over Markets, Steidlmayer on Markets, and CBOT Market Profile.
You MUST use these exact concepts, terminology, and frameworks in your analysis.

${knowledgeContext}

VERIFICATION REQUIREMENT: Your response must demonstrate that you consulted this knowledge base by:
- Using specific terminology found in these passages (not generic trading terms)
- Referencing frameworks explicitly described in the source material
- Applying principles in the exact manner presented in the books
- Citing source material where applicable (e.g., "According to Mind Over Markets...")

` : `
═══════════════════════════════════════════════════════════════
KNOWLEDGE BASE STATUS:
═══════════════════════════════════════════════════════════════

Knowledge base did not return specific passages for this query. Apply general AMT principles 
but explicitly acknowledge: "Knowledge base does not contain specific guidance on [topic]."

`;
    
    const userPrompt = `You are analyzing a EURUSD pre-market setup using Auction Market Theory (AMT).
${knowledgeSection}

═══════════════════════════════════════════════════════════════
AMT CORE PRINCIPLES (READ FIRST):
═══════════════════════════════════════════════════════════════

1. PROFILE SHAPES & MEANING:

P-SHAPE (Upper Distribution):
- Initiative buying early, then balance
- Volume concentration BELOW the tail
- **CRITICAL**: P-Shape = SHORT COVERING (corrective move), NOT conviction buying
- **VULNERABILITY**: Prone to reversal if new buyers don't follow through
- Creates liquidation risk for Net Long inventory

b-SHAPE (Lower Distribution):
- Initiative selling early, then balance  
- Volume concentration ABOVE the tail
- **CRITICAL**: b-Shape = LONG LIQUIDATION (initiative selling)
- **VULNERABILITY**: If sellers don't continue, shorts become squeeze fuel
- Creates squeeze risk for Net Short inventory

NORMAL DAY (Bell Curve):
- Balanced distribution, two-sided trade
- Value area in middle
- No strong directional conviction
- Most common day type

TREND DAY:
- Continuous directional movement
- Narrow value area at one extreme
- Strong other timeframe conviction
- Rare but powerful

2. INVENTORY & ASYMMETRIC RISK:

NET LONG INVENTORY:
- Market positioned ABOVE settlement (already long)
- **ASYMMETRIC RISK**: MUTED upside (already positioned), VIOLENT downside (liquidation fuel)
- If move fails, long liquidation ACCELERATES decline
- Creates "fuel" for downside moves

NET SHORT INVENTORY:
- Market positioned BELOW settlement (already short)
- **ASYMMETRIC RISK**: MUTED downside (already positioned), VIOLENT upside (short squeeze fuel)
- If move fails, short covering ACCELERATES rally
- Creates "fuel" for upside moves

**KEY INSIGHT**: Positioned inventory creates FUEL for moves in the OPPOSITE direction.

3. OPEN RELATIONS:

OIV (Open Inside Value):
- Opened within yesterday's value area
- NEUTRAL starting point, testing ground
- Two-sided potential
- No immediate directional bias

OAV (Open Above Value):
- Opened above yesterday's VAH
- Bullish continuation ATTEMPT
- Requires IMMEDIATE follow-through
- Failure = gap fill back to value

OBV (Open Below Value):
- Opened below yesterday's VAL
- Bearish continuation ATTEMPT
- Requires IMMEDIATE follow-through
- Failure = gap fill back to value

GAP (Open Outside Range):
- Opened outside yesterday's entire range
- Strong directional bias
- Often driven by news
- High gap-fill probability if conviction lacks

4. VALUE RELATIONSHIP:

HIGHER VALUE:
- Today's value moved higher than yesterday
- Bullish structural development
- Buyers accepting higher prices

LOWER VALUE:
- Today's value moved lower than yesterday
- Bearish structural development
- Sellers accepting lower prices

INSIDE/UNCHANGED VALUE:
- Today's value overlaps yesterday
- Balanced, consolidation phase
- Awaiting catalyst

5. STRUCTURAL LOGIC:

ALIGNMENT (What points same direction):
- Value Relationship + Open Relation = directional bias
- Example: Higher Value + OAV = bullish alignment

CONFLICT (What creates vulnerability):
- Inventory + Structure = risk opposite to alignment
- Example: Net Long + P-Shape = liquidation vulnerability

**CRITICAL FRAMEWORK**:
When analyzing, SEPARATE what aligns from what conflicts:
- "Primary alignment: Higher Value + OAV = bullish"
- "Primary conflict: Net Long + P-Shape = liquidation risk if fails"

6. COILED SPRING EFFECT:

SETUP:
- Tight overnight range (compressed)
- + Positioned inventory (Net Long or Net Short)
- = EXPLOSIVE POTENTIAL

MECHANISM:
- Compressed range masks underlying tension
- Small catalyst triggers VIOLENT move
- Inventory liquidation ACCELERATES the move
- "Speed and violence" characterize breakout

EXAMPLE:
- 30-pip overnight range + Net Short inventory
- Break ONH → violent short squeeze
- Break ONL → violent continuation lower

7. INITIATIVE vs. RESPONSIVE ACTIVITY:

INITIATIVE:
- Other timeframe entering aggressively
- DRIVES price discovery (range extension)
- Creates directional conviction
- Example: Breaking out of value with volume

RESPONSIVE:
- Reacting to price extremes
- FADING moves back toward value
- Provides liquidity at extremes
- Example: Buying at VAL, selling at VAH

**KEY**: Initiative MOVES markets; responsive STABILIZES them.

8. REFERENCE LEVELS:

VAH (Value Area High): Top 70% of volume, key resistance/support
VAL (Value Area Low): Bottom 70% of volume, key support/resistance
VPOC (Volume Point of Control): Highest volume price, fair value magnet
ONH (Overnight High): Overnight session high, breakout level
ONL (Overnight Low): Overnight session low, breakdown level

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
ANALYSIS REQUIREMENTS:
═══════════════════════════════════════════════════════════════

### 1. Market Context

Analyze the structural imbalance, positional overextension, and auction stage.

Write 2-3 detailed paragraphs covering:
- Auction stage (Discovery/Acceptance/Rejection)
- Positional overextension (is inventory positioned for the move?)
- Structural imbalance (what creates tension?)

### 2. Structural Observations

Identify inventory traps, P-shape/b-shape vulnerabilities, convergence vs. divergence.

Write 2-3 detailed paragraphs covering:
- P-Shape/b-Shape implications (remember: P=short covering, b=long liquidation)
- Inventory vulnerability (asymmetric risk)
- Convergence (what aligns?) vs. Divergence (what conflicts?)

### 3. Key Structural Scenarios

Provide exactly 3 scenarios with CONTEXT-SPECIFIC NAMES.

**Scenario 1: [Context-Specific Name]**
Type of Move: [e.g., "Trend type 1TF up", "Fast 1TF down", "2TF ranging"]
In Play: [Specific trigger with price, e.g., "Acceptance above ONH 1.04524"]
LIS: [Invalidation level with price, e.g., "Yesterday VAH 1.04428"]
Behavior: [2-3 sentences: what happens if this plays out, who gets trapped, why]

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

**NAMING RULES**:
- Bullish setups: "Bullish Continuation", "Long Liquidation" (if Net Long fails), "Rotational Acceptance"
- Bearish setups: "Bearish Continuation", "Short Squeeze Rally" (if Net Short fails), "Value Rejection"
- Use "Inventory Liquidation" when positioned inventory at risk
- Use "Short Squeeze" or "Long Squeeze" when appropriate
- NEVER use generic names that don't match context

### 4. Inventory Risk Analysis

Explain how inventory interacts with structure and open relation.

Write 2-3 detailed paragraphs covering:
- Asymmetric risk profile (muted vs. violent directions)
- Resolution mechanism (what needs to happen?)
- Time factor (how long can imbalance persist?)

### 5. Coherence Rating

Rate as ALIGNED, CONFLICTED, or NEUTRAL.

**LOGIC**:

ALIGNED:
- Value + Open point same direction AND Inventory + Structure support it
- Example: Higher Value + OAV + Net Long + P-Shape = all bullish

CONFLICTED:
- Value/Open point one way BUT Inventory/Structure create vulnerability
- Example: Higher Value + OAV (bullish) BUT Net Long + P-Shape (liquidation risk)
- **MUST SEPARATE**: "Primary alignment: [X]. Primary conflict: [Y]."

NEUTRAL:
- No clear bias, balanced, awaiting catalyst

**FORMAT**:
Rating: [ALIGNED/CONFLICTED/NEUTRAL]
Explanation: [2-3 sentences. If CONFLICTED, clearly state what aligns vs. what conflicts]

### 6. Primary Structural Risk

Identify the single greatest threat with specific mechanism.

Write 2-3 detailed sentences covering:
- Name the risk (e.g., "Inventory-Driven Reversal", "Coiled Spring Explosion")
- Explain mechanism (trigger → cascade → outcome)
- Emphasize "speed and violence" if applicable

### 7. Structural Checklist

Answer these 5 questions with SPECIFIC, ACTIONABLE answers (2-3 sentences each):

Q1: What is the primary structural conflict or alignment in this setup?
A: [Separate alignment from conflict. Example: "Primary alignment: Higher Value + OAV = bullish. Primary conflict: Net Long + P-Shape = liquidation vulnerability if ONH fails. Requires immediate follow-through."]

Q2: What are the critical structural pivots and what do they represent?
A: [List 3-4 levels with prices and meanings. Example: "ONH 1.04524 = breakout confirmation. VAH 1.04428 = value test. VPOC 1.04285 = fair value. VAL 1.04153 = structural support. Key test is ONH."]

Q3: What does the inventory position tell us about potential price action?
A: [Explain asymmetric risk. Example: "Net Long inventory creates asymmetric risk: muted upside (already positioned), violent downside (liquidation fuel). If ONH fails, liquidation accelerates decline."]

Q4: How does yesterday's structure influence today's auction?
A: [Connect structure to today. Example: "Yesterday's P-Shape Normal Day with Higher Value = short covering move, not conviction buying. Today must prove sustainability. OAV open tests whether new buyers enter."]

Q5: What structural development am I most likely to miss?
A: [Identify blind spot. Example: "Tight overnight range (26 pips) + Net Long inventory = coiled spring. Easy to miss speed and violence of potential liquidation if ONH fails. Explosive move likely."]

═══════════════════════════════════════════════════════════════
TONE & STYLE (MANDATORY):
═══════════════════════════════════════════════════════════════
- Institutional, precise, nuanced (like hedge fund morning brief)
- Use AMT terminology from the uploaded PDFs - NOT generic trading terms
- Reference specific books: "According to Mind Over Markets...", "Steidlmayer describes this as..."
- Identify asymmetric risk explicitly using source material frameworks
- Use metaphors from the PDFs: "coiled spring", "fuel for reversal", "trapped inventory", "other-timeframe participants"
- Be specific with prices and mechanisms
- Write in complete, detailed paragraphs
- Emphasize "speed and violence" for liquidation scenarios as described in the source material

EXAMPLES OF KNOWLEDGE-BASE-INFORMED ANALYSIS:

✅ "The Net Short inventory creates an asymmetric risk profile as described in Mind Over Markets. Per Steidlmayer's framework, this positioning represents other-timeframe participants who are positioned for downside, creating liquidation fuel in the opposite direction. If responsive activity (local buying) emerges and price achieves acceptance above VAL (time + volume), the inventory becomes vulnerable to a violent liquidation move higher - what the source material describes as the 'coiled spring' effect when positioned inventory meets structural rejection."

✅ "Yesterday's P-Shape structure indicates short covering activity, not conviction buying - a critical distinction emphasized in CBOT Market Profile. The profile shows volume concentration below the tail, meaning initiative buying created the extension but balance followed. This creates vulnerability: the positioned longs lack structural conviction and become liquidation fuel if today's auction fails to attract new buyers above ONH."

❌ AVOID GENERIC ANALYSIS LIKE: "The Net Short inventory suggests bearish pressure. If price breaks below support, we could see further downside." (This is generic, not using knowledge base terminology)

═══════════════════════════════════════════════════════════════
KNOWLEDGE BASE VERIFICATION CHECKLIST (COMPLETE BEFORE RESPONDING):
═══════════════════════════════════════════════════════════════

Before submitting your response, verify you have:
- [ ] Used day type terminology from the knowledge base passages
- [ ] Applied value relationship framework from the PDFs
- [ ] Referenced structure analysis (P-Shape/b-Shape) using source material language
- [ ] Used inventory positioning principles exactly as described in the books
- [ ] Applied open type framework from the uploaded references
- [ ] Employed exact AMT terminology from the PDFs (not generic terms)
- [ ] Applied the acceptance/rejection framework from the source material
- [ ] Referenced initiative vs. responsive activity definitions from the books
- [ ] Used the asymmetric risk framework from the PDFs
- [ ] Applied the coiled spring concept as described in the source material

If you cannot check all boxes, return to the knowledge base passages above and extract the missing concepts before generating your response.

Now provide your complete analysis following this framework, demonstrating clear consultation of the knowledge base passages provided above.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 8192,
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
