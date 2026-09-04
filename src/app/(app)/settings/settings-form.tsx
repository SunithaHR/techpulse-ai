"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, SectionHeader, buttonCls } from "@/components/ui";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

const NOTIF_OPTS: Array<[string, string]> = [
  ["releases", "New releases of followed technologies"],
  ["security", "Security vulnerabilities & advisories"],
  ["aiModels", "New AI models"],
  ["breakingChanges", "Breaking changes"],
  ["majorAnnouncements", "Major company announcements"],
  ["ecosystem", "Developer ecosystem updates"],
];

export function SettingsForm({
  user,
  categories,
  dashboardCategories,
  notifPrefs,
  digest,
}: {
  user: { id: string; name: string | null; email: string; headline: string | null; bio: string | null };
  categories: { key: string; name: string; emoji: string }[];
  dashboardCategories: string[];
  notifPrefs: Record<string, boolean>;
  digest: { enabled?: boolean; scope?: string; time?: string };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user.name ?? "",
    headline: user.headline ?? "",
    bio: user.bio ?? "",
  });
  const [cats, setCats] = useState<string[]>(dashboardCategories);
  const [notifs, setNotifs] = useState<Record<string, boolean>>(notifPrefs);
  const [digestOn, setDigestOn] = useState(Boolean(digest.enabled));
  const [digestScope, setDigestScope] = useState(digest.scope ?? "DAILY");

  const toggle = (arr: string[], set: (v: string[]) => void, key: string) =>
    set(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        headline: form.headline,
        bio: form.bio,
        prefs: { dashboardCategories: cats, notifPrefs: notifs, digest: { enabled: digestOn, scope: digestScope } },
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Profile, dashboard preferences and notification settings.</p>
      </div>

      <Card className="p-5">
        <SectionHeader title="Profile" />
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-[color:var(--text-2)]">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-[color:var(--text-2)]">Email</label>
              <Input value={user.email} disabled className="opacity-60" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11.5px] font-medium text-[color:var(--text-2)]">Headline</label>
            <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Full-stack engineer · AI infrastructure" />
          </div>
          <div>
            <label className="mb-1 block text-[11.5px] font-medium text-[color:var(--text-2)]">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="Short bio shown on your profile"
              className="w-full rounded-lg bg-[color:var(--panel-2)] px-3 py-2.5 text-[13px] text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--border)] outline-none placeholder:text-[color:var(--text-3)] focus:ring-2 focus:ring-cyan-400/50"
            />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="Dashboard categories" sub="Pick which technology categories appear on your dashboard." />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const on = cats.includes(c.key);
            return (
              <button key={c.key} onClick={() => toggle(cats, setCats, c.key)} type="button"
                className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-medium ring-1 ring-inset transition-colors",
                  on ? "bg-cyan-400/12 text-cyan-600 ring-cyan-400/35 dark:text-cyan-300" : "bg-[color:var(--panel-2)] text-[color:var(--text-2)] ring-[color:var(--border)] hover:bg-[color:var(--hover)]")}>
                <span>{c.emoji}</span> {c.name}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="Notifications" sub="What you want to be notified about." />
        <div className="space-y-2">
          {NOTIF_OPTS.map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[color:var(--hover)]">
              <input type="checkbox" checked={Boolean(notifs[key])} onChange={() => setNotifs({ ...notifs, [key]: !notifs[key] })}
                className="h-4 w-4 rounded accent-cyan-500" />
              <span className="text-[13px] text-[color:var(--text-2)]">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="Daily digest" sub="A curated morning briefing delivered to your notifications." />
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={digestOn} onChange={() => setDigestOn(!digestOn)} className="h-4 w-4 rounded accent-cyan-500" />
            <span className="text-[13px] text-[color:var(--text-2)]">Enable the daily technology digest</span>
          </label>
          {digestOn && (
            <div className="flex gap-2">
              {["DAILY", "WEEKLY"].map((s) => (
                <button key={s} onClick={() => setDigestScope(s)} type="button"
                  className={cn("rounded-lg px-3 py-1.5 text-[12px] font-medium ring-1 ring-inset",
                    digestScope === s ? "bg-cyan-400/12 text-cyan-600 ring-cyan-400/35" : "bg-[color:var(--panel-2)] text-[color:var(--text-2)] ring-[color:var(--border)]")}>
                  {s === "DAILY" ? "Daily" : "Weekly"}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={save} disabled={saving}>
          <Icon name="check" size={14} /> {saving ? "Saving…" : "Save settings"}
        </Button>
        {saved && <span className="inline-flex items-center gap-1 text-[12.5px] text-emerald-400"><Icon name="check-circle" size={14} /> Saved</span>}
        <a href="/api/auth/logout" className={buttonCls("ghost", "md", "ml-auto text-red-400 hover:text-red-300")}>
          <Icon name="logout" size={14} /> Sign out
        </a>
      </div>
    </div>
  );
}