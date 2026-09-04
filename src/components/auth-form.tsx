"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { Icon } from "@/components/icons";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setBusy(false);
        return;
      }
      router.push(data.next ?? next);
      router.refresh();
    } catch {
      setError("Network error — try again");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      {mode === "register" && (
        <div>
          <label className="mb-1 block text-[12px] font-medium text-[color:var(--text-2)]">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
        </div>
      )}
      <div>
        <label className="mb-1 block text-[12px] font-medium text-[color:var(--text-2)]">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email" />
      </div>
      <div>
        <label className="mb-1 block text-[12px] font-medium text-[color:var(--text-2)]">Password</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} />
      </div>
      {error && (
        <div className="rounded-lg bg-red-500/10 px-3 py-2 text-[12.5px] font-medium text-red-400 ring-1 ring-inset ring-red-400/30">{error}</div>
      )}
      <Button type="submit" variant="primary" className="w-full" disabled={busy}>
        {busy ? <Icon name="loader" size={14} className="animate-spin" /> : <Icon name="key" size={14} />}
        {mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}