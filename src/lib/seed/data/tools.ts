// Seed catalog of AI tools. Illustrative sample data for local development.
export interface ToolSeed {
  name: string;
  slug?: string;
  company?: string; // company slug
  category: string; // TOOL_CATEGORIES key
  pricingModel: string;
  priceLabel?: string;
  apiAvailable: boolean;
  launchDaysAgo: number;
  updateDaysAgo?: number;
  description: string;
  website?: string;
  github?: string;
  features: string[];
  useCases: string[];
  competitors: string[];
  tags: string[];
  status?: string;
  stack?: string;
  featured?: boolean;
}

const T = (
  name: string,
  company: string | undefined,
  category: string,
  pricingModel: string,
  apiAvailable: boolean,
  launchDaysAgo: number,
  description: string,
  opts: Partial<Omit<ToolSeed, "name" | "company" | "category" | "pricingModel" | "apiAvailable" | "launchDaysAgo" | "description">> = {},
): ToolSeed => ({
  name,
  company,
  category,
  pricingModel,
  apiAvailable,
  launchDaysAgo,
  description,
  features: opts.features ?? [],
  useCases: opts.useCases ?? [],
  competitors: opts.competitors ?? [],
  tags: opts.tags ?? [],
  ...opts,
});

export const TOOL_SEEDS: ToolSeed[] = [
  // ── AI Coding ─────────────────────────────────────────────────────────────
  T("GitHub Copilot", "github", "coding", "PAID", true, 1300,
    "AI pair programmer with agent mode, code review and Copilot Workspace.", {
    priceLabel: "From $10/mo", website: "https://github.com/features/copilot",
    features: ["Agent mode", "Code review", "Chat in IDE", "CLI", "Custom models"],
    useCases: ["Writing code", "Reviewing PRs", "Explaining codebases"], competitors: ["Cursor", "Claude Code", "Codex CLI"],
    tags: ["autocomplete", "agents"], updateDaysAgo: 3, featured: true, stack: "GitHub / OpenAI models",
  }),
  T("Claude Code", "anthropic", "coding", "PAID", false, 420,
    "Agentic coding tool for the terminal by Anthropic — plans, edits, tests and commits.", {
    priceLabel: "Included with Claude plans", website: "https://anthropic.com/claude-code", github: "anthropics/claude-code",
    features: ["Terminal agent", "Subagents", "Plan mode", "MCP support", "Hooks"],
    useCases: ["Large refactors", "Test writing", "Repo exploration"], competitors: ["Codex CLI", "GitHub Copilot", "Cursor"],
    tags: ["agents", "terminal"], updateDaysAgo: 1, featured: true,
  }),
  T("Cursor", "cursor", "coding", "PAID", false, 800,
    "AI-first code editor (VS Code fork) with powerful agentic editing.", {
    priceLabel: "From $20/mo", website: "https://cursor.com",
    features: ["Agent", "Tab autocomplete", "Composer", "Background agents"], useCases: ["Daily development", "Multi-file edits"],
    competitors: ["Windsurf", "Copilot", "Zed AI"], tags: ["editor", "agents"], updateDaysAgo: 2, featured: true, stack: "VS Code fork",
  }),
  T("Windsurf", undefined, "coding", "FREEMIUM", false, 900,
    "Agentic IDE from the Codeium team with Cascade flow.", {
    priceLabel: "Free tier + Pro $15/mo", website: "https://windsurf.com",
    features: ["Cascade agent", "Precognition", "Editor + web + terminal"], useCases: ["Agentic coding"], competitors: ["Cursor", "Copilot"],
    tags: ["editor"], updateDaysAgo: 4,
  }),
  T("OpenAI Codex CLI", "openai", "coding", "PAID", true, 260,
    "Open-source coding agent that runs in your terminal and cloud sandboxes.", {
    website: "https://openai.com/codex", github: "openai/codex",
    features: ["Terminal agent", "Cloud sandbox", "GitHub integration"], useCases: ["Tasks", "PR review", "Bulk edits"],
    competitors: ["Claude Code", "Copilot"], tags: ["terminal", "agents"], updateDaysAgo: 2, featured: true,
  }),
  T("v0", "vercel", "coding", "FREEMIUM", true, 700,
    "Vercel's AI UI builder — generate and deploy React/Next.js interfaces from prompts.", {
    priceLabel: "Free tier", website: "https://v0.dev",
    features: ["Prompt to UI", "shadcn/ui", "One-click deploy"], useCases: ["Prototyping", "Landing pages"],
    competitors: ["Lovable", "Tempo"], tags: ["ui", "frontend"], updateDaysAgo: 5, featured: true,
  }),
  T("Replit Agent", "replit", "coding", "PAID", false, 500,
    "Full-stack app building agent that scaffolds, codes and deploys in the browser.", {
    priceLabel: "Core $25/mo", website: "https://replit.com",
    features: ["Agent", "Deployments", "Databases"], useCases: ["App prototyping", "Hackathon builds"],
    competitors: ["Lovable", "v0", "Bolt"], tags: ["app-builder"], updateDaysAgo: 3, featured: true,
  }),
  T("Lovable", undefined, "coding", "FREEMIUM", false, 600,
    "Prompt-to-app platform with focus on full-stack React + Supabase apps.", {
    priceLabel: "Free + $25/mo", website: "https://lovable.dev",
    features: ["Prompt to app", "Supabase auth", "Deploy"], useCases: ["MVPs", "Internal tools"],
    competitors: ["Replit Agent", "Bolt"], tags: ["app-builder"], updateDaysAgo: 4,
  }),
  T("Devin", undefined, "coding", "PAID", true, 700,
    "Fully autonomous software engineer by Cognition — owns tasks from ticket to PR.", {
    priceLabel: "From $20/mo", website: "https://devin.ai",
    features: ["Autonomous agent", "Slack/Linear", "Cloud workspace"], useCases: ["Ticket execution", "Migration tasks"],
    competitors: ["Claude Code", "Codex"], tags: ["agents"], updateDaysAgo: 6,
  }),
  T("Gemini CLI", "google", "coding", "FREE", false, 250,
    "Open-source terminal agent from Google — multi-model, code-aware.", {
    website: "https://github.com/google-gemini/gemini-cli", github: "google-gemini/gemini-cli",
    features: ["Terminal agent", "Multi-model"], useCases: ["Coding tasks"], competitors: ["Claude Code", "Codex CLI"], tags: ["terminal"],
  }),
  T("Zed AI", undefined, "coding", "PAID", false, 500,
    "High-performance editor with integrated AI agents and inline diffs.", {
    priceLabel: "Free tier", website: "https://zed.dev",
    features: ["Inline edits", "Agent panel"], useCases: ["Performance-focused dev"], competitors: ["Cursor", "Windsurf"], tags: ["editor"],
  }),
  T("Amazon Q Developer", "amazon", "coding", "PAID", true, 900,
    "AWS's assistant for coding, cloud operations and AWS expertise.", {
    website: "https://aws.amazon.com/q/developer/", features: ["IDE agent", "AWS expertise"], useCases: ["AWS development"],
    competitors: ["Copilot", "CodeWhisperer (retired)"], tags: ["cloud"],
  }),
  T("Sourcegraph Cody", undefined, "coding", "PAID", true, 950,
    "AI coding assistant that understands your entire codebase.", {
    website: "https://sourcegraph.com/cody", github: "sourcegraph/cody",
    features: ["Context engine", "Autocomplete"], useCases: ["Large codebases"], competitors: ["Copilot"], tags: ["code-search"],
  }),
  T("Qwen Code", "alibaba", "coding", "FREEMIUM", true, 300,
    "Alibaba's coding assistant for IDE and CLI with open Qwen3-Coder models.", {
    website: "https://qwen.ai/coding", features: ["IDE plugin", "Open models"], useCases: ["Coding"], competitors: ["Copilot"],
    tags: ["open-source"],
  }),
  T("Bolt.new", undefined, "coding", "FREEMIUM", false, 650,
    "StackBlitz's prompt-to-fullstack-app tool running entirely in the browser.", {
    website: "https://bolt.new", features: ["In-browser", "WebContainers"], useCases: ["Quick apps"], competitors: ["Replit Agent"],
    tags: ["app-builder"], updateDaysAgo: 5,
  }),

  // ── AI Agents / Assistants ────────────────────────────────────────────────
  T("Manus", undefined, "agents", "FREEMIUM", true, 400,
    "General autonomous agent that browses, codes and operates computers.", {
    website: "https://manus.im", features: ["Autonomous browsing", "Computer use"], useCases: ["Research", "Tasks"],
    competitors: ["Devin", "Genspark"], tags: ["autonomous"], updateDaysAgo: 2, featured: true,
  }),
  T("OpenAI Agents SDK", "openai", "agents", "FREE", true, 300,
    "Production-ready framework for building agentic apps with handoffs and guardrails.", {
    website: "https://openai.github.io/openai-agents-python", github: "openai/openai-agents-python",
    features: ["Agents", "Handoffs", "Guardrails", "MCP"], useCases: ["Agent products"], competitors: ["LangGraph", "CrewAI"],
    tags: ["framework"], updateDaysAgo: 3,
  }),
  T("LangGraph", undefined, "agents", "OPEN_SOURCE", true, 750,
    "Low-level orchestration framework for stateful agent graphs.", {
    website: "https://langchain.com/langgraph", github: "langchain-ai/langgraph",
    features: ["Graphs", "Persistence", "Streaming"], useCases: ["Complex agents"], competitors: ["Agents SDK", "AutoGen"], tags: ["framework"],
  }),
  T("Claude Agent SDK", "anthropic", "agents", "FREE", true, 200,
    "Anthropic's toolkit for building agentic apps, with full Claude Code parity.", {
    website: "https://docs.anthropic.com/en/api/agent-sdk", github: "anthropics/claude-agent-sdk-python",
    features: ["Agent loop", "Sandboxing", "MCP"], useCases: ["Agent products"], competitors: ["Agents SDK"], tags: ["framework"],
    updateDaysAgo: 1,
  }),
  T("AutoGPT", undefined, "agents", "OPEN_SOURCE", true, 800,
    "The platform that popularized autonomous agents; now a low-code builder.", {
    website: "https://agpt.co", github: "Significant-Gravitas/AutoGPT",
    features: ["Blocks", "Agents"], useCases: ["Automation"], competitors: ["n8n"], tags: ["autonomous"],
  }),
  T("Microsoft Copilot Studio", "microsoft", "agents", "PAID", true, 1000,
    "Build custom copilots and agents on Microsoft 365 data.", {
    website: "https://microsoft.com/copilot-studio", features: ["Custom agents", "M365 actions"], useCases: ["Enterprise copilots"],
    competitors: ["OpenAI Assistants"], tags: ["enterprise"],
  }),
  T("Google Agentspace", "google", "agents", "PAID", true, 600,
    "Enterprise agent platform unifying Gemini, search and company data.", {
    website: "https://cloud.google.com/products/agentspace", features: ["Vertex AI agents", "Search"], useCases: ["Enterprise"],
    competitors: ["Copilot Studio"], tags: ["enterprise"],
  }),

  // ── AI Assistants (chat) ──────────────────────────────────────────────────
  T("ChatGPT", "openai", "assistants", "FREEMIUM", true, 1000,
    "The original AI assistant — now with memory, canvas, projects and agents.", {
    priceLabel: "Free + $20/mo Plus", website: "https://chatgpt.com",
    features: ["Canvas", "Memory", "Projects", "GPT-5.2"], useCases: ["Work", "Coding", "Research"],
    competitors: ["Claude", "Gemini"], tags: ["chat"], updateDaysAgo: 1, featured: true,
  }),
  T("Claude", "anthropic", "assistants", "FREEMIUM", true, 1100,
    "Anthropic's assistant app with artifacts, projects and Claude Code integration.", {
    priceLabel: "Free + Pro/Max", website: "https://claude.ai",
    features: ["Artifacts", "Projects", "Web search"], useCases: ["Writing", "Coding", "Analysis"],
    competitors: ["ChatGPT", "Gemini"], tags: ["chat"], updateDaysAgo: 1, featured: true,
  }),
  T("Google Gemini", "google", "assistants", "FREEMIUM", true, 1100,
    "Google's multimodal assistant across apps, devices and Workspace.", {
    website: "https://gemini.google.com", features: ["Deep Research", "Gems", "Apps integration"], useCases: ["Research", "Assistant"],
    competitors: ["ChatGPT", "Claude"], tags: ["chat"], updateDaysAgo: 1,
  }),
  T("Perplexity", undefined, "assistants", "FREEMIUM", true, 1300,
    "Answer engine with live citations; Sonar API for developers.", {
    website: "https://perplexity.ai", features: ["Live answers", "Comet browser"], useCases: ["Research"], competitors: ["ChatGPT Search"],
    tags: ["search"], updateDaysAgo: 2, featured: true,
  }),
  T("Mistral Le Chat", "mistral", "assistants", "FREEMIUM", true, 500,
    "European assistant app from Mistral — fast, with canvas and agentic tasks.", {
    website: "https://chat.mistral.ai", features: ["Canvas", "Agents"], useCases: ["Chat"], competitors: ["ChatGPT"], tags: ["chat"],
  }),

  // ── AI Voice / Video / Image ──────────────────────────────────────────────
  T("ElevenLabs", undefined, "voice", "FREEMIUM", true, 1300,
    "The leading text-to-speech platform — ultra-realistic voices and dubbing.", {
    priceLabel: "Free + from $5/mo", website: "https://elevenlabs.io",
    features: ["Voice cloning", "Dubbing", "Sound effects"], useCases: ["Narration", "Localization"], competitors: ["OpenAI TTS"],
    tags: ["tts"], updateDaysAgo: 2,
  }),
  T("OpenAI Advanced Voice", "openai", "voice", "PAID", true, 700,
    "Real-time voice chat with GPT — used by the ChatGPT voice mode.", {
    website: "https://openai.com", features: ["Real-time speech", "Emotion"], useCases: ["Voice assistants"], competitors: ["Gemini Live"],
    tags: ["voice"],
  }),
  T("Gemini Live", "google", "voice", "FREE", true, 800,
    "Conversational voice mode for Gemini with camera understanding.", {
    website: "https://gemini.google.com/live", features: ["Video understanding", "Live chat"], useCases: ["Voice", "Assistant"],
    competitors: ["Advanced Voice"], tags: ["voice"],
  }),
  T("Runway", undefined, "video", "FREEMIUM", true, 1400,
    "Generative video platform — Gen-4 models power film-grade tools.", {
    priceLabel: "Free + $12/mo", website: "https://runwayml.com", features: ["Gen-4 video", "Act-One"], useCases: ["Film", "Ads"],
    competitors: ["Sora", "Kling"], tags: ["video"], updateDaysAgo: 3,
  }),
  T("Sora", "openai", "video", "PAID", true, 900,
    "OpenAI's text-to-video model with storyboards and remix tools.", {
    website: "https://sora.com", features: ["Text-to-video", "Storyboard"], useCases: ["Social video", "Prototypes"], competitors: ["Runway"],
    tags: ["video"],
  }),
  T("Synthesia", undefined, "video", "PAID", true, 1500,
    "AI video creation with lifelike avatars for training and marketing.", {
    priceLabel: "From $29/mo", website: "https://synthesia.io", features: ["Avatars", "Translation"], useCases: ["Training videos"],
    competitors: ["HeyGen"], tags: ["video", "avatars"],
  }),
  T("HeyGen", undefined, "video", "FREEMIUM", true, 1200,
    "Avatar video platform with instant cloning and translations.", {
    website: "https://heygen.com", features: ["Avatar 2.0", "Translate"], useCases: ["Marketing"], competitors: ["Synthesia"], tags: ["video"],
  }),
  T("Midjourney", undefined, "image", "PAID", false, 1400,
    "The reference image-generation tool — V7 introduced realistic rendering.", {
    priceLabel: "From $10/mo", website: "https://midjourney.com", features: ["V7 model", "Style references"], useCases: ["Concept art"],
    competitors: ["Ideogram", "Flux", "gpt-image"], tags: ["image"],
  }),
  T("Ideogram", undefined, "image", "FREEMIUM", true, 1200,
    "Image model famous for text rendering and canvas remixing.", {
    website: "https://ideogram.ai", features: ["Text rendering", "Canvas"], useCases: ["Design", "Logos"], competitors: ["Midjourney"],
    tags: ["image"],
  }),
  T("Flux", undefined, "image", "FREEMIUM", true, 1000,
    "Black Forest Labs' open image models — FLUX.1 and FLUX.2 tools.", {
    website: "https://blackforestlabs.ai", github: "black-forest-labs/flux", features: ["Open weights", "Fast"], useCases: ["Image gen"],
    competitors: ["Midjourney", "SD"], tags: ["image", "open-source"],
  }),

  // ── AI Writing / Productivity / Search ────────────────────────────────────
  T("Notion AI", "notion", "writing", "PAID", true, 900,
    "AI across docs — writing, Q&A over your workspace, and Notion Mail/Calendar.", {
    website: "https://notion.so/product/ai", features: ["Q&A", "Autofill"], useCases: ["Docs", "Knowledge"], competitors: ["Mem"],
    tags: ["docs"], updateDaysAgo: 3,
  }),
  T("Grammarly", undefined, "writing", "FREEMIUM", true, 2000,
    "AI writing assistance everywhere you type, now with organizational knowledge.", {
    website: "https://grammarly.com", features: ["Rewrite", "Tone"], useCases: ["Email", "Docs"], competitors: ["Wordtune"], tags: ["writing"],
  }),
  T("Jasper", undefined, "writing", "PAID", true, 1500,
    "Marketing copy platform with brand voice and campaigns.", {
    website: "https://jasper.ai", features: ["Brand voice", "Campaigns"], useCases: ["Marketing"], competitors: ["Copy.ai"], tags: ["writing"],
  }),
  T("Rewind", undefined, "productivity", "PAID", false, 800,
    "The search engine of your life — records and answers over your screen.", {
    website: "https://rewind.ai", features: ["Screen memory", "Answers"], useCases: ["Recall", "Meetings"], competitors: ["Limitless"],
    tags: ["memory"],
  }),
  T("Limitless", undefined, "productivity", "PAID", false, 700,
    "AI wearable + app for meeting notes and personal memory.", {
    website: "https://limitless.ai", features: ["Pendant", "Meeting notes"], useCases: ["Meetings"], competitors: ["Rewind"], tags: ["memory"],
  }),
  T("Notta", undefined, "productivity", "FREEMIUM", true, 1200,
    "Meeting transcription and AI summaries.", {
    website: "https://notta.ai", features: ["Transcription", "Summary"], useCases: ["Meetings"], competitors: ["Otter"], tags: ["meetings"],
  }),
  T("Fireflies.ai", undefined, "productivity", "FREEMIUM", true, 1400,
    "Meeting assistant that records, transcribes and searches conversations.", {
    website: "https://fireflies.ai", features: ["Transcripts", "CRM sync"], useCases: ["Sales", "Meetings"], competitors: ["Notta"], tags: ["meetings"],
  }),
  T("Cognition Recall", undefined, "productivity", "FREEMIUM", false, 100,
    "AI that watches your screen and answers questions about your work.", {
    website: "https://recall.cognition.ai", features: ["Screen memory", "Sessions"], useCases: ["Context recall"], competitors: ["Rewind"],
    tags: ["memory"], status: "BETA",
  }),

  // ── AI Research / Search / API / Infra ────────────────────────────────────
  T("Deep Research (OpenAI)", "openai", "research", "PAID", true, 500,
    "Agentic multi-step research that compiles cited reports.", {
    website: "https://openai.com", features: ["Multi-step research", "Citations"], useCases: ["Reports"], competitors: ["Gemini Deep Research"],
    tags: ["research"], updateDaysAgo: 2,
  }),
  T("Gemini Deep Research", "google", "research", "FREE", true, 700,
    "Builds multi-step research plans and synthesizes a report.", {
    website: "https://gemini.google.com", features: ["Plans", "Reports"], useCases: ["Research"], competitors: ["OpenAI Deep Research"],
    tags: ["research"],
  }),
  T("Elicit", undefined, "research", "FREEMIUM", true, 1100,
    "AI research assistant for finding and summarizing papers.", {
    website: "https://elicit.com", features: ["Paper search", "Extraction"], useCases: ["Literature review"], competitors: ["Scite"], tags: ["research"],
  }),
  T("Exa", undefined, "search", "PAID", true, 900,
    "Neural search API for the web — semantic + keyword + code search.", {
    website: "https://exa.ai", features: ["Semantic search", "Crawling"], useCases: ["RAG", "Research"], competitors: ["Tavily"], tags: ["api"],
  }),
  T("Tavily", undefined, "search", "PAID", true, 850,
    "Search API optimized for AI agents and RAG.", {
    website: "https://tavily.com", features: ["Agent search", "Extract"], useCases: ["RAG"], competitors: ["Exa"], tags: ["api"],
  }),
  T("You.com", undefined, "search", "FREEMIUM", true, 1200,
    "AI search engine with custom modes and API.", {
    website: "https://you.com", features: ["Modes", "API"], useCases: ["Search"], competitors: ["Perplexity"], tags: ["search"],
  }),
  T("vLLM", undefined, "infra", "OPEN_SOURCE", true, 800,
    "Fast LLM serving engine — PagedAttention, continuous batching.", {
    website: "https://docs.vllm.ai", github: "vllm-project/vllm", features: ["High throughput", "OpenAI-compatible"], useCases: ["Serving"],
    competitors: ["TGI", "Ollama"], tags: ["serving", "open-source"],
  }),
  T("Ollama", undefined, "infra", "OPEN_SOURCE", false, 850,
    "Local model runner — one command to serve open models.", {
    website: "https://ollama.com", github: "ollama/ollama", features: ["Local", "Simple"], useCases: ["Local dev"], competitors: ["LM Studio"],
    tags: ["local", "open-source"],
  }),
  T("LM Studio", undefined, "infra", "FREEMIUM", false, 950,
    "Desktop app to run and chat with local models.", {
    website: "https://lmstudio.ai", features: ["Local chat", "GPU"], useCases: ["Local dev"], competitors: ["Ollama"], tags: ["local"],
  }),
  T("Together AI", undefined, "infra", "PAID", true, 1000,
    "Serverless GPU cloud for training and inference.", {
    website: "https://together.ai", features: ["Inference", "Fine-tuning"], useCases: ["Production AI"], competitors: ["Fireworks", "Groq"],
    tags: ["cloud"],
  }),
  T("Groq", undefined, "infra", "PAID", true, 900,
    "Ultra-fast inference on LPU hardware.", {
    website: "https://groq.com", features: ["LPU speed"], useCases: ["Low latency"], competitors: ["Together"], tags: ["cloud"],
  }),
  T("Fireworks AI", undefined, "infra", "PAID", true, 900,
    "Fast inference and fine-tuning platform with FSL (serverless LoRA).", {
    website: "https://fireworks.ai", features: ["Fast serving", "LoRA"], useCases: ["Production"], competitors: ["Together"], tags: ["cloud"],
  }),
  T("Anyscale", undefined, "infra", "PAID", true, 1100,
    "Ray-powered compute for AI workloads.", {
    website: "https://anyscale.com", features: ["Ray", "Scaling"], useCases: ["Training", "Serving"], competitors: ["Together"], tags: ["cloud"],
  }),
  T("Modal", undefined, "infra", "PAID", true, 800,
    "Cloud functions and containers for AI teams — instant serverless GPU.", {
    website: "https://modal.com", features: ["Serverless GPU", "Scale to zero"], useCases: ["Batch", "Serving"], competitors: ["RunPod", "Replicate"],
    tags: ["cloud"],
  }),
  T("Replicate", undefined, "infra", "PAID", true, 1300,
    "Cloud API to run open-source AI models.", {
    website: "https://replicate.com", features: ["Model catalog", "Cog"], useCases: ["App integration"], competitors: ["Modal"], tags: ["api"],
  }),
  T("Baseten", undefined, "infra", "PAID", true, 900,
    "ML infrastructure to deploy and scale models in production.", {
    website: "https://baseten.co", features: ["Deploy", "Scale"], useCases: ["Production ML"], competitors: ["SageMaker"], tags: ["cloud"],
  }),

  // ── AI Developer tools / Testing / Security / SaaS / Automation ───────────
  T("Mintlify", undefined, "devtools", "FREEMIUM", true, 1000,
    "AI-powered documentation platform — write docs in minutes, beautiful by default.", {
    website: "https://mintlify.com", features: ["AI writer", "Hosting"], useCases: ["API docs"], competitors: ["ReadMe"], tags: ["docs"],
  }),
  T("Sweep", undefined, "devtools", "FREEMIUM", true, 700,
    "AI junior developer that turns issues into PRs.", {
    website: "https://sweep.dev", features: ["Issue→PR"], useCases: ["Chores"], competitors: ["Devin"], tags: ["agents"],
  }),
  T("Cognition", undefined, "devtools", "PAID", true, 900,
    "Agent-first development tools — Devin, Recall and more.", {
    website: "https://cognition.ai", features: ["Devin", "Recall"], useCases: ["Engineering"], competitors: ["OpenAI", "Anthropic"], tags: ["agents"],
  }),
  T("Gretel", undefined, "testing", "PAID", true, 900,
    "Synthetic data generation for testing AI and analytics.", {
    website: "https://gretel.ai", features: ["Synthetic data", "Evaluation"], useCases: ["Test data"], competitors: ["Mostly AI"], tags: ["data"],
  }),
  T("Mabl", undefined, "testing", "PAID", true, 1200,
    "Intelligent test automation platform with AI-assisted authoring.", {
    website: "https://mabl.com", features: ["E2E", "Auto-healing"], useCases: ["QA"], competitors: ["Testim"], tags: ["testing"],
  }),
  T("Reflect", undefined, "testing", "PAID", true, 1000,
    "No-code automated web testing that writes itself.", {
    website: "https://reflect.run", features: ["Self-writing tests"], useCases: ["E2E"], competitors: ["Mabl"], tags: ["testing"],
  }),
  T("Vanta", undefined, "security", "PAID", false, 1200,
    "Automated security & compliance — SOC 2, ISO 27001.", {
    website: "https://vanta.com", features: ["Automation", "Monitors"], useCases: ["Compliance"], competitors: ["Drata"], tags: ["compliance"],
  }),
  T("Drata", undefined, "security", "PAID", false, 1200,
    "Continuous SOC 2 compliance automation.", {
    website: "https://drata.com", features: ["Continuous monitoring"], useCases: ["Compliance"], competitors: ["Vanta"], tags: ["compliance"],
  }),
  T("Ironclad", undefined, "saas", "PAID", true, 1300,
    "AI contract lifecycle management.", {
    website: "https://ironcladapp.com", features: ["Contract AI"], useCases: ["Legal"], competitors: ["Evisort"], tags: ["legal"],
  }),
  T("Glean", undefined, "saas", "PAID", true, 1000,
    "Enterprise search + AI work assistant over all company apps.", {
    website: "https://glean.com", features: ["Enterprise search", "Assistant"], useCases: ["Knowledge"], competitors: ["Copilot Studio"],
    tags: ["enterprise"], updateDaysAgo: 2,
  }),
  T("Clerk", undefined, "saas", "FREEMIUM", true, 1000,
    "User management and authentication for modern apps — now AI-session aware.", {
    website: "https://clerk.com", features: ["Auth", "Sessions"], useCases: ["App auth"], competitors: ["Auth0", "Supabase Auth"], tags: ["auth"],
  }),
  T("Auth0", "okta", "saas", "PAID", true, 2000,
    "Identity platform by Okta for developers.", {
    website: "https://auth0.com", features: ["SSO", "MFA"], useCases: ["Enterprise auth"], competitors: ["Clerk"], tags: ["auth"],
  }),
  T("n8n", undefined, "automation", "OPEN_SOURCE", true, 1100,
    "Workflow automation with native AI agent nodes (fair-code).", {
    website: "https://n8n.io", github: "n8n-io/n8n", features: ["Visual workflows", "AI nodes"], useCases: ["Automation"], competitors: ["Zapier"],
    tags: ["workflows", "open-source"], updateDaysAgo: 1,
  }),
  T("Zapier", undefined, "automation", "FREEMIUM", true, 2500,
    "The classic no-code automation platform — now with AI agents.", {
    website: "https://zapier.com", features: ["Zaps", "Agents"], useCases: ["Automation"], competitors: ["Make"], tags: ["workflows"],
  }),
  T("Make", undefined, "automation", "FREEMIUM", true, 2000,
    "Visual automation platform (formerly Integromat).", {
    website: "https://make.com", features: ["Scenarios", "AI"], useCases: ["Automation"], competitors: ["Zapier"], tags: ["workflows"],
  }),
  T("Cognition Devin", "cursor", "automation", "PAID", true, 90,
    "Autonomous software engineering via Devin API — 15-minute sessions in the cloud.", {
    website: "https://devin.ai", features: ["Devin API"], useCases: ["Tasks"], competitors: ["Claude Code"], tags: ["agents"], status: "BETA",
  }),
];
