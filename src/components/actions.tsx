"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";

type State = { active: boolean } | null;

async function fetchState(kind: "save" | "follow", entityType: string, entityId: string): Promise<State> {
  try {
    const res = await fetch(`/api/user-state?kind=${kind}&type=${encodeURIComponent(entityType)}&id=${encodeURIComponent(entityId)}`);
    if (res.status === 401) return { active: false };
    const data = await res.json();
    return { active: Boolean(data?.active) };
  } catch {
    return { active: false };
  }
}

function useToggle(kind: "save" | "follow", entityType: string, entityId: string) {
  const [active, setActive] = useState<boolean | null>(null);
  const router = useRouter();
  useEffect(() => {
    let mounted = true;
    fetchState(kind, entityType, entityId).then((s) => mounted && setActive(s?.active ?? false));
    return () => {
      mounted = false;
    };
  }, [kind, entityType, entityId]);

  const toggle = useCallback(async () => {
    const next = !(active ?? false);
    setActive(next);
    const res = await fetch(`/api/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType, entityId }),
    });
    if (res.status === 401) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!res.ok) setActive(!next);
  }, [active, entityType, entityId, kind, router]);
  return { active, toggle };
}

export function SaveButton({ entityType, entityId, label, compact, className }: { entityType: string; entityId: string; label?: string; compact?: boolean; className?: string }) {
  const { active, toggle } = useToggle("save", entityType, entityId);
  return (
    <button
      type="button"
      onClick={toggle}
      title={active ? "Remove from saved" : "Save item"}
      aria-pressed={active ?? false}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg text-[12px] font-medium ring-1 ring-inset ring-[color:var(--border)] transition-colors",
        compact ? "h-7 px-2" : "h-8 px-2.5",
        active ? "bg-cyan-400/12 text-cyan-600 ring-cyan-400/35 dark:text-cyan-300" : "bg-[color:var(--panel-2)] text-[color:var(--text-2)] hover:text-[color:var(--text)]",
        className,
      )}
    >
      <Icon name="bookmark" size={13} className={active ? "fill-current" : ""} />
      {!compact && (active ? "Saved" : "Save")}
    </button>
  );
}

export function FollowButton({ entityType, entityId, label, compact, className }: { entityType: string; entityId: string; label?: string; compact?: boolean; className?: string }) {
  const { active, toggle } = useToggle("follow", entityType, entityId);
  return (
    <button
      type="button"
      onClick={toggle}
      title={active ? "Stop following" : `Follow ${label ?? ""}`}
      aria-pressed={active ?? false}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg text-[12px] font-medium ring-1 ring-inset ring-[color:var(--border)] transition-colors",
        compact ? "h-7 px-2" : "h-8 px-2.5",
        active ? "bg-amber-400/12 text-amber-600 ring-amber-400/35 dark:text-amber-300" : "bg-[color:var(--panel-2)] text-[color:var(--text-2)] hover:text-[color:var(--text)]",
        className,
      )}
    >
      <Icon name="star" size={13} className={active ? "fill-current" : ""} />
      {!compact && (active ? "Following" : "Follow")}
    </button>
  );
}

export function CopyButton({ text, className, label = "Copy" }: { text: string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-[color:var(--text-3)] hover:bg-white/10 hover:text-white", className)}
    >
      <Icon name={copied ? "check" : "copy"} size={12} /> {copied ? "Copied" : label}
    </button>
  );
}
