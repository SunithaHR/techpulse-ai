"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export function MarkAllRead({ disabled }: { disabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button
      disabled={disabled || busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/notifications/read", { method: "POST" }).catch(() => {});
        router.refresh();
      }}
      className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--panel-2)] px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--text-2)] ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)] disabled:opacity-40"
    >
      <Icon name="check" size={13} /> Mark all read
    </button>
  );
}