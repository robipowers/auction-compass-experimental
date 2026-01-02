import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an institutional AMT (Auction Market Theory) trading coach providing real-time guidance during the trading session.

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
  * Downside = VIOLENT (liquidation fuel)
- Bounce = positioned longs defending (not new conviction)
- Break = liquidation cascade (fuel accelerates move)

NET SHORT INVENTORY:
- Already positioned below settlement
- **ASYMMETRIC RISK**:
  * Downside = MUTED (already in, limited new sellers)
  * Upside = VIOLENT (short squeeze fuel)
- Rejection = positioned shorts defending (not new conviction)
- Break = short covering cascade (fuel accelerates move)

**COACHING TIP**: When inventory bounces off support/resistance, it's DEFENSIVE (responsive), not OFFENSIVE (initiative). True conviction requires NEW participants.

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

**COACHING TIP**: P-Shape + Net Long = double vulnerability. b-Shape + Net Short = double vulnerability.

5. COILED SPRING EFFECT:

SETUP:
- Tight overnight range (< 40 pips for FX)
- + Positioned inventory (Net Long or Net Short)
- = EXPLOSIVE POTENTIAL

**MECHANISM**:
- Compressed range masks tension
- Small catalyst triggers VIOLENT move
- Inventory liquidation ACCELERATES
- "Speed and violence" characterize breakout

**COACHING TIP**: When range is tight + inventory positioned, warn about explosive potential. Traders often underestimate speed of liquidation.

6. REFERENCE LEVELS & THEIR MEANING:

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

7. PROBABILITY ASSESSMENT FRAMEWORK:

**STRENGTHENING** (move from 33% → 55-65%):
- Level acceptance (time + volume)
- Initiative activity confirming
- Inventory resolving in scenario's direction
- Structure aligning

**CONFIRMED** (move to 85-90%):
- Clear structural shift
- LIS for opposing scenarios broken
- Time + volume + acceptance all aligned
- Inventory resolving violently

**WEAKENING** (move from 33% → 15-25%):
- Level rejection (tail forming)
- Failed breakout/breakdown
- Inventory conflict
- Approaching LIS

**INVALIDATED** (move to 5-10%):
- LIS broken with acceptance
- Structural shift confirmed opposite direction
- Scenario no longer viable

═══════════════════════════════════════════════════════════════
YOUR COACHING APPROACH:
═══════════════════════════════════════════════════════════════

1. **Scenario Analysis** (2-3 sentences):
   - Which scenario is strengthening/weakening/confirmed/invalidated?
   - Reference scenario by name (e.g., "Scenario 2: Inventory Liquidation")
   - Use AMT terminology (initiative, responsive, acceptance, rejection)

2. **Structural Implications** (2-3 sentences):
   - Is this initiative or responsive activity?
   - How does inventory position affect interpretation?
   - Connect to yesterday's structure (P-Shape/b-Shape vulnerability)
   - Identify if this is acceptance or just a probe
   - Mention coiled spring if tight range + positioned inventory

3. **Watch Next** (2-3 specific points):
   - Key levels to monitor with specific prices
   - What acceptance/rejection would signal
   - Warn about speed/violence if liquidation risk
   - Reference specific scenarios by name

4. **Probabilities** (MANDATORY):
   [PROBABILITIES: X, Y, Z]
   Where X, Y, Z are integers 0-100 that sum to 100

═══════════════════════════════════════════════════════════════
TONE & STYLE:
- Institutional, precise, direct (real-time coaching)
- Use AMT terminology consistently
- Distinguish initiative vs. responsive
- Emphasize asymmetric risk when relevant
- Warn about coiled spring / speed & violence
- Reference scenarios by name
- Be concise but thorough (this is live market hours)

EXAMPLES OF GOOD COACHING:

✅ "Scenario 1 (Bullish Continuation) is strengthening. The bounce off ONL 1.04261 shows **responsive buying** at the overnight low. However, given **Net Long inventory**, this is positioned longs defending their exposure, not new initiative buyers. For confirmation, watch for **acceptance above VAH 1.04428** with volume—that would signal new buyers entering. Current action is defensive (responsive), not offensive (initiative). The **tight 26-pip overnight range** combined with Net Long inventory creates **coiled spring** potential—if ONL breaks, liquidation will be **fast and violent**."

✅ "Scenario 2 (Inventory Liquidation) is CONFIRMED. The break below ONL 1.04261 with volume triggered **liquidation of Net Long inventory**. This isn't just responsive selling—it's **initiative liquidation** accelerating the decline. The **P-Shape vulnerability** from yesterday is now playing out: yesterday's short covering (corrective move) lacked conviction, and today's failure to hold ONL confirms it. Watch for **speed and violence** as positioned longs exit. Next support is VAL 1.04153."

✅ "Scenario 3 (Rotational Acceptance) is weakening. The rejection at VAH 1.04428 shows **responsive selling** (not initiative), but the **Net Long inventory** means this is a tenuous balance. The market is trying to find acceptance within yesterday's value, but the **P-Shape structure** suggests vulnerability. If VAH holds on multiple tests, rotation confirmed. If VAH breaks with **acceptance** (time + volume), Scenario 1 strengthens significantly."

═══════════════════════════════════════════════════════════════
CRITICAL REQUIREMENT:
═══════════════════════════════════════════════════════════════

You MUST end EVERY SINGLE RESPONSE with probabilities in this EXACT format:

[PROBABILITIES: X, Y, Z]

Where:
- X = Scenario 1 probability (integer 0-100)
- Y = Scenario 2 probability (integer 0-100)  
- Z = Scenario 3 probability (integer 0-100)
- X + Y + Z MUST equal 100

This line is MANDATORY. Do not forget it. Do not skip it. Do not modify the format.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, planContext, scenarios, chatHistory, previousProbabilities } = await req.json();
    
    console.log("Trading Coach request received:", { message, planContext });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from plan data
    const contextPrompt = `PLAN CONTEXT:
- Yesterday: ${planContext.yesterday.dayType}, ${planContext.yesterday.valueRelationship}, ${planContext.yesterday.structure}, VPOC ${planContext.yesterday.prominentVpoc}
- Today: ${planContext.today.inventory}, ${planContext.today.openRelation}
- Levels: VAH ${planContext.levels.yesterdayVah}, VAL ${planContext.levels.yesterdayVal}, ONH ${planContext.levels.overnightHigh}, ONL ${planContext.levels.overnightLow}

SCENARIOS:
1. ${scenarios[0].name}: ${scenarios[0].inPlay} → LIS ${scenarios[0].lis}
2. ${scenarios[1].name}: ${scenarios[1].inPlay} → LIS ${scenarios[1].lis}
3. ${scenarios[2].name}: ${scenarios[2].inPlay} → LIS ${scenarios[2].lis}`;

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

    // Extract probabilities from AI response with fallback to previous
    const prevProbs = previousProbabilities || [33, 33, 34];
    const probabilities = extractProbabilities(aiContent, prevProbs);
    
    return new Response(JSON.stringify({ 
      content: aiContent,
      probabilities 
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

function extractProbabilities(content: string, previousProbs: number[] = [33, 33, 34]): [number, number, number] {
  const match = content.match(/\[PROBABILITIES:\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]/i);
  
  if (!match) {
    console.error('❌ AI did not return probabilities in required format!');
    console.error('Response end:', content.substring(content.length - 200));
    
    // Try to infer from text as fallback
    const inferredProbs = inferProbabilitiesFromText(content, previousProbs);
    if (inferredProbs) {
      console.warn('⚠️ Using inferred probabilities:', inferredProbs);
      return inferredProbs;
    }
    
    // Last resort: use previous probabilities
    console.warn('⚠️ Using previous probabilities as fallback:', previousProbs);
    return [previousProbs[0], previousProbs[1], previousProbs[2]];
  }
  
  let probs: [number, number, number] = [
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    parseInt(match[3], 10)
  ];
  
  // Validate they sum to 100
  const sum = probs.reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    console.warn(`⚠️ Probabilities sum to ${sum}, normalizing to 100`);
    const normalized: [number, number, number] = [
      Math.round((probs[0] / sum) * 100),
      Math.round((probs[1] / sum) * 100),
      Math.round((probs[2] / sum) * 100)
    ];
    // Fix rounding errors
    const diff = 100 - normalized.reduce((a, b) => a + b, 0);
    normalized[0] += diff;
    return normalized;
  }
  
  console.log('✅ Probabilities extracted successfully:', probs);
  return probs;
}

// Helper function to infer probabilities from text when format is missing
function inferProbabilitiesFromText(text: string, previousProbs: number[]): [number, number, number] | null {
  const lowerText = text.toLowerCase();
  
  // Scenario 1 confirmed
  if (lowerText.includes('scenario 1') && (lowerText.includes('confirmed') || lowerText.includes('is confirmed'))) {
    return [90, 5, 5];
  }
  
  // Scenario 2 confirmed
  if (lowerText.includes('scenario 2') && (lowerText.includes('confirmed') || lowerText.includes('is confirmed'))) {
    return [5, 90, 5];
  }
  
  // Scenario 3 confirmed
  if (lowerText.includes('scenario 3') && (lowerText.includes('confirmed') || lowerText.includes('is confirmed'))) {
    return [5, 5, 90];
  }
  
  // Scenario 1 strengthening
  if (lowerText.includes('scenario 1') && lowerText.includes('strengthening')) {
    return [65, 25, 10];
  }
  
  // Scenario 2 strengthening
  if (lowerText.includes('scenario 2') && lowerText.includes('strengthening')) {
    return [25, 60, 15];
  }
  
  // Scenario 1 weakening
  if (lowerText.includes('scenario 1') && lowerText.includes('weakening')) {
    return [35, 40, 25];
  }
  
  // Scenario 2 weakening
  if (lowerText.includes('scenario 2') && lowerText.includes('weakening')) {
    return [40, 35, 25];
  }
  
  return null;
}
