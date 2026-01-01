import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dataSummary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert credit risk analyst assistant helping users analyze their accounts receivable data. You provide actionable insights about client risk, payment behaviors, and collection strategies.

## Current Data Context
${dataSummary}

## Risk Scoring Methodology
The risk score (0-100) is calculated using a weighted formula:
- Days Past Due (50% weight): 0-90+ days normalized to 0-50 points
- Credit Utilization (25% weight): 0-85%+ normalized to 0-25 points
- Reminders Count (15% weight): 0-3+ reminders normalized to 0-15 points
- Average Orders 60 Days (10% weight): Lower orders = higher risk, normalized to 0-10 points

## Risk Category Thresholds
- High Risk: Score ≥ 65 (requires immediate attention)
- Medium Risk: Score 35-64 (monitor closely)
- Low Risk: Score < 35 (healthy accounts)

## Your Responsibilities
1. Answer questions about client risk patterns, overdue payments, and credit utilization
2. Provide specific recommendations for collection prioritization
3. Explain why specific clients have their risk scores
4. Identify trends and patterns in the data
5. Suggest actionable next steps for risk mitigation

## Response Guidelines
- Be concise and actionable
- Use specific numbers from the data when relevant
- Prioritize insights that help with collection decisions
- When asked "why" about a risk score, explain which factors contributed most
- If you don't have enough information to answer precisely, say so and explain what data would be needed`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Credit risk chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
