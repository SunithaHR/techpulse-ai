import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveEntity } from "@/lib/links";
import { BrandAvatar, EmptyState, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";
import { SaveButton } from "@/components/actions";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Saved" };
export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/saved");

  const saved = await prisma.savedItem.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" }, take: 200 });
  const resolved = await Promise.all(saved.map(async (s) => ({ row: s, link: await resolveEntity(s.entityType, s.entityId) })));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Saved</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Everything you bookmarked — news, releases, models, tools, advisories and more.</p>
      </div>

      {resolved.length === 0 && (
        <EmptyState
          icon={<Icon name="bookmark" size={26} />}
          title="Nothing saved yet"
          sub="Hit the bookmark button on any news item, release, model or tool to keep it here."
          action={<LinkButton href="/news" variant="primary">Browse news</LinkButton>}
        />
      )}

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {resolved.map(({ row, link }) => (
          <div key={`${row.entityType}-${row.entityId}`} className="panel flex items-center gap-3 p-3.5">
            {link ? (
              <Link href={link.href} className="min-w-0 flex-1 no-underline">
                <div className="flex items-center gap-2">
                  <BrandAvatar name={link.label} accent={null} size={28} />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-[color:var(--text)] hover:text-cyan-500">{link.label}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10.5px] text-[color:var(--text-3)]">
                      <ChipTiny>{link.typeLabel}</ChipTiny>
                      <span>{timeAgo(row.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">{row.entityId}</div>
                <div className="text-[11px] text-[color:var(--text-3)]">{row.entityType}</div>
              </div>
            )}
            <SaveButton entityType={row.entityType} entityId={row.entityId} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChipTiny({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-[color:var(--panel-2)] px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-wide text-[color:var(--text-3)] ring-1 ring-inset ring-[color:var(--border)]">{children}</span>;
}