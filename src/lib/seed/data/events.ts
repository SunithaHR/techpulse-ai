// Curated "story" seed events — headline-level updates for AI labs, tool
// launches, cloud providers, research papers, security and tech business.
// Releases for tracked technologies are generated separately (releaseTracks).
// All content is illustrative sample data for local development.

export interface StorySeed {
  d: number; // days ago (0 = today)
  hour?: number;
  cat: string; // NEWS_CATEGORIES key
  kind?: string; // NEWS_KIND
  imp: string;
  title: string;
  summary: string;
  techs?: string[]; // Technology names (catalog)
  company?: string; // Company slug
  source?: string; // Source slug
  tags?: string[];
  what?: string;
  why?: string;
  who?: string;
  act?: string;
  url?: string;
}

const S = (
  d: number,
  cat: string,
  imp: string,
  title: string,
  summary: string,
  opts: Partial<Omit<StorySeed, "d" | "cat" | "imp" | "title" | "summary">> = {},
): StorySeed => ({ d, cat, imp, title, summary, ...opts });

export const STORIES: StorySeed[] = [
  // ── Model releases & LLM news ────────────────────────────────────────────
  S(0, "llm", "HIGH", "Anthropic ships Claude Opus 4.6 with a sharper coding long-horizon agent mode",
    "The new flagship improves agent reliability on multi-hour tasks and upgrades the tool-use loop used by Claude Code.", {
    company: "anthropic", techs: ["Claude (model family)"], source: "anthropic-news", tags: ["claude", "agents", "flagship"],
    what: "Claude Opus 4.6 is now available on the API and in Claude apps, with improvements to instruction following, agentic tool use and long-context recall.", why: "Frontier labs keep raising the bar for agentic coding; Opus 4.6 targets multi-step engineering workflows.", who: "Teams building on the Claude API or using Claude Code.", act: "Evaluate against your eval suite before switching; the API is drop-in for Opus 4.5.",
  }),
  S(0, "llm", "HIGH", "OpenAI begins rolling out GPT-5.2 to ChatGPT and the API",
    "GPT-5.2 lands as a beta with gains in real-time reasoning, image understanding and agent tool orchestration.", {
    company: "openai", techs: ["GPT (model family)"], source: "openai-blog", tags: ["gpt", "api"],
    what: "ChatGPT Plus/Pro users get GPT-5.2 gradually; API access starts today for tier 4+ developers.", why: "The update targets agent-heavy workloads with better multi-step planning and cheaper cached tool outputs.", who: "ChatGPT users and API developers.", act: "Watch the model dropdown; pin a prior model if your pipeline needs stability.",
  }),
  S(1, "llm", "HIGH", "Google releases Gemini 3 Pro widely after record deep-research signups",
    "Gemini 3 Pro exits preview for all users with agentic search, bigger file uploads and multimodal code execution.", {
    company: "google", techs: ["Gemini (model family)"], source: "google-blog", tags: ["gemini", "agents"],
    what: "Google removed the waitlist for Gemini 3 Pro in the consumer app and opened it on the API.", why: "Deep Research usage tripled during preview, pushing Google to scale serving capacity.", who: "Gemini users and Vertex AI customers.", act: "Re-run existing eval prompts; Gemini 3 Pro changes formatting on structured outputs.",
  }),
  S(2, "llm", "MEDIUM", "Mistral's open-weights Small 3.2 hits 128K context on consumer hardware",
    "The Apache-2.0 model runs locally at ~50 tok/s on a MacBook Pro and improves tool calling.", {
    company: "mistral", source: "mistral-news", tags: ["open-weights"], techs: [],
  }),
  S(3, "llm", "MEDIUM", "DeepSeek open-sources the R1 reasoning distill recipes used in V3.2",
    "DeepSeek publishes the full distillation pipeline and eval harness behind its hybrid reasoning model.", {
    company: "deepseek", source: "huggingface-blog", tags: ["open-weights", "reasoning"],
  }),
  S(4, "llm", "MEDIUM", "Qwen3-Max debuts with 1M-token native context via Alibaba Cloud",
    "Alibaba launches Qwen3-Max on the Tongyi platform; weights for the open 235B variant refreshed.", {
    company: "alibaba", source: "alibaba-blog", tags: ["open-weights"],
  }),
  S(6, "llm", "MEDIUM", "Amazon Nova Premier reaches GA on Bedrock for enterprise agents",
    "Nova Premier becomes generally available with streaming tool calls and lower price-per-task than preview.", {
    company: "amazon", techs: ["AWS"], source: "aws-news", tags: ["aws", "enterprise"],
  }),
  S(7, "llm", "MEDIUM", "Cohere releases Command A fine-tuning recipes for retrieval-heavy RAG",
    "New LoRA recipes cut hallucination on long-context retrieval benchmarks by ~40% in Cohere's tests.", {
    company: "cohere", source: "cohere-blog", tags: ["rag"],
  }),
  S(8, "research", "HIGH", "New Anthropic paper: sub-agent routing cuts cost per solved coding task by 37%",
    "Anthropic researchers publish a routing study for hierarchical coding agents with a public eval harness.", {
    company: "anthropic", source: "anthropic-research", tags: ["agents", "paper"], kind: "RESEARCH_PAPER",
    what: "The paper evaluates when single-agent vs. sub-agent topologies win on SWE-bench-style tasks.", why: "Agent architecture choices materially change cost and latency at scale.", who: "Teams building production agent systems.", act: "Read the routing heuristics before scaling parallel agents.",
  }),
  S(9, "research", "MEDIUM", "DeepMind's AlphaProof team publishes a verifier-driven RL update",
    "The update trains reasoning models with step-wise verifiers instead of outcome rewards on math tasks.", {
    company: "deepmind", source: "deepmind-blog", kind: "RESEARCH_PAPER", tags: ["rl", "math"],
  }),
  S(10, "llm", "MEDIUM", "OpenAI quietly retires GPT-4.1 from new API signups",
    "GPT-4.1 moves to archived status; GPT-5 series and fine-tuned legacy models remain available.", {
    company: "openai", source: "openai-blog", tags: ["api", "deprecation"],
    act: "Migrate pinned GPT-4.1 workloads to GPT-5 mini with identical prompts where possible.",
  }),

  // ── Tool launches & updates ──────────────────────────────────────────────
  S(0, "tools", "HIGH", "Claude Code adds parallel subagents with shared checkpoints",
    "Anthropic's terminal agent now runs multiple subagents concurrently and merges their edits safely.", {
    company: "anthropic", source: "anthropic-news", techs: [], tags: ["claude-code", "agents"],
    what: "Claude Code 2.x introduces a subagent pool, project checkpoints and merge conflict detection.", why: "Parallel agentic work is the biggest productivity unlock for AI coding tools this year.", who: "Claude Code users on Pro/Max plans.", act: "Try /agents with a review task to see the merge flow.",
  }),
  S(1, "tools", "HIGH", "Codex CLI goes GA with cloud sandboxes and parallel tasks",
    "OpenAI graduates Codex from beta: cloud sandboxes, GitHub Actions integration and cheaper bulk mode.", {
    company: "openai", source: "openai-blog", tags: ["codex", "agents"],
  }),
  S(1, "tools", "MEDIUM", "Gemini CLI adds multi-model routing and a debugger integration",
    "Google's open terminal agent can now route requests across Gemini, Claude and local models.", {
    company: "google", source: "google-blog", tags: ["cli"],
  }),
  S(2, "tools", "MEDIUM", "v0 launches 'v0 Studio' for multi-page product design sessions",
    "Vercel's AI UI tool now keeps design context across pages with reusable component libraries.", {
    company: "vercel", source: "vercel-blog", tags: ["ui", "frontend"],
  }),
  S(3, "tools", "MEDIUM", "Cursor ships background agents that review every PR in your repo",
    "Cursor 2.0 adds repo-wide background agents, expandable context and a codebase memory index.", {
    company: "cursor", source: "cursor-blog", tags: ["editor"],
  }),
  S(4, "tools", "MEDIUM", "GitHub Copilot agent mode rolls out to all VS Code users",
    "Agent mode leaves preview: plan-and-execute loops, automatic test runs and multi-file edits.", {
    company: "github", source: "github-blog", tags: ["copilot"],
  }),
  S(5, "tools", "MEDIUM", "Replit Agent 3.0 rebuilds apps from design screenshots",
    "Replit's agent accepts Figma exports and screenshots as first-class input with pixel-level layouts.", {
    company: "replit", source: "replit-blog", tags: ["app-builder"],
  }),
  S(6, "tools", "MEDIUM", "Windsurf merges Cascade into a single agentic canvas",
    "The Cascade flow now spans editor, terminal and browser automation in one session.", {
    source: "devto", tags: ["editor"],
  }),
  S(8, "tools", "MEDIUM", "Manus opens its API to developers",
    "The autonomous agent platform exposes the Manus API with session replay and telemetry.", {
    source: "techcrunch", tags: ["agents", "api"],
  }),
  S(10, "tools", "MEDIUM", "Perplexity ships Sonar 2.5 with live-code execution in answers",
    "The answer engine can now run generated code snippets in sandboxes before citing results.", {
    source: "perplexity-blog", tags: ["search"],
  }),

  // ── Company & business news ──────────────────────────────────────────────
  S(0, "ai", "HIGH", "OpenAI signs a multi-year enterprise deal with a Fortune-100 bank",
    "The agreement covers ChatGPT Enterprise seats plus dedicated capacity for agent workloads.", {
    company: "openai", source: "techcrunch", tags: ["enterprise"],
  }),
  S(1, "business", "HIGH", "NVIDIA reports record data-center revenue as AI capex keeps climbing",
    "Data-center revenue beat estimates again; Blackwell Ultra ramp is ahead of schedule.", {
    company: "nvidia", source: "the-verge", tags: ["earnings", "gpus"],
  }),
  S(2, "startups", "HIGH", "Agentic QA startup raises $120M Series B",
    "The company's AI testing agents run visual regression at feature-request speed across 300 customers.", {
    source: "techcrunch", tags: ["funding"],
  }),
  S(3, "business", "MEDIUM", "Google reorganizes DeepMind and Cloud AI into one P&L",
    "DeepMind research now reports alongside Vertex AI, focusing all model work into one team.", {
    company: "google", source: "the-verge", tags: ["reorg"],
  }),
  S(4, "startups", "MEDIUM", "Anthropic opens its first Tokyo office for Claude adoption in Asia",
    "Anthropic expands APAC operations after strong Claude Code growth among Japanese enterprises.", {
    company: "anthropic", source: "anthropic-news", tags: ["expansion"],
  }),
  S(5, "business", "MEDIUM", "Vercel reports $400M ARR on the back of v0 enterprise adoption",
    "Vercel says AI-assisted UI work now drives a third of new customer starts.", {
    company: "vercel", source: "techcrunch", tags: ["arr"],
  }),
  S(6, "business", "MEDIUM", "Apple and Meta hold fresh talks over AI model licensing",
    "Apple explores a second model provider beyond OpenAI for on-device intelligence in iOS.", {
    company: "apple", source: "the-verge", tags: ["apple-intelligence"],
  }),
  S(7, "startups", "MEDIUM", "Vector database upstart raises $90M to take on hosted search incumbents",
    "The round funds hybrid search and real-time ingestion features.", {
    source: "techcrunch", tags: ["funding"],
  }),
  S(8, "business", "MEDIUM", "AWS lowers Lambda cold-start latency with new runtime tier",
    "AWS previews a faster Lambda runtime for Node.js and Python with sub-100ms cold starts.", {
    company: "amazon", techs: ["AWS", "AWS Lambda"], source: "aws-news", tags: ["serverless"],
  }),
  S(9, "startups", "MEDIUM", "European coding-assistant startup raises $45M seed for open models",
    "The Paris-based team targets on-prem deployments of its open-weights coding models.", {
    source: "techcrunch", tags: ["funding", "open-weights"],
  }),
  S(11, "business", "MEDIUM", "Mistral passes 1M developers on La Plateforme",
    "Mistral credits Le Chat free tier and SDK improvements for the milestone.", {
    company: "mistral", source: "mistral-news", tags: ["platform"],
  }),
  S(12, "business", "MEDIUM", "GitHub blocks 90M malicious AI-written spam PRs in one quarter",
    "GitHub's automated abuse detection now targets the wave of LLM-generated spam contributions.", {
    company: "github", source: "github-blog", tags: ["abuse"],
  }),

  // ── Cloud provider updates ───────────────────────────────────────────────
  S(0, "cloud", "MEDIUM", "AWS announces Aurora PostgreSQL 18 support and zero-ETL GA for Bedrock",
    "Aurora gains PG18 compatibility while zero-ETL integration with Amazon Bedrock reaches GA.", {
    company: "amazon", techs: ["AWS", "PostgreSQL"], source: "aws-news", tags: ["aurora", "database"],
  }),
  S(1, "cloud", "MEDIUM", "Azure upgrades AKS with node autoscaling v2 and faster cluster start",
    "Azure Kubernetes Service previews API-driven node pools and 40% faster control plane restore.", {
    company: "microsoft", techs: ["Microsoft Azure", "Kubernetes"], source: "microsoft-blog", tags: ["aks"],
  }),
  S(2, "cloud", "MEDIUM", "Google Cloud commits to carbon-aware scheduling for GKE",
    "GKE workloads can now be scheduled when regional grids are cleanest, at no extra cost.", {
    company: "google", techs: ["Google Cloud", "Kubernetes"], source: "google-cloud-blog", tags: ["sustainability"],
  }),
  S(3, "cloud", "MEDIUM", "Cloudflare launches Workers AI 2.0 with multi-provider routing",
    "Workers AI 2.0 routes inference across GPU providers by price and latency per region.", {
    company: "cloudflare", source: "cloudflare-blog", tags: ["workers", "inference"],
  }),
  S(4, "cloud", "MEDIUM", "Cloudflare R2 adds immutable versioning and event notifications",
    "R2 object storage GA's versioning with retention policies and webhook event delivery.", {
    company: "cloudflare", source: "cloudflare-blog", tags: ["storage"],
  }),
  S(6, "cloud", "MEDIUM", "Fly.io and Railway announce deeper GPU partnerships",
    "Fly.io adds H100 capacity; Railway ships one-command GPU deploys for fine-tuning jobs.", {
    source: "devto", tags: ["gpu", "deploy"],
  }),
  S(9, "cloud", "MEDIUM", "Vercel Edge Runtime reaches 300 cities for AI streaming responses",
    "Vercel expands its edge network to cut AI stream latency, adding nine new regions.", {
    company: "vercel", source: "vercel-blog", tags: ["edge"],
  }),

  // ── Developer ecosystem ───────────────────────────────────────────────────
  S(0, "web", "MEDIUM", "The WebAssembly tail-call proposal ships in all major browsers",
    "Tail calls land in stable releases of Chrome, Firefox and Safari — unblocking functional compilers on the web.", {
    techs: ["JavaScript"], source: "mozilla-hacks", tags: ["wasm"],
  }),
  S(1, "devops", "HIGH", "Kubernetes 1.35 removes beta APIs deprecated in 1.33",
    "Several legacy APIs are removed; cluster operators must migrate manifests before upgrading.", {
    techs: ["Kubernetes"], source: "kubernetes-blog", tags: ["k8s"],
    what: "The 1.35 release deletes APIs deprecated two versions ago, including some CRD defaulting paths.", why: "API cleanup enables the project to move faster on storage and scheduling features.", who: "Kubernetes cluster operators and platform teams.", act: "Run kubent or the API deprecation tooling before planning your upgrade.",
  }),
  S(2, "security", "HIGH", "CISA adds critical CI/CD plugin flaw to its Known Exploited Vulnerabilities catalog",
    "A widely used CI plugin vulnerability sees active exploitation; the fixed version patches the RCE path.", {
    techs: ["Jenkins", "GitHub Actions"], source: "cisa", tags: ["cve", "ci-cd"],
  }),
  S(3, "opensource", "MEDIUM", "OpenTofu 1.10 ships with the long-awaited provider registry mirror",
    "The open Terraform fork adds a first-party registry mirror and HCP-compatible state backends.", {
    techs: ["OpenTofu"], source: "opentofu-blog", tags: ["iac"],
  }),
  S(4, "opensource", "MEDIUM", "Linux Foundation launches the Agentic Software Supply Chain project",
    "A new foundation project defines SBOMs and provenance for AI-generated code in CI pipelines.", {
    source: "cncf-blog", tags: ["supply-chain"],
  }),
  S(5, "devops", "MEDIUM", "GitHub Actions introduces reusable workflow caching across organizations",
    "Actions caches reusable workflows org-wide, cutting setup time for monorepo migrations.", {
    company: "github", techs: ["GitHub Actions"], source: "github-blog", tags: ["ci"],
  }),
  S(6, "web", "MEDIUM", "Chrome ships baseline CSS color-mix and cascade layers flags update",
    "Interop 2026 features reach default-on status ahead of schedule in Chrome 142.", {
    source: "webplatform-blog", tags: ["css"],
  }),
  S(8, "api", "MEDIUM", "OpenAI publishes structured-output conformance test suite",
    "A public test suite helps developers verify JSON-schema conformance across OpenAI-compatible providers.", {
    company: "openai", source: "openai-blog", tags: ["structured-output"],
  }),
  S(10, "api", "MEDIUM", "Model Context Protocol hits 1.0: spec frozen with auth built in",
    "MCP 1.0 stabilizes transports, adds OAuth 2.1 authorization and deprecates legacy streamable HTTP.", {
    techs: ["Model Context Protocol"], source: "anthropic-news", tags: ["mcp"],
    what: "MCP 1.0 freezes the protocol spec and introduces standardized OAuth-based server auth.", why: "A stable MCP is becoming the USB-C of AI tool integration.", who: "Agent and tool developers integrating with LLM apps.", act: "Target MCP 1.0 in new servers; update clients that rely on deprecated transports.",
  }),
  S(12, "opensource", "MEDIUM", "Rust reaches 100% of crates.io downloads over the 100 billion mark",
    "The Rust community crosses another adoption milestone as the ecosystem expands beyond systems code.", {
    techs: ["Rust"], source: "rust-blog", tags: ["rust"],
  }),
  S(13, "db", "MEDIUM", "Postgres community drafts native columnar storage as an extension",
    "The community postgres proposal brings lightweight columnar tables for analytics workloads.", {
    techs: ["PostgreSQL"], source: "postgres-news", tags: ["postgres"],
  }),
  S(14, "research", "MEDIUM", "Researchers benchmark vector stores at 10B scale — DuckDB holds its own",
    "A new benchmark compares hosted and local vector databases on recall, cost and p95 latency.", {
    source: "arxiv", kind: "RESEARCH_PAPER", tags: ["vectors", "benchmark"],
  }),

  // ── Hardware & systems ────────────────────────────────────────────────────
  S(0, "hardware", "MEDIUM", "NVIDIA previews the Rubin next-gen rack for AI factories",
    "NVIDIA shares early Rubin specifications with double the memory bandwidth of Blackwell Ultra.", {
    company: "nvidia", source: "nvidia-blog", tags: ["gpus"],
  }),
  S(2, "hardware", "MEDIUM", "Qualcomm's Snapdragon X2 laptops ship with 45 TOPS NPU default",
    "The next Snapdragon generation makes on-device AI the default for Windows laptops.", {
    source: "the-verge", tags: ["chips"],
  }),
  S(4, "os", "MEDIUM", "Ubuntu 26.10 beta opens for testing",
    "Ubuntu 'Questing Quokka' beta includes the 6.17 kernel and GNOME 51 preview.", {
    techs: ["Ubuntu", "Linux"], source: "ubuntu-blog", tags: ["linux"],
  }),
  S(6, "hardware", "MEDIUM", "RISC-V laptops get a mainstream Linux distro certification push",
    "Two distros commit to first-class RISC-V laptop images with daily CI.", {
    techs: ["RISC-V"], source: "phoronix", tags: ["risc-v"],
  }),

  // ── Mobile ───────────────────────────────────────────────────────────────
  S(1, "mobile", "MEDIUM", "iOS 27 preview adds on-device agentic Siri for developers",
    "Apple previews an LLM-powered Siri SDK with app-intent APIs at its developer conference.", {
    company: "apple", techs: ["iOS"], source: "apple-news", tags: ["apple-intelligence"],
  }),
  S(3, "mobile", "MEDIUM", "Flutter 3.33 improves Impeller shader compilation on Android",
    "Flutter's engine work cuts first-frame jank for complex UI on mid-range Android devices.", {
    techs: ["Flutter"], source: "flutter-blog", tags: ["flutter"],
  }),

  // ── Gaming ────────────────────────────────────────────────────────────────
  S(5, "gaming", "LOW", "Unity adds AI-assisted asset pipelines to the editor",
    "Unity's editor now generates textures and LODs from single source assets.", {
    source: "unity-blog", tags: ["gamedev"],
  }),
  S(9, "gaming", "LOW", "Godot 4.6 release candidate focuses on multiplayer determinism",
    "The open-source game engine's RC adds netcode debugging tools and physics rollback helpers.", {
    source: "godot-blog", tags: ["gamedev", "open-source"],
  }),

  // ── Frontend / framework ecosystem highlights ─────────────────────────────
  S(0, "web", "MEDIUM", "React team publishes its roadmap for the next compiler features",
    "The React 19.x line continues with memoization improvements and server-component refinements.", {
    techs: ["React"], source: "react-blog", tags: ["react"],
  }),
  S(2, "web", "MEDIUM", "Tailwind CSS 4.2 makes CSS variables the default theme layer",
    "Tailwind 4.2 stabilizes the CSS-first theme config and ships faster watch mode.", {
    techs: ["Tailwind CSS"], source: "tailwind-blog", tags: ["css"],
  }),
  S(4, "frontend", "MEDIUM", "Vite 7 finalizes the Rolldown-powered production build",
    "Vite 7's Rolldown bundler exits beta — most projects see 2–4× faster production builds.", {
    techs: ["Vite"], source: "vite-blog", tags: ["build-tools"],
    what: "Vite 7 makes Rolldown the default production bundler, replacing Rollup for most configs.", why: "Rust-powered bundling cuts CI and preview build times substantially.", who: "All Vite users and framework maintainers.", act: "Test your plugins against the Rolldown migration guide before upgrading.",
  }),
  S(6, "web", "MEDIUM", "Astro 5.5 adds islands streaming for content sites",
    "Astro now streams interactive islands progressively, improving Core Web Vitals on slow networks.", {
    techs: ["Astro"], source: "astro-blog", tags: ["astro"],
  }),
  S(8, "dev", "MEDIUM", "ESLint 10 moves to a unified config with deprecation shims",
    "ESLint 10 deprecates legacy config entirely; teams get migration tooling in the CLI.", {
    techs: ["ESLint"], source: "eslint-blog", tags: ["linting"],
  }),

  // ── Security beyond advisories ────────────────────────────────────────────
  S(1, "security", "HIGH", "Critical supply-chain attack targets popular npm cache packages",
    "A typosquat campaign published malicious cache-related packages; npm removed them within hours.", {
    techs: ["Node.js"], source: "github-blog", tags: ["supply-chain"],
    act: "Audit recently added dependencies and enable npm's provenance verification.",
  }),
  S(3, "security", "HIGH", "Open-source maintainers report rising AI-bot dependency confusion",
    "Fake 'AI-fix' PRs now account for a measurable share of malicious contributions to popular repos.", {
    source: "the-register", tags: ["supply-chain"],
  }),
  S(6, "security", "MEDIUM", "Browser vendors patch a shared WebGPU memory leak",
    "Chromium, Firefox and WebKit shipped coordinated fixes for a GPU-process memory disclosure.", {
    techs: ["JavaScript"], source: "mozilla-hacks", tags: ["browsers"],
  }),
];

// ── Research papers ─────────────────────────────────────────────────────────
export const PAPERS: StorySeed[] = [
  S(2, "research", "MEDIUM", "Paper: 'Scaling Test-Time Compute for Long-Horizon Agents'",
    "DeepMind researchers show test-time compute scaling curves for multi-turn agent tasks.", {
    company: "deepmind", source: "arxiv", kind: "RESEARCH_PAPER", tags: ["agents", "scaling"],
  }),
  S(4, "research", "MEDIUM", "Paper: 'Verifier-Free RL for Code Generation'",
    "An open study finds that outcome-only RL with careful sampling matches verifier-guided training on code.", {
    source: "arxiv", kind: "RESEARCH_PAPER", tags: ["rl", "code"],
  }),
  S(6, "research", "MEDIUM", "Paper: 'Context Engineering: A Survey'",
    "A comprehensive survey categorizes context-engineering techniques for production RAG and agents.", {
    source: "arxiv", kind: "RESEARCH_PAPER", tags: ["rag"],
  }),
  S(8, "research", "MEDIUM", "Paper: 'Sparse Attention Is All You Need for 1M Context'",
    "A new sparse attention kernel achieves 10× speedup on 1M-token inference in the authors' benchmarks.", {
    source: "arxiv", kind: "RESEARCH_PAPER", tags: ["efficiency"],
  }),
  S(10, "research", "LOW", "Paper: 'Benchmarking Local LLMs for Privacy-Sensitive Coding'",
    "A benchmark evaluates small local models on sensitive code tasks; llama.cpp stack results included.", {
    source: "arxiv", kind: "RESEARCH_PAPER", tags: ["local-models"],
  }),
  S(12, "research", "LOW", "Paper: 'The Economic Value of AI Pair Programmers'",
    "A field study quantifies developer throughput gains from AI pair programming across 4,000 engineers.", {
    source: "arxiv", kind: "RESEARCH_PAPER", tags: ["developer-productivity"],
  }),
];

// ── Security advisories ─────────────────────────────────────────────────────
export interface AdvisorySeed {
  d: number;
  tech?: string;
  cve?: string;
  severity: string;
  title: string;
  description: string;
  affected: string; // human-readable affected versions
  fixed: string; // human-readable fixed versions
  recommendation?: string;
  cvss?: number;
  source?: string;
  tags?: string[];
}

export const ADVISORIES: AdvisorySeed[] = [
  { d: 0, tech: "PostgreSQL", cve: "CVE-2026-40121", severity: "HIGH", cvss: 8.1,
    title: "PostgreSQL privilege escalation via custom index functions", description: "A crafted index function can escalate privileges during autovacuum in specific extension setups.", affected: "PostgreSQL 17.6 and earlier, 18.x before 18.2", fixed: "18.2, 17.6+ patch", recommendation: "Upgrade to 18.2 or apply the 17.x backport; restrict untrusted extensions.", source: "postgres-advisories", tags: ["postgres", "rce-adjacent"] },
  { d: 0, tech: "Next.js", cve: "CVE-2026-40087", severity: "CRITICAL", cvss: 9.4,
    title: "Next.js middleware cache poisoning via crafted host header", description: "Requests with a forged host header can poison the middleware/shared cache when using certain rewrites.", affected: "Next.js 15.x before 15.4.3, 16.x before 16.2.1", fixed: "15.4.3, 16.2.1", recommendation: "Upgrade immediately if you use middleware rewrites behind a CDN.", source: "vercel-advisories", tags: ["nextjs", "cache"] },
  { d: 1, tech: "Kubernetes", cve: "CVE-2026-40109", severity: "HIGH", cvss: 7.7,
    title: "kubelet API allows pod spec escape with subpath volumes", description: "A malicious pod with subPath volume access can read host files in specific SELinux configurations.", affected: "Kubernetes < 1.34.4, 1.35.0-1.35.1", fixed: "1.34.4, 1.35.2", recommendation: "Upgrade kubelets; audit workloads granted subPath volume privileges.", source: "kubernetes-advisories", tags: ["k8s"] },
  { d: 1, tech: "Redis", cve: "CVE-2026-40113", severity: "MEDIUM", cvss: 6.5,
    title: "Redis Lua script memory exhaustion via large KEYS tables", description: "Redis 8.0 allows Lua scripts to allocate unbounded memory through oversized KEYS arguments.", affected: "Redis 8.0-8.1", fixed: "8.2.1", recommendation: "Upgrade to 8.2.1 or restrict EVAL access via ACLs.", source: "redis-advisories", tags: ["redis"] },
  { d: 2, tech: "Node.js", cve: "CVE-2026-40099", severity: "HIGH", cvss: 8.2,
    title: "Node.js HTTP/2 rapid reset amplification (variant of CVE-2023-44487)", description: "A variant of the HTTP/2 rapid-reset attack can amplify connection churn against Node servers.", affected: "Node.js 20.x < 20.19.3, 22.x < 22.17.2, 24.x < 24.4.1", fixed: "20.19.3, 22.17.2, 24.4.1", recommendation: "Apply the patch release; consider limiting HTTP/2 concurrent streams at the proxy.", source: "nodejs-advisories", tags: ["node"] },
  { d: 2, tech: "OpenSSL", cve: "CVE-2026-40131", severity: "HIGH", cvss: 7.5,
    title: "OpenSSL DTLS handshake buffer over-read", description: "A malformed DTLS flight can trigger a one-byte over-read during handshake processing.", affected: "OpenSSL 3.0-3.5", fixed: "3.5.1, 3.4.7, 3.0.16", recommendation: "Upgrade OpenSSL; rebuild containers and static binaries.", source: "openssl-advisories", tags: ["tls"] },
  { d: 3, tech: "GitHub Actions", cve: "CVE-2026-40140", severity: "HIGH", cvss: 8.8,
    title: "GitHub Actions runner token exfiltration via composite action inputs", description: "Composite actions that interpolate untrusted inputs into run steps can leak the GITHUB_TOKEN.", affected: "All versions (config issue)", fixed: "N/A — use env passthrough", recommendation: "Pass inputs via env, never string-interpolate into run:; pin third-party actions by SHA.", source: "github-advisories", tags: ["ci"] },
  { d: 4, tech: "curl", cve: "CVE-2026-40090", severity: "HIGH", cvss: 7.2,
    title: "curl SASL auth buffer overflow in IMAP/LDAP", description: "An integer overflow in SASL authentication can corrupt heap memory for IMAP and LDAP URLs.", affected: "curl 8.0-8.16", fixed: "8.16.1", recommendation: "Update curl; rebuild anything statically linked.", source: "curl-advisories", tags: ["curl"] },
  { d: 4, tech: "Docker", cve: "CVE-2026-40102", severity: "HIGH", cvss: 8.0,
    title: "Docker Engine information disclosure via build cache keys", description: "BuildKit cache keys can leak environment variable names into exported cache metadata.", affected: "Docker Engine < 29.0.3, BuildKit < 0.19.2", fixed: "29.0.3 / BuildKit 0.19.2", recommendation: "Upgrade Docker Engine or pin buildkit image in CI.", source: "docker-advisories", tags: ["docker"] },
  { d: 5, tech: "OpenSearch", cve: "CVE-2026-40095", severity: "MEDIUM", cvss: 6.1,
    title: "OpenSearch Dashboards stored XSS in visualization titles", description: "Visualization titles are not fully sanitized, enabling stored XSS for dashboard editors.", affected: "OpenSearch < 3.4.2", fixed: "3.4.2", recommendation: "Upgrade Dashboards; review titles of shared dashboards.", source: "opensearch-advisories", tags: ["xss"] },
  { d: 5, tech: "Go", cve: "CVE-2026-40116", severity: "MEDIUM", cvss: 6.3,
    title: "Go net/http request smuggling on HTTP/1 keep-alive", description: "Inconsistent handling of header folding can enable request smuggling between proxy and origin.", affected: "Go < 1.24.9, < 1.25.3", fixed: "1.24.9, 1.25.3", recommendation: "Update the Go toolchain and rebuild services.", source: "go-advisories", tags: ["go"] },
  { d: 6, tech: "Python", cve: "CVE-2026-40123", severity: "MEDIUM", cvss: 5.9,
    title: "Python ssl module leaks key bits via error timing", description: "TLS key-exchange error paths have a small timing side channel in the ssl module.", affected: "CPython 3.12.x < 3.12.11, 3.13.x < 3.13.6", fixed: "3.12.11, 3.13.6, 3.14.0+", recommendation: "Apply the patch release when practical.", source: "python-advisories", tags: ["python"] },
  { d: 7, tech: "Terraform", cve: "CVE-2026-40128", severity: "MEDIUM", cvss: 5.3,
    title: "Terraform plan shows stale outputs after failed refresh", description: "A failed provider refresh can leave stale outputs in the plan display, misleading operators.", affected: "Terraform < 1.14.1", fixed: "1.14.1", recommendation: "Upgrade Terraform in CI and local toolchains.", source: "hashicorp-advisories", tags: ["iac"] },
  { d: 8, tech: "Flutter", cve: "CVE-2026-40101", severity: "HIGH", cvss: 7.5,
    title: "Flutter web engine allows cross-origin data read via asset pipeline", description: "A flaw in Flutter web asset handling can read same-site data across origins in specific deployments.", affected: "Flutter < 3.33.1 (web)", fixed: "3.33.1", recommendation: "Upgrade Flutter and rebuild web releases.", source: "flutter-advisories", tags: ["flutter"] },
  { d: 9, tech: "WordPress", cve: "CVE-2026-40144", severity: "MEDIUM", cvss: 5.4,
    title: "WordPress core stored XSS in block comments", description: "Block comment rendering allows stored XSS for users with comment-block editing rights.", affected: "WordPress < 6.8.3", fixed: "6.8.3", recommendation: "Update core and security plugins.", source: "wpscan", tags: ["wordpress"] },
  { d: 10, tech: "Vue", cve: "CVE-2026-40130", severity: "MEDIUM", cvss: 6.1,
    title: "Vue template compiler prototype pollution via v-bind keys", description: "Crafted v-bind attribute names can pollute prototypes during template compilation in dev builds.", affected: "Vue 3.x < 3.6.4", fixed: "3.6.4", recommendation: "Upgrade; avoid compiling untrusted templates.", source: "vue-advisories", tags: ["vue"] },
  { d: 11, tech: "MongoDB", cve: "CVE-2026-40135", severity: "MEDIUM", cvss: 5.9,
    title: "MongoDB $lookup denial of service on nested pipeline", description: "Deeply nested $lookup pipelines can exhaust memory on unauthenticated read paths.", affected: "MongoDB 8.0 < 8.0.13", fixed: "8.0.13", recommendation: "Upgrade mongod; restrict read access.", source: "mongodb-advisories", tags: ["mongodb"] },
  { d: 12, tech: "Grafana", cve: "CVE-2026-40118", severity: "HIGH", cvss: 7.8,
    title: "Grafana SSRF through data source proxy URLs", description: "Data source proxy can be abused for SSRF when a custom URL is configured by an editor role.", affected: "Grafana < 12.5.2", fixed: "12.5.2, 12.4.7", recommendation: "Upgrade; restrict data source edit permissions.", source: "grafana-advisories", tags: ["ssrf"] },
  { d: 13, tech: "Elasticsearch", cve: "CVE-2026-40107", severity: "LOW", cvss: 3.1,
    title: "Elasticsearch cluster name disclosure in error responses", description: "Unhandled query errors can reveal the cluster name to unauthenticated callers.", affected: "Elasticsearch < 9.1.2", fixed: "9.1.2", recommendation: "Upgrade on your next maintenance window.", source: "elastic-advisories", tags: ["elastic"] },
  { d: 14, tech: "Rust", cve: "CVE-2026-40137", severity: "LOW", cvss: 4.2,
    title: "rustc debuginfo path traversal for proc-macro crates", description: "Debug info generated for proc-macro crates can embed traversal paths when built from untrusted dirs.", affected: "rustc < 1.90.1", fixed: "1.90.1", recommendation: "Update the Rust toolchain.", source: "rust-advisories", tags: ["rust"] },
];
