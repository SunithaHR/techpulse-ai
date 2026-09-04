import Link from "next/link";
import { AdminActions } from "@/components/admin-actions";
import { Stat, SectionHeader, Card, Chip } from "@/components/ui";
import { prisma } from "@/lib/db";
import { overviewStats } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export default async function AdminPage() {
  const [stats, jobs, users, sources] = await Promise.all([
    overviewStats(),
    prisma.ingestionJob.findMany({ orderBy: { startedAt: "desc" }, take: 8, include: { source: { select: { name: true } } } }),
    prisma.user.count(),
    prisma.source.count(),
  ]);

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <div className="text-[14px] font-semibold">Data operations</div>
          <p className="mt-0.5 text-[12px] text-[color:var(--text-3)]">Run the ingestion pipeline or reset to the curated demo dataset.</p>
        </div>
        <AdminActions />
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <Stat label="News" value={stats.news} />
        <Stat label="Releases" value={stats.releases} />
        <Stat label="Models" value={stats.models} />
        <Stat label="Tools" value={stats.tools} />
        <Stat label="Advisories" value={stats.advisories} />
        <Stat label="Repos" value={stats.repos} />
        <Stat label="Companies" value={stats.companies} />
        <Stat label="Technologies" value={stats.techs} />
        <Stat label="Sources" value={sources} />
        <Stat label="Users" value={users} />
        <Stat label="Critical" value={stats.critical} accent="#f87171" />
        <Stat label="High" value={stats.high} accent="#fb923c" />
      </div>

      <section>
        <SectionHeader title="Recent ingestion jobs" right={<Link href="/admin/jobs" className="text-[12px] text-cyan-500 hover:underline">All jobs →</Link>} />
        <div className="panel divide-y divide-[color:var(--border)]">
          {jobs.length === 0 && <p className="p-4 text-[12.5px] text-[color:var(--text-3)]">No jobs yet — run ingestion above.</p>}
          {jobs.map((j) => (
            <div key={j.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Chip tone={j.status === "DONE" ? "brand" : j.status === "FAILED" ? "neutral" : "accent"}>{j.status}</Chip>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[color:var(--text)]">{j.source?.name ?? j.kind}</span>
              <span className="text-[11.5px] text-[color:var(--text-3)]">{j.itemsFound} found · +{j.itemsAdded}</span>
              <span className="text-[11.5px] text-[color:var(--text-3)]">{timeAgo(j.startedAt)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}