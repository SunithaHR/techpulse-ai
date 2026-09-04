// ────────────────────────────────────────────────────────────────────────────
// TechPulse AI — canonical constant sets shared by the schema, seed, API & UI.
// Keep string values stable — they are persisted to the database.
// ────────────────────────────────────────────────────────────────────────────

export type Importance = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export const IMPORTANCE_ORDER: Importance[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const IMPORTANCE_LABEL: Record<Importance, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export interface CategoryDef {
  key: string;
  name: string;
  emoji: string;
  color: string;
  description?: string;
}

// ── News feed categories ────────────────────────────────────────────────────
export const NEWS_CATEGORIES: CategoryDef[] = [
  { key: "ai", name: "Artificial Intelligence", emoji: "🤖", color: "#e879f9", description: "AI products, platforms and industry moves" },
  { key: "llm", name: "LLMs & Models", emoji: "🧠", color: "#a78bfa", description: "New and updated large language & foundation models" },
  { key: "dev", name: "Software Development", emoji: "💻", color: "#38bdf8", description: "Engineering practice, architecture and methodology" },
  { key: "web", name: "Web Development", emoji: "🌐", color: "#34d399", description: "Frontend frameworks, browsers and the web platform" },
  { key: "mobile", name: "Mobile Development", emoji: "📱", color: "#fb923c", description: "iOS, Android and cross-platform development" },
  { key: "cloud", name: "Cloud Computing", emoji: "☁️", color: "#60a5fa", description: "Cloud providers, services and infrastructure" },
  { key: "devops", name: "DevOps & Containers", emoji: "🐳", color: "#22d3ee", description: "Docker, Kubernetes, CI/CD and platform engineering" },
  { key: "db", name: "Databases", emoji: "🗄️", color: "#fbbf24", description: "Database engines, query engines and data stores" },
  { key: "security", name: "Security", emoji: "🔐", color: "#f87171", description: "Vulnerabilities, advisories and security engineering" },
  { key: "os", name: "Operating Systems", emoji: "🖥️", color: "#94a3b8", description: "OS releases, kernels and system software" },
  { key: "tools", name: "Developer Tools", emoji: "🧩", color: "#c084fc", description: "Editors, CLIs, testing and productivity tooling" },
  { key: "releases", name: "Software Releases", emoji: "📦", color: "#4ade80", description: "Versioned releases across the ecosystem" },
  { key: "api", name: "APIs", emoji: "🔌", color: "#2dd4bf", description: "API launches, changes and platform interfaces" },
  { key: "research", name: "Research", emoji: "🧪", color: "#5eead4", description: "Papers and breakthroughs from academia & industry labs" },
  { key: "opensource", name: "Open Source", emoji: "🛠️", color: "#a3e635", description: "Open-source projects, foundations and community" },
  { key: "startups", name: "Startups & Funding", emoji: "🚀", color: "#f472b6", description: "New companies, funding rounds and launches" },
  { key: "business", name: "Tech Business", emoji: "💰", color: "#facc15", description: "Earnings, M&A and the business of technology" },
  { key: "gaming", name: "Gaming", emoji: "🎮", color: "#818cf8", description: "Game engines, platforms and gaming technology" },
  { key: "hardware", name: "Hardware", emoji: "🔩", color: "#e2e8f0", description: "Chips, GPUs, devices and compute hardware" },
];

// ── Coarse domains that technologies belong to ──────────────────────────────
export const DOMAIN_CATEGORIES: CategoryDef[] = [
  { key: "ai-ml", name: "AI & Machine Learning", emoji: "🤖", color: "#e879f9" },
  { key: "frontend", name: "Frontend", emoji: "🌐", color: "#34d399" },
  { key: "backend", name: "Backend", emoji: "💻", color: "#38bdf8" },
  { key: "lang", name: "Languages & Runtimes", emoji: "🔤", color: "#a78bfa" },
  { key: "data", name: "Data & Databases", emoji: "🗄️", color: "#fbbf24" },
  { key: "cloud", name: "Cloud & Providers", emoji: "☁️", color: "#60a5fa" },
  { key: "devops", name: "DevOps & Infra", emoji: "🐳", color: "#22d3ee" },
  { key: "mobile", name: "Mobile", emoji: "📱", color: "#fb923c" },
  { key: "security", name: "Security", emoji: "🔐", color: "#f87171" },
  { key: "os", name: "Operating Systems", emoji: "🖥️", color: "#94a3b8" },
  { key: "platforms", name: "Platforms & Services", emoji: "🧩", color: "#c084fc" },
  { key: "hardware", name: "Hardware & Chips", emoji: "🔩", color: "#e2e8f0" },
];

// ── AI tool directory categories ────────────────────────────────────────────
export const TOOL_CATEGORIES: CategoryDef[] = [
  { key: "coding", name: "AI Coding", emoji: "⌨️", color: "#38bdf8" },
  { key: "agents", name: "AI Agents", emoji: "🕵️", color: "#a78bfa" },
  { key: "assistants", name: "AI Assistants", emoji: "💬", color: "#22d3ee" },
  { key: "voice", name: "AI Voice", emoji: "🎙️", color: "#f472b6" },
  { key: "video", name: "AI Video", emoji: "🎬", color: "#fb7185" },
  { key: "image", name: "AI Image Generation", emoji: "🎨", color: "#c084fc" },
  { key: "writing", name: "AI Writing", emoji: "✍️", color: "#fb923c" },
  { key: "research", name: "AI Research", emoji: "🧪", color: "#5eead4" },
  { key: "search", name: "AI Search", emoji: "🔎", color: "#2dd4bf" },
  { key: "productivity", name: "AI Productivity", emoji: "⚡", color: "#facc15" },
  { key: "automation", name: "AI Automation", emoji: "🔁", color: "#34d399" },
  { key: "devtools", name: "AI Developer Tools", emoji: "🛠️", color: "#a3e635" },
  { key: "saas", name: "AI SaaS", emoji: "🏢", color: "#60a5fa" },
  { key: "api", name: "AI APIs", emoji: "🔌", color: "#2dd4bf" },
  { key: "infra", name: "AI Infrastructure", emoji: "🏗️", color: "#94a3b8" },
  { key: "models", name: "AI Models", emoji: "🧠", color: "#a78bfa" },
  { key: "testing", name: "AI Testing", emoji: "✅", color: "#4ade80" },
  { key: "security", name: "AI Security", emoji: "🛡️", color: "#f87171" },
];

export const ALL_CATEGORY_TYPES = {
  NEWS: "NEWS",
  DOMAIN: "DOMAIN",
  TOOL: "TOOL",
} as const;

export function categoryByKey(defs: CategoryDef[], key: string): CategoryDef {
  return defs.find((c) => c.key === key) ?? defs[0];
}

// ── News kinds ──────────────────────────────────────────────────────────────
export const NEWS_KIND = {
  NEWS: "NEWS",
  RELEASE_ANNOUNCEMENT: "RELEASE_ANNOUNCEMENT",
  SECURITY_ADVISORY: "SECURITY_ADVISORY",
  RESEARCH_PAPER: "RESEARCH_PAPER",
  MODEL_RELEASE: "MODEL_RELEASE",
  TOOL_LAUNCH: "TOOL_LAUNCH",
  GITHUB_RELEASE: "GITHUB_RELEASE",
  COMPANY_NEWS: "COMPANY_NEWS",
} as const;

export const NEWS_KIND_LABEL: Record<string, string> = {
  NEWS: "News",
  RELEASE_ANNOUNCEMENT: "Release",
  SECURITY_ADVISORY: "Security advisory",
  RESEARCH_PAPER: "Research paper",
  MODEL_RELEASE: "Model release",
  TOOL_LAUNCH: "Tool launch",
  GITHUB_RELEASE: "GitHub release",
  COMPANY_NEWS: "Company",
};

// ── Importance tones (literal Tailwind classes so JIT keeps them) ───────────
export const IMPORTANCE_META: Record<
  Importance,
  { label: string; chip: string; dot: string; text: string; ring: string }
> = {
  CRITICAL: {
    label: "Critical",
    chip: "bg-red-500/10 text-red-300 ring-red-400/30",
    dot: "bg-red-400",
    text: "text-red-300",
    ring: "ring-red-400/40",
  },
  HIGH: {
    label: "High",
    chip: "bg-orange-500/10 text-orange-300 ring-orange-400/30",
    dot: "bg-orange-400",
    text: "text-orange-300",
    ring: "ring-orange-400/30",
  },
  MEDIUM: {
    label: "Medium",
    chip: "bg-sky-500/10 text-sky-300 ring-sky-400/30",
    dot: "bg-sky-400",
    text: "text-sky-300",
    ring: "ring-sky-400/30",
  },
  LOW: {
    label: "Low",
    chip: "bg-slate-500/10 text-slate-300 ring-slate-400/30",
    dot: "bg-slate-400",
    text: "text-slate-300",
    ring: "ring-slate-400/30",
  },
};

export const SEVERITY_META: Record<string, { chip: string; label: string }> = {
  CRITICAL: { chip: "bg-red-500/15 text-red-300 ring-red-400/40", label: "Critical" },
  HIGH: { chip: "bg-orange-500/15 text-orange-300 ring-orange-400/40", label: "High" },
  MEDIUM: { chip: "bg-yellow-500/15 text-yellow-300 ring-yellow-400/40", label: "Medium" },
  LOW: { chip: "bg-slate-500/15 text-slate-300 ring-slate-400/40", label: "Low" },
};

export const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

// ── Entity type vocabulary for Follow / SavedItem / links ───────────────────
export const ENTITY_TYPE = {
  TECHNOLOGY: "TECHNOLOGY",
  COMPANY: "COMPANY",
  AIMODEL: "AIMODEL",
  AITOOL: "AITOOL",
  REPOSITORY: "REPOSITORY",
  NEWS: "NEWS",
  RELEASE: "RELEASE",
  ADVISORY: "ADVISORY",
  TOPIC: "TOPIC",
} as const;

export const ENTITY_TYPE_LABEL: Record<string, string> = {
  TECHNOLOGY: "Technology",
  COMPANY: "Company",
  AIMODEL: "AI model",
  AITOOL: "AI tool",
  REPOSITORY: "Repository",
  NEWS: "News",
  RELEASE: "Release",
  ADVISORY: "Security advisory",
  TOPIC: "Topic",
};

// ── Technology kinds ────────────────────────────────────────────────────────
export const TECH_KIND = {
  LANGUAGE: "LANGUAGE",
  FRAMEWORK: "FRAMEWORK",
  LIBRARY: "LIBRARY",
  DATABASE: "DATABASE",
  TOOL: "TOOL",
  CLOUD: "CLOUD",
  PLATFORM: "PLATFORM",
  SERVICE: "SERVICE",
  OS: "OS",
  HARDWARE: "HARDWARE",
  MODEL_FAMILY: "MODEL_FAMILY",
  PROTOCOL: "PROTOCOL",
} as const;

export const TECH_KIND_LABEL: Record<string, string> = {
  LANGUAGE: "Language",
  FRAMEWORK: "Framework",
  LIBRARY: "Library",
  DATABASE: "Database",
  TOOL: "Developer tool",
  CLOUD: "Cloud",
  PLATFORM: "Platform",
  SERVICE: "Service",
  OS: "Operating system",
  HARDWARE: "Hardware",
  MODEL_FAMILY: "Model family",
  PROTOCOL: "Protocol",
};

// ── Release kinds ───────────────────────────────────────────────────────────
export const RELEASE_KIND_LABEL: Record<string, string> = {
  MAJOR: "Major",
  MINOR: "Minor",
  PATCH: "Patch",
  SECURITY: "Security",
  BETA: "Beta",
  RC: "Release candidate",
  NIGHTLY: "Nightly",
};

// ── Sources ─────────────────────────────────────────────────────────────────
export const SOURCE_TYPE = {
  OFFICIAL_DOCS: "OFFICIAL_DOCS",
  OFFICIAL_BLOG: "OFFICIAL_BLOG",
  GITHUB: "GITHUB",
  CHANGELOG: "CHANGELOG",
  RESEARCH: "RESEARCH",
  PUBLICATION: "PUBLICATION",
  COMMUNITY: "COMMUNITY",
  ADVISORY: "ADVISORY",
} as const;

export const SOURCE_TYPE_LABEL: Record<string, string> = {
  OFFICIAL_DOCS: "Official docs",
  OFFICIAL_BLOG: "Official blog",
  GITHUB: "GitHub",
  CHANGELOG: "Changelog",
  RESEARCH: "Research",
  PUBLICATION: "Publication",
  COMMUNITY: "Community",
  ADVISORY: "Advisory feed",
};

// Source reliability tiers used for ranking (§29)
export const SOURCE_RANK: Record<string, number> = {
  OFFICIAL_DOCS: 10,
  OFFICIAL_BLOG: 9,
  GITHUB: 8,
  CHANGELOG: 8,
  RESEARCH: 7,
  PUBLICATION: 6,
  COMMUNITY: 4,
  ADVISORY: 9,
};

// ── Navigation ──────────────────────────────────────────────────────────────
export const NAV_SECTIONS: { title: string; items: { href: string; label: string; icon: string; match?: string }[] }[] = [
  {
    title: "Intelligence",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard", match: "/dashboard" },
      { href: "/timeline", label: "Timeline", icon: "calendar-range", match: "/timeline" },
      { href: "/digest", label: "Digest", icon: "newspaper", match: "/digest" },
      { href: "/chat", label: "AI Chat", icon: "bot", match: "/chat" },
    ],
  },
  {
    title: "Track",
    items: [
      { href: "/news", label: "News", icon: "flame", match: "/news" },
      { href: "/releases", label: "Releases", icon: "package", match: "/releases" },
      { href: "/ai", label: "AI", icon: "brain", match: "/ai" },
      { href: "/security", label: "Security", icon: "shield", match: "/security" },
      { href: "/github", label: "GitHub", icon: "git-branch", match: "/github" },
    ],
  },
  {
    title: "Explore",
    items: [
      { href: "/companies", label: "Companies", icon: "building-2", match: "/companies" },
      { href: "/technologies", label: "Technologies", icon: "boxes", match: "/technologies" },
      { href: "/compare", label: "Compare", icon: "scale", match: "/compare" },
      { href: "/search", label: "Search", icon: "search", match: "/search" },
    ],
  },
  {
    title: "Personal",
    items: [
      { href: "/watchlist", label: "Watchlist", icon: "star", match: "/watchlist" },
      { href: "/saved", label: "Saved", icon: "bookmark", match: "/saved" },
      { href: "/notifications", label: "Notifications", icon: "bell", match: "/notifications" },
    ],
  },
];

export const APP_NAME = "TechPulse AI";
export const APP_TAGLINE = "Your AI-powered technology intelligence platform";
