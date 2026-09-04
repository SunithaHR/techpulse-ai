import Link from "next/link";
import { prisma } from "@/lib/db";
import { Chip, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { timeAgo } from "@/lib/utils";

export default async function AdminDuplicatesPage() {
  const clusters = await prisma.news.groupBy({ by: ["clusterKey"], _count: true, where: { clusterKey: { not: null } }, orderBy: { _count: { clusterKey: "desc" } }, take: 40 });
  const withCount = clusters.filter((c) => c._count > 1);

  const rows = await Promise.all(
    withCount.slice(0, 20).map(async (c) => {
      const items = await prisma.news.findMany({
        where: { clusterKey: c.clusterKey },
        select: { id: true, title: true, isPrimary: true, publishedAt: true, source: { select: { name: true, type: true, reliability: true } } },
        orderBy: [{ isPrimary: "desc" }, { publishedAt: "asc" }],
      });
      return { clusterKey: c.clusterKey, count: c._count, items };
    }),
  );

  return (
    <div className="space-y-4">
      {rows.length === 0 && (
        <EmptyState icon={<Icon name="link" size={26} />} title="No duplicate clusters"
          sub="Items are deduplicated by URL hash on ingestion and clustered by normalized title." />
      )}
      {rows.map((r) => (
        <div key={r.clusterKey} className="panel p-4">
          <div className="mb-2 flex items-center gap-2">
            <Chip tone="accent">{r.count} sources</Chip>
            <span className="font-mono text-[10.5px] text-[color:var(--text-3)]">{r.clusterKey}</span>
          </div>
          <ul className="space-y-1.5">
            {r.items.map((it) => (
              <li key={it.id} className="flex items-center gap-2 text-[12.5px]">
                {it.isPrimary ? <Chip tone="brand">Primary</Chip> : <Chip>Coverage</Chip>}
                <Link href={`/news/${it.id}`} className="min-w-0 flex-1 truncate font-medium text-[color:var(--text)] hover:text-cyan-500">{it.title}</Link>
                <span className="shrink-0 text-[11px] text-[color:var(--text-3)]">{it.source.name}</span>
                <span className="shrink-0 text-[11px] text-[color:var(--text-3)]">{timeAgo(it.publishedAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}