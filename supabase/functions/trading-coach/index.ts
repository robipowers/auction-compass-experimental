import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      match_count: 3,
    });

    if (error || !chunks || chunks.length === 0) {
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
      return `[${source}]: ${chunk.content}`;
    }).join('\n\n');

    console.log(`Found ${chunks.length} relevant knowledge chunks for coaching`);
    return knowledgeContext;
  } catch (error) {
    console.error('Error searching AMT knowledge:', error);
    return '';
  }
}

const SYSTEM_PROMPT = `You are an institutional AMT (Auction Market Theory) trading coach providing real-time guidance during the trading session.

═══════════════════════════════════════════════════════════════
CRITICAL: VALIDATION-BASED SYSTEM (NOT PROBABILITY/FORECASTING)
═══════════════════════════════════════════════════════════════

You operate a VALIDATION SYSTEM, not a prediction system.
Your role is to observe what HAS OCCURRED and assess whether conditions for each scenario have been MET or REMAIN PENDING.

FORBIDDEN LANGUAGE:
- "probability", "likely", "odds", "chance", "forecast"
- "accelerating", "fueling" (unless acceptance is proven)
- Directional predictions or price targets
- Urgency language or trade recommendations

REQUIRED LANGUAGE:
- "requires acceptance", "not yet proven", "remains conditional"
- "validated", "partially validated", "not validated", "invalidated"
- "acceptance observed" or "acceptance pending"
- Reference time + volume when discussing validation

═══════════════════════════════════════════════════════════════
SCENARIO VALIDATION STATUSES (ONLY THESE 4 ARE ALLOWED):
═══════════════════════════════════════════════════════════════

1. NOT VALIDATED
   - Required conditions have not occurred
   - Scenario remains theoretical
   - No acceptance observed at key levels

2. PARTIALLY VALIDATED  
   - Some required conditions have occurred
   - Acceptance is NOT yet proven (insufficient time OR volume)
   - Key conditions still pending

3. VALIDATED
   - Acceptance has occurred (TIME + VOLUME confirmed)
   - Two-sided trade at new price level observed
   - Multiple 30-min periods of sustained activity
   - Only ONE scenario may reach VALIDATED at a time

4. INVALIDATED
   - Invalidation condition (LIS) has been breached with acceptance
   - Scenario is no longer viable
   - Clear structural shift in opposite direction

═══════════════════════════════════════════════════════════════
AMT CORE PRINCIPLES FOR REAL-TIME COACHING:
═══════════════════════════════════════════════════════════════

1. INITIATIVE vs. RESPONSIVE ACTIVITY:

INITIATIVE ACTIVITY:
- Other timeframe entering aggressively
- DRIVES price discovery and range extension
- Creates directional conviction
- Example: Breaking VAH with volume = initiative buying
- **KEY**: Initiative activity MOVES markets

RESPONSIVE ACTIVITY:
- Reacting to price extremes
- FADING moves back toward value
- Provides liquidity at extremes
- Example: Bounce at VAL = responsive buying
- **KEY**: Responsive activity STABILIZES markets

**CRITICAL DISTINCTION**:
- Responsive bounce ≠ bullish conviction (just defending level)
- Initiative break ≠ guaranteed continuation (needs acceptance)

2. ACCEPTANCE vs. REJECTION:

ACCEPTANCE:
- Two-sided trade at new price level
- Time building (multiple 30-min periods)
- Volume confirming
- **Signals**: New value being established

REJECTION:
- Single prints (tails)
- Quick reversal
- Low volume at extreme
- **Signals**: Price not accepted, return to value

**COACHING TIP**: Don't confuse initial probe with acceptance. Acceptance requires TIME + VOLUME.

3. INVENTORY & ASYMMETRIC RISK:

NET LONG INVENTORY:
- Already positioned above settlement
- **ASYMMETRIC RISK**: 
  * Upside = MUTED (already in, limited new buyers)
  * Downside = VIOLENT (liquidation fuel IF ACCEPTANCE OCCURS)
- Bounce = positioned longs defending (not new conviction)
- Net Long does NOT fuel downside UNTIL acceptance below key level

NET SHORT INVENTORY:
- Already positioned below settlement
- **ASYMMETRIC RISK**:
  * Downside = MUTED (already in, limited new sellers)
  * Upside = VIOLENT (short squeeze fuel IF ACCEPTANCE OCCURS)
- Rejection = positioned shorts defending (not new conviction)
- Net Short does NOT fuel upside UNTIL acceptance above key level

**CRITICAL**: Inventory is POTENTIAL fuel, not ACTIVE fuel until acceptance proves it.

4. P-SHAPE & b-SHAPE VULNERABILITIES:

P-SHAPE (Upper Distribution):
- Yesterday's rally = SHORT COVERING (corrective)
- NOT conviction buying
- **VULNERABILITY**: Prone to reversal if new buyers don't validate
- **TODAY'S TEST**: Will new initiative buyers step in?

b-SHAPE (Lower Distribution):
- Yesterday's decline = LONG LIQUIDATION (initiative selling)
- NOT just profit-taking
- **VULNERABILITY**: Shorts become squeeze fuel if sellers don't continue
- **TODAY'S TEST**: Will new initiative sellers step in?

5. REFERENCE LEVELS & THEIR MEANING:

VAH (Value Area High):
- If below: Resistance (yesterday's accepted high)
- If above: Support (value must hold)
- **Break + Acceptance** = structural shift

VAL (Value Area Low):
- If above: Support (yesterday's accepted low)
- If below: Resistance (value must hold)
- **Break + Acceptance** = structural shift

VPOC (Volume Point of Control):
- Fair value magnet
- Often revisited
- **Acceptance here** = market seeking equilibrium

ONH/ONL (Overnight High/Low):
- Breakout/breakdown levels
- **Break** = other timeframe entering
- **Rejection** = overnight range holds

**COACHING TIP**: Always distinguish between PROBE (initial test) and ACCEPTANCE (sustained trade).

═══════════════════════════════════════════════════════════════
YOUR COACHING RESPONSE FORMAT:
═══════════════════════════════════════════════════════════════

1. **Scenario Validation Assessment** (2-3 sentences):
   - Which scenario's conditions are being validated/partially validated/invalidated?
   - Reference scenario by name
   - State what has OCCURRED vs what REMAINS PENDING
   - Use: "requires acceptance", "not yet proven", "remains conditional"

2. **Structural Observations** (2-3 sentences):
   - Is this initiative or responsive activity?
   - Describe acceptance OR rejection behavior
   - Note if acceptance is pending (e.g., "sustained trade below VAL for 30+ minutes required")

3. **Watch Next** (2-3 specific points):
   - Key conditions that would validate or invalidate scenarios
   - Specific levels and required behavior (time + volume)
   - Reference specific scenarios by name

4. **Validation Status** (MANDATORY):
   [VALIDATIONS: {"scenario1": {"status": "...", "validatedConditions": [...], "pendingConditions": [...], "invalidationCondition": "..."}, "scenario2": {...}, "scenario3": {...}}]

═══════════════════════════════════════════════════════════════
EXAMPLES OF CORRECT COACHING:
═══════════════════════════════════════════════════════════════

✅ CORRECT: "Scenario 1 (Bullish Continuation) remains NOT VALIDATED. The bounce off ONL 1.04261 shows **responsive buying** at the overnight low—positioned longs defending their exposure. This is not new initiative buying. For validation, **acceptance above VAH 1.04428 is required**: sustained trade (30+ minutes) with volume. Until this occurs, Scenario 1 is conditional."

✅ CORRECT: "Scenario 2 (Inventory Liquidation) is now PARTIALLY VALIDATED. We have observed a break below ONL 1.04261 with volume—this is initiative selling. However, **acceptance below ONL is not yet proven**. For full validation, we need sustained trade below 1.04261 for 30+ minutes. Without this, the break could be a failed probe."

✅ CORRECT: "Scenario 3 (Rotational Acceptance) is VALIDATED. Price has built value within yesterday's range for 2+ hours with two-sided trade at VPOC. Both VAH and VAL held as boundaries. This confirms the market is accepting this value area."

❌ INCORRECT: "This move is being fueled by net short inventory, accelerating upside." 
→ WRONG: Inventory cannot "fuel" until acceptance is proven.

❌ INCORRECT: "Scenario 2 probability increases to 65%."
→ WRONG: Do not use probability language.

═══════════════════════════════════════════════════════════════
VALIDATION OUTPUT FORMAT (MANDATORY):
═══════════════════════════════════════════════════════════════

End EVERY response with:

[VALIDATIONS: {"scenario1": {"status": "not_validated|partially_validated|validated|invalidated", "validatedConditions": ["condition 1", "condition 2"], "pendingConditions": ["pending 1"], "invalidationCondition": "LIS description"}, "scenario2": {...}, "scenario3": {...}}]

RULES:
- Only ONE scenario may be "validated" at any time
- Multiple scenarios may be "not_validated" or "partially_validated"
- Use specific level values in conditions when available
- Status must be one of: not_validated, partially_validated, validated, invalidated`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, planContext, scenarios, chatHistory, currentValidations } = await req.json();
    
    console.log("Trading Coach request received:", { message, planContext });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Search knowledge base for relevant AMT concepts based on the user's message
    const knowledgeQuery = `${message} ${planContext.yesterday.structure} ${planContext.today.inventory} auction market theory acceptance rejection`;
    const knowledgeContext = await searchAMTKnowledge(knowledgeQuery, LOVABLE_API_KEY, supabaseUrl, supabaseServiceKey);

    // Build context from plan data
    let contextPrompt = `PLAN CONTEXT:
- Yesterday: ${planContext.yesterday.dayType}, ${planContext.yesterday.valueRelationship}, ${planContext.yesterday.structure}, VPOC ${planContext.yesterday.prominentVpoc}
- Today: ${planContext.today.inventory}, ${planContext.today.openRelation}
- Levels: VAH ${planContext.levels.yesterdayVah}, VAL ${planContext.levels.yesterdayVal}, ONH ${planContext.levels.overnightHigh}, ONL ${planContext.levels.overnightLow}

SCENARIOS TO VALIDATE:
1. ${scenarios[0].name}: In Play at ${scenarios[0].inPlay} → Invalidates at ${scenarios[0].lis}
2. ${scenarios[1].name}: In Play at ${scenarios[1].inPlay} → Invalidates at ${scenarios[1].lis}
3. ${scenarios[2].name}: In Play at ${scenarios[2].inPlay} → Invalidates at ${scenarios[2].lis}`;

    // Add current validation states if available
    if (currentValidations && currentValidations.length > 0) {
      contextPrompt += `

CURRENT VALIDATION STATES:
1. ${scenarios[0].name}: ${currentValidations[0]?.status || 'not_validated'}
2. ${scenarios[1].name}: ${currentValidations[1]?.status || 'not_validated'}
3. ${scenarios[2].name}: ${currentValidations[2]?.status || 'not_validated'}`;
    }

    // Add knowledge context if available
    if (knowledgeContext) {
      contextPrompt += `

RELEVANT AMT BOOK REFERENCES:
${knowledgeContext}

Apply these authoritative insights when assessing acceptance, rejection, and validation conditions.`;
    }

    // Build messages array with chat history
    const messages = [
      { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextPrompt },
      ...chatHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    console.log("Calling Lovable AI with messages:", messages.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 4096,
        messages,
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
    
    console.log("AI response received:", aiContent.substring(0, 200));

    // Extract validations from AI response
    const validations = extractValidations(aiContent, scenarios, currentValidations);
    
    return new Response(JSON.stringify({ 
      content: aiContent,
      validations 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Trading Coach error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

interface ScenarioValidation {
  status: "not_validated" | "partially_validated" | "validated" | "invalidated";
  validatedConditions: string[];
  pendingConditions: string[];
  invalidationCondition: string;
}

function extractValidations(content: string, scenarios: any[], currentValidations: ScenarioValidation[] | null): ScenarioValidation[] {
  // Try to parse JSON from [VALIDATIONS: {...}] format
  // IMPORTANT: Only treat it as valid if it actually contains scenario keys.
  const match = content.match(/\[VALIDATIONS:\s*(\{[\s\S]*?\})\s*\]/i);

  if (match) {
    const rawJson = match[1];

    // Guard: avoid accidentally matching unrelated braces.
    const looksLikeValidationPayload = /scenario\s*1|"scenario1"/i.test(rawJson);

    if (looksLikeValidationPayload) {
      try {
        const validationData = JSON.parse(rawJson);

        const parsed: ScenarioValidation[] = scenarios.map((scenario, index) => {
          const key = `scenario${index + 1}`;
          const data = validationData[key] || {};

          return {
            status: parseValidationStatus(data.status || "not_validated"),
            validatedConditions: Array.isArray(data.validatedConditions) ? data.validatedConditions : [],
            pendingConditions: Array.isArray(data.pendingConditions)
              ? data.pendingConditions
              : ["Awaiting price action update"],
            invalidationCondition: data.invalidationCondition || scenario.lis || "N/A",
          };
        });

        // Heuristic: if JSON exists but yields no meaningful status changes, fall back to text inference.
        const allNotValidated = parsed.every((v) => v.status === "not_validated");
        const textSuggestsValidation = /scenario\s*3[\s\S]{0,120}(?:is\s+now\s+)?validated/i.test(content);

        if (allNotValidated && textSuggestsValidation) {
          console.warn('⚠️ Validation JSON present but not usable; falling back to text inference');
          return inferValidationsFromText(content, scenarios, currentValidations);
        }

        console.log('✅ Validations extracted successfully:', parsed.map((v) => v.status));
        return parsed;
      } catch (e) {
        console.warn('Failed to parse validations JSON:', e);
      }
    }
  }

  // Fallback: infer from text
  console.warn('⚠️ No validation JSON found, inferring from text');
  return inferValidationsFromText(content, scenarios, currentValidations);
}

function parseValidationStatus(statusStr: string): "not_validated" | "partially_validated" | "validated" | "invalidated" {
  const normalized = statusStr.toLowerCase().replace(/[\s_-]+/g, '_');
  if (normalized.includes('invalidated')) return "invalidated";
  if (normalized === 'validated' || normalized === 'confirmed') return "validated";
  if (normalized.includes('partially') || normalized.includes('partial')) return "partially_validated";
  return "not_validated";
}

function inferValidationsFromText(text: string, scenarios: any[], currentValidations: ScenarioValidation[] | null): ScenarioValidation[] {
  const lowerText = text.toLowerCase();
  
  console.log('Inferring validations from text. Searching for patterns...');
  
  // Start with current validations or defaults
  const result: ScenarioValidation[] = scenarios.map((scenario, index) => {
    const current = currentValidations?.[index];
    return {
      status: current?.status || "not_validated",
      validatedConditions: current?.validatedConditions || [],
      pendingConditions: current?.pendingConditions || ["Requires acceptance (time + volume)"],
      invalidationCondition: current?.invalidationCondition || scenario.lis,
    };
  });
  
  // Check for validation language in text for each scenario
  // More robust patterns to catch "is now VALIDATED", "is VALIDATED", "now VALIDATED"
  for (let i = 0; i < 3; i++) {
    const scenarioNum = i + 1;
    const scenarioName = scenarios[i]?.name?.toLowerCase() || '';
    
    // Multiple patterns to match validation statements
    const patterns = [
      new RegExp(`scenario\\s*${scenarioNum}[^.]*?(?:is\\s+now\\s+|is\\s+|now\\s+)?(invalidated|validated|partially\\s*validated|not\\s*validated)`, 'gi'),
      new RegExp(`scenario\\s*${scenarioNum}[^.]*?(validated|invalidated|partially|not validated)`, 'gi'),
      // Also try matching by scenario name if available
      ...(scenarioName ? [new RegExp(`${scenarioName.replace(/[()]/g, '\\$&')}[^.]*?(?:is\\s+now\\s+|is\\s+|now\\s+)?(invalidated|validated|partially\\s*validated|not\\s*validated)`, 'gi')] : [])
    ];
    
    for (const pattern of patterns) {
      const matches = lowerText.match(pattern);
      
      if (matches) {
        const lastMatch = matches[matches.length - 1].toLowerCase();
        console.log(`Scenario ${scenarioNum} matched:`, lastMatch);
        
        // Order matters: check more specific patterns first
        if (lastMatch.includes('invalidated')) {
          result[i].status = "invalidated";
          break;
        } else if (lastMatch.includes('partially')) {
          result[i].status = "partially_validated";
          break;
        } else if (lastMatch.includes('not validated') || lastMatch.includes('not_validated')) {
          result[i].status = "not_validated";
          break;
        } else if (lastMatch.includes('validated') && !lastMatch.includes('not')) {
          result[i].status = "validated";
          break;
        }
      }
    }
  }
  
  // Ensure only one scenario is validated
  const validatedCount = result.filter(v => v.status === "validated").length;
  if (validatedCount > 1) {
    // Keep only the first validated one
    let foundFirst = false;
    for (let i = 0; i < result.length; i++) {
      if (result[i].status === "validated") {
        if (foundFirst) {
          result[i].status = "partially_validated";
        } else {
          foundFirst = true;
        }
      }
    }
  }
  
  console.log('⚠️ Inferred validations:', result.map(v => v.status));
  return result;
}
