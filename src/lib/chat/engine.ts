// TechPulse AI — grounded chat engine.
//
// The engine answers technology questions using the platform's knowledge
// base (news, releases, models, tools, advisories) rather than free text.
// It is intentionally self-contained: no external LLM is required to answer.
// When an LLM provider is configured (see llm.ts), the route streams an
// enhanced, grounded response instead; the local engine remains the fallback
// and the source of citations for both paths.

import { prisma } from "@/lib/db";
import { slugify, fmtDate, asArray, asObject, asString } from "@/lib/utils";
import { IMPORTANCE_ORDER } from "@/lib/constants";

export interface ChatSource {
  title: string;
  url?: string | null;
  kind: string;
  label: string;
  href: string;
}

export interface ChatAnswer {
  text: string;
  sources: ChatSource[];
  followUps: string[];
  subject?: string; // resolved entity label, used for follow-up context
}

export interface HistoryMsg {
  role: string;
  content: string;
}

export interface AnswerOpts {
  history?: HistoryMsg[];
  lastSubject?: string | null;
}

const NON_TECH_PATTERNS: Array<[RegExp, string]> = [
  [/weather/i, "weather"],
  [/who (won|is winning)|football|soccer|nba|nfl|champions league|world cup/i, "sports"],
  [/movie|film|actor|celebrity|gossip/i, "entertainment"],
  [/recipe|ingredients|cooking|dinner|lunch/i, "food"],
  [/stock price of|how is my portfolio|buy stocks/i, "investing"],
  [/who is the (president|prime minister)|election results/i, "politics"],
  [/horoscope|zodiac/i, "horoscope"],
];

interface TimeWindow {
  label: string;
  from?: Date;
  to?: Date;
  rangeDays?: number;
}

interface EntityRef {
  type: "TECHNOLOGY" | "COMPANY" | "MODEL" | "TOOL";
  slug: string;
  label: string;
}

interface Scope {
  guard?: string;
  focus: "NEWS" | "RELEASES" | "MODELS" | "TOOLS" | "SECURITY" | "GENERAL";
  time?: TimeWindow;
  entities: EntityRef[];
  compare: boolean;
  keywords: string[];
}

// ── Entity catalog (loaded once per request) ────────────────────────────────
interface Catalog {
  techs: Array<{ slug: string; name: string; kind: string; isFeatured: boolean }>;
  companies: Array<{ slug: string; name: string }>;
  models: Array<{ slug: string; name: string; family: string | null }>;
  tools: Array<{ slug: string; name: string }>;
}

async function loadCatalog(): Promise<Catalog> {
  const [techs, companies, models, tools] = await Promise.all([
    prisma.technology.findMany({ select: { slug: true, name: true, kind: true, isFeatured: true } }),
    prisma.company.findMany({ select: { slug: true, name: true } }),
    prisma.aIModel.findMany({ select: { slug: true, name: true, family: true } }),
    prisma.aITool.findMany({ select: { slug: true, name: true } }),
  ]);
  return { techs, companies, models, tools };
}

function matches(question: string, name: string): boolean {
  if (!name) return false;
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i").test(question);
}

// Prefer longest matching label so "Next.js" wins over "Next".
function findEntities(q: string, cat: Catalog): EntityRef[] {
  const out: EntityRef[] = [];
  const push = (type: EntityRef["type"], slug: string, label: string) => {
    if (!out.some((e) => e.slug === slug && e.type === type)) out.push({ type, slug, label });
  };
  const all: Array<[EntityRef["type"], string, string]> = [
    ...cat.techs.map((t): [EntityRef["type"], string, string] => ["TECHNOLOGY", t.slug, t.name]),
    ...cat.companies.map((c): [EntityRef["type"], string, string] => ["COMPANY", c.slug, c.name]),
    ...cat.models.map((m): [EntityRef["type"], string, string] => ["MODEL", m.slug, m.name]),
    ...cat.tools.map((t): [EntityRef["type"], string, string] => ["TOOL", t.slug, t.name]),
  ].sort((a, b) => b[2].length - a[2].length);

  for (const [type, slug, name] of all) {
    if (matches(q, name)) push(type, slug, name);
  }

  // Model families: "Claude", "GPT", "Gemini", "Llama" — map family → latest model slug.
  if (out.length === 0) {
    for (const m of cat.models) {
      if (m.family && matches(q, m.family)) {
        const latest = cat.models.filter((x) => x.family === m.family).sort((a, b) => b.slug.localeCompare(a.slug))[0];
        if (latest) push("MODEL", latest.slug, m.family);
        break;
      }
    }
  }
  return out.slice(0, 3);
}

// ── Intent detection ────────────────────────────────────────────────────────
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function parseTime(q: string): TimeWindow | undefined {
  const now = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  if (/\btoday\b/i.test(q)) return { label: "today", from: daysAgo(0) };
  if (/\byesterday\b/i.test(q)) return { label: "yesterday", from: daysAgo(1), to: daysAgo(0) };
  const lastX = q.match(/\blast\s+(\d+)\s+days?\b/i);
  if (lastX) {
    const n = Math.min(90, parseInt(lastX[1], 10) || 7);
    return { label: `last ${n} days`, from: daysAgo(n - 1), rangeDays: n };
  }
  if (/\bthis\s+week\b/i.test(q)) return { label: "this week", from: daysAgo(6), rangeDays: 7 };
  if (/\bthis\s+month\b/i.test(q)) {
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    return { label: "this month", from: d };
  }
  if (/\blast\s+month\b/i.test(q)) {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { label: "last month", from: d, to: new Date(now.getFullYear(), now.getMonth(), 1) };
  }
  const monthIdx = MONTHS.findIndex((m) => q.toLowerCase().includes(m));
  if (monthIdx >= 0) {
    const mName = MONTHS[monthIdx];
    const year = Number((q.match(/\b(20\d{2})\b/) ?? [])[1] ?? now.getFullYear());
    const day = Number((q.match(new RegExp(`${mName}[a-z]*\\s+(\\d{1,2})`, "i")) ?? [])[1] ?? 1);
    const from = new Date(year, monthIdx, day);
    if (!Number.isNaN(from.getTime())) {
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      return { label: `${fmtDate(from)}`, from, to };
    }
  }
  return undefined;
}

function detectFocus(q: string): Scope["focus"] {
  const s = q.toLowerCase();
  if (/\b(security|vulnerabilit|cve|exploit|breach|advis|patch (for|critical))\b/.test(s)) return "SECURITY";
  if (/\b(model|gpt|claude|gemini|llama|mistral|deepseek|qwen|grok|phi|context window|benchmark)\b/.test(s)) return "MODELS";
  if (/\b(tool|app(lication)?|assistant|agent|directory)\b/.test(s) && /\b(ai|new|launch|startup)\b/.test(s)) return "TOOLS";
  if (/\b(release|version|changelog|upgrade|update|breaking|what changed|released)\b/.test(s)) return "RELEASES";
  return "NEWS";
}

function detectScope(q: string, cat: Catalog, lastSubject?: string | null): Scope {
  for (const [re, label] of NON_TECH_PATTERNS) {
    if (re.test(q) && !cat.techs.some((t) => matches(q, t.name))) {
      return {
        guard: label,
        focus: "GENERAL",
        entities: [],
        compare: false,
        keywords: [],
      };
    }
  }
  const compare = /\b(vs\.?|versus|compare|comparison)\b/i.test(q);
  let entities = findEntities(q, cat);

  // Follow-up: no entity but previous subject known → carry it over.
  if (entities.length === 0 && lastSubject) {
    const tech = cat.techs.find((t) => t.name.toLowerCase() === lastSubject.toLowerCase());
    if (tech) entities = [{ type: "TECHNOLOGY", slug: tech.slug, label: tech.name }];
    else {
      const company = cat.companies.find((c) => c.name.toLowerCase() === lastSubject.toLowerCase());
      if (company) entities = [{ type: "COMPANY", slug: company.slug, label: company.name }];
    }
  }

  const focus = detectFocus(q);
  const time = parseTime(q);
  return { focus, time, entities, compare, keywords: q.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2) };
}

// ── Retrieval ───────────────────────────────────────────────────────────────
async function retrieve(scope: Scope) {
  const from = scope.time?.from;
  const to = scope.time?.to;
  const inRange = { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) };
  const newsWhere = {
    isPrimary: true,
    ...(from || to ? { publishedAt: inRange } : { publishedAt: { gte: daysAgoDate(13) } }),
    ...(scope.entities.length === 1
      ? scope.entities[0].type === "TECHNOLOGY"
        ? { technologies: { some: { technology: { slug: scope.entities[0].slug } } } }
        : scope.entities[0].type === "COMPANY"
          ? { companies: { some: { company: { slug: scope.entities[0].slug } } } }
          : {}
      : {}),
  };

  const news = await prisma.news.findMany({
    where: newsWhere,
    include: {
      category: true,
      source: true,
      technologies: { include: { technology: { select: { slug: true, name: true } } }, take: 2 },
      companies: { include: { company: { select: { slug: true, name: true } } }, take: 2 },
    },
    orderBy: [{ importance: "asc" }, { publishedAt: "desc" }],
    take: scope.focus === "SECURITY" ? 40 : 25,
  });

  const advisories = scope.focus === "SECURITY" || scope.entities[0]?.type === "TECHNOLOGY"
    ? await prisma.securityAdvisory.findMany({
        where: {
          ...(from || to ? { publishedAt: inRange } : { publishedAt: { gte: daysAgoDate(29) } }),
          ...(scope.entities[0]?.type === "TECHNOLOGY" ? { technology: { slug: scope.entities[0].slug } } : {}),
        },
        include: { technology: true },
        orderBy: [{ publishedAt: "desc" }],
        take: 8,
      })
    : [];

  let releases: any[] = [];
  if (scope.focus === "RELEASES" || scope.entities[0]?.type === "TECHNOLOGY" || scope.entities[0]?.type === "COMPANY") {
    releases = await prisma.release.findMany({
      where: {
        ...(from || to ? { announcedOn: inRange } : { announcedOn: { gte: daysAgoDate(89) } }),
        ...(scope.entities[0]?.type === "TECHNOLOGY"
          ? { technology: { slug: scope.entities[0].slug } }
          : scope.entities[0]?.type === "COMPANY"
            ? { company: { slug: scope.entities[0].slug } }
            : {}),
      },
      include: { technology: { select: { slug: true, name: true, accent: true } }, company: { select: { slug: true, name: true } } },
      orderBy: { announcedOn: "desc" },
      take: 12,
    });
  }

  let models: any[] = [];
  if (scope.focus === "MODELS" || scope.entities.some((e) => e.type === "MODEL")) {
    models = await prisma.aIModel.findMany({
      where: scope.entities.some((e) => e.type === "MODEL") ? { slug: { in: scope.entities.filter((e) => e.type === "MODEL").map((e) => e.slug) } } : {},
      include: { provider: { select: { slug: true, name: true, accent: true } } },
      orderBy: { releasedOn: "desc" },
      take: 8,
    });
  }

  let tools: any[] = [];
  if (scope.focus === "TOOLS" || scope.entities.some((e) => e.type === "TOOL")) {
    tools = await prisma.aITool.findMany({
      where: scope.entities.some((e) => e.type === "TOOL") ? { slug: { in: scope.entities.filter((e) => e.type === "TOOL").map((e) => e.slug) } } : {},
      include: { company: true, primaryCategory: true },
      orderBy: { launchDate: "desc" },
      take: 8,
    });
  }

  return { news, advisories, releases, models, tools };
}

function daysAgoDate(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Composition ─────────────────────────────────────────────────────────────
const IMP: Record<string, string> = { CRITICAL: "🔴", HIGH: "🟠", MEDIUM: "🔵", LOW: "⚪" };

function cite(sources: ChatSource[], item: { title: string; href: string; label: string }): string {
  const idx = sources.findIndex((s) => s.href === item.href);
  if (idx >= 0) return ` **[${idx + 1}]**`;
  sources.push({ title: item.title, href: item.href, label: item.label, kind: item.label.split(" ")[0] });
  return ` **[${sources.length}]**`;
}

function bullet(item: any, sources: ChatSource[], withImp = true): string {
  const imp = withImp && item.importance ? IMP[item.importance] ?? "" : "";
  const src = item.source
    ? cite(sources, { title: item.source.name, href: `/news/${item.id}`, label: "News" })
    : "";
  const when = item.publishedAt ? ` · ${fmtDate(item.publishedAt)}` : "";
  return `- ${imp} **${item.title}**${when}${src}\n  ${item.summary ?? ""}`;
}

function compose(scope: Scope, ctx: Awaited<ReturnType<typeof retrieve>>, sources: ChatSource[]): { text: string; subject?: string } {
  const entity = scope.entities[0];
  const timeLabel = scope.time?.label;

  // ── Guardrail ────────────────────────────────────────────────────────────
  if (scope.guard) {
    return {
      text:
        `I'm **TechPulse AI**, and I'm focused on technology — software, AI, cloud, security, releases, developer tools and the companies behind them.${scope.guard === "weather" ? " For weather, check a forecast app instead. " : " "}I can't help with that topic here.\n\nThings I *can* help with:\n\n- What's new in a framework, language or platform\n- Latest releases and whether they affect you\n- New AI models and tools, compared\n- Security advisories and what to do about them\n- Anything that happened on a specific day or over the last week`,
    };
  }

  // ── Compare ──────────────────────────────────────────────────────────────
  if (scope.compare && scope.entities.length >= 2) {
    const sections: string[] = [];
    const techRefs = scope.entities.filter((e) => e.type === "TECHNOLOGY");
    const modelRefs = scope.entities.filter((e) => e.type === "MODEL");
    if (modelRefs.length >= 2) {
      const models = ctx.models.filter((m) => modelRefs.some((r) => r.slug === m.slug));
      if (models.length >= 2) {
        sections.push(`## ${models.map((m) => m.name).join(" vs ")}\n\n| Spec | ${models.map(() => "").join(" | ")} |\n| --- |${models.map(() => " --- ").join("|")} |`);
        const row = (label: string, fn: (m: any) => string) =>
          `| ${label} | ${models.map((m) => fn(m)).join(" | ")} |`;
        const p = (m: any) => asObject<{ inputPerM?: number; outputPerM?: number }>(m.pricing);
        sections.push(row("Context", (m) => m.contextWindow ? `${(m.contextWindow / 1000).toFixed(0)}K` : "—"));
        sections.push(row("Max output", (m) => m.maxOutput ? `${(m.maxOutput / 1000).toFixed(0)}K` : "—"));
        sections.push(row("Reasoning", (m) => asObject(m.capabilities).reasoning ? "✅" : "—"));
        sections.push(row("Tool calling", (m) => asObject(m.capabilities).toolCalling ? "✅" : "—"));
        sections.push(row("Vision", (m) => asObject(m.capabilities).vision ? "✅" : "—"));
        sections.push(row("Open weights", (m) => m.openSource ? "✅" : "—"));
        sections.push(row("Input /1M", (m) => `$${p(m).inputPerM?.toFixed(2) ?? "—"}`));
        sections.push(row("Output /1M", (m) => `$${p(m).outputPerM?.toFixed(2) ?? "—"}`));
        sections.push(row("Released", (m) => m.releasedOn ? fmtDate(m.releasedOn) : "—"));
        for (const m of models) cite(sources, { title: `${m.name} — model page`, href: `/ai/models/${m.slug}`, label: "Model" });
        const prices = models.map((m) => p(m).inputPerM ?? 0);
        const cheapest = models[prices.indexOf(Math.min(...prices))];
        if (cheapest && models.length >= 2) {
          sections.push(`**Bottom line:** ${cheapest.name} is the cheapest on input tokens ($${(p(cheapest).inputPerM ?? 0).toFixed(2)}/1M); choose by reasoning needs and context budget. Want me to dig into a specific one?`);
        }
      }
    }
    if (techRefs.length >= 2) {
      const releasesByTech = new Map<string, any[]>();
      for (const r of ctx.releases) {
        const arr = releasesByTech.get(r.technology.name) ?? [];
        arr.push(r);
        releasesByTech.set(r.technology.name, arr);
      }
      const names = techRefs.map((t) => t.label);
      sections.push(`## ${names.join(" vs ")}\n\n| | ${names.join(" | ")} |\n| --- |${names.map(() => " --- ").join("|")} |`);
      const latest = (name: string) => releasesByTech.get(name)?.[0];
      sections.push(`| Latest version | ${names.map((n) => latest(n)?.version ?? "—").join(" | ")} |`);
      sections.push(`| Latest release | ${names.map((n) => latest(n) ? fmtDate(latest(n).announcedOn) : "—").join(" | ")} |`);
      sections.push(`| Type | ${techRefs.map((t) => t.label).join(" | ")} |`);
      for (const t of techRefs) {
        const l = latest(t.label);
        if (l) cite(sources, { title: `${l.technology.name} ${l.version}`, href: `/releases/${l.id}`, label: "Release" });
        else cite(sources, { title: t.label, href: `/technologies/${t.slug}`, label: "Technology" });
      }
      sections.push(`**Note:** these are the technologies as tracked by TechPulse — ask me for a deeper dive on any one of them.`);
    }
    if (sections.length === 0) {
      return { text: `I found the entities you mentioned, but I need at least two items of the same kind to compare (e.g. two AI models, or two frameworks). Try “compare GPT vs Claude” or “compare React vs Vue”.` };
    }
    return { text: sections.join("\n\n") };
  }

  // ── Security focus (explicit security questions) ────────────────────────
  if (scope.focus === "SECURITY") {
    const advs = ctx.advisories.slice(0, 6);
    const lines: string[] = [];
    if (advs.length > 0) {
      lines.push(`## ${entity ? `Security for ${entity.label}` : "Security advisories"}${timeLabel ? ` · ${timeLabel}` : " (last 30 days)"}\n`);
      for (const a of advs) {
        const aff = asArray<{ versions?: string }>(a.affected);
        const fix = asArray<{ versions?: string }>(a.fixedVersions);
        const imp = IMP[a.severity] ?? "";
        const c = cite(sources, { title: a.cveId ?? a.title, href: `/security/${a.id}`, label: "Advisory" });
        lines.push(`- ${imp} **${a.cveId ? `${a.cveId} — ` : ""}${a.title}**${c} · ${fmtDate(a.publishedAt)}${a.technology ? ` · ${a.technology.name}` : ""}`);
        if (aff[0]?.versions) lines.push(`  - Affected: \`${aff[0].versions}\``);
        if (fix[0]?.versions) lines.push(`  - Fixed in: \`${fix[0].versions}\``);
        if (a.recommendation) lines.push(`  - ${a.recommendation}`);
      }
      if (ctx.news.some((n) => n.kind === "SECURITY_ADVISORY")) {
        lines.push(`\n### Also in the news\n`);
        lines.push(ctx.news.filter((n) => n.kind === "SECURITY_ADVISORY").slice(0, 3).map((n) => bullet(n, sources)).join("\n"));
      }
      lines.push(`\n**What you should do:** upgrade affected packages to the fixed versions above, and check whether the advisory affects your deployment.`);
    } else {
      lines.push(`## Security${entity ? ` · ${entity.label}` : ""}\n\nNo tracked advisories match${timeLabel ? ` ${timeLabel}` : " in the last 30 days"}. The knowledge base only contains sample data — real-world ingestion will populate it continuously.`);
    }
    return { text: lines.join("\n") };
  }

  // ── Release / "what changed" focus with an entity ────────────────────────
  if (entity && (scope.focus === "RELEASES" || scope.focus === "NEWS")) {
    const rels = ctx.releases.slice(0, 6);
    const lines: string[] = [];
    if (rels.length > 0) {
      lines.push(`## ${entity.label} — latest changes${timeLabel ? ` · ${timeLabel}` : ""}\n`);
      for (const r of rels) {
        const log = asObject<{ highlights?: string[]; breaking?: string[]; fixes?: string[]; security?: string[]; performance?: string[]; migration?: string[] }>(r.changelog);
        const c = cite(sources, { title: `${r.technology.name} ${r.version}`, href: `/releases/${r.id}`, label: "Release" });
        lines.push(`### ${r.technology.name} ${r.version}${c} · ${fmtDate(r.announcedOn)}${r.previousVersion ? ` (from ${r.previousVersion})` : ""}`);
        if (asArray(log.highlights).length) lines.push(`\n${asArray(log.highlights).map((h) => `- ${h}`).join("\n")}`);
        if (asArray(log.breaking).length) lines.push(`\n**Breaking changes:**\n${asArray(log.breaking).map((b) => `- ⚠️ ${b}`).join("\n")}`);
        if (asArray(log.security).length) lines.push(`\n**Security:**\n${asArray(log.security).map((b) => `- 🔒 ${b}`).join("\n")}`);
        if (asArray(log.performance).length) lines.push(`\n**Performance:**\n${asArray(log.performance).map((b) => `- ⚡ ${b}`).join("\n")}`);
        if (asArray(log.migration).length) lines.push(`\n**Migration:**\n${asArray(log.migration).map((b) => `- 🧭 ${b}`).join("\n")}`);
      }
      lines.push(`\n**Developer impact:** ${rels.some((r) => r.importance === "CRITICAL" || r.importance === "HIGH") ? "high — review the breaking changes and security notes above before upgrading." : "moderate — review highlights; upgrade when convenient."}`);
      lines.push(`\nWant me to walk through whether any of these affect *your* stack?`);
    } else if (ctx.news.length > 0) {
      lines.push(`## ${entity.label} — recent news\n`);
      lines.push(ctx.news.slice(0, 6).map((n) => bullet(n, sources)).join("\n"));
    } else {
      lines.push(`## ${entity.label}\n\nNothing tracked for ${entity.label} in this window yet. Try a wider range, e.g. “${entity.label} releases last 90 days”.`);
    }
    if (entity.type === "TECHNOLOGY" && ctx.advisories.length > 0) {
      lines.push(`\n### Security notes\n`);
      for (const a of ctx.advisories.slice(0, 3)) {
        const c = cite(sources, { title: a.cveId ?? a.title, href: `/security/${a.id}`, label: "Advisory" });
        const fix = asArray<{ versions?: string }>(a.fixedVersions);
        lines.push(`- ${IMP[a.severity] ?? ""} **${a.cveId ? `${a.cveId} — ` : ""}${a.title}**${c} · ${fmtDate(a.publishedAt)}${fix[0]?.versions ? ` · fixed in \`${fix[0].versions}\`` : ""}`);
      }
      lines.push(`\nFull advisories with affected versions live on the /security page.`);
    }
    return { text: lines.join("\n"), subject: entity.label };
  }

  // ── Models focus ─────────────────────────────────────────────────────────
  if (scope.focus === "MODELS") {
    const lines: string[] = [];
    if (ctx.models.length > 0) {
      lines.push(`## Latest AI models${timeLabel ? ` · ${timeLabel}` : ""}\n`);
      for (const m of ctx.models.slice(0, 6)) {
        const p = asObject<{ inputPerM?: number }>(m.pricing);
        const c = cite(sources, { title: `${m.name} — model page`, href: `/ai/models/${m.slug}`, label: "Model" });
        const caps = asObject<Record<string, boolean>>(m.capabilities);
        const bits = [
          m.contextWindow ? `${(m.contextWindow / 1000).toFixed(0)}K context` : "",
          caps.reasoning ? "reasoning" : "",
          caps.toolCalling ? "tool calling" : "",
          m.openSource ? "open weights" : "",
          p.inputPerM != null ? `$${p.inputPerM}/1M in` : "",
        ].filter(Boolean);
        lines.push(`- **${m.name}**${c} · ${m.provider?.name}${m.releasedOn ? ` · ${fmtDate(m.releasedOn)}` : ""}`);
        if (bits.length) lines.push(`  - ${bits.join(" · ")}`);
        lines.push(`  - ${m.description}`);
      }
      lines.push(`\nAsk me to compare any two of these side by side.`);
    } else {
      lines.push(`## AI models\n\nNo models match that query yet. Try “latest OpenAI models” or “compare GPT vs Claude”.`);
    }
    return { text: lines.join("\n") };
  }

  // ── Tools focus ──────────────────────────────────────────────────────────
  if (scope.focus === "TOOLS") {
    const lines: string[] = [];
    if (ctx.tools.length > 0) {
      lines.push(`## AI tools${entity ? ` · ${entity.label}` : ""}\n`);
      for (const t of ctx.tools.slice(0, 6)) {
        const c = cite(sources, { title: `${t.name} — tool page`, href: `/ai/tools/${t.slug}`, label: "Tool" });
        const pricing = t.pricingModel === "FREE" ? "free" : t.pricingModel === "FREEMIUM" ? "freemium" : t.pricingModel === "OPEN_SOURCE" ? "open source" : "paid";
        lines.push(`- **${t.name}**${c} · ${t.company?.name ?? t.primaryCategory?.name ?? ""} · ${pricing}${t.apiAvailable ? " · API" : ""}${t.launchDate ? ` · launched ${fmtDate(t.launchDate)}` : ""}`);
        lines.push(`  - ${t.description}`);
      }
    } else {
      lines.push(`## AI tools\n\nNo tools match that query yet. Try “new AI coding tools” or “AI agents”.`);
    }
    return { text: lines.join("\n") };
  }

  // ── General news / digest ────────────────────────────────────────────────
  const items = ctx.news.filter((n) => n.kind !== "SECURITY_ADVISORY").slice(0, 14);
  const lines: string[] = [];
  if (items.length > 0) {
    lines.push(`## ${entity ? `What's new with ${entity.label}` : "Technology updates"}${timeLabel ? ` · ${timeLabel}` : " · last 14 days"}\n`);
    if (entity) {
      lines.push(items.slice(0, 8).map((n) => bullet(n, sources)).join("\n"));
    } else {
      // group by day
      const byDay = new Map<string, typeof items>();
      for (const n of items) {
        const k = n.publishedAt.toISOString().slice(0, 10);
        const arr = byDay.get(k) ?? [];
        arr.push(n);
        byDay.set(k, arr);
      }
      const days = [...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 5);
      for (const [day, list] of days) {
        const order = IMPORTANCE_ORDER as readonly string[];
        const top = [...list].sort((a, b) => order.indexOf(a.importance) - order.indexOf(b.importance)).slice(0, 4);
        lines.push(`### ${fmtDate(day)}\n`);
        lines.push(top.map((n) => bullet(n, sources)).join("\n"));
      }
    }
    const byImp = (level: string) => items.filter((n) => n.importance === level).length;
    lines.push(`\n**At a glance:** ${byImp("CRITICAL")} critical · ${byImp("HIGH")} high · ${byImp("MEDIUM")} medium · ${byImp("LOW")} low impact items${timeLabel ? ` in ${timeLabel}` : ""}. Ask me to drill into any of them.`);
  } else {
    lines.push(`## ${timeLabel ? `What happened ${timeLabel}` : "Technology updates"}\n\nNo primary stories in this window yet — the knowledge base is seeded with demo data; live ingestion will keep this fresh.`);
  }
  return { text: lines.join("\n") };
}

// ── Public API ──────────────────────────────────────────────────────────────
export async function answer(question: string, opts: AnswerOpts = {}): Promise<ChatAnswer> {
  const cat = await loadCatalog();
  const lastSubject = opts.lastSubject ?? null;
  const scope = detectScope(question, cat, lastSubject);
  const sources: ChatSource[] = [];
  const ctx = await retrieve(scope);
  const { text, subject } = compose(scope, ctx, sources);

  const followUps = scope.entities.length > 0
    ? [
        `Does the latest ${scope.entities[0].label} update affect me?`,
        `What are the top stories about ${scope.entities[0].label} this month?`,
        scope.entities.length >= 2 ? `Compare ${scope.entities[0].label} vs ${scope.entities[1].label} in detail` : `What are the alternatives to ${scope.entities[0].label}?`,
      ]
    : scope.focus === "SECURITY"
      ? ["What critical CVEs are active right now?", "Which of my followed technologies have open advisories?"]
      : timeFollowUps(scope);

  return { text, sources: dedupeSources(sources), followUps: followUps.filter(Boolean).slice(0, 3), subject };
}

function timeFollowUps(scope: Scope): string[] {
  if (scope.time?.rangeDays && scope.time.rangeDays <= 7) return ["What new AI models came out this week?", "Any breaking changes I should know about?", "Give me the week in review"];
  return ["What are the latest releases this month?", "Which companies made the biggest announcements?", "Summarize the last 7 days"];
}

function dedupeSources(sources: ChatSource[]): ChatSource[] {
  const seen = new Set<string>();
  const out: ChatSource[] = [];
  for (const s of sources) {
    const key = s.href ?? s.title;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out.slice(0, 10);
}

/** Build the grounded context blob used when an external LLM is configured. */
export async function buildContext(question: string, opts: AnswerOpts = {}): Promise<{ scopeSummary: string; context: string; local: ChatAnswer }> {
  const local = await answer(question, opts);
  const cat = await loadCatalog();
  const scope = detectScope(question, cat, opts.lastSubject ?? null);
  const ctx = await retrieve(scope);
  const newsBlob = ctx.news.slice(0, 12).map((n) => `[${fmtDate(n.publishedAt)}] (${n.importance}) ${n.title} — ${n.summary} /${n.id}`).join("\n");
  const relBlob = ctx.releases.slice(0, 10).map((r) => `${r.technology.name} ${r.version} (${fmtDate(r.announcedOn)}) — ${r.summary ?? ""}`).join("\n");
  const advBlob = ctx.advisories.slice(0, 8).map((a) => `${a.cveId ?? "ADV"} ${a.title} (${a.severity}) affected=${JSON.stringify(a.affected)} fixed=${JSON.stringify(a.fixedVersions)}`).join("\n");
  const modelBlob = ctx.models.slice(0, 8).map((m) => `${m.name} (${m.provider?.name}) ${m.contextWindow ? `${m.contextWindow / 1000}K ctx` : ""} open=${m.openSource} price=${JSON.stringify(m.pricing)}`).join("\n");
  return {
    scopeSummary: `Time window: ${scope.time?.label ?? "last 14 days"}; focus: ${scope.focus}; entities: ${scope.entities.map((e) => e.label).join(", ") || "none"}; compare: ${scope.compare}`,
    context: `# Tracked knowledge base\n\n## News\n${newsBlob}\n\n## Releases\n${relBlob}\n\n## Security advisories\n${advBlob}\n\n## AI models\n${modelBlob}`,
    local,
  };
}

export function assistantIdentity(): string {
  return [
    "You are TechPulse AI, the assistant for a technology intelligence platform.",
    "Answer ONLY technology questions (software, AI, cloud, security, releases, developer tools, tech business).",
    "If asked about anything non-technology (weather, sports, movies, politics, cooking), politely decline and redirect to technology topics.",
    "Ground every answer in the provided tracked knowledge base — cite items with [n] matching the sources list, and link using the /news/{id}, /releases/{id}, /ai/models/{slug}, /ai/tools/{slug}, /security/{id}, /technologies/{slug} URLs.",
    "Use markdown with headings and bullets. Include a '## Sources' section at the end.",
    "Never invent releases, versions, or CVEs that are not in the provided context. If the context has no relevant data, say so.",
    "Keep answers structured and developer-friendly; bold the important parts.",
  ].join(" ");
}