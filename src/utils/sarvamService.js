const SARVAM_API_KEY = "sk_wajkrjjw_D129eXthDsNC46eozPXL5nCC";

/**
 * Cleans the AI response by stripping internal thinking blocks (<think>...</think>)
 * and any other non-user-facing metadata.
 */
function cleanAiResponse(text) {
  if (!text) return "";
  // Remove <think> blocks (including nested or multiline)
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

/**
 * Common Sarvam AI caller for city intelligence and report generation.
 * @param {string} systemPrompt 
 * @param {string} userPrompt 
 * @returns {Promise<string>}
 */
export async function callSarvamAI(systemPrompt, userPrompt) {
  try {
    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SARVAM_API_KEY}`
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1200,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Sarvam API error: ${response.status} – ${err}`);
    }
    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";
    return cleanAiResponse(rawContent);
  } catch (error) {
    console.error("Sarvam AI Error:", error);
    throw error;
  }
}

/**
 * Specialized caller for Real-life Scenario Simulation (e.g. IRAN-WAR Impact)
 * @param {Object} scenario { name, impactFactor, newsSnippet, baseMetrics }
 */
export async function analyzeScenario(scenario) {
  const systemPrompt = `You are the Lead Data Scientist for Nashik Smart City (MargVedha AI).
    Analyze a hypothetical but realistic scenario provided by the Admin and its impact on city-wide traffic and fuel.
    Combine our base metrics with the external scenario to provide tactical shifts.
    
    IMPORTANT: You MUST conclude your response with a JSON block in the following format:
    ---METRICS---
    {
      "impact_score": (Integer 1-100),
      "traffic_shift": (Integer percentage +/-),
      "fuel_reduction": (Integer percentage),
      "critical_junctions": ["Junction A", "Junction B"]
    }
    
    Provide the narrative summary FIRST, then the ---METRICS--- block.
    Ensure the narrative has:
    - **IMPACT**: (1 sentence summary)
    - **STRATEGY**: (1 sentence summary)
    - **ACTION**: (1 sentence recommendation)`;

  const userPrompt = `
    SCENARIO: ${scenario.name}
    IMPACT FACTOR: ${scenario.impactFactor}
    LATEST NEWS: ${scenario.newsSnippet}
    
    BASE CITY METRICS: ${JSON.stringify(scenario.baseMetrics)}
    
    Please provide an AI-driven visual insight for the Nashik administration.
    NO thinking blocks in the output.`;

  return await callSarvamAI(systemPrompt, userPrompt);
}
