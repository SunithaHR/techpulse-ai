"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "@/lib/constants";
import { Logo, IconBtn, buttonCls } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useTheme } from "@/components/theme-provider";
import type { SessionUser } from "@/lib/auth";

// ── Command palette ─────────────────────────────────────────────────────────
interface SearchHit {
  kind: string;
  label: string;
  sub?: string;
  href: string;
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => document.getElementById("tp-cmd-input")?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!open) return;
    if (!q.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
        const data = await res.json();
        setHits(flatten(data));
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 p-4 pt-[12vh] backdrop-blur-sm" onClick={onClose}>
      <div className="panel w-full max-w-xl overflow-hidden shadow-2xl shadow-black/40 fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 border-b border-[color:var(--border)] px-4">
          <Icon name="search" size={16} className="shrink-0 text-[color:var(--text-3)]" />
          <input
            id="tp-cmd-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && hits[0]) {
                onClose();
                router.push(hits[0].href);
              }
            }}
            placeholder="Search news, releases, models, tools, companies…  (esc to close)"
            className="h-12 w-full bg-transparent text-sm text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-3)]"
          />
          {loading && <Icon name="loader" size={14} className="animate-spin text-[color:var(--text-3)]" />}
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {q.trim() === "" && (
            <div className="px-2 py-3 text-[12px] text-[color:var(--text-3)]">
              Try “React”, “OpenAI”, “Claude”, “PostgreSQL”, “AI agents”, “Next.js release”…
            </div>
          )}
          {hits.length === 0 && q.trim() !== "" && !loading && (
            <div className="px-2 py-4 text-center text-[12.5px] text-[color:var(--text-2)]">No results — try the full search page.</div>
          )}
          {hits.map((h, i) => (
            <button
              key={`${h.kind}-${h.href}-${i}`}
              onClick={() => {
                onClose();
                router.push(h.href);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-[color:var(--hover)]"
            >
              <span className="inline-flex h-6 w-14 items-center justify-center rounded text-[9.5px] font-semibold uppercase tracking-wide text-[color:var(--text-3)] ring-1 ring-inset ring-[color:var(--border)]">
                {h.kind}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-[color:var(--text)]">{h.label}</span>
                {h.sub && <span className="block truncate text-[11px] text-[color:var(--text-3)]">{h.sub}</span>}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-[color:var(--border)] px-4 py-2 text-[10.5px] text-[color:var(--text-3)]">
          <span><kbd className="rounded bg-[color:var(--panel-2)] px-1 ring-1 ring-[color:var(--border)]">↵</kbd> open</span>
          <span><kbd className="rounded bg-[color:var(--panel-2)] px-1 ring-1 ring-[color:var(--border)]">esc</kbd> close</span>
          <span className="ml-auto">Powered by the TechPulse knowledge base</span>
        </div>
      </div>
    </div>
  );
}

function flatten(data: Record<string, unknown[]>): SearchHit[] {
  const out: SearchHit[] = [];
  const order = ["NEWS", "RELEASES", "TECHNOLOGIES", "COMPANIES", "MODELS", "TOOLS", "REPOSITORIES", "ADVISORIES"];
  for (const key of order) {
    const list = (data[key] ?? []) as Array<Record<string, string | number | null>>;
    for (const it of list.slice(0, 5)) {
      out.push({ kind: key.slice(0, -1), label: String(it.title ?? it.name ?? it.label ?? ""), sub: String(it.sub ?? it.summary ?? ""), href: String(it.href ?? "/") });
    }
  }
  return out.slice(0, 20);
}

// ── Shell ───────────────────────────────────────────────────────────────────
export function AppShell({ children, user }: { children: ReactNode; user: SessionUser | null }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  const nav = useMemo(() => NAV_SECTIONS, []);
  const isActive = (match: string) => (match === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(match) || pathname === match);

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-[color:var(--border)] bg-[color:var(--panel)] lg:flex">
        <div className="flex h-14 items-center px-4">
          <Link href="/" aria-label="TechPulse AI home"><Logo size={26} /></Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Main">
          {nav.map((group) => (
            <div key={group.title} className="mb-3">
              <div className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-3)]">{group.title}</div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.match ?? item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-colors",
                          active
                            ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300"
                            : "text-[color:var(--text-2)] hover:bg-[color:var(--hover)] hover:text-[color:var(--text)]",
                        )}
                      >
                        <Icon name={item.icon} size={15} className={active ? "text-cyan-500 dark:text-cyan-300" : "opacity-70"} />
                        {item.label}
                        {item.href === "/chat" && <span className="ml-auto rounded bg-gradient-to-r from-cyan-500 to-violet-500 px-1.5 py-px text-[9px] font-bold uppercase text-white">AI</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-[color:var(--border)] p-3">
          {user ? (
            <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-[12px] font-bold text-white">
                {(user.name ?? user.email)[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium text-[color:var(--text)]">{user.name ?? user.email}</div>
                <div className="truncate text-[10.5px] text-[color:var(--text-3)]">{user.role === "ADMIN" ? "Administrator" : user.email}</div>
              </div>
              <Link href="/settings" aria-label="Settings" className="text-[color:var(--text-3)] hover:text-[color:var(--text)]"><Icon name="settings" size={15} /></Link>
            </div>
          ) : (
            <Link href="/login" className={buttonCls("primary", "sm", "w-full")}>
              <Icon name="key" size={13} /> Sign in
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[color:var(--border)] bg-[color:var(--panel)]/85 px-3 backdrop-blur lg:hidden">
        <IconBtn label="Menu" onClick={() => setMobileNav(true)}><Icon name="menu" /></IconBtn>
        <Link href="/" className="flex-1"><Logo size={24} /></Link>
        <IconBtn label="Search" onClick={() => setPaletteOpen(true)}><Icon name="search" /></IconBtn>
        <IconBtn label="Toggle theme" onClick={toggle}>{theme === "dark" ? <Icon name="sun" size={16} /> : <Icon name="moon" size={16} />}</IconBtn>
      </header>

      {/* Mobile drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[color:var(--panel)] shadow-xl">
            <div className="flex h-14 items-center justify-between px-4">
              <Logo size={24} />
              <IconBtn label="Close" onClick={() => setMobileNav(false)}><Icon name="x" /></IconBtn>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 pb-4">
              {nav.map((group) => (
                <div key={group.title} className="mb-3">
                  <div className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-3)]">{group.title}</div>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-[color:var(--text-2)] hover:bg-[color:var(--hover)]">
                          <Icon name={item.icon} size={16} /> {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Top actions on desktop */}
      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-20 hidden h-14 items-center gap-2 border-b border-[color:var(--border)] bg-[color:var(--bg)]/80 px-6 backdrop-blur lg:flex">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-8 w-full max-w-sm items-center gap-2 rounded-lg bg-[color:var(--panel-2)] px-3 text-[12.5px] text-[color:var(--text-3)] ring-1 ring-inset ring-[color:var(--border)] transition hover:ring-[color:var(--border-strong)]"
          >
            <Icon name="search" size={13} />
            <span>Search everything…</span>
            <kbd className="ml-auto rounded bg-[color:var(--panel)] px-1.5 py-px text-[10px] font-semibold ring-1 ring-[color:var(--border)]">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <Link href="/digest" className={buttonCls("ghost", "sm")}><Icon name="sparkles" size={13} /> Digest</Link>
            <Link href="/notifications" aria-label="Notifications" className={buttonCls("ghost", "sm", "h-8 w-8 px-0")}><Icon name="bell" size={15} /></Link>
            <IconBtn label="Toggle theme" onClick={toggle} className="h-8 w-8">{theme === "dark" ? <Icon name="sun" size={15} /> : <Icon name="moon" size={15} />}</IconBtn>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1240px] px-4 pb-24 pt-5 sm:px-6 lg:px-8">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
