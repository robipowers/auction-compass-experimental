import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert institutional trader and Market Profile analyst with deep knowledge of Auction Market Theory (AMT). You analyze market structure with the precision of a hedge fund strategist.

When relevant passages from AMT reference books are provided, incorporate their insights and terminology into your analysis. Reference specific concepts, examples, and principles from these authoritative sources to strengthen your analysis.`;

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

    // Search knowledge base for relevant AMT concepts
    const knowledgeQuery = `${plan.yesterday.dayType} ${plan.yesterday.structure} ${plan.today.inventory} ${plan.today.openRelation} auction market theory profile structure value area`;
    const knowledgeContext = await searchAMTKnowledge(knowledgeQuery, LOVABLE_API_KEY, supabaseUrl, supabaseServiceKey);

    // Build the knowledge base section if we have relevant content
    const knowledgeSection = knowledgeContext ? `
═══════════════════════════════════════════════════════════════
RELEVANT PASSAGES FROM AMT REFERENCE BOOKS:
═══════════════════════════════════════════════════════════════

${knowledgeContext}

Use these authoritative AMT principles and examples to inform your analysis. Reference specific concepts from these books when applicable.

` : '';
    
    const userPrompt = `You are the **AMT CRITIQUE ENGINE** - an institutional-grade analysis system for auction market structure.

Your task is to analyze the following trading plan and provide a comprehensive structural critique.
${knowledgeSection}

## INPUT DATA

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

You MUST structure your response EXACTLY as follows:

### 1. Header

AI Strategist
AMT CRITIQUE ENGINE
Institutional-grade analysis of your auction plan

### 2. COHERENCE RATING: [ALIGNED | CONFLICTED]

**[ALIGNED or CONFLICTED]**

**Explanation:** [2-3 sentences explaining the primary alignment and primary conflict between inventory, structure, value relationship, and open relation]

---

### 3. 📊 HYPOTHESES

Present exactly 3 scenarios in this table format:

| Scenario | Type of Move | In Play | LIS |
|----------|--------------|---------|-----|
| 1. [Name] | [Type] | [Trigger] | [Line in Sand] |
| 2. [Name] | [Type] | [Trigger] | [Line in Sand] |
| 3. [Name] | [Type] | [Trigger] | [Line in Sand] |

**CRITICAL:** After the table, add a "Suggested Strategy" section with detailed behavior for each scenario:

**Scenario 1: [Name]**
**Type of Move:** [Type]
**In Play:** [Trigger]
**LIS:** [Line in Sand]
**Behavior:** [2-3 sentences explaining what happens if this scenario plays out, including specific price action and participant behavior]

**Scenario 2: [Name]**
**Type of Move:** [Type]
**In Play:** [Trigger]
**LIS:** [Line in Sand]
**Behavior:** [2-3 sentences explaining what happens if this scenario plays out]

**Scenario 3: [Name]**
**Type of Move:** [Type]
**In Play:** [Trigger]
**LIS:** [Line in Sand]
**Behavior:** [2-3 sentences explaining what happens if this scenario plays out]

---

### 4. 📋 DAILY TRADING CHECKLIST

Answer these 5 critical questions with detailed, specific responses:

**Q1: What is the primary structural conflict or alignment in this setup?**
**A:** [Detailed answer with specific reference to inventory, value relationship, open relation, and structure]

**Q2: What are the critical structural pivots and what do they represent?**
**A:** [List each level (ONH, ONL, VAH, VAL, VPOC) with specific prices and explain what each represents structurally. Calculate and mention specific pip ranges where relevant (e.g., "8.7-pip zone between VAL and ONL")]

**Q3: What does the inventory position tell us about potential price action?**
**A:** [Explain inventory implications, asymmetric risk, and liquidation fuel potential]

**Q4: How does yesterday's structure influence today's auction?**
**A:** [Connect yesterday's day type, value relationship, and structure to today's setup with specific cause-and-effect relationships]

**Q5: What structural development am I most likely to miss?**
**A:** [Identify the blind spot or hidden risk with specific levels and measurements. Use phrases like "tight proximity", "structural decision point is imminent", "coiled spring effect"]

---

### 5. PRIMARY RISK

**The single greatest structural threat is [Risk Name] if [specific condition]. [2-3 sentences explaining the mechanism and potential outcome with specific levels]**

---

### 6. Market Context

**The market is currently in a state of [Auction Stage].**

**Yesterday's Auction Stage:** [Detailed explanation of yesterday's structure and what it signifies]

**Current Structural Imbalance:** [Explain the current imbalance created by today's inventory and open relation]

**Auction Stage:** [Explain the current phase and what typically happens next]

---

### 7. Critique: Contradictions & Structural Observations

**Inventory Vulnerability:** [Detailed explanation of how inventory creates vulnerability]

**Convergence/Divergence:** [Analyze alignment vs. conflict between different structural elements]

**Yesterday's Influence:** [Explain how yesterday's structure sets up today's auction]

---

### 8. Missing Risk Factors

**The [inventory type] Inventory interacts with the [open relation] open following a [day type] day, creating an asymmetric risk profile skewed toward the [direction].**

**Risk:** [Detailed explanation of the primary risk with specific mechanism]

**Resolution:**
- **Bearish Resolution:** [What needs to happen for bearish outcome with specific levels]
- **Bullish Resolution:** [What needs to happen for bullish outcome with specific levels]

---

## ANALYSIS PRINCIPLES

### AMT Core Concepts (from the knowledge base)

1. **Initiative vs. Responsive Activity**
   - Initiative = conviction moves by other-timeframe participants (directional, high volume)
   - Responsive = defensive moves by locals/positioned traders (counter-trend, lower volume)
   - Initiative activity creates trends; responsive activity creates rotation

2. **Inventory & Positional Risk**
   - Net Long inventory = positioned for upside, creates downside fuel (liquidation)
   - Net Short inventory = positioned for downside, creates upside fuel (short covering)
   - Asymmetric risk: muted in the positioned direction, violent in the opposite direction

3. **P-Shape vs. b-Shape**
   - P-Shape = short covering (corrective move, not bullish strength)
   - b-Shape = long liquidation (initiative selling, bearish conviction)
   - Both create vulnerability for continuation in the same direction

4. **Acceptance vs. Rejection**
   - Acceptance = time + volume at a level (structural shift)
   - Rejection = wicks, quick reversals (level holds)
   - Initial probe ≠ acceptance

5. **Coiled Spring Effect**
   - Tight range + positioned inventory = explosive potential
   - Small catalyst triggers violent move
   - "Speed and violence" in the resolution

6. **Open Types**
   - OIV (Open Inside Value) = neutral, testing ground, two-sided
   - OAV (Open Above Value) = bullish bias, but vulnerable if fails
   - OBV (Open Below Value) = bearish bias, but vulnerable if fails
   - GAP = strong conviction, look for acceptance or rejection

7. **Value Relationships**
   - Higher Value = bullish trend, look for continuation or exhaustion
   - Lower Value = bearish trend, look for continuation or exhaustion
   - Inside Value = balance, look for breakout or continued rotation
   - Overlapping Value = transition, direction unclear

### Scenario Naming Guidelines

- Use context-specific names, not generic ones
- Examples:
  * "Inventory Liquidation" (not "Bearish Continuation")
  * "Short Squeeze Rally" (not "Bullish Reversal")
  * "Trap Higher" (not "False Breakout")
  * "Value Rejection" (not "Support Hold")

### Language & Tone

- Use institutional language: "coiled spring", "liquidation fuel", "speed and violence", "trap higher/lower"
- Be specific with measurements: "8.7-pip zone", "26-pip overnight range"
- Use active voice: "The market needs..." not "It would be needed..."
- Be precise: "structural decision point is imminent" not "something might happen soon"

### Common Mistakes to Avoid

1. ❌ Don't say "Net Long conflicts with OAV" - they align (both bullish)
2. ❌ Don't confuse P-Shape with bullish strength - it's short covering (corrective)
3. ❌ Don't ignore coiled spring potential in tight ranges with positioned inventory
4. ❌ Don't forget to calculate and mention specific pip ranges
5. ❌ Don't use generic scenario names - be context-specific
6. ❌ Don't forget the "Behavior" field in scenarios
7. ❌ Don't skip the "Missing Risk Factors" section

---

Now provide your complete analysis following this framework.`;

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
  // Extract coherence from Section 2
  let coherence: "ALIGNED" | "CONFLICTED" | "NEUTRAL" = "NEUTRAL";
  const coherenceSection = content.match(/### 2\. COHERENCE RATING[\s\S]*?(?=---|\n### 3|$)/i);
  if (coherenceSection) {
    if (coherenceSection[0].includes("ALIGNED")) coherence = "ALIGNED";
    else if (coherenceSection[0].includes("CONFLICTED")) coherence = "CONFLICTED";
  }

  // Extract coherence explanation
  let coherenceExplanation = "Analysis of structural coherence between inventory and market context.";
  const explanationMatch = content.match(/\*\*Explanation:\*\*\s*([^\n]+(?:\n(?!\*\*|\n###)[^\n]*)*)/i);
  if (explanationMatch) {
    coherenceExplanation = explanationMatch[1].trim().substring(0, 600);
  }

  // Extract market context (Section 6)
  const contextMatch = content.match(/### 6\. Market Context[\s\S]*?(?=---|\n### 7|$)/i);
  const marketContext = contextMatch
    ? contextMatch[0].replace(/### 6\. Market Context/i, '').replace(/\*\*.*?\*\*/g, '').trim()
    : "Current market conditions require careful level monitoring.";

  // Extract structural observations (Section 7)
  const structuralMatch = content.match(/### 7\. Critique: Contradictions & Structural Observations[\s\S]*?(?=---|\n### 8|$)/i);
  const structuralObservations = structuralMatch
    ? structuralMatch[0].replace(/### 7\. Critique: Contradictions & Structural Observations/i, '').replace(/\*\*.*?\*\*/g, '').trim()
    : "Structural analysis pending.";

  // Extract scenarios from Section 3 - new format with Suggested Strategy
  const scenarios = [];
  const scenarioRegex = /\*\*Scenario \d+:\s*([^*]+)\*\*[\s\S]*?\*\*Type of Move:\*\*\s*([^\n]+)[\s\S]*?\*\*In Play:\*\*\s*([^\n]+)[\s\S]*?\*\*LIS:\*\*\s*([^\n]+)[\s\S]*?\*\*Behavior:\*\*\s*([^\n]+(?:\n(?!\*\*Scenario|\n###)[^\n*]*)*)/gi;
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

  // Extract primary risk (Section 5)
  const riskMatch = content.match(/### 5\. PRIMARY RISK[\s\S]*?(?=---|\n### 6|$)/i);
  const primaryRisk = riskMatch
    ? riskMatch[0].replace(/### 5\. PRIMARY RISK/i, '').replace(/\*\*.*?\*\*/g, '').trim().substring(0, 500)
    : "Monitor for failed breakouts that could reverse quickly with speed and violence.";

  // Extract structural checklist Q&A (Section 4)
  const checklistItems = [];
  const checklistSection = content.match(/### 4\. 📋 DAILY TRADING CHECKLIST[\s\S]*?(?=---|\n### 5|$)/i);
  
  if (checklistSection) {
    const qaRegex = /\*\*Q(\d):\s*([^*]+)\*\*\s*\n\*\*A:\*\*\s*([^\n]+(?:\n(?!\*\*Q\d:|\n###)[^\n*]*)*)/gi;
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
