// Real calls to api.anthropic.com — this project's grading/planning/help/chat all
// route through here. Two models are used (design doc §14: cheap/fast for small
// jobs, stronger for real judgment) — which one is picked is the caller's choice,
// not this file's.

const ANTHROPIC_VERSION = "2023-06-01";

export async function callClaude(env, { model, system, messages, maxTokens = 2000 }) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
      // Claude Sonnet 5 runs adaptive thinking by default, and thinking tokens are
      // billed against the same max_tokens budget as the actual answer — without
      // this, a call can spend its entire budget "thinking" and return nothing.
      // This app needs a complete, predictable JSON/text answer, not exposed
      // reasoning, so thinking is turned off outright rather than budgeted around.
      thinking: { type: "disabled" }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const textBlocks = (data.content || []).filter((block) => block.type === "text");
  if (textBlocks.length === 0) {
    throw new Error(`Anthropic API returned no text (stop_reason: ${data.stop_reason}). Raw: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return textBlocks.map((block) => block.text).join("\n");
}

// Extracts the first {...} JSON object from a text blob. Claude is asked to return
// ONLY JSON, but this is a cheap safety net against stray preamble.
export function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model output");
  }
  return JSON.parse(text.slice(start, end + 1));
}
