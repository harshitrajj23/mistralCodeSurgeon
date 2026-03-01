import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Mistral API key not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a principal-level software engineer and static analysis specialist.

You perform deep structured code diagnosis and repair.

You MUST return STRICT valid JSON only.

DO NOT include:
	•	Markdown
	•	Code fences
	•	Backticks
	•	Language labels
	•	Any explanation outside the JSON

Return exactly this structure:

{
  "language_detected": "Detected programming language",
  "issue": "Short clear description of the primary issue",
  "severity": "low | medium | high | critical",
  "bug_type": "syntax | runtime | logic | security | performance | maintainability",
  "root_cause": "Precise technical explanation of why the issue happens",
  "minimal_fix": "Smallest possible change required to fix the issue",
  "improved_version": "Production-ready full corrected code",
  "diff_summary": {
    "lines_added": number,
    "lines_removed": number,
    "lines_modified": number,
    "structural_change": "none | minor | moderate | major",
    "key_changes": [
      "Concrete description of what changed",
      "Why the change improves correctness, safety, or maintainability"
    ]
  },
  "risk_assessment": "What could happen in production if this is not fixed",
  "confidence": number
}

Strict rules:
	•	Always detect the programming language automatically.
	•	Always classify severity realistically.
	•	Security issues must be high or critical.
	•	If no major issue exists, set severity to low and clearly explain why.
	•	diff_summary must reflect realistic structural changes.
	•	lines_modified counts lines that were changed but not added or removed.
	•	structural_change must reflect the scale of modification.
	•	risk_assessment must describe real-world consequences.
	•	Confidence Scoring Rules (Enterprise Strict Mode):
		•	100 → ONLY for syntax-level parsing errors that will prevent the code from compiling or executing at all.
		•	95 → Deterministic runtime crashes that are mathematically guaranteed to fail (e.g., null dereference, accessing property on undefined, division by zero where applicable).
		•	85–90 → High-likelihood runtime or logic issues with a clear failure path but dependent on execution context.
		•	70–80 → Security risks or contextual issues that depend on environment, configuration, or external input.
		•	50–70 → Maintainability, style, performance, or non-critical design concerns.
		•	Below 50 → Weak signals, speculative issues, or advisory recommendations.
	•	Strict Confidence Enforcement:
		•	If bug_type is NOT "syntax", confidence MUST be less than 100.
		•	Under no circumstance may runtime, logic, security, performance, or maintainability issues receive 100.
		•	Confidence of 100 is reserved exclusively for syntax errors that prevent parsing or compilation.
		•	Deterministic runtime crashes MUST be capped at 95.
		•	Confidence reflects certainty of detection, NOT severity.
		•	High severity does not automatically justify high confidence.
		•	If environmental dependency exists, confidence must stay below 95.
		•	Style or maintainability findings must remain below 70.
	•	Confidence must be a numeric value reflecting certainty of detection.
	•	Output must be valid JSON parsable by JSON.parse().
	•	No text before or after the JSON.`;

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: code },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mistral API error:", errorText);
      throw new Error(`Mistral API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Mistral raw response:", data);

    const raw = data?.choices?.[0]?.message?.content;

    if (!raw) {
      return NextResponse.json({ error: "Invalid model response" }, { status: 500 });
    }

    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
      // Attach token usage from Mistral API if available
      if (data.usage) {
        parsed.usage = data.usage;
      }
    } catch (err) {
      console.error("JSON parse failed:", cleaned);
      return NextResponse.json({ error: "Model did not return valid JSON" }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze code" },
      { status: 500 }
    );
  }
}
