// Seed catalog of AI models. Illustrative sample data generated for local
// development — versions, pricing and dates are plausible placeholders, not
// live-fetched facts.
import type { CompanySeed } from "./companies";

export interface ModelSeed {
  name: string;
  provider: string; // company slug
  family?: string;
  version?: string;
  status: string;
  releasedDaysAgo: number;
  contextWindow?: number;
  maxOutput?: number;
  caps: string; // letters: r reasoning, t tool, s structured, v vision, a audio, c code, i image-out, w web
  priceIn?: number; // USD per 1M input tokens
  priceOut?: number; // USD per 1M output tokens
  cachedIn?: number;
  openSource?: boolean;
  license?: string;
  description?: string;
  docsUrl?: string;
  benchmarks?: [string, string][];
  compare?: Record<string, string>;
  featured?: boolean;
}

const M = (
  name: string,
  provider: string,
  family: string,
  releasedDaysAgo: number,
  contextWindow: number | undefined,
  maxOutput: number | undefined,
  caps: string,
  priceIn: number | undefined,
  priceOut: number | undefined,
  opts: Partial<Omit<ModelSeed, "name" | "provider" | "family" | "releasedDaysAgo" | "contextWindow" | "maxOutput" | "caps" | "priceIn" | "priceOut">> = {},
): ModelSeed => ({
  name,
  provider,
  family,
  releasedDaysAgo,
  contextWindow,
  maxOutput,
  caps,
  priceIn,
  priceOut,
  status: opts.status ?? "STABLE",
  openSource: opts.openSource ?? false,
  ...opts,
});

function describe(m: ModelSeed, companies: CompanySeed[]): string {
  const provider = companies.find((c) => c.slug === m.provider)?.name ?? m.provider;
  const flags: string[] = [];
  if (m.caps.includes("r")) flags.push("reasoning");
  if (m.caps.includes("v") && m.caps.includes("a")) flags.push("multimodal");
  else if (m.caps.includes("v")) flags.push("vision");
  if (m.caps.includes("c")) flags.push("code");
  if (m.openSource) flags.push("open-weight");
  const ctx = m.contextWindow ? ` with a ${(m.contextWindow / 1000).toFixed(0)}K context window` : "";
  return m.description ?? `${provider} model${flags.length ? ` — ${flags.join(", ")}` : ""}${ctx}.`;
}

export function buildModels(companies: CompanySeed[]): ModelSeed[] {
  const rows: ModelSeed[] = [
    // ── OpenAI ──────────────────────────────────────────────────────────────
    M("GPT-5.2", "openai", "gpt-5", 2, 400000, 128000, "rtsvca", 1.25, 10, {
      cachedIn: 0.125, status: "BETA", docsUrl: "https://platform.openai.com/docs",
      benchmarks: [["SWE-bench Verified", "81.4%"], ["AIME 2025", "96/100"], ["GPQA Diamond", "71.8%"]],
      compare: { knowledgeCutoff: "Early 2026", releaseFormat: "Chat + API" }, featured: true,
    }),
    M("GPT-5.1", "openai", "gpt-5", 34, 400000, 128000, "rtsvca", 1.25, 10, {
      cachedIn: 0.125,
      benchmarks: [["SWE-bench Verified", "80.2%"], ["AIME 2025", "94/100"]],
      compare: { knowledgeCutoff: "Late 2025" },
    }),
    M("GPT-5 mini", "openai", "gpt-5", 21, 200000, 64000, "rtsvca", 0.25, 2, {
      cachedIn: 0.025, compare: { knowledgeCutoff: "Late 2025" }, featured: true,
    }),
    M("GPT-5 nano", "openai", "gpt-5", 12, 128000, 32000, "rtsvc", 0.05, 0.4, {
      status: "BETA", compare: { knowledgeCutoff: "Late 2025" },
    }),
    M("GPT-4.1", "openai", "gpt-4", 150, 1047576, 32768, "tsvc", 2, 8, { status: "ARCHIVED" }),
    M("o4-mini", "openai", "o4", 180, 200000, 100000, "rtsc", 1.1, 4.4, { status: "ARCHIVED" }),

    // ── Anthropic ───────────────────────────────────────────────────────────
    M("Claude Opus 4.6", "anthropic", "claude-opus", 5, 500000, 128000, "rtsvca", 15, 75, {
      cachedIn: 1.5, status: "BETA", docsUrl: "https://docs.anthropic.com",
      benchmarks: [["SWE-bench Verified", "79.6%"], ["GPQA Diamond", "78.2%"], ["TAU-bench", "84.9%"]],
      compare: { knowledgeCutoff: "Early 2026" }, featured: true,
    }),
    M("Claude Opus 4.5", "anthropic", "claude-opus", 60, 500000, 128000, "rtsvca", 15, 75, {
      cachedIn: 1.5,
      benchmarks: [["SWE-bench Verified", "77.2%"], ["GPQA Diamond", "74.7%"]],
    }),
    M("Claude Sonnet 4.5", "anthropic", "claude-sonnet", 100, 500000, 128000, "rtsvca", 3, 15, {
      cachedIn: 0.3,
      benchmarks: [["SWE-bench Verified", "72.7%"]],
      compare: { knowledgeCutoff: "Aug 2025" }, featured: true,
    }),
    M("Claude Haiku 4.5", "anthropic", "claude-haiku", 120, 500000, 64000, "rtsvca", 1, 5, { cachedIn: 0.1, status: "ARCHIVED" }),
    M("Claude 3.7 Sonnet", "anthropic", "claude-sonnet", 420, 200000, 64000, "rtsvc", 3, 15, { status: "ARCHIVED" }),

    // ── Google ──────────────────────────────────────────────────────────────
    M("Gemini 3 Pro", "google", "gemini-3", 8, 1000000, 65536, "rtsvca", 2, 12, {
      cachedIn: 0.2, docsUrl: "https://ai.google.dev",
      benchmarks: [["MMMU", "77.2%"], ["AIME 2025", "92/100"]],
      compare: { knowledgeCutoff: "Early 2026" }, featured: true,
    }),
    M("Gemini 3 Flash", "google", "gemini-3", 16, 1000000, 65536, "rtsvca", 0.3, 2.5, {
      cachedIn: 0.03, status: "BETA",
      benchmarks: [["MMMU", "74.1%"]],
      compare: { knowledgeCutoff: "Late 2025" }, featured: true,
    }),
    M("Gemini 2.5 Pro", "google", "gemini-2.5", 130, 1000000, 65536, "rtsvca", 1.25, 10, {
      cachedIn: 0.3, status: "ARCHIVED",
    }),
    M("Gemini 2.5 Flash", "google", "gemini-2.5", 140, 1000000, 65536, "rtsvca", 0.3, 2.5, {
      cachedIn: 0.03, status: "ARCHIVED",
    }),
    M("Gemini 2.5 Flash-Lite", "google", "gemini-2.5", 200, 1000000, 8192, "tsvca", 0.1, 0.4, { status: "ARCHIVED" }),

    // ── Meta ────────────────────────────────────────────────────────────────
    M("Llama 4 Maverick", "meta", "llama-4", 240, 1000000, 128000, "rtsvc", 0.2, 0.6, {
      openSource: true, license: "Llama 4 Community License", docsUrl: "https://llama.com",
      benchmarks: [["MMLU-Pro", "79.6%"]], compare: { knowledgeCutoff: "Mid 2025" },
    }),
    M("Llama 4 Scout", "meta", "llama-4", 240, 10000000, 128000, "tsvc", 0.1, 0.3, {
      openSource: true, license: "Llama 4 Community License",
    }),
    M("Llama 3.3 70B", "meta", "llama-3", 400, 128000, 8192, "ts", 0.08, 0.2, {
      openSource: true, license: "Llama 3.1 Community License", status: "ARCHIVED",
    }),

    // ── xAI ─────────────────────────────────────────────────────────────────
    M("Grok 4.1", "xai", "grok-4", 70, 256000, 32768, "rtsvc", 3, 15, {
      docsUrl: "https://docs.x.ai", compare: { knowledgeCutoff: "Mid 2025" },
    }),
    M("Grok 4", "xai", "grok-4", 120, 256000, 32768, "rtsvc", 3, 15, { status: "ARCHIVED" }),
    M("Grok 4 fast", "xai", "grok-4", 55, 256000, 32768, "rtsvc", 0.5, 3, { status: "BETA" }),

    // ── DeepSeek ────────────────────────────────────────────────────────────
    M("DeepSeek-V3.2", "deepseek", "deepseek-v3", 18, 128000, 16384, "tsvc", 0.28, 0.42, {
      openSource: true, license: "MIT", docsUrl: "https://api-docs.deepseek.com",
      benchmarks: [["MMLU-Pro", "75.1%"], ["AIME 2025", "93/100"]],
      compare: { knowledgeCutoff: "Mid 2025" }, featured: true,
    }),
    M("DeepSeek-R1-0528", "deepseek", "deepseek-r1", 100, 128000, 16384, "rs", 0.55, 2.19, {
      openSource: true, license: "MIT",
    }),

    // ── Mistral ─────────────────────────────────────────────────────────────
    M("Mistral Large 3", "mistral", "mistral-large", 90, 256000, 128000, "rtsvc", 2, 6, {
      docsUrl: "https://docs.mistral.ai", compare: { knowledgeCutoff: "Mid 2025" },
    }),
    M("Mistral Small 3.2", "mistral", "mistral-small", 30, 128000, 32768, "rtsvc", 0.1, 0.3, {
      openSource: true, license: "Apache-2.0",
    }),
    M("Pixtral Large 2", "mistral", "pixtral", 75, 128000, 16384, "rtsvc", 2, 6, {
      openSource: true, license: "Apache-2.0",
    }),

    // ── Qwen (Alibaba) ──────────────────────────────────────────────────────
    M("Qwen3-Max", "alibaba", "qwen3", 40, 256000, 32768, "rtsvc", 1.2, 6, { status: "BETA" }),
    M("Qwen3-235B-A22B", "alibaba", "qwen3", 60, 256000, 32768, "rtsvc", 0.6, 1.5, {
      openSource: true, license: "Apache-2.0",
    }),

    // ── Cohere ──────────────────────────────────────────────────────────────
    M("Command A", "cohere", "command", 250, 256000, 64000, "tsv", 2.5, 10, {
      openSource: true, license: "CC-BY-NC-4.0",
    }),

    // ── Amazon ──────────────────────────────────────────────────────────────
    M("Amazon Nova Pro", "amazon", "nova", 300, 300000, 5120, "tsvc", 0.8, 3.2, {
      docsUrl: "https://docs.aws.amazon.com/nova",
    }),
    M("Amazon Nova Premier", "amazon", "nova", 90, 300000, 5120, "rtsvc", 0.8, 3.2, { status: "BETA" }),

    // ── Microsoft ───────────────────────────────────────────────────────────
    M("Phi-4", "microsoft", "phi", 240, 16000, 16384, "ts", 0.15, 0.15, {
      openSource: true, license: "MIT", status: "ARCHIVED",
    }),

    // ── IBM ─────────────────────────────────────────────────────────────────
    M("Granite 4.0 8B", "ibm", "granite", 150, 128000, 8192, "ts", 0.1, 0.1, {
      openSource: true, license: "Apache-2.0",
    }),

    // ── NVIDIA ──────────────────────────────────────────────────────────────
    M("Nemotron 4 340B", "nvidia", "nemotron", 500, 4096, 4096, "ts", 0.05, 0.05, {
      openSource: true, license: "NVIDIA Open Model License", status: "ARCHIVED",
    }),
    M("Llama-3.1-Nemotron-Nano-8B", "nvidia", "nemotron", 200, 128000, 8192, "ts", 0.05, 0.05, {
      openSource: true, license: "NVIDIA Open Model License",
    }),

    // ── Smaller open labs ───────────────────────────────────────────────────
    M("Zephyr 4.0", "huggingface", "zephyr", 45, 32768, 8192, "ts", 0, 0, {
      openSource: true, license: "Apache-2.0", status: "BETA",
    }),
    M("SmolLM3-3B", "huggingface", "smollm", 25, 16384, 8192, "ts", 0, 0, {
      openSource: true, license: "Apache-2.0",
    }),
  ];

  for (const m of rows) {
    if (!m.description) m.description = describe(m, companies);
  }
  return rows;
}
