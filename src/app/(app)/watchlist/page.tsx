import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveEntity } from "@/lib/links";
import { BrandAvatar, Chip, EmptyState, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";
import { FollowButton } from "@/components/actions";

export const metadata: Metadata = { title: "Watchlist" };
export const dynamic = "force-dynamic";

const TYPE_ORDER = ["TECHNOLOGY", "COMPANY", "AIMODEL", "AITOOL", "REPOSITORY", "TOPIC"];

export default async function WatchlistPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/watchlist");

  const follows = await prisma.follow.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" } });
  const resolved = await Promise.all(
    follows.map(async (f) => ({ row: f, link: await resolveEntity(f.entityType, f.entityId) })),
  );

  const grouped = new Map<string, typeof resolved>();
  for (const r of resolved) {
    const arr = grouped.get(r.row.entityType) ?? [];
    arr.push(r);
    grouped.set(r.row.entityType, arr);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Watchlist</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">
          Follow technologies, companies, models and tools to prioritize them on your dashboard and notifications.
        </p>
      </div>

      {follows.length === 0 && (
        <EmptyState
          icon={<Icon name="star" size={26} />}
          title="Nothing followed yet"
          sub="Follow technologies and companies you care about from their pages — the dashboard will prioritize their updates."
          action={<LinkButton href="/technologies" variant="primary">Browse technologies</LinkButton>}
        />
      )}

      {[...grouped.entries()].map(([type, items]) => (
        <section key={type}>
          <h2 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-[color:var(--text-3)]">
            {typeLabel(type)} <span className="rounded bg-[color:var(--panel-2)] px-1.5 py-px text-[10px] font-medium ring-1 ring-inset ring-[color:var(--border)]">{items.length}</span>
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ row, link }) => (
              <div key={`${row.entityType}-${row.entityId}`} className="panel flex items-center gap-3 p-3.5">
                {link ? (
                  <Link href={link.href} className="min-w-0 flex-1 no-underline">
                    <div className="flex items-center gap-2">
                      {link.label.length > 2 && <BrandAvatar name={link.label} accent={null} size={28} />}
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-[color:var(--text)] hover:text-cyan-500">{link.label}</div>
                        <div className="truncate text-[11px] text-[color:var(--text-3)]">{row.label ?? link.typeLabel}</div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-[color:var(--text)]">{row.entityId}</div>
                    <div className="text-[11px] text-[color:var(--text-3)]">{row.label ?? typeLabel(type)}</div>
                  </div>
                )}
                <FollowButton entityType={row.entityType} entityId={row.entityId} compact />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function typeLabel(t: string): string {
  const map: Record<string, string> = {
    TECHNOLOGY: "Technologies", COMPANY: "Companies", AIMODEL: "AI Models", AITOOL: "AI Tools", REPOSITORY: "Repositories", TOPIC: "Topics",
  };
  return map[t] ?? t;
}