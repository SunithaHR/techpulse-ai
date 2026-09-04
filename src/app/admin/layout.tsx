import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Overview", icon: "chart" },
  { href: "/admin/sources", label: "Sources", icon: "globe" },
  { href: "/admin/jobs", label: "Ingestion jobs", icon: "refresh" },
  { href: "/admin/duplicates", label: "Duplicates", icon: "link" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight"><Icon name="settings" size={18} className="text-violet-400" /> Admin</h1>
          <p className="mt-0.5 text-[12.5px] text-[color:var(--text-3)]">Manage sources, ingestion, duplicates and platform data.</p>
        </div>
      </div>
      <nav className="flex flex-wrap gap-1.5 border-b border-[color:var(--border)] pb-3">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-[color:var(--text-2)] ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]">
            <Icon name={t.icon} size={13} /> {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}