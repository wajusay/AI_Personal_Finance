import { z } from "zod";

const ollamaResponseSchema = z.object({
  suggestedCategory: z.string().min(1),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
});

export type OllamaCategorization = z.infer<typeof ollamaResponseSchema>;

function ensureLocalOllamaUrl() {
  // Hard-code loopback; do not allow arbitrary hosts.
  return "http://127.0.0.1:11434/api/chat";
}

function buildPrompt(input: {
  merchant: string;
  description: string;
  amount: number;
  existingCategories: string[];
  accountName?: string;
}) {
  const categories = input.existingCategories
    .map((c) => c.trim())
    .filter(Boolean)
    .filter((c) => c.toLowerCase() !== "needs review");

  return [
    "You are helping categorize personal finance transactions. Return ONLY JSON.",
    "",
    "Rules:",
    '- Use ONLY a category from "categories" if possible; otherwise pick the closest short category name.',
    "- Confidence must be a number between 0 and 1.",
    "- Reasoning must be short (<= 20 words) and must not include any private speculation.",
    "",
    "Return JSON with exactly:",
    '{ "suggestedCategory": string, "confidence": number, "reasoning": string }',
    "",
    `Transaction:`,
    `- merchant: ${input.merchant}`,
    `- description: ${input.description}`,
    `- amount: ${input.amount.toFixed(2)}`,
    input.accountName ? `- accountName: ${input.accountName}` : undefined,
    "",
    `categories: ${JSON.stringify(categories.slice(0, 100))}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return null;
}

export async function categorizeWithOllama(input: {
  merchant: string;
  description: string;
  amount: number;
  existingCategories: string[];
  model: string;
  accountName?: string;
  timeoutMs?: number;
}): Promise<
  | { ok: true; result: OllamaCategorization }
  | { ok: false; error: string }
> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? 15_000);

  try {
    const url = ensureLocalOllamaUrl();
    const prompt = buildPrompt(input);

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: input.model,
        stream: false,
        messages: [
          { role: "system", content: "Return only JSON. No markdown." },
          { role: "user", content: prompt },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Ollama error (${res.status}): ${t.slice(0, 200) || res.statusText}`,
      };
    }

    const json = (await res.json()) as unknown;
    const content =
      typeof json === "object" && json !== null && "message" in json
        ? String((json as { message?: { content?: unknown } }).message?.content ?? "")
        : "";
    const jsonText = extractJson(content);
    if (!jsonText) return { ok: false, error: "Ollama returned non-JSON output." };

    const parsed = ollamaResponseSchema.safeParse(JSON.parse(jsonText));
    if (!parsed.success) return { ok: false, error: "Ollama JSON did not match expected schema." };

    return { ok: true, result: parsed.data };
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError")
      return { ok: false, error: "Ollama request timed out." };
    return {
      ok: false,
      error:
        "Could not reach Ollama. Is it running locally on 127.0.0.1:11434?",
    };
  } finally {
    clearTimeout(timeout);
  }
}

