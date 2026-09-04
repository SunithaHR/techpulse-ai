import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Chip, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { MarkAllRead } from "./mark-read";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

const KIND_META: Record<string, { icon: string; color: string }> = {
  RELEASE: { icon: "package", color: "#34d399" },
  SECURITY: { icon: "shield", color: "#f87171" },
  MODEL: { icon: "brain", color: "#a78bfa" },
  TOOL: { icon: "wand", color: "#22d3ee" },
  BREAKING: { icon: "alert", color: "#fb923c" },
  COMPANY: { icon: "building-2", color: "#facc15" },
  SYSTEM: { icon: "info", color: "#94a3b8" },
};

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/notifications");

  const items = await prisma.notification.findMany({
    where: { userId: session.sub },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Releases, security and announcements for your followed entities.</p>
        </div>
        <MarkAllRead disabled={items.every((n) => n.readAt != null)} />
      </div>

      {items.length === 0 && (
        <EmptyState icon={<Icon name="bell" size={26} />} title="No notifications yet"
          sub="Follow technologies and companies — new releases and advisories about them land here." />
      )}

      <div className="space-y-2">
        {items.map((n) => {
          const meta = KIND_META[n.kind] ?? KIND_META.SYSTEM;
          const unread = n.readAt == null;
          return (
            <div key={n.id} className={`panel flex items-start gap-3 p-4 ${unread ? "ring-1 ring-inset ring-cyan-400/30" : "opacity-70"}`}>
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${meta.color}1f`, color: meta.color }}>
                <Icon name={meta.icon} size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-semibold text-[color:var(--text)]">{n.title}</span>
                  {unread && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                </div>
                {n.body && <p className="mt-1 text-[12.5px] leading-relaxed text-[color:var(--text-2)]">{n.body}</p>}
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[color:var(--text-3)]">
                  <span>{timeAgo(n.createdAt)}</span>
                  {n.importance && <Chip>{n.importance}</Chip>}
                  {n.link && <Link href={n.link} className="inline-flex items-center gap-1 text-cyan-500 hover:underline">Open <Icon name="chevron-right" size={11} /></Link>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}