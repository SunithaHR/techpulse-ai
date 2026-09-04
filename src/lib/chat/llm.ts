// TechPulse AI — LLM provider abstraction.
//
// The platform never hard-couples to a single model vendor. This module
// exposes `streamGrounded` which returns a streaming text response when an
// OpenAI-compatible or Anthropic API key is configured, and null otherwise
// (the local grounded engine in engine.ts is then used).
//
// Supported env vars:
//   OPENAI_API_KEY / OPENAI_BASE_URL / OPENAI_MODEL (default gpt-4o-mini)
//   ANTHROPIC_API_KEY / ANTHROPIC_MODEL (default claude-sonnet-4-5)
//   TECHPULSE_LLM_MODEL (optional override for either)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface GroundedRequest {
  question: string;
  context: string;
  scopeSummary: string;
  history: { role: string; content: string }[];
}

function systemPrompt(): string {
  return [
    "You are TechPulse AI, the assistant for a technology intelligence platform.",
    "Answer ONLY technology questions (software, AI, cloud, security, releases, developer tools, tech business).",
    "If asked about anything non-technology, politely decline and redirect to technology topics.",
    "Ground every answer in the provided tracked knowledge base. Do NOT invent releases, versions, CVEs, or prices not present in the context.",
    "Use markdown with headings and bullets. End with a '## Sources' section listing the referenced items with links.",
    "If the context lacks relevant data, say so and suggest what the user can ask instead.",
  ].join(" ");
}

/** Returns a ReadableStream of text chunks, or null when no provider is configured. */
export async function streamGrounded(req: GroundedRequest): Promise<ReadableStream<string> | null> {
  if (process.env.OPENAI_API_KEY) return streamOpenAI(req);
  if (process.env.ANTHROPIC_API_KEY) return streamAnthropic(req);
  return null;
}

async function streamOpenAI(req: GroundedRequest): Promise<ReadableStream<string> | null> {
  const base = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.TECHPULSE_LLM_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const messages = [
    { role: "system", content: systemPrompt() },
    ...req.history.slice(-6).map((m) => ({ role: m.role.toLowerCase() === "assistant" ? "assistant" : "user", content: m.content })),
    {
      role: "user",
      content: `# Question\n${req.question}\n\n# Scope\n${req.scopeSummary}\n\n# Tracked knowledge base\n${req.context.slice(0, 24_000)}`,
    },
  ];
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model, messages, stream: true, temperature: 0.3, max_tokens: 1400 }),
  });
  if (!res.ok || !res.body) return null;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  return new ReadableStream<string>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta: string | undefined = json?.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(delta);
          } catch {
            // partial JSON — ignore
          }
        }
      } catch {
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

async function streamAnthropic(req: GroundedRequest): Promise<ReadableStream<string> | null> {
  const model = process.env.TECHPULSE_LLM_MODEL ?? process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
  const history = req.history.slice(-6).map((m) => ({
    role: m.role.toLowerCase() === "assistant" ? "assistant" : "user",
    content: m.content,
  }));
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1400,
      system: systemPrompt(),
      messages: [
        ...history,
        {
          role: "user",
          content: `# Question\n${req.question}\n\n# Scope\n${req.scopeSummary}\n\n# Tracked knowledge base\n${req.context.slice(0, 24_000)}`,
        },
      ],
      stream: true,
    }),
  });
  if (!res.ok || !res.body) return null;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  return new ReadableStream<string>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          try {
            const json = JSON.parse(trimmed.slice(5).trim());
            if (json.type === "content_block_delta" && json.delta?.type === "text_delta") {
              controller.enqueue(json.delta.text);
            }
          } catch {
            // ignore partial frames
          }
        }
      } catch {
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

// Small helper so route code can rate-limit token delivery for a nicer UX.
export { sleep };