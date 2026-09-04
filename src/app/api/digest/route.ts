import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { topStories } from "@/lib/data";
import { materializeForUser } from "@/lib/notifications";
import { fmtDate, startOfDayUTC, daysAgo } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "json";
  const scope = url.searchParams.get("scope") === "WEEKLY" ? "WEEKLY" : "DAILY";
  const days = scope === "WEEKLY" ? 7 : 1;

  const session = await getSession();
  if (session) {
    try {
      await materializeForUser(session.sub);
    } catch {
      // non-fatal
    }
  }

  const [top, releases, advisories] = await Promise.all([
    topStories(days, 8),
    prisma.release.findMany({
      where: { announcedOn: { gte: startOfDayUTC(daysAgo(days - 1)) } },
      include: { technology: { select: { slug: true, name: true } } },
      orderBy: { announcedOn: "desc" },
      take: 10,
    }),
    prisma.securityAdvisory.findMany({
      where: { publishedAt: { gte: startOfDayUTC(daysAgo(days - 1)) } },
      include: { technology: { select: { slug: true, name: true } } },
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
  ]);

  if (format === "text") {
    const lines: string[] = [`# TechPulse ${scope === "WEEKLY" ? "Week in Review" : "Daily"} — ${fmtDate(new Date())}`, ""];
    lines.push(`## 🔥 Top ${scope === "WEEKLY" ? "stories of the week" : "stories today"}`);
    top.forEach((n, i) => lines.push(`${i + 1}. ${n.title} (${n.importance.toLowerCase()})`));
    if (releases.length) {
      lines.push("", "## 📦 Releases");
      releases.forEach((r) => lines.push(`- ${r.technology.name} ${r.version}`));
    }
    if (advisories.length) {
      lines.push("", "## 🔐 Security");
      advisories.forEach((a) => lines.push(`- ${a.cveId ?? "Advisory"}: ${a.title} (${a.severity.toLowerCase()})`));
    }
    return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  return Response.json({
    scope,
    date: new Date().toISOString().slice(0, 10),
    top: top.map((n) => ({ id: n.id, title: n.title, summary: n.summary, importance: n.importance, href: `/news/${n.id}`, source: n.source.name })),
    releases: releases.map((r) => ({ id: r.id, tech: r.technology.name, version: r.version, href: `/releases/${r.id}` })),
    advisories: advisories.map((a) => ({ id: a.id, cveId: a.cveId, title: a.title, severity: a.severity, href: `/security/${a.id}` })),
  });
}