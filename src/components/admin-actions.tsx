"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export function AdminActions() {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "seed" | "ingest">(null);
  const [result, setResult] = useState<string | null>(null);

  async function run(action: "seed" | "ingest") {
    setBusy(action);
    setResult(null);
    try {
      const res = await fetch(action === "seed" ? "/api/admin/seed" : "/api/admin/ingest", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      if (res.ok) {
        setResult(action === "seed" ? `Re-seeded: ${JSON.stringify(data.counts ?? data)}` : `Ingestion: ${data.jobs} job(s), +${data.added} added, ${data.skipped} skipped`);
        router.refresh();
      } else {
        setResult(`Error: ${data.error ?? res.status}`);
      }
    } catch (e) {
      setResult(`Error: ${String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => run("ingest")} disabled={busy !== null}
        className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-3 py-2 text-[12.5px] font-medium text-cyan-600 ring-1 ring-inset ring-cyan-400/30 hover:bg-cyan-500/20 disabled:opacity-50 dark:text-cyan-300">
        <Icon name="refresh" size={14} className={busy === "ingest" ? "animate-spin" : ""} />
        {busy === "ingest" ? "Running…" : "Run ingestion"}
      </button>
      <button onClick={() => run("seed")} disabled={busy !== null}
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-[12.5px] font-medium text-red-400 ring-1 ring-inset ring-red-400/30 hover:bg-red-500/20 disabled:opacity-50">
        <Icon name="refresh" size={14} className={busy === "seed" ? "animate-spin" : ""} />
        {busy === "seed" ? "Re-seeding…" : "Re-seed database"}
      </button>
      {result && <span className="max-w-md truncate text-[11.5px] text-[color:var(--text-3)]">{result}</span>}
    </div>
  );
}