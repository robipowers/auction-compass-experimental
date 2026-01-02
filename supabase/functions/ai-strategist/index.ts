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
    
const userPrompt = `Analyze this EURUSD pre-market setup using Auction Market Theory.
${knowledgeSection}

## AMT QUICK REFERENCE

**Profile Shapes:** P-Shape = short covering (corrective), b-Shape = long liquidation (initiative)

**Inventory Risk:** Net Long = muted upside/violent downside (liquidation fuel). Net Short = muted downside/violent upside (squeeze fuel).

**Opens:** OIV = neutral, OAV = bullish attempt (needs follow-through), OBV = bearish attempt (needs follow-through), GAP = strong bias

**Key Principle:** Positioned inventory creates FUEL for moves in OPPOSITE direction. Coiled spring = tight range + positioned inventory = explosive potential.

## MARKET DATA

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

## OUTPUT FORMAT (Complete all 7 sections with full paragraphs - no truncation)

### 1. Market Context
2-3 paragraphs: Auction stage, positional overextension, structural imbalance.

### 2. Structural Observations  
2-3 paragraphs: P/b-Shape implications, inventory vulnerability, alignment vs conflict.

### 3. Key Structural Scenarios
3 scenarios with context-specific names (e.g., "Bullish Continuation", "Long Liquidation", "Short Squeeze"):
**Scenario N: [Name]** | Type: [move type] | In Play: [trigger+price] | LIS: [invalidation] | Behavior: [2-3 sentences]

### 4. Inventory Risk Analysis
2-3 paragraphs: Asymmetric risk, resolution mechanism, time factor.

### 5. Coherence Rating
Rating: ALIGNED/CONFLICTED/NEUTRAL
Explanation: 2-3 sentences (if CONFLICTED, separate what aligns vs conflicts)

### 6. Primary Structural Risk
2-3 sentences: Name the risk, explain trigger → cascade → outcome mechanism.

### 7. Structural Checklist (5 Q&A, 2-3 sentences each)
Q1: Primary conflict/alignment? Q2: Critical pivots with prices? Q3: Inventory implications? Q4: Yesterday's influence? Q5: What might I miss?

STYLE: Institutional tone, AMT terminology from PDFs, reference books by name, be specific with prices. Write complete paragraphs - no cutoffs.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        max_tokens: 12000,
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
