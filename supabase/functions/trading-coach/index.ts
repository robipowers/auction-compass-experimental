import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an AMT trading coach. The trader will describe price action. You must:
1. Identify which of the 3 scenarios is playing out
2. Explain why using the plan context
3. Update probabilities

PROBABILITY RULES:
- Scenario strengthening (trigger approaching): 60-75%
- Scenario confirmed (trigger hit, LIS holding): 85-95%
- Scenario weakening (opposite action): 20-35%
- Scenario invalidated (LIS broken): 5-10%

RESPONSE FORMAT:
**Scenario Analysis:**
[Which scenario is playing out and why]

**Structural Implications:**
[What this means for market structure]

**Watch Next:**
[What to monitor]

[PROBABILITIES: X, Y, Z]

EXAMPLE:
User: "Price testing VAH 1.03528, seeing wicks and rejection"

Your response:
**Scenario Analysis:**
Scenario 1 (Bearish Continuation) is strengthening. VAH rejection with Net Short inventory shows sellers defending yesterday's value high. The b-Shape liquidation structure from yesterday supports continued selling pressure.

**Structural Implications:**
Rejection at VAH 1.03528 means yesterday's sellers are active. With Net Short inventory, this creates downside bias. Watch for break below ONL 1.03261 as next confirmation.

**Watch Next:**
If price breaks ONL with volume → Scenario 1 confirmed (85%+)
If price accepts above VAH → Scenario 2 (Short Squeeze) activates

[PROBABILITIES: 65, 25, 10]

CRITICAL RULES:
- ALWAYS include [PROBABILITIES: X, Y, Z] at the end where X+Y+Z=100
- Reference specific scenarios by name
- Use AMT terminology (acceptance, rejection, inventory, discovery)
- Do NOT prescribe trades, only analyze structure

═══════════════════════════════════════════════════════════════
CRITICAL REQUIREMENT - READ THIS CAREFULLY:
═══════════════════════════════════════════════════════════════

You MUST end EVERY SINGLE RESPONSE with probabilities in this EXACT format:

[PROBABILITIES: X, Y, Z]

Where:
- X = Scenario 1 probability (integer 0-100)
- Y = Scenario 2 probability (integer 0-100)  
- Z = Scenario 3 probability (integer 0-100)
- X + Y + Z MUST equal 100

This line is MANDATORY. Do not forget it. Do not skip it. Do not modify the format.

EXAMPLES OF CORRECT ENDINGS:
When Scenario 1 is confirmed:
[PROBABILITIES: 90, 5, 5]

When Scenario 2 is confirmed:
[PROBABILITIES: 5, 90, 5]

When Scenario 1 is strengthening:
[PROBABILITIES: 65, 25, 10]

When Scenario 2 is strengthening:
[PROBABILITIES: 25, 60, 15]

When balanced/uncertain:
[PROBABILITIES: 33, 33, 34]

When Scenario 1 is weakening after being strong:
[PROBABILITIES: 35, 40, 25]

REMINDER: Every response must end with this line. No exceptions.`;

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
