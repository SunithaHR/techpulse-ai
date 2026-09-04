// Classification heuristics for fetched items: news kind, category, importance,
// tags, technology matching and dedupe/cluster keys.
import { slugify, truncate } from "@/lib/utils";
import { createHash } from "node:crypto";

export const CATEGORY_KEYWORDS: Array<{ key: string; words: string[] }> = [
  { key: "ai", words: ["ai", "artificial intelligence", "machine learning", "ml model", "neural", "deep learning", "agent", "copilot", "llm"] },
  { key: "llm", words: ["gpt", "claude", "gemini", "llama", "mistral", "deepseek", "qwen", "grok", "phi", "context window", "foundation model", "openai", "anthropic", "model release", "model card"] },
  { key: "security", words: ["cve", "vulnerab", "exploit", "ransomware", "breach", "advisory", "zero-day", "patch", "malware", "phishing", "security fix", "supply chain attack"] },
  { key: "cloud", words: ["aws", "azure", "gcp", "google cloud", "cloudflare", "kubernetes", "serverless", "lambda", "s3", "ec2", "azure ", "cloud"] },
  { key: "devops", words: ["docker", "kubernetes", "ci/cd", "devops", "terraform", "ansible", "github actions", "observability", "monitoring", "deploy", "infrastructure"] },
  { key: "db", words: ["database", "postgres", "mysql", "mongodb", "redis", "sql", "data warehouse", "vector database", "elasticsearch", "indexing"] },
  { key: "web", words: ["react", "next.js", "vue", "angular", "frontend", "css", "tailwind", "browser", "javascript", "typescript", "webgl", "web assembly"] },
  { key: "mobile", words: ["ios", "android", "swift", "kotlin", "react native", "flutter", "mobile", "app store", "sdk"] },
  { key: "os", words: ["linux", "kernel", "windows 1", "macos", "ubuntu", "debian", "operating system", "rust in linux"] },
  { key: "tools", words: ["developer tool", "ide", "editor", "cli", "debugger", "vscode", "jetbrains", "testing framework", "linter", "release of", "changelog"] },
  { key: "api", words: ["api", "sdk", "endpoint", "graphql", "rest", "rate limit", "webhook", "developer platform"] },
  { key: "research", words: ["paper", "arxiv", "research", "study", "benchmark", "sota", "state of the art", "publication", "preprint"] },
  { key: "opensource", words: ["open source", "open-source", "license", "github", "mit license", "apache license", "contributor", "oss"] },
  { key: "startups", words: ["funding", "series a", "series b", "seed round", "startup", "raised", "valuation", "y combinator"] },
  { key: "business", words: ["acquisition", "acquires", "acquired", "merger", "earnings", "revenue", "layoffs", "ipo", "stock"] },
  { key: "hardware", words: ["gpu", "chip", "cpu", "silicon", "semiconductor", "nvidia", "apple silicon", "tsmc", "processor"] },
];

export const IMPORTANCE_KEYWORDS: Array<{ level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; words: string[] }> = [
  { level: "CRITICAL", words: ["critical", "cve-", "zero-day", "exploit", "ransomware", "data breach", "emergency", "drops support", "deprecated", "breaking change"] },
  { level: "HIGH", words: ["major release", "releases", "launches", "announced", "acquisition", "funding", "acquires", "security", "vulnerability", "patch release", "next.js", "react 2", "new model", "general availability"] },
  { level: "MEDIUM", words: ["update", "improves", "adds", "introduces", "beta", "preview", "changelog", "fixes", "performance"] },
];

const KIND_KEYWORDS: Array<{ kind: string; words: string[] }> = [
  { kind: "SECURITY_ADVISORY", words: ["cve-", "advisory", "vulnerability", "security update", "exploit", "zero-day"] },
  { kind: "MODEL_RELEASE", words: ["gpt-", "claude ", "gemini ", "llama ", "mistral ", "deepseek", "qwen", "grok ", "model release", "frontier model"] },
  { kind: "TOOL_LAUNCH", words: ["launches", "launched", "announces", "introducing", "new tool", "beta launch"] },
  { kind: "RELEASE_ANNOUNCEMENT", words: ["releases", "release", "version", "changelog", "available now", "download"] },
  { kind: "RESEARCH_PAPER", words: ["paper", "arxiv", "research", "preprint", "study"] },
];

export function classifyTitle(title: string, text: string, sourceType: string) {
  const hay = `${title} ${text}`.toLowerCase();

  let categoryKey = "dev";
  let best = 0;
  for (const { key, words } of CATEGORY_KEYWORDS) {
    let score = 0;
    for (const w of words) if (hay.includes(w)) score++;
    if (score > best) {
      best = score;
      categoryKey = key;
    }
  }

  let importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
  for (const { level, words } of IMPORTANCE_KEYWORDS) {
    if (words.some((w) => hay.includes(w))) {
      importance = level;
      break;
    }
  }
  // Bump importance by source reliability.
  if (importance === "LOW" && sourceType !== "COMMUNITY") importance = "MEDIUM";

  let kind = "NEWS";
  for (const { kind: k, words } of KIND_KEYWORDS) {
    if (words.some((w) => hay.includes(w))) {
      kind = k;
      break;
    }
  }
  if (kind === "SECURITY_ADVISORY" && importance === "LOW") importance = "MEDIUM";

  const tags: string[] = [];
  if (hay.includes("release") || hay.includes("version")) tags.push("release");
  if (hay.includes("security") || hay.includes("cve")) tags.push("security");
  if (hay.includes("ai") || hay.includes("model")) tags.push("ai");
  if (hay.includes("open source") || hay.includes("github")) tags.push("open-source");

  return { categoryKey, importance, kind, tags };
}

export function makeSummary(content: string, max = 240): string {
  const plain = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return truncate(plain, max);
}

export function hashUrl(url: string): string {
  return createHash("sha1").update(url.trim().toLowerCase()).digest("hex");
}

export function hashContent(title: string, summary: string): string {
  return createHash("sha1").update(`${title.toLowerCase()}::${summary.slice(0, 200).toLowerCase()}`).digest("hex");
}

/** Normalize a title into a cluster key so same-event stories group together. */
export function clusterTitle(title: string): string {
  const normalized = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\b(the|a|an|of|for|and|on|in|with|to)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = normalized.split(" ").filter(Boolean);
  const core = words.slice(0, 6).join(" ");
  return `c:${createHash("sha1").update(core).digest("hex").slice(0, 16)}`;
}

export function cleanSlug(title: string): string {
  return `${slugify(title).slice(0, 90)}-${Date.now().toString(36)}`;
}