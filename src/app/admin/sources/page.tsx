import { prisma } from "@/lib/db";
import { Chip, SectionHeader } from "@/components/ui";
import { Icon } from "@/components/icons";
import { SOURCE_TYPE_LABEL } from "@/lib/constants";
import { AddSourceForm } from "./add-source";

export default async function AdminSourcesPage() {
  const sources = await prisma.source.findMany({
    orderBy: [{ active: "desc" }, { reliability: "desc" }],
    include: { _count: { select: { news: true, ingestionJobs: true } } },
  });

  return (
    <div className="space-y-6">
      <SectionHeader title={`Sources (${sources.length})`} sub="Official docs, blogs, changelogs and publications — reliability score ranks them." />

      <AddSourceForm />

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-[color:var(--border)] text-left text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-3)]">
              <th className="p-3">Source</th>
              <th className="p-3">Type</th>
              <th className="p-3">Reliability</th>
              <th className="p-3">Feed</th>
              <th className="p-3">News</th>
              <th className="p-3">Jobs</th>
              <th className="p-3">Last check</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--hover)]/40">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[color:var(--text)]">{s.name}</span>
                    {!s.active && <Chip>inactive</Chip>}
                  </div>
                  <div className="mt-0.5 max-w-[300px] truncate text-[11px] text-[color:var(--text-3)]">{s.url}</div>
                </td>
                <td className="p-3"><Chip>{SOURCE_TYPE_LABEL[s.type] ?? s.type}</Chip></td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-semibold">{s.reliability}</span>
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[color:var(--panel-2)]">
                      <span className="block h-full rounded-full bg-cyan-400" style={{ width: `${s.reliability * 10}%` }} />
                    </span>
                  </div>
                </td>
                <td className="p-3 text-[11.5px] text-[color:var(--text-3)]">{s.feedUrl ? <span className="inline-flex items-center gap-1 text-emerald-500"><Icon name="check-circle" size={12} /> RSS</span> : "—"}</td>
                <td className="p-3 font-mono">{s._count.news}</td>
                <td className="p-3 font-mono">{s._count.ingestionJobs}</td>
                <td className="p-3 text-[11.5px] text-[color:var(--text-3)]">{s.lastCheckedAt ? s.lastCheckedAt.toISOString().slice(0, 10) : "never"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}