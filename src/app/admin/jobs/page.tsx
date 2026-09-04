import { prisma } from "@/lib/db";
import { Chip } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import { asArray } from "@/lib/utils";

export default async function AdminJobsPage() {
  const jobs = await prisma.ingestionJob.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
    include: { source: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-[color:var(--border)] text-left text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-3)]">
              <th className="p-3">Status</th>
              <th className="p-3">Kind</th>
              <th className="p-3">Source</th>
              <th className="p-3">Found</th>
              <th className="p-3">Added</th>
              <th className="p-3">Skipped</th>
              <th className="p-3">Started</th>
              <th className="p-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-[12.5px] text-[color:var(--text-3)]">No jobs recorded yet.</td></tr>
            )}
            {jobs.map((j) => (
              <tr key={j.id} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--hover)]/40">
                <td className="p-3"><Chip tone={j.status === "DONE" ? "brand" : j.status === "FAILED" ? "neutral" : "accent"}>{j.status}</Chip></td>
                <td className="p-3 font-mono text-[11.5px]">{j.kind}</td>
                <td className="p-3 text-[color:var(--text-2)]">{j.source?.name ?? "—"}</td>
                <td className="p-3 font-mono">{j.itemsFound}</td>
                <td className="p-3 font-mono text-emerald-500">+{j.itemsAdded}</td>
                <td className="p-3 font-mono text-[color:var(--text-3)]">{j.itemsSkipped}</td>
                <td className="p-3 text-[11.5px] text-[color:var(--text-3)]">{timeAgo(j.startedAt)}</td>
                <td className="max-w-[220px] truncate p-3 text-[11.5px] text-red-400">{j.error ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}