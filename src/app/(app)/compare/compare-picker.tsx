"use client";

import { useRouter, usePathname } from "next/navigation";
import { BrandAvatar } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface CompareOption {
  slug: string;
  name: string;
  accent?: string | null;
  sub?: string;
}

export function ComparePicker({
  kind,
  options,
  selected,
  max = 4,
}: {
  kind: string;
  options: CompareOption[];
  selected: string[];
  max?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (ids: string[]) => {
    const u = new URLSearchParams();
    u.set("kind", kind);
    if (ids.length > 0) u.set("ids", ids.join(","));
    router.push(`${pathname}?${u.toString()}`);
  };

  const toggle = (slug: string) => {
    if (selected.includes(slug)) {
      navigate(selected.filter((s) => s !== slug));
    } else if (selected.length < max) {
      navigate([...selected, slug]);
    }
  };

  return (
    <div className="panel p-3">
      <div className="mb-2 px-1 text-[10.5px] font-semibold uppercase tracking-wider text-[color:var(--text-3)]">
        Add up to {max} items to compare
      </div>
      <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
        {options.map((o) => {
          const on = selected.includes(o.slug);
          return (
            <button
              key={o.slug}
              type="button"
              onClick={() => toggle(o.slug)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] transition-colors",
                on
                  ? "bg-cyan-400/12 text-cyan-600 ring-1 ring-inset ring-cyan-400/35 dark:text-cyan-300"
                  : "text-[color:var(--text-2)] hover:bg-[color:var(--hover)]",
                !on && selected.length >= max && "opacity-40",
              )}
            >
              <BrandAvatar name={o.name} accent={o.accent} size={22} />
              <span className="min-w-0 flex-1 truncate font-medium">{o.name}</span>
              {on && <span className="text-[10px] font-bold text-cyan-500">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}