/**
 * ai.service.js
 * Handles AI-powered deep analysis of individual vulnerability instances
 * using Groq (Llama 3.3 70B Versatile).
 *
 * Design principles:
 *   - AI is assistive, NOT authoritative — it only explains what ZAP found
 *   - Each call analyses exactly ONE vulnerability instance
 *   - Input excludes description/solution fields (those are ZAP's own text)
 *   - Output is a structured JSON object with 7 educational fields
 *   - The AI must remain defensive, educational, and analytical
 *
 * Provider: Groq (OpenAI-compatible API)
 * Model:    llama-3.3-70b-versatile
 */

import OpenAI from 'openai';

// Groq uses an OpenAI-compatible API, so we reuse the openai client
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

// ─────────────────────────────────────────────────────────────────────────────
// System prompt — carefully crafted for educational, non-exploitative output
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a defensive web-security analyst and educator.

CONTEXT:
You are part of an AI-assisted vulnerability scanner built for students and developers.
The system uses OWASP ZAP to discover vulnerabilities. Your role is strictly to ANALYZE
and EXPLAIN a single vulnerability instance that ZAP has already identified — you do NOT
perform any scanning yourself.

YOUR RESPONSIBILITIES:
- Provide a clear, accurate, and educational analysis of the given vulnerability instance
- Ground every part of your analysis in the specific data provided (URL, parameter, attack payload, evidence, etc.)
- Make your explanations accessible to beginners and computer science students
- Provide actionable, practical fix guidance for developers
- Maintain a defensive and educational tone throughout

STRICT RULES — YOU MUST FOLLOW THESE:
1. Analyze ONLY the single vulnerability instance provided — do not invent additional issues
2. Do NOT generate new attack payloads or exploitation techniques
3. Do NOT provide step-by-step exploitation instructions or hacking tutorials
4. Do NOT assume or imply that attacks succeeded beyond what the evidence shows
5. Do NOT use knowledge outside the provided input data to fabricate findings
6. Keep all guidance defensive — focused on understanding and fixing, never on attacking
7. Be specific to the provided data — avoid generic boilerplate answers
8. Respond ONLY with valid JSON — no markdown, no explanations, no extra text outside the JSON`;

// ─────────────────────────────────────────────────────────────────────────────
// Build the user prompt from instance data
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Constructs the user-role prompt from a single vulnerability instance.
 * Deliberately excludes `description` and `solution` fields — those are
 * ZAP's own static text and would bias the AI towards parroting them.
 *
 * @param {Object} instance - The vulnerability instance data
 * @returns {string} Formatted prompt string
 */
const buildUserPrompt = (instance) => {
  return `VULNERABILITY INSTANCE DATA:
  Name:       ${instance.name}
  Risk:       ${instance.risk}
  Confidence: ${instance.confidence || 'N/A'}
  URL:        ${instance.url || 'N/A'}
  Method:     ${instance.method || 'N/A'}
  Parameter:  ${instance.param || 'N/A'}
  Attack:     ${instance.attack || 'N/A'}
  Evidence:   ${instance.evidence || 'N/A'}
  Other Info: ${instance.otherInfo || 'N/A'}
  CWE ID:     ${instance.cweid || 'N/A'}
  WASC ID:    ${instance.wascid || 'N/A'}

TASK:
Produce a deep, structured analysis of this specific vulnerability instance.
Your output must be a single JSON object with exactly these 7 fields:

{
  "vulnerabilityOverview": "A clear 2-3 sentence summary explaining what this vulnerability is and what it means in the context of this specific finding. Reference the actual URL, parameter, or payload when relevant.",

  "whyThisOccurs": "Explain the root cause — why this type of vulnerability happens in web applications. Relate it to the specific parameter/URL/method from the data above.",

  "riskAndConfidenceInterpretation": "Interpret what the '${instance.risk}' risk level and '${instance.confidence || 'N/A'}' confidence level mean in practical terms. What does this combination imply about the severity and reliability of this finding?",

  "affectedRequestContext": "Describe the specific HTTP request context — which endpoint is affected, what method is used, which parameter is vulnerable, and how the attack payload interacts with the request. Be specific to the data above.",

  "potentialImpact": "Explain what could happen if this vulnerability is exploited in a real-world scenario. Keep it educational and grounded — do not exaggerate or sensationalize.",

  "developerFixGuidance": "Provide 2-4 concrete, actionable remediation steps that a developer could implement to fix this specific issue. Include code-level guidance where appropriate (e.g., input validation, encoding, headers).",

  "studentLearningNotes": "Provide 2-3 educational takeaways for a computer science student. What security concepts does this vulnerability illustrate? What should they learn from this finding?"
}

IMPORTANT: Return ONLY the JSON object above. No markdown fences, no extra text.`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main export — generate AI insights for one instance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a single vulnerability instance to Groq/Llama for deep analysis.
 * Returns a structured analysis object on success, or null on failure.
 *
 * @param {Object} instanceData - Single alert instance from the scan
 * @returns {Object|null} Parsed AI analysis object, or null if generation failed
 */
export const generateInstanceInsights = async (instanceData) => {
  console.log(`🤖 [AI] Generating insights for: "${instanceData.name}" at ${instanceData.url}`);

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,  // Very low temperature for consistent, factual output
      max_tokens: 1500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(instanceData) }
      ]
    });

    const rawContent = completion.choices[0].message.content;

    // Attempt to parse the JSON response
    try {
      const parsed = JSON.parse(rawContent);

      console.log(`✅ [AI] Insights generated successfully for: "${instanceData.name}"`);

      // Validate that all expected fields exist, fill missing ones with fallback
      return {
        vulnerabilityOverview:           parsed.vulnerabilityOverview           || 'Analysis not available for this field.',
        whyThisOccurs:                   parsed.whyThisOccurs                   || 'Analysis not available for this field.',
        riskAndConfidenceInterpretation: parsed.riskAndConfidenceInterpretation || 'Analysis not available for this field.',
        affectedRequestContext:          parsed.affectedRequestContext          || 'Analysis not available for this field.',
        potentialImpact:                 parsed.potentialImpact                 || 'Analysis not available for this field.',
        developerFixGuidance:            parsed.developerFixGuidance            || 'Analysis not available for this field.',
        studentLearningNotes:            parsed.studentLearningNotes            || 'Analysis not available for this field.',
        generatedAt:                     new Date()
      };
    } catch (parseErr) {
      // Model returned non-JSON — log it and return null
      console.warn(`⚠️ [AI] Model returned non-JSON response. Raw output:`);
      console.warn(rawContent);
      return null;
    }
  } catch (err) {
    // Log the failure but do NOT throw — AI errors should not crash the app
    console.error(`❌ [AI] Groq API call failed for: "${instanceData.name}"`);
    console.error(`❌ [AI] Error: ${err.message}`);

    if (err.response) {
      console.error(`❌ [AI] Response Status: ${err.response.status}`);
    }

    return null;
  }
};