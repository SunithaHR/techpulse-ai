"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

const TYPES = ["OFFICIAL_BLOG", "OFFICIAL_DOCS", "GITHUB", "CHANGELOG", "RESEARCH", "PUBLICATION", "COMMUNITY", "ADVISORY"];

export function AddSourceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "OFFICIAL_BLOG", url: "", feedUrl: "", reliability: "8" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ name: "", type: "OFFICIAL_BLOG", url: "", feedUrl: "", reliability: "8" });
        setOpen(false);
        router.refresh();
      } else {
        setMsg(data.error ?? "Failed to add source");
      }
    } catch (e) {
      setMsg(String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)} variant="secondary" size="sm">+ Add source</Button>;
  }

  return (
    <form onSubmit={submit} className="panel space-y-3 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-[11.5px] font-medium text-[color:var(--text-2)]">Name</label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="OpenAI Blog" />
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-medium text-[color:var(--text-2)]">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-9 w-full rounded-lg bg-[color:var(--panel-2)] px-2 text-[13px] text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--border)] outline-none">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-medium text-[color:var(--text-2)]">Homepage URL</label>
          <Input required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://openai.com/blog" />
        </div>
        <div>
          <label className="mb-1 block text-[11.5px] font-medium text-[color:var(--text-2)]">Feed URL</label>
          <Input value={form.feedUrl} onChange={(e) => setForm({ ...form, feedUrl: e.target.value })} placeholder="https://openai.com/blog/rss.xml" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="sm" disabled={busy}>{busy ? "Adding…" : "Add source"}</Button>
        <Button type="button" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        <label className="flex items-center gap-2 text-[12px] text-[color:var(--text-2)]">
          Reliability
          <Input type="number" min={1} max={10} value={form.reliability} onChange={(e) => setForm({ ...form, reliability: e.target.value })} className="!h-8 !w-16" />
        </label>
        {msg && <span className="text-[12px] text-red-400">{msg}</span>}
      </div>
    </form>
  );
}