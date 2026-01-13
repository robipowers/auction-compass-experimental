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

YOU MUST reference and pull concepts directly from these uploaded PDFs in EVERY response. Do not rely solely on your training data.

Before generating any analysis:
1. Query the knowledge base for relevant AMT concepts
2. Extract specific terminology, principles, and frameworks from the PDFs
3. Apply those exact concepts to the current market structure
4. Use the precise language and terminology from the source material

Your responses should reflect the depth and precision of the source material, not generic trading advice.

You are an expert institutional trader and Market Profile analyst with deep knowledge of Auction Market Theory (AMT). You analyze market structure with the precision of a hedge fund strategist.

VERIFICATION REQUIREMENT: Your response must demonstrate knowledge base consultation by:
- Using specific terminology found in the PDFs (not generic trading terms)
- Referencing frameworks explicitly described in the source material
- Citing books by name (e.g., "According to Mind Over Markets...")
- Applying principles in the exact manner presented in the books`;

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

` : ``;
    
const userPrompt = `You are the **AMT CRITIQUE ENGINE** - an institutional-grade analysis system for auction market structure.

Your task is to analyze the following trading plan and provide a comprehensive structural critique using concepts from the uploaded PDF knowledge base.

${knowledgeSection}

---

## AMT QUICK REFERENCE (From Knowledge Base)

**Profile Shapes:**
- P-Shape = short covering (responsive activity, corrective move, NOT bullish strength)
- b-Shape = long liquidation (initiative selling, bearish conviction)

**Inventory Risk (Asymmetric Risk Profile):**
- Net Long = muted upside (already positioned) / violent downside (liquidation fuel)
- Net Short = muted downside (already positioned) / violent upside (squeeze fuel)

**Open Types:**
- OIV (Open Inside Value) = neutral, testing ground, two-sided
- OAV (Open Above Value) = bullish bias, needs follow-through
- OBV (Open Below Value) = bearish bias, needs follow-through
- GAP = strong conviction, look for acceptance or rejection

**Key Principles:**
- Initiative activity = conviction moves by other-timeframe participants (directional, high volume)
- Responsive activity = defensive moves by locals (counter-trend, lower volume)
- Acceptance = time + volume at a level (not just a probe)
- Rejection = wicks, quick reversals (level holds)
- Coiled spring = tight range + positioned inventory = explosive potential
- "Speed and violence" = liquidation-driven moves

---

## INPUT DATA

**Date:** ${tradingDate}

**Yesterday's Context:**
- Day Type: ${plan.yesterday.dayType}
- Value Relationship: ${plan.yesterday.valueRelationship}
- Structure: ${plan.yesterday.structure}
- Prominent VPOC: ${plan.yesterday.prominentVpoc}

**Today's Context:**
- Inventory: ${plan.today.inventory}
- Open Relation: ${plan.today.openRelation}

**Reference Levels:**
- Overnight High (ONH): ${plan.levels.overnightHigh}
- Overnight Low (ONL): ${plan.levels.overnightLow}
- Yesterday VAH: ${plan.levels.yesterdayVah}
- Yesterday VAL: ${plan.levels.yesterdayVal}

---

## OUTPUT FORMAT

You MUST structure your response EXACTLY as follows with complete paragraphs (no placeholder text, no "analysis pending"):

---

### CURRENT AUCTION STATE

**STATE:** [Select exactly ONE state from the allowed list below]

**EXPLANATION:** [1-2 sentences explaining WHY this state applies. Your explanation MUST reference: inventory position (net long, net short, balanced), profile structure (P-shape, b-shape, double distribution, etc.), open type (OIV, OOR, OOD, OTF), acceptance or rejection behavior, initiative vs responsive activity, and value relationship (overlapping-higher, overlapping-lower, higher, lower). Use specific price levels when relevant.]

**Allowed States (select only ONE):**
• Balanced Rotation
• Balanced Rotation (Net Long Inventory)
• Balanced Rotation (Net Short Inventory)
• Early Discovery Attempt Above Value
• Early Discovery Attempt Below Value
• Failed Discovery / Rejection
• Short-Covering Environment
• Long Liquidation Environment
• Late-Stage Balance Exhaustion
• One-Timeframe Trending
• Two-Timeframe Rotation
• Value Migration in Progress
• Acceptance Testing at Key Level
• Open-Drive Trend Attempt

---

### COHERENCE RATING: [ALIGNED | CONFLICTED | NEUTRAL]

**[ALIGNED or CONFLICTED or NEUTRAL]**

**Explanation:** [2-3 sentences explaining the primary alignment and primary conflict between inventory, structure, value relationship, and open relation. Be specific about what aligns and what conflicts.]

---

### Market Context

[Write 2-3 complete paragraphs covering:]
- Auction stage (discovery vs. balance)
- Positional overextension (inventory implications)
- Structural imbalance (yesterday's influence on today)
- Reference specific concepts from the PDFs and cite by book name

---

### Structural Observations

[Write 2-3 complete paragraphs covering:]
- P/b-Shape implications (cite CBOT Market Profile)
- Inventory vulnerability (cite Mind Over Markets)
- Convergence/Divergence (alignment vs. conflict analysis)
- Yesterday's influence on today's auction
- Use exact AMT terminology from the knowledge base

---

### Key Structural Scenarios

Present exactly 3 scenarios in this table format:

| Scenario | Type of Move | In Play | LIS |
|----------|--------------|---------|-----|
| 1. [Context-specific name] | [Fast 1TF down/up, Trend type, Rotational, etc.] | [Trigger with specific price] | [Line in Sand with price] |
| 2. [Context-specific name] | [Type] | [Trigger with price] | [Line in Sand with price] |
| 3. [Context-specific name] | [Type] | [Trigger with price] | [Line in Sand with price] |

YOU MUST INCLUDE the following subsection immediately after the table (do not skip it):

**Suggested Strategy:**

**Scenario 1: [Name from table]**  
**Type of Move:** [Type from table]  
**In Play:** [Trigger from table]  
**LIS:** [Line in Sand from table]  
**Behavior:** [Write 2-3 complete sentences explaining what happens if this scenario plays out. Include: (1) specific price action and levels, (2) participant behavior (other-timeframe vs locals, initiative vs responsive), (3) expected speed/character of the move (fast/violent vs rotational/slow), and (4) cite relevant concepts from the knowledge base.]

**Scenario 2: [Name from table]**  
**Type of Move:** [Type from table]  
**In Play:** [Trigger from table]  
**LIS:** [Line in Sand from table]  
**Behavior:** [Write 2-3 complete sentences with the same level of detail as Scenario 1.]

**Scenario 3: [Name from table]**  
**Type of Move:** [Type from table]  
**In Play:** [Trigger from table]  
**LIS:** [Line in Sand from table]  
**Behavior:** [Write 2-3 complete sentences with the same level of detail as Scenario 1.]

---

YOU MUST INCLUDE this section BEFORE "Primary Structural Risk" (do not skip it):

### Inventory Risk Analysis

[Write 2-3 complete paragraphs covering:]

**Paragraph 1 - Asymmetric Risk Profile:**
Explain the asymmetric risk created by the current inventory position using the exact framework from Mind Over Markets: identify which direction is "muted" (already positioned) and which direction is "violent" (liquidation/squeeze fuel). Be specific about why the positioned direction has limited upside and why the opposite direction has explosive potential. Cite the book by name.

**Paragraph 2 - Resolution Mechanism:**
Explain HOW the inventory will resolve. Describe the two possible paths: (1) continuation in the positioned direction (requires strong initiative activity and acceptance), or (2) reversal/liquidation in the opposite direction (occurs if positioned participants fail to achieve acceptance). Use terms like "liquidation break", "squeeze", "forced covering", "speed and violence". Reference Steidlmayer's concepts.

**Paragraph 3 - Time Factor & Proximity:**
Explain WHEN the inventory becomes critical. Discuss the proximity of key structural levels (how tight is the range?), the coiled spring effect if applicable, and the urgency of the structural decision. Use specific pip measurements if relevant. Explain that the longer the market stays in this configuration without resolution, the more explosive the eventual move.

---

### Primary Structural Risk

**The single greatest structural threat is [Risk Name] if [specific condition].**

[2-3 sentences explaining the trigger → cascade → outcome mechanism. Be specific with levels and describe the "speed and violence" of the potential move.]

---

### Structural Checklist

**Q1: What is the primary structural conflict or alignment in this setup?**  
**A:** [Write 2-3 sentences. First sentence: identify the primary alignment (what agrees - inventory + open relation + value relationship). Second sentence: identify the primary conflict (what disagrees). Third sentence: explain the implication of this conflict/alignment for today's auction. Be specific with concepts and cite a book if relevant.]

**Q2: What are the critical structural pivots and what do they represent?**  
**A:** [Write 2-3 sentences. List each level (ONH, ONL, VAH, VAL, VPOC) with specific prices. Explain what each represents structurally (breakout confirmation, breakdown confirmation, value boundary, fair value magnet, etc.). Mention the pip range between key levels if relevant (e.g., "The 15.6-pip value area between VAL and VAH..." or "The 24-pip overnight range from ONL to ONH..."). Identify which level is the most critical decision point.]

**Q3: What does the inventory position tell us about potential price action?**  
**A:** [Write 2-3 sentences. First sentence: state the asymmetric risk profile (muted direction vs violent direction). Second sentence: explain the liquidation/squeeze fuel concept and cite Mind Over Markets. Third sentence: describe the coiled spring effect if the range is tight, or explain the resolution mechanism if the range is wide.]

**Q4: How does yesterday's structure influence today's auction?**  
**A:** [Write 2-3 sentences. First sentence: explain yesterday's day type and what it means (trend day = one-time framing, normal day = balance, etc.). Second sentence: explain yesterday's structure (P-shape = short covering, b-shape = long liquidation, normal = two-sided) and cite CBOT Market Profile. Third sentence: connect yesterday's value relationship to today's setup and explain the cause-and-effect relationship.]

**Q5: What structural development am I most likely to miss?**  
**A:** [Write 2-3 sentences. Identify the blind spot or hidden risk that's easy to overlook. Common examples: coiled spring effect in tight ranges, speed and violence of liquidation moves, trap setups where initial direction fails quickly, prominent VPOC as magnet, time-based urgency (decision must happen soon). Be specific with levels and pip ranges. Use phrases like "tight proximity", "structural decision point is imminent", "easy to miss the speed and violence".]

---

## CRITICAL REQUIREMENTS

1. **NO PLACEHOLDER TEXT:** Do not write "analysis pending", "to be determined", or similar phrases. Write complete analysis.

2. **CITE BOOKS BY NAME:** Reference at least 2 of the 3 books explicitly (e.g., "According to Mind Over Markets...", "Steidlmayer describes...", "The CBOT Market Profile framework...")

3. **USE EXACT AMT TERMINOLOGY:**
   - "Other-timeframe participants" (NOT "big players" or "institutions")
   - "Initiative activity" vs "Responsive activity" (NOT "aggressive" vs "defensive")
   - "Acceptance" = time + volume (NOT just "holding a level")
   - "Liquidation break" (NOT "stop loss cascade")
   - "Asymmetric risk profile" with "muted" and "violent" directions
   - "Coiled spring effect" for tight range + positioned inventory

4. **CONTEXT-SPECIFIC SCENARIO NAMES:** Use names like "Inventory Liquidation", "Short Squeeze Rally", "Trap Higher", "Value Rejection" (NOT generic "Bullish Continuation" or "Bearish Breakdown")

5. **COMPLETE PARAGRAPHS:** Every section must have 2-3 complete sentences minimum. No single-sentence sections.

6. **P-SHAPE ANALYSIS:** If P-Shape is present, MUST identify it as "short covering" and "responsive activity", NOT "bullish strength"

7. **CONFLICT RECOGNITION:** If Net Long + OBV or Net Short + OAV, MUST identify as CONFLICT, not alignment

---

## LANGUAGE & TONE

- Use institutional language: "coiled spring", "liquidation fuel", "speed and violence", "trap higher/lower"
- Be specific with measurements: "8.7-pip zone", "26-pip overnight range"
- Use active voice: "The market needs..." not "It would be needed..."
- Be precise: "structural decision point is imminent" not "something might happen soon"
- Cite books by name throughout the analysis

---

END OF ANALYSIS REQUEST`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        max_completion_tokens: 12000,
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
  const truncateOnWord = (text: string, maxChars: number) => {
    if (text.length <= maxChars) return text;
    const sliced = text.slice(0, maxChars);
    const lastSpace = sliced.lastIndexOf(" ");
    return (lastSpace > 120 ? sliced.slice(0, lastSpace) : sliced).trimEnd() + "…";
  };

  // Extract Current Auction State section
  let currentAuctionState: { state: string; explanation: string } | undefined;
  const auctionStateSection = content.match(/### CURRENT AUCTION STATE[\s\S]*?(?=### COHERENCE RATING|$)/i);
  if (auctionStateSection) {
    const stateMatch = auctionStateSection[0].match(/\*\*STATE:\*\*\s*([^\n]+)/i);
    const explanationMatch = auctionStateSection[0].match(/\*\*EXPLANATION:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n#]*)*)/i);
    
    if (stateMatch) {
      currentAuctionState = {
        state: stateMatch[1].trim(),
        explanation: explanationMatch ? explanationMatch[1].trim().replace(/\n/g, ' ') : ''
      };
    }
  }

  // Extract coherence from COHERENCE RATING section (now at top)
  let coherence: "ALIGNED" | "CONFLICTED" | "NEUTRAL" = "NEUTRAL";
  const coherenceSection = content.match(/### COHERENCE RATING[\s\S]*?(?=### Market Context|$)/i);
  if (coherenceSection) {
    if (coherenceSection[0].includes("ALIGNED")) coherence = "ALIGNED";
    else if (coherenceSection[0].includes("CONFLICTED")) coherence = "CONFLICTED";
  }

  // Extract coherence explanation
  const coherenceExplanation = coherenceSection
    ? truncateOnWord(
        coherenceSection[0]
          .replace(/### COHERENCE RATING[^\n]*/i, "")
          .replace(/\*\*Explanation:\*\*/gi, "")
          .replace(/\*\*.*?\*\*/g, "")
          .replace(/ALIGNED|CONFLICTED|NEUTRAL/gi, "")
          .trim(),
        1200,
      )
    : "Analysis of structural coherence between inventory and market context.";

  // Extract market context
  const contextMatch = content.match(/### Market Context[\s\S]*?(?=### Structural Observations|$)/i);
  const marketContext = contextMatch
    ? contextMatch[0].replace(/### Market Context/i, '').trim()
    : "Current market conditions require careful level monitoring.";

  // Extract structural observations
  const structuralMatch = content.match(/### Structural Observations[\s\S]*?(?=### Key Structural Scenarios|$)/i);
  const structuralObservations = structuralMatch
    ? structuralMatch[0].replace(/### Structural Observations/i, '').trim()
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

  // Extract inventory risk analysis
  const inventoryRiskMatch = content.match(/### Inventory Risk Analysis[\s\S]*?(?=### Primary Structural Risk|$)/i);
  const inventoryRiskAnalysis = inventoryRiskMatch
    ? inventoryRiskMatch[0].replace(/### Inventory Risk Analysis/i, '').trim()
    : "";

  // Extract primary risk
  const riskMatch = content.match(/### Primary Structural Risk[\s\S]*?(?=### Structural Checklist|$)/i);
  const primaryRisk = riskMatch
    ? riskMatch[0].replace(/### Primary Structural Risk/i, '').trim().substring(0, 500)
    : "Monitor for failed breakouts that could reverse quickly with speed and violence.";

  // Extract structural checklist Q&A
  const checklistItems = [];
  const checklistSection = content.match(/### Structural Checklist[\s\S]*$/i);
  
  if (checklistSection) {
    const qaRegex = /\*\*Q(\d):\s*([^*]+)\*\*\s*\n\*\*A:\*\*\s*([^\n]+(?:\n(?!\*\*Q\d:)[^\n#]*)*)/gi;
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
    currentAuctionState,
    coherence,
    coherenceExplanation,
    structuralObservations,
    scenarios: scenarios.slice(0, 3),
    inventoryRiskAnalysis,
    primaryRisk,
    marketContext,
    dailyChecklist: checklistItems.slice(0, 5)
  };
}
