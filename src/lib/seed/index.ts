// ────────────────────────────────────────────────────────────────────────────
// TechPulse AI seed runner.
// Populates the knowledge base with an illustrative, internally consistent
// sample dataset: categories, sources, companies, technologies, releases with
// timeline coverage, AI models/tools, repositories, advisories, news clusters,
// demo users with personalization and sample chat history.
//
// IMPORTANT: this is DEMO/SAMPLE data for local development. It is generated
// deterministically relative to "now" — it is NOT live-fetched journalism.
// Production content is produced by the ingestion workers (scripts/ingest-cli).
// ────────────────────────────────────────────────────────────────────────────
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { slugify, mulberry32, pick, pickN, randInt, daysAgo } from "@/lib/utils";
import { hashPassword } from "@/lib/auth";
import {
  NEWS_CATEGORIES,
  DOMAIN_CATEGORIES,
  TOOL_CATEGORIES,
  NEWS_KIND,
  ENTITY_TYPE,
  type Importance,
} from "@/lib/constants";
import { COMPANIES, type CompanySeed } from "@/lib/seed/data/companies";
import { TECH_SEEDS, type TechSeed } from "@/lib/seed/data/technologies";
import { buildModels, type ModelSeed } from "@/lib/seed/data/models";
import { TOOL_SEEDS, type ToolSeed } from "@/lib/seed/data/tools";
import { STORIES, PAPERS, ADVISORIES, type StorySeed, type AdvisorySeed } from "@/lib/seed/data/events";
import { RELEASE_TRACKS } from "@/lib/seed/data/releaseTracks";

const j = (v: unknown): Prisma.InputJsonValue => JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;

// ── Source catalog (official blogs auto-derive from COMPANIES below) ────────
const MANUAL_SOURCES: { slug: string; name: string; type: string; reliability: number; url: string; homepage?: string; description?: string }[] = [
  { slug: "github-releases", name: "GitHub Releases", type: "GITHUB", reliability: 8, url: "https://github.com", description: "Release feeds from official repositories" },
  { slug: "arxiv", name: "arXiv", type: "RESEARCH", reliability: 7, url: "https://arxiv.org", description: "Preprint server for research papers" },
  { slug: "huggingface-blog", name: "Hugging Face Blog", type: "OFFICIAL_BLOG", reliability: 9, url: "https://huggingface.co/blog" },
  { slug: "anthropic-research", name: "Anthropic Research", type: "RESEARCH", reliability: 8, url: "https://anthropic.com/research" },
  { slug: "deepmind-blog", name: "Google DeepMind Blog", type: "OFFICIAL_BLOG", reliability: 9, url: "https://deepmind.google/blog" },
  { slug: "google-cloud-blog", name: "Google Cloud Blog", type: "OFFICIAL_BLOG", reliability: 9, url: "https://cloud.google.com/blog" },
  { slug: "the-verge", name: "The Verge", type: "PUBLICATION", reliability: 6, url: "https://theverge.com" },
  { slug: "techcrunch", name: "TechCrunch", type: "PUBLICATION", reliability: 6, url: "https://techcrunch.com" },
  { slug: "the-register", name: "The Register", type: "PUBLICATION", reliability: 6, url: "https://theregister.com" },
  { slug: "infoq", name: "InfoQ", type: "PUBLICATION", reliability: 6, url: "https://infoq.com" },
  { slug: "hacker-news", name: "Hacker News", type: "COMMUNITY", reliability: 4, url: "https://news.ycombinator.com" },
  { slug: "devto", name: "DEV Community", type: "COMMUNITY", reliability: 4, url: "https://dev.to" },
  { slug: "mozilla-hacks", name: "Mozilla Hacks", type: "OFFICIAL_BLOG", reliability: 8, url: "https://hacks.mozilla.org" },
  { slug: "webplatform-blog", name: "Web Platform Blog", type: "CHANGELOG", reliability: 7, url: "https://web.dev/blog" },
  { slug: "perplexity-blog", name: "Perplexity Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://perplexity.ai/blog" },
  { slug: "phoronix", name: "Phoronix", type: "PUBLICATION", reliability: 6, url: "https://phoronix.com" },
  { slug: "unity-blog", name: "Unity Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://unity.com/blog" },
  { slug: "godot-blog", name: "Godot Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://godotengine.org/news" },
  { slug: "cncf-blog", name: "CNCF Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://cncf.io/blog" },
  { slug: "kubernetes-blog", name: "Kubernetes Blog", type: "OFFICIAL_BLOG", reliability: 9, url: "https://kubernetes.io/blog" },
  { slug: "postgres-news", name: "PostgreSQL News", type: "OFFICIAL_BLOG", reliability: 9, url: "https://postgresql.org/about/news" },
  { slug: "react-blog", name: "React Blog", type: "OFFICIAL_BLOG", reliability: 9, url: "https://react.dev/blog" },
  { slug: "tailwind-blog", name: "Tailwind CSS Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://tailwindcss.com/blog" },
  { slug: "vite-blog", name: "Vite Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://vite.dev/blog" },
  { slug: "astro-blog", name: "Astro Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://astro.build/blog" },
  { slug: "eslint-blog", name: "ESLint Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://eslint.org/blog" },
  { slug: "ubuntu-blog", name: "Ubuntu Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://ubuntu.com/blog" },
  { slug: "flutter-blog", name: "Flutter Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://flutter.dev/blog" },
  { slug: "opentofu-blog", name: "OpenTofu Blog", type: "OFFICIAL_BLOG", reliability: 8, url: "https://opentofu.org/blog" },
  { slug: "rust-blog", name: "Rust Blog", type: "OFFICIAL_BLOG", reliability: 9, url: "https://blog.rust-lang.org" },
  { slug: "apple-news", name: "Apple Developer News", type: "OFFICIAL_BLOG", reliability: 9, url: "https://developer.apple.com/news" },
  { slug: "cisa", name: "CISA", type: "ADVISORY", reliability: 9, url: "https://cisa.gov", description: "US cybersecurity advisory agency" },
];

// Company blog aliases used by stories → resolved to `${slug}-blog` when the
// company has a blogUrl, otherwise to the manual source list.
const SOURCE_ALIASES: Record<string, string> = {
  "anthropic-news": "anthropic-blog",
  "mistral-news": "mistral-blog",
  "cohere-blog": "cohere-blog",
  "alibaba-blog": "alibaba-blog",
  "openai-blog": "openai-blog",
  "google-blog": "google-blog",
  "microsoft-blog": "microsoft-blog",
  "aws-news": "aws-blog",
  "nvidia-blog": "nvidia-blog",
  "cloudflare-blog": "cloudflare-blog",
  "vercel-blog": "vercel-blog",
  "github-blog": "github-blog",
  "docker-blog": "docker-blog",
  "supabase-blog": "supabase-blog",
  "cursor-blog": "cursor-blog",
  "replit-blog": "replit-blog",
  "perplexity-blog": "perplexity-blog",
};

const ADVISORY_SOURCE_SLUG = (tech: string) => `${slugify(tech)}-advisories`;

function sourceNameFor(slug: string): string {
  const c = COMPANIES.find((x) => x.slug === slug.replace("-blog", "")) ?? COMPANIES.find((x) => `${x.slug}-blog` === slug);
  return c ? `${c.name} Blog` : slug;
}

export async function runSeed(opts: { wipe?: boolean; quiet?: boolean } = {}): Promise<{ [k: string]: number }> {
  const wipe = opts.wipe ?? true;
  const log = (msg: string) => {
    if (!opts.quiet) console.log(`  · ${msg}`);
  };
  const counts: Record<string, number> = {};
  const rng = mulberry32(20260903);
  const NOW = new Date();

  const at = (daysBack: number, jitterSeed: number, hourMin = 8, hourMax = 20): Date => {
    const hour = hourMin + Math.floor(jitterSeed % (hourMax - hourMin));
    return daysAgo(daysBack, NOW, hour * 100 + ((jitterSeed * 37) % 60));
  };

  if (wipe) {
    log("wiping existing data…");
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.chat.deleteMany();
    await prisma.savedItem.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.newsCompany.deleteMany();
    await prisma.newsTechnology.deleteMany();
    await prisma.news.deleteMany();
    await prisma.release.deleteMany();
    await prisma.securityAdvisory.deleteMany();
    await prisma.aITool.deleteMany();
    await prisma.aIModel.deleteMany();
    await prisma.repository.deleteMany();
    await prisma.technology.deleteMany();
    await prisma.company.deleteMany();
    await prisma.sourceItem.deleteMany();
    await prisma.ingestionJob.deleteMany();
    await prisma.source.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  }

  // ── Categories ───────────────────────────────────────────────────────────
  const catNews = NEWS_CATEGORIES.map((c, i) => ({ key: c.key, type: "NEWS", name: c.name, emoji: c.emoji, color: c.color, description: c.description ?? "", sort: i }));
  const catDom = DOMAIN_CATEGORIES.map((c, i) => ({ key: c.key, type: "DOMAIN", name: c.name, emoji: c.emoji, color: c.color, description: "", sort: i }));
  const catTool = TOOL_CATEGORIES.map((c, i) => ({ key: c.key, type: "TOOL", name: c.name, emoji: c.emoji, color: c.color, description: "", sort: i }));
  await prisma.category.createMany({ data: [...catNews, ...catDom, ...catTool] });
  counts.categories = catNews.length + catDom.length + catTool.length;

  const catAll = await prisma.category.findMany();
  const catId = (key: string, type: string): string => catAll.find((c) => c.key === key && c.type === type)!.id;
  const NEWS_CAT = (key: string): string => catId(key, "NEWS");
  const DOMAIN_CAT = (key: string): string => catId(key, "DOMAIN");
  const TOOL_CAT = (key: string): string => catId(key, "TOOL");

  // ── Sources ──────────────────────────────────────────────────────────────
  const sourceRows = new Map<string, { slug: string; name: string; type: string; reliability: number; url: string }>();
  const putSource = (slug: string, name: string, type: string, reliability: number, url: string) => {
    if (!sourceRows.has(slug)) sourceRows.set(slug, { slug, name, type, reliability, url });
  };
  for (const s of MANUAL_SOURCES) putSource(s.slug, s.name, s.type, s.reliability, s.url);
  for (const c of COMPANIES) {
    if (c.blogUrl || c.website) {
      putSource(`${c.slug}-blog`, sourceNameFor(`${c.slug}-blog`), "OFFICIAL_BLOG", 9, c.blogUrl ?? `${c.website}/blog`);
    }
  }
  // advisory sources per affected tech
  for (const a of ADVISORIES) {
    const slug = ADVISORY_SOURCE_SLUG(a.tech ?? "software");
    const label = a.tech ?? "Software";
    putSource(slug, `${label} Security Advisories`, "ADVISORY", 9, `https://example.invalid/${slug}`);
  }
  putSource("techpulse", "TechPulse AI", "OFFICIAL_DOCS", 5, "https://techpulse.ai");
  for (const [slug, s] of sourceRows) {
    const alias = SOURCE_ALIASES[slug];
    const target = alias && sourceRows.has(alias) ? alias : slug;
    await prisma.source.upsert({
      where: { slug: target },
      update: { name: sourceRows.get(target)!.name, type: sourceRows.get(target)!.type, url: sourceRows.get(target)!.url },
      create: { slug: target, name: sourceRows.get(target)!.name, type: sourceRows.get(target)!.type, url: sourceRows.get(target)!.url, reliability: sourceRows.get(target)!.reliability, active: true },
    });
  }
  const sourceMap = new Map<string, string>();
  for (const s of await prisma.source.findMany()) sourceMap.set(s.slug, s.id);
  const SRC = (slug: string): string => sourceMap.get(SOURCE_ALIASES[slug] ?? slug) ?? sourceMap.get("techpulse")!;
  counts.sources = sourceRows.size;

  // ── Companies ────────────────────────────────────────────────────────────
  const companyMap = new Map<string, { id: string; name: string; website?: string | null; blogUrl?: string | null; githubOrg?: string | null; accent: string }>();
  for (const c of COMPANIES) {
    const row = await prisma.company.create({
      data: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        accent: c.accent,
        website: c.website,
        blogUrl: c.blogUrl,
        githubOrg: c.githubOrg,
        headquarters: c.hq,
        founded: c.founded,
        details: c.details ? j(c.details) : undefined,
        isFeatured: c.featured ?? false,
      },
      select: { id: true, name: true, website: true, blogUrl: true, githubOrg: true, accent: true },
    });
    companyMap.set(c.slug, row);
  }
  counts.companies = companyMap.size;

  // ── Technologies ─────────────────────────────────────────────────────────
  const TECH_COMPANY: Record<string, string> = {
    React: "meta", "React Native": "meta", PyTorch: "meta", "Next.js": "vercel", TypeScript: "microsoft", Playwright: "microsoft",
    Supabase: "supabase", Docker: "docker", Terraform: "hashicorp", Grafana: "grafana", Angular: "google", Flutter: "google", Go: "google",
    Deno: "deno", Bun: "bun", Svelte: "svelte", MongoDB: "mongodb", "Transformers": "huggingface", "Hugging Face Hub": "huggingface",
    "GitHub Actions": "github", "GitHub Copilot": "github", "NVIDIA CUDA": "nvidia", "Llama (model family)": "meta",
    "Claude (model family)": "anthropic", "GPT (model family)": "openai", "Gemini (model family)": "google",
    ".NET": "microsoft", "Microsoft Azure": "microsoft", AWS: "amazon", "AWS Lambda": "amazon", "Google Cloud": "google",
    Cloudflare: "cloudflare", Vercel: "vercel", Stripe: "stripe", Twilio: "twilio", Firebase: "google", "OpenAI API": "openai",
    "Anthropic API": "anthropic",
  };

  const techMap = new Map<string, { id: string; slug: string; name: string; kind: string; domain: string; github: string | null; accent: string; featured: boolean }>();
  const techBySlug = new Map<string, { id: string; slug: string; name: string }>();
  for (const t of TECH_SEEDS) {
    const row = await prisma.technology.create({
      data: {
        slug: t.slug,
        name: t.name,
        kind: t.kind,
        description: t.description,
        accent: t.accent ?? "#22d3ee",
        website: t.website,
        githubUrl: t.github ? `https://github.com/${t.github}` : undefined,
        license: t.license,
        stars: t.stars,
        isFeatured: t.featured ?? false,
        categoryId: DOMAIN_CAT(t.domain),
        companyId: TECH_COMPANY[t.name] ? companyMap.get(TECH_COMPANY[t.name])!.id : undefined,
      },
      select: { id: true, slug: true, name: true },
    });
    techMap.set(t.name, { ...row, kind: t.kind, domain: t.domain, github: t.github ?? null, accent: t.accent ?? "#22d3ee", featured: t.featured ?? false });
    techBySlug.set(t.slug, row);
  }
  counts.technologies = techMap.size;

  // ── AI models ────────────────────────────────────────────────────────────
  const modelBySlug = new Map<string, { id: string; slug: string; name: string; providerId: string }>();
  const allModels = buildModels([...COMPANIES]);
  const MOD_REL = (m: ModelSeed) => m.releasedDaysAgo;
  for (const m of allModels) {
    const provider = companyMap.get(m.provider);
    if (!provider) continue;
    const slug = slugify(m.name);
    const capabilities: Record<string, boolean> = {
      reasoning: m.caps.includes("r"), toolCalling: m.caps.includes("t"), structuredOutput: m.caps.includes("s"),
      vision: m.caps.includes("v"), audio: m.caps.includes("a"), code: m.caps.includes("c"), imageGeneration: m.caps.includes("i"), webSearch: m.caps.includes("w"),
    };
    const modalities = ["text", ...(m.caps.includes("v") ? ["image"] : []), ...(m.caps.includes("a") ? ["audio"] : [])];
    const pricing = m.priceIn != null ? { inputPerM: m.priceIn, outputPerM: m.priceOut ?? 0, cachedInputPerM: m.cachedIn ?? null, unit: "USD" } : null;
    const row = await prisma.aIModel.create({
      data: {
        slug, name: m.name, family: m.family, version: m.version, status: m.status, description: m.description ?? "",
        releasedOn: MOD_REL(m) >= 0 ? at(MOD_REL(m), Math.abs(MOD_REL(m)) * 7 + 3) : null,
        contextWindow: m.contextWindow, maxOutput: m.maxOutput, capabilities: j(capabilities), modalities: j(modalities),
        pricing: pricing ? j(pricing) : Prisma.DbNull, openSource: m.openSource ?? false, license: m.license, apiAvailable: true,
        benchmarks: m.benchmarks ? j(Object.fromEntries(m.benchmarks)) : j({}),
        docsUrl: m.docsUrl ?? provider.website, tags: j(["model"]), compare: m.compare ? j(m.compare) : j({}),
        isFeatured: m.featured ?? false, providerId: provider.id,
      },
      select: { id: true, slug: true, name: true, providerId: true },
    });
    modelBySlug.set(slug, row);
  }
  counts.models = modelBySlug.size;

  // ── AI tools ─────────────────────────────────────────────────────────────
  const toolBySlug = new Map<string, { id: string; slug: string; name: string }>();
  for (const t of TOOL_SEEDS) {
    const slug = slugify(t.name);
    const row = await prisma.aITool.create({
      data: {
        slug, name: t.name, description: t.description,
        pricingModel: t.pricingModel, priceLabel: t.priceLabel, apiAvailable: t.apiAvailable,
        launchDate: t.launchDaysAgo >= 0 ? at(t.launchDaysAgo, t.launchDaysAgo * 5 + 1) : null,
        latestUpdate: t.updateDaysAgo != null ? at(t.updateDaysAgo, t.updateDaysAgo * 3 + 2) : null,
        website: t.website, githubUrl: t.github ? `https://github.com/${t.github}` : undefined, stack: t.stack,
        features: j(t.features), useCases: j(t.useCases), competitors: j(t.competitors), tags: j(t.tags),
        status: t.status ?? "LIVE", isFeatured: t.featured ?? false,
        companyId: t.company ? companyMap.get(t.company)?.id : undefined,
        primaryCategoryId: TOOL_CAT(t.category),
      },
      select: { id: true, slug: true, name: true },
    });
    toolBySlug.set(slug, row);
  }
  counts.tools = toolBySlug.size;

  // ── Repositories (from technology catalog + companies) ────────────────────
  const repoByTech = new Map<string, string>();
  const repoByFull = new Map<string, { id: string; fullName: string }>();
  for (const t of TECH_SEEDS) {
    if (!t.github) continue;
    const fullName = t.github;
    const parts = fullName.split("/");
    const owner = parts[0] ?? fullName;
    const name = parts[1] ?? fullName;
    const base = t.stars ?? (t.featured ? randInt(rng, 30000, 140000) : randInt(rng, 800, 24000));
    const row = await prisma.repository.create({
      data: {
        fullName, owner, name,
        description: t.description, language: guessLanguage(t.kind, t.name),
        homepage: t.website, stars: base, forks: Math.round(base * randInt(rng, 5, 30) / 100),
        openIssues: randInt(rng, 20, 900), contributors: randInt(rng, 30, 2500),
        license: t.license, topics: j([t.domain, t.kind.toLowerCase()]), isFeatured: t.featured ?? false,
        technologyId: techMap.get(t.name)?.id,
      },
      select: { id: true, fullName: true },
    });
    repoByFull.set(fullName, row);
    repoByTech.set(t.name, fullName);
  }
  // extra org repos for big companies
  counts.repositories = repoByFull.size;

  // ── Releases + announcement news (flagship tracks) ───────────────────────
  const CLUSTER_IMPORTANCE = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 } as const;

  const decVersion = (v: string, kind: "minor" | "patch"): string => {
    const parts = v.split(".").map((x) => parseInt(x, 10) || 0);
    while (parts.length < 3) parts.push(0);
    if (kind === "minor") {
      if (parts[1] === 0) {
        if (parts[0] === 0) return v;
        parts[0] -= 1;
        parts[1] = 15;
      } else {
        parts[1] -= 1;
      }
      parts[2] = 0;
    } else {
      if (parts[2] > 0) {
        parts[2] -= 1;
      } else if (parts[1] > 0) {
        parts[1] -= 1;
        parts[2] = randInt(rng, 6, 9);
      } else {
        return v;
      }
    }
    return parts.join(".");
  };

  const BULLETS: Record<string, { feat: string[]; fix: string[]; perf: string[]; sec: string[]; breaking: string[]; migration: string[] }> = {
    web: {
      feat: ["Adds support for the new hydration improvements", "Introduces experimental server component features", "New dev-time error overlay with actionable hints", "Improves TypeScript inference for dynamic imports", "Adds opt-in runtime flag for the next-generation rendering path"],
      fix: ["Fixes a memory leak when unmounting large trees", "Fixes stale closures in concurrent mode edge cases", "Corrects CSS ordering when mixing global and scoped styles", "Fixes source maps for Turbopack builds"],
      perf: ["Cuts cold-start compile time by up to 22%", "Improves incremental cache hit rates", "Smaller production bundles via tree-shaking fixes", "Speeds up large-dependency resolution"],
      sec: ["Patches a cross-site scripting vector in HTML escaping", "Fixes a cache-poisoning edge case in the dev server", "Closes a prototype-pollution path in configuration parsing"],
      breaking: ["Removes APIs deprecated in the previous minor release", "Changes default behavior of the metadata API", "Node.js 20 is no longer supported"],
      migration: ["Run `npx codemod` to migrate renamed options", "Update TypeScript definitions for changed generics", "See the upgrade guide for breaking changes"],
    },
    lang: {
      feat: ["Adds new standard library conveniences", "Improves type checking performance on large codebases", "New debugging aids and diagnostics", "Better interop with the platform ecosystem"],
      fix: ["Fixes incorrect code generation for an edge case", "Fixes a race in the runtime scheduler", "Fixes flaky signals on some platforms"],
      perf: ["Faster startup and lower memory overhead", "Improves JIT warm-up behavior", "Speeds up string and array operations"],
      sec: ["Fixes a denial-of-service vector in request parsing", "Patches a memory-safety issue in the runtime", "Hardens certificate handling"],
      breaking: ["Drops support for older platform versions", "Tightens default lint rules", "Removes a deprecated standard module"],
      migration: ["Check the release notes for removed features", "Update CI images to the new toolchain version"],
    },
    data: {
      feat: ["New query planner optimizations", "Adds JSON path expression improvements", "Extended window function support", "Improved vector index performance", "New observability views for slow queries"],
      fix: ["Fixes a deadlock under heavy replication load", "Fixes vacuum progress reporting", "Corrects result ordering for parallel scans"],
      perf: ["Faster index scans for range predicates", "Reduces WAL amplification on bulk loads", "Improves hash join memory usage"],
      sec: ["Fixes a privilege-escalation vector in extensions", "Patches an integer overflow in a parsing path", "Fixes a replication information leak"],
      breaking: ["Removes a deprecated configuration parameter", "Changes default for a security-related setting", "Drops support for an old client protocol version"],
      migration: ["Review changed defaults before upgrading", "Run ANALYZE after upgrading for optimal plans"],
    },
    infra: {
      feat: ["Adds a new declarative configuration option", "Improves rollout safety for control-plane components", "New metrics for resource utilization", "Adds fine-grained role-based access control helpers"],
      fix: ["Fixes a race in leader election", "Fixes retry logic under transient network errors", "Corrects status reporting during rolling updates"],
      perf: ["Reduces API server latency for list operations", "Improves scheduler throughput", "Faster reconciliation for large clusters"],
      sec: ["Fixes an authentication bypass in the API", "Patches a credential handling issue", "Hardens default TLS configuration"],
      breaking: ["Removes deprecated API versions", "Changes default resource limits", "Updates the minimum supported runtime"],
      migration: ["Run the upgrade checker before applying", "Update manifests to the latest API versions"],
    },
    tool: {
      feat: ["New CLI command for workspace inspection", "Improved cache invalidation and sharing", "Adds watch mode enhancements", "Better config autocompletion"],
      fix: ["Fixes incremental builds after file moves", "Fixes encoding issues on Windows paths", "Corrects output when caching is disabled"],
      perf: ["Faster cold start for large projects", "Reduces memory usage during dependency resolution", "Optimizes parallel task scheduling"],
      sec: ["Fixes a command-injection vector in plugin hooks", "Patches a symlink traversal in archive handling", "Scans and updates bundled native binaries"],
      breaking: ["Requires a minimum runtime version", "Removes a legacy configuration flag", "Changes default output directory behavior"],
      migration: ["Run the automated migration command", "Update CI configuration for new defaults"],
    },
  };

  const domainPool = (domain: string): keyof typeof BULLETS => {
    switch (domain) {
      case "frontend":
      case "mobile":
      case "backend":
        return "web";
      case "ai-ml":
      case "lang":
      case "os":
        return "lang";
      case "data":
        return "data";
      case "devops":
      case "cloud":
      case "security":
      case "platforms":
      case "hardware":
        return "infra";
      default:
        return "tool";
    }
  };

  const makeBullets = (pool: (typeof BULLETS)[keyof typeof BULLETS], kind: string, need: number, sec = false): string[] => {
    const out: string[] = [];
    if (sec || kind === "SECURITY") {
      for (let i = 0; i < Math.min(2, pool.sec.length); i++) out.push(pool.sec[randInt(rng, 0, pool.sec.length - 1)]);
    }
    if (need > 0) {
      for (let i = 0; i < need; i++) {
        const list = pick(rng, [pool.feat, pool.perf, pool.fix]);
        out.push(pick(rng, list));
      }
    }
    return [...new Set(out)].slice(0, 6);
  };

  const linkTech = async (newsId: string, techNames: string[], primaryName?: string) => {
    for (const name of techNames) {
      const t = techMap.get(name);
      if (!t) continue;
      await prisma.newsTechnology.create({
        data: { newsId, technologyId: t.id, isPrimary: name === primaryName || (techNames.length === 1) },
      });
    }
  };
  const linkCompany = async (newsId: string, companySlug?: string) => {
    const c = companyMap.get(companySlug ?? "");
    if (!c) return;
    await prisma.newsCompany.create({ data: { newsId, companyId: c.id, isPrimary: true } });
  };

  // Track-level generation for flagship releases
  const analysisFor = (what: string, techName: string, imp: string) => {
    const why = imp === "HIGH" || imp === "CRITICAL"
      ? `${techName} is widely deployed; this update matters for most production stacks tracking the ecosystem.`
      : `A routine but useful update for teams on ${techName}.`;
    return {
      whatChanged: what,
      whyItMatters: why,
      whoAffected: `Developers and teams using ${techName}.`,
      whatToDo: "Review the release notes for migration steps before upgrading in production.",
    };
  };

  const summaryFrom = (changelog: { highlights: string[]; security: string[] }, blurb: string, sec: boolean): string =>
    sec && changelog.security.length ? `Security release: ${changelog.security[0]}` : blurb;

  for (const track of RELEASE_TRACKS) {
    const tech = techMap.get(track.name);
    if (!tech) continue;
    const poolKey = domainPool(tech.domain);
    const pool = BULLETS[poolKey];
    const count = Math.max(3, Math.min(9, Math.round(32 / track.cadenceDays) + 1));
    // deterministic offsets newest→oldest
    const offsets: number[] = [];
    let cur = trackIdxOffset(track.name);
    offsets.push(cur);
    for (let i = 1; i < count; i++) {
      cur += track.cadenceDays + randInt(rng, -1, 2);
      offsets.push(cur);
      if (cur > 40) break;
    }
    let version = track.current;
    const releases: { version: string; previous: string | null; kind: string; offset: number; sec: boolean }[] = [];
    const stepFor = (i: number): "minor" | "patch" => {
      if (track.style === "patch") return "patch";
      if (track.style === "minor") return "minor";
      return i % 2 === 0 ? "patch" : "minor";
    };
    for (let i = 0; i < offsets.length; i++) {
      releases.push({ version, previous: null, kind: "PATCH", offset: offsets[i], sec: false });
      version = decVersion(version, stepFor(i));
    }
    releases[0].kind = releases[0].version !== track.current ? "MINOR" : track.style === "minor" ? "MINOR" : "PATCH";
    // label kinds for steps (newest is MINOR only when style allows majors)
    const newestKind: string = track.style === "minor" ? "MINOR" : track.style === "mixed" ? "MINOR" : "PATCH";
    for (let i = 0; i < releases.length; i++) releases[i].kind = i === 0 ? newestKind : "PATCH";
    releases.forEach((r, i) => {
      if (i + 1 < releases.length) r.previous = releases[i + 1].version;
    });
    // sprinkle security releases
    for (let i = 1; i < releases.length; i += 2) {
      if (i % 3 === 0 && rng() < 0.4) releases[i].kind = "SECURITY";
    }
    const orderDesc = [...releases].sort((a, b) => b.offset - a.offset);
    for (const rel of orderDesc) {
      const sec = rel.kind === "SECURITY";
      const importance: Importance = sec ? "HIGH" : (track.releaseImportance as Importance) ?? (rel.kind === "MINOR" ? "HIGH" : "MEDIUM");
      const secBullets = makeBullets(pool, rel.kind, rel.kind === "MINOR" ? 3 : 2, sec);
      const changelog = {
        highlights: sec ? [] : makeBullets(pool, rel.kind, rel.kind === "MINOR" ? 3 : 2, false),
        breaking: rel.kind === "MINOR" && rng() < 0.4 ? pickN(rng, pool.breaking, 1) : [],
        fixes: sec ? [] : pickN(rng, pool.fix, 1),
        security: sec ? secBullets : [],
        performance: pickN(rng, pool.perf, rng() < 0.5 ? 1 : 0),
        migration: rel.kind === "MINOR" ? pickN(rng, pool.migration, 1) : [],
      };
      const released = at(rel.offset, rel.offset * 13 + 5);
      const summary = summaryFrom(changelog, track.blurb, sec);
      const relRow = await prisma.release.create({
        data: {
          version: rel.version,
          previousVersion: rel.previous,
          kind: rel.kind,
          summary,
          changelog: j(changelog),
          importance,
          announcedOn: released,
          notesUrl: tech.github ? `https://github.com/${tech.github}/releases/tag/${rel.version}` : undefined,
          technologyId: tech.id,
          companyId: TECH_COMPANY[track.name] ? companyMap.get(TECH_COMPANY[track.name])!.id : undefined,
        },
        select: { id: true },
      });
      counts.releases = (counts.releases ?? 0) + 1;

      // Announcement story for most releases (always for featured/major)
      const announce = importance === "HIGH" || importance === "CRITICAL" || (tech.featured && rng() < 0.75) || rel.offset <= 2;
      if (!announce) continue;
      const clusterKey = `rel-${tech.slug}-${rel.version}`;
      const what = changelog.highlights.slice(0, 3).join(" · ") || (sec ? changelog.security[0] : track.blurb);
      const sourceSlug = tech.github ? "github-releases" : "techpulse";
      const headline = sec
        ? `${track.name} ${rel.version} addresses a security issue`
        : `${track.name} ${rel.version} released`;
      const newsSlug = `${slugify(headline)}-${rel.version.replace(/\./g, "-")}-${rel.offset}`;
      const newsRow = await prisma.news.create({
        data: {
          slug: newsSlug,
          kind: sec ? NEWS_KIND.SECURITY_ADVISORY : NEWS_KIND.RELEASE_ANNOUNCEMENT,
          categoryId: sec ? NEWS_CAT("security") : NEWS_CAT("releases"),
          sourceId: SRC(sourceSlug),
          title: headline,
          summary,
          analysis: j(analysisFor(what, track.name, importance)),
          importance,
          tags: j([tech.slug, rel.version]),
          publishedAt: released,
          url: relRow.id ? `https://github.com/${tech.github}/releases` : tech.github ? `https://github.com/${tech.github}/releases/tag/${rel.version}` : undefined,
          engagement: randInt(rng, 20, rel.offset <= 1 ? 4200 : 900),
          clusterKey,
          isPrimary: true,
          releaseId: relRow.id,
        },
        select: { id: true },
      });
      await linkTech(newsRow.id, [track.name], track.name);
      await linkCompany(newsRow.id, TECH_COMPANY[track.name]);
      counts.news = (counts.news ?? 0) + 1;
      if (rel.offset <= 3 && importance !== "LOW") {
        // community coverage duplicate
        const covSource = pick(rng, ["devto", "infoq", "hacker-news"]);
        const cov = await prisma.news.create({
          data: {
            slug: `${tech.slug}-${rel.version}-coverage-${rel.offset}`,
            kind: NEWS_KIND.NEWS,
            categoryId: NEWS_CAT("releases"),
            sourceId: SRC(covSource),
            title: `Developer coverage: ${track.name} ${rel.version} overview`,
            summary: `The ${track.name} community rounds up what changed in ${rel.version}, including the highlights below.`,
            analysis: j({ whatChanged: what, whyItMatters: `Community discussion of ${track.name} ${rel.version}.`, whoAffected: `${track.name} developers.`, whatToDo: "" }),
            importance: rel.kind === "MINOR" ? "MEDIUM" : "LOW",
            tags: j([tech.slug]),
            publishedAt: new Date(released.getTime() + 2 * 3600_000),
            url: `https://${covSource}.com`,
            engagement: randInt(rng, 40, 300),
            clusterKey,
            isPrimary: false,
            releaseId: relRow.id,
          },
          select: { id: true },
        });
        await linkTech(cov.id, [track.name], track.name);
        counts.news = (counts.news ?? 0) + 1;
      }
    }
  }

  // ── Curated stories ──────────────────────────────────────────────────────
  const sourceUrlFor = (slug: string): string => sourceRows.get(slug)?.url ?? "https://techpulse.ai";
  const makeStory = async (st: StorySeed) => {
    const catKey = st.cat && NEWS_CATEGORIES.some((c) => c.key === st.cat) ? st.cat : "dev";
    const published = at(st.d, st.hour ?? st.d * 11 + 2, 7, 21);
    const srcSlug = st.source ?? "techpulse";
    const source = sourceRows.get(SOURCE_ALIASES[srcSlug] ?? srcSlug);
    const company = st.company ? companyMap.get(st.company) : undefined;
    const url = st.url ?? company?.blogUrl ?? company?.website ?? source?.url ?? "https://techpulse.ai";
    const imp = (["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).includes(st.imp as Importance) ? (st.imp as Importance) : "MEDIUM";
    const headline = st.title;
    const row = await prisma.news.create({
      data: {
        slug: `${slugify(headline).slice(0, 90)}-${published.getTime()}`,
        kind: st.kind ?? NEWS_KIND.NEWS,
        categoryId: NEWS_CAT(catKey),
        sourceId: SRC(srcSlug),
        title: headline,
        summary: st.summary,
        analysis: j({
          whatChanged: st.what ?? st.summary,
          whyItMatters: st.why ?? "",
          whoAffected: st.who ?? "",
          whatToDo: st.act ?? "",
        }),
        importance: imp,
        tags: j(st.tags ?? []),
        publishedAt: published,
        url,
        engagement: randInt(rng, 40, imp === "HIGH" || imp === "CRITICAL" ? 2600 : 500),
        clusterKey: st.kind === NEWS_KIND.RESEARCH_PAPER ? undefined : undefined,
      },
      select: { id: true },
    });
    if (st.techs?.length) await linkTech(row.id, st.techs, st.techs[0]);
    if (company) await linkCompany(row.id, st.company);
    counts.news = (counts.news ?? 0) + 1;
    return row;
  };

  for (const st of STORIES) await makeStory(st);
  for (const p of PAPERS) await makeStory(p);

  // ── Advisories (+ critical news coverage) ────────────────────────────────
  for (const a of ADVISORIES) {
    const tech = a.tech ? techMap.get(a.tech) : undefined;
    const srcSlug = ADVISORY_SOURCE_SLUG(a.tech ?? "software");
    const row = await prisma.securityAdvisory.create({
      data: {
        cveId: a.cve,
        title: a.title,
        description: a.description,
        severity: a.severity,
        cvssScore: a.cvss,
        affected: j([{ product: a.tech ?? "Software", versions: a.affected }]),
        fixedVersions: j([{ product: a.tech ?? "Software", versions: a.fixed }]),
        recommendation: a.recommendation,
        publishedAt: at(a.d, a.d * 7 + 4),
        advisoryUrl: a.source ? `https://example.invalid/advisory/${a.cve ?? a.title.toLowerCase().replace(/\s+/g, "-")}` : undefined,
        status: "ACTIVE",
        tags: j(a.tags ?? []),
        technologyId: tech?.id,
        sourceId: SRC(srcSlug),
      },
      select: { id: true },
    });
    counts.advisories = (counts.advisories ?? 0) + 1;
    if ((a.severity === "CRITICAL" || a.severity === "HIGH") && tech) {
      const n = await prisma.news.create({
        data: {
          slug: `${slugify(a.cve ?? a.title).slice(0, 80)}-adv`,
          kind: NEWS_KIND.SECURITY_ADVISORY,
          categoryId: NEWS_CAT("security"),
          sourceId: SRC(srcSlug),
          title: `${a.cve ?? a.title}`,
          summary: a.description,
          analysis: j({
            whatChanged: a.description,
            whyItMatters: `A ${a.severity.toLowerCase()} severity issue affects ${a.tech}.`,
            whoAffected: a.affected,
            whatToDo: a.recommendation ?? "Upgrade to the fixed version.",
          }),
          importance: a.severity === "CRITICAL" ? "CRITICAL" : "HIGH",
          tags: j(a.tags ?? []),
          publishedAt: at(a.d, a.d * 7 + 5),
          url: `https://example.invalid/advisory/${a.cve}`,
          engagement: randInt(rng, 300, 3000),
        },
        select: { id: true },
      });
      await linkTech(n.id, [a.tech!], a.tech!);
      counts.news = (counts.news ?? 0) + 1;
    }
  }

  // ── Day filler: guarantee a baseline of content for every recent day ─────
  const existing = await prisma.news.findMany({ select: { publishedAt: true } });
  const perDay = new Map<string, number>();
  for (const n of existing) {
    const k = n.publishedAt.toISOString().slice(0, 10);
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }
  const FILLER_TEMPLATES: { cat: string; title: (tech: string) => string; summary: string }[] = [
    { cat: "opensource", title: (t) => `${t} project publishes a community patch release`, summary: "A small maintenance update lands with fixes contributed by community maintainers." },
    { cat: "dev", title: (t) => `Engineering teams share migration notes for ${t}`, summary: "Practitioners post write-ups about upgrading production workloads to the latest stable line." },
    { cat: "tools", title: (t) => `${t} adds a point update with usability fixes`, summary: "A routine update focuses on stability, documentation and developer experience improvements." },
    { cat: "opensource", title: (t) => `${t} reaches a contributor milestone`, summary: "The project crosses another contributor milestone as its community keeps growing." },
    { cat: "dev", title: (t) => `Weekly roundup: what developers are saying about ${t}`, summary: "Curated links and discussions from around the developer community this week." },
    { cat: "api", title: (t) => `${t} API changelog highlights`, summary: "New parameters, deprecation notices and behavior changes from the latest API updates." },
  ];
  const fillerTechs = TECH_SEEDS.filter((t) => !RELEASE_TRACKS.some((r) => r.name === t.name)).slice(0, 60);
  for (let d = 1; d <= 34; d++) {
    const key = new Date(at(d, d)).toISOString().slice(0, 10);
    let need = 3 - (perDay.get(key) ?? 0);
    if (need <= 0) continue;
    for (let i = 0; i < need; i++) {
      const tech = fillerTechs[(d * 7 + i * 13) % fillerTechs.length];
      if (!tech) break;
      const tpl = FILLER_TEMPLATES[(d + i) % FILLER_TEMPLATES.length];
      const published = at(d, d * 3 + i * 5, 7, 19);
      const row = await prisma.news.create({
        data: {
          slug: `filler-${tech.slug}-${d}-${i}`,
          kind: NEWS_KIND.NEWS,
          categoryId: NEWS_CAT(tpl.cat),
          sourceId: SRC(pick(rng, ["devto", "hacker-news", "infoq"])),
          title: tpl.title(tech.name),
          summary: tpl.summary,
          analysis: j({ whatChanged: "", whyItMatters: "", whoAffected: "", whatToDo: "" }),
          importance: i === 0 ? "MEDIUM" : "LOW",
          tags: j([tech.slug]),
          publishedAt: published,
          url: "https://techpulse.ai",
          engagement: randInt(rng, 5, 120),
        },
        select: { id: true },
      });
      await linkTech(row.id, [tech.name], tech.name);
      counts.news = (counts.news ?? 0) + 1;
    }
  }

  // ── Users ────────────────────────────────────────────────────────────────
  const demoPrefs = {
    dashboardCategories: ["ai", "llm", "dev", "web", "cloud", "devops", "security", "tools", "db", "releases", "research", "opensource"],
    notifPrefs: { releases: true, security: true, aiModels: true, breakingChanges: true, majorAnnouncements: true, ecosystem: true },
    digest: { enabled: true, time: "08:00", scope: "DAILY" },
  };
  const adminPrefs = { dashboardCategories: [], notifPrefs: {}, digest: { enabled: false, time: "08:00", scope: "OFF" } };

  const demoPw = await hashPassword("demo1234");
  const adminPw = await hashPassword("admin1234");
  const demo = await prisma.user.create({
    data: {
      name: "Alex Rivera", email: "demo@techpulse.dev", passwordHash: demoPw, role: "USER",
      headline: "Staff Engineer · Platform", bio: "Tracking AI infra, TypeScript and Postgres.",
      prefs: j(demoPrefs),
    },
    select: { id: true },
  });
  await prisma.user.create({
    data: {
      name: "TechPulse Admin", email: "admin@techpulse.dev", passwordHash: adminPw, role: "ADMIN", prefs: j(adminPrefs),
    },
  });

  const followTechs = ["Next.js", "React", "Node.js", "Python", "PostgreSQL", "Docker", "Kubernetes", "TypeScript", "FastAPI"];
  const followCompanies = ["openai", "anthropic", "google", "aws", "vercel", "github"];
  for (const name of followTechs) {
    const t = techMap.get(name);
    if (!t) continue;
    await prisma.follow.create({
      data: { userId: demo.id, entityType: ENTITY_TYPE.TECHNOLOGY, entityId: t.slug, label: t.name },
    });
  }
  for (const slug of followCompanies) {
    const c = companyMap.get(slug);
    if (!c) continue;
    await prisma.follow.create({
      data: { userId: demo.id, entityType: ENTITY_TYPE.COMPANY, entityId: slug, label: c.name },
    });
  }
  for (const m of ["GPT-5.2", "Claude Opus 4.6", "Gemini 3 Pro"]) {
    const mm = allModels.find((x) => x.name === m);
    if (!mm) continue;
    await prisma.follow.create({
      data: { userId: demo.id, entityType: ENTITY_TYPE.AIMODEL, entityId: slugify(mm.name), label: mm.name },
    });
  }
  await prisma.follow.create({
    data: { userId: demo.id, entityType: ENTITY_TYPE.TOPIC, entityId: "AI agents", label: "AI agents" },
  });

  // saved items
  const latestNews = await prisma.news.findFirst({ where: { importance: "HIGH", isPrimary: true }, orderBy: { publishedAt: "desc" }, select: { id: true } });
  if (latestNews) {
    await prisma.savedItem.create({ data: { userId: demo.id, entityType: ENTITY_TYPE.NEWS, entityId: latestNews.id } });
  }
  const latestRel = await prisma.release.findFirst({ orderBy: { announcedOn: "desc" }, select: { id: true } });
  if (latestRel) {
    await prisma.savedItem.create({ data: { userId: demo.id, entityType: ENTITY_TYPE.RELEASE, entityId: latestRel.id } });
  }
  const savedModel = modelBySlug.get("claude-opus-4-6") ?? modelBySlug.values().next().value;
  if (savedModel) {
    await prisma.savedItem.create({ data: { userId: demo.id, entityType: ENTITY_TYPE.AIMODEL, entityId: savedModel.slug } });
  }

  // chat history sample
  const chat1 = await prisma.chat.create({
    data: { userId: demo.id, title: "What's new in Next.js?", meta: j({ lastSubject: "Next.js", lastKind: "TECHNOLOGY" }) },
  });
  await prisma.message.createMany({
    data: [
      { chatId: chat1.id, role: "USER", content: "What's new in Next.js recently?" },
      { chatId: chat1.id, role: "ASSISTANT", content: "Here are the latest Next.js updates I track:\n\n- **Next.js 16.3.2** — static exports and Turbopack stability fixes (see release notes).\n- **Next.js 16.3.0** — minor release with new features.\n\nWant me to check which changes affect your existing application?" },
    ],
  });
  const chat2 = await prisma.chat.create({
    data: { userId: demo.id, title: "Digest for today", meta: j({}) },
  });
  await prisma.message.createMany({
    data: [
      { chatId: chat2.id, role: "USER", content: "Give me today's tech digest" },
      { chatId: chat2.id, role: "ASSISTANT", content: "**Top of today:**\n1. Claude Opus 4.6 with agentic improvements.\n2. GPT-5.2 rolling out.\n3. OpenSSL & Next.js security advisories.\n\nAsk me for the full digest with sources." },
    ],
  });

  // ── Demo notifications ────────────────────────────────────────────────────
  const todayNews = await prisma.news.findMany({
    where: { publishedAt: { gte: daysAgo(0, NOW, 0) }, isPrimary: true },
    orderBy: { importance: "asc" },
    take: 6,
    select: { id: true, title: true, importance: true, kind: true },
  });
  const notifDefs: { kind: string; importance: string; title: string; body?: string }[] = [
    { kind: "MODEL", importance: "HIGH", title: "New flagship model: Claude Opus 4.6", body: "Anthropic released Claude Opus 4.6 with stronger agentic tool use." },
    { kind: "RELEASE", importance: "HIGH", title: "Next.js 16.3.2 released", body: "Static exports and Turbopack fixes." },
    { kind: "SECURITY", importance: "CRITICAL", title: "Critical: Next.js cache poisoning advisory", body: "Upgrade to 16.2.1+ if you use middleware rewrites." },
  ];
  for (const n of todayNews) {
    notifDefs.push({ kind: "SYSTEM", importance: n.importance, title: n.title });
  }
  for (const [i, n] of notifDefs.entries()) {
    await prisma.notification.create({
      data: {
        userId: demo.id,
        kind: n.kind,
        importance: n.importance,
        title: n.title,
        body: n.body ?? null,
        fingerprint: `seed-demo-${i}`,
        createdAt: new Date(NOW.getTime() - i * 40 * 60_000),
      },
    });
  }

  // repo latest releases
  const techRepos = await prisma.release.groupBy({ by: ["technologyId"], _max: { announcedOn: true } });
  for (const g of techRepos) {
    const tech = techMapBy(techMap, g.technologyId);
    if (!tech) continue;
    const rel = await prisma.release.findFirst({ where: { technologyId: g.technologyId }, orderBy: { announcedOn: "desc" } });
    const fullName = repoByTech.get(tech.name);
    if (!rel || !fullName) continue;
    const repo = repoByFull.get(fullName);
    if (!repo) continue;
    await prisma.repository.update({
      where: { id: repo.id },
      data: { latestRelease: j({ tag: rel.version, name: `${tech.name} ${rel.version}`, date: rel.announcedOn.toISOString(), importance: rel.importance }) },
    });
  }

  // ── ingestion job trail ───────────────────────────────────────────────────
  await prisma.ingestionJob.create({
    data: {
      kind: "SEED", status: "DONE", startedAt: new Date(NOW.getTime() - 100_000), finishedAt: NOW,
      itemsFound: counts.news ?? 0, itemsAdded: counts.news ?? 0, itemsSkipped: 0,
      log: j([{ at: NOW.toISOString(), msg: `Seed completed: ${JSON.stringify(counts)}` }]),
    },
  });

  log(`done: ${JSON.stringify(counts)}`);
  return counts;
}

// techBySlug uses slugs; this resolves by id
function techMapBy(map: Map<string, { id: string }>, id: string): { name: string; id: string } | undefined {
  for (const [name, v] of map) if (v.id === id) return { name, id };
  return undefined;
}

function guessLanguage(kind: string, name: string): string {
  if (name === "Python") return "Python";
  if (["Go", "Docker", "Kubernetes", "Terraform", "Helm"].includes(name)) return "Go";
  if (["Rust", "Bun", "Deno", "Turbopack"].includes(name)) return "Rust";
  if (["React", "Next.js", "Vue", "Svelte", "TypeScript", "Node.js", "Vite", "ESLint", "Tailwind CSS", "shadcn/ui", "Prisma", "Zod", "tRPC", "Fastify", "NestJS", "Hono", "Vitest", "Storybook", "Playwright"].includes(name)) return "TypeScript";
  if (["PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Elasticsearch", "ClickHouse", "DuckDB"].includes(name)) return "C";
  if (["Angular", "Flutter", "React Native", "Django", "Flask", "FastAPI"].includes(name)) return name === "Django" || name === "Flask" || name === "FastAPI" ? "Python" : "TypeScript";
  if (kind === "OS") return "C";
  return "TypeScript";
}

/** Deterministic newest-release offset (0..2) per track name. */
function trackIdxOffset(name: string): number {
  const sum = [...name].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return sum % 3;
}
