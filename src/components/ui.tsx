import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn, fmtDate, timeAgo, formatCount } from "@/lib/utils";
import { IMPORTANCE_META, SEVERITY_META, type Importance } from "@/lib/constants";

// ── Logo ────────────────────────────────────────────────────────────────────
export function Logo({ size = 28, withWord = true, className }: { size?: number; withWord?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <span className="relative inline-flex" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" width={size} height={size} fill="none" aria-hidden>
          <defs>
            <linearGradient id="tp-logo" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#22d3ee" />
              <stop offset="0.55" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <rect x="1.5" y="1.5" width="37" height="37" rx="11" stroke="url(#tp-logo)" strokeOpacity="0.55" />
          <path d="M20 7c7 4.6 10.4 8.6 10.4 13.2 0 5.5-4.6 10-10.4 10s-10.4-4.5-10.4-10C9.6 15.6 13 11.6 20 7z" fill="url(#tp-logo)" />
          <circle cx="14.6" cy="19.4" r="1.7" fill="#080b12" />
          <circle cx="25.4" cy="19.4" r="1.7" fill="#080b12" />
          <path d="M15.8 25.6c1.1 1 2.5 1.5 4.2 1.5s3.1-.5 4.2-1.5" stroke="#080b12" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      {withWord && (
        <span className="text-[15px] font-semibold tracking-tight text-[color:var(--text)]">
          TechPulse <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">AI</span>
        </span>
      )}
    </span>
  );
}

// ── Badges / chips ──────────────────────────────────────────────────────────
export function ImportanceBadge({ importance, className }: { importance: string; className?: string }) {
  const meta = IMPORTANCE_META[(importance as Importance) ?? "LOW"] ?? IMPORTANCE_META.LOW;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        meta.chip,
        className,
      )}
    >
      <span className={cn("h-1 w-1 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  const meta = SEVERITY_META[severity] ?? SEVERITY_META.MEDIUM;
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ring-1 ring-inset", meta.chip, className)}>
      {meta.label}
    </span>
  );
}

export function Chip({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "brand" | "accent"; className?: string }) {
  const tones = {
    neutral: "bg-[color:var(--panel-2)] text-[color:var(--text-2)] ring-1 ring-inset ring-[color:var(--border)]",
    brand: "bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 ring-1 ring-inset ring-cyan-400/25",
    accent: "bg-violet-400/10 text-violet-600 dark:text-violet-300 ring-1 ring-inset ring-violet-400/25",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Dot({ color, className }: { color?: string; className?: string }) {
  return <span className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", className)} style={color ? { background: color } : undefined} />;
}

export function KindChip({ kind }: { kind: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    RELEASE_ANNOUNCEMENT: { label: "Release", cls: "text-emerald-600 dark:text-emerald-300 bg-emerald-400/10 ring-emerald-400/25" },
    SECURITY_ADVISORY: { label: "Security", cls: "text-red-600 dark:text-red-300 bg-red-400/10 ring-red-400/25" },
    MODEL_RELEASE: { label: "Model", cls: "text-violet-600 dark:text-violet-300 bg-violet-400/10 ring-violet-400/25" },
    TOOL_LAUNCH: { label: "Tool", cls: "text-cyan-600 dark:text-cyan-300 bg-cyan-400/10 ring-cyan-400/25" },
    RESEARCH_PAPER: { label: "Paper", cls: "text-teal-600 dark:text-teal-300 bg-teal-400/10 ring-teal-400/25" },
    GITHUB_RELEASE: { label: "GitHub", cls: "text-slate-600 dark:text-slate-300 bg-slate-400/10 ring-slate-400/25" },
    COMPANY_NEWS: { label: "Company", cls: "text-amber-600 dark:text-amber-300 bg-amber-400/10 ring-amber-400/25" },
    NEWS: { label: "News", cls: "text-sky-600 dark:text-sky-300 bg-sky-400/10 ring-sky-400/25" },
  };
  const m = map[kind] ?? map.NEWS;
  return <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ring-1 ring-inset", m.cls)}>{m.label}</span>;
}

// ── Buttons ─────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";

export function buttonCls(variant: BtnVariant = "secondary", size: "sm" | "md" | "xs" = "md", className?: string) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const sizes = { xs: "h-7 px-2 text-xs", sm: "h-8 px-2.5 text-[13px]", md: "h-9 px-3.5 text-[13px]" };
  const variants: Record<BtnVariant, string> = {
    primary:
      "bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-sm shadow-cyan-500/25 hover:from-cyan-400 hover:to-cyan-600",
    secondary: "bg-[color:var(--panel-2)] text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]",
    outline: "text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--border-strong)] hover:bg-[color:var(--hover)]",
    ghost: "text-[color:var(--text-2)] hover:text-[color:var(--text)] hover:bg-[color:var(--hover)]",
    danger: "bg-red-500/10 text-red-500 dark:text-red-300 ring-1 ring-inset ring-red-400/30 hover:bg-red-500/20",
  };
  return cn(base, sizes[size], variants[variant], className);
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "xs" }) {
  return <button className={buttonCls(variant, size, className)} {...props} />;
}

export function IconBtn({ label, className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button aria-label={label} title={label} className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--text-2)] hover:bg-[color:var(--hover)] hover:text-[color:var(--text)]", className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ href, variant = "secondary", size = "md", className, children }: { href: string; variant?: BtnVariant; size?: "sm" | "md" | "xs"; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonCls(variant, size, className)}>
      {children}
    </Link>
  );
}

// ── Layout atoms ────────────────────────────────────────────────────────────
export function Card({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "article" | "li" }) {
  return <Tag className={cn("panel", className)}>{children}</Tag>;
}

export function SectionHeader({ title, sub, right, icon }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[color:var(--text)]">{icon}{title}</h2>
        {sub && <p className="mt-0.5 text-[12.5px] text-[color:var(--text-2)]">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: string; accent?: string }) {
  return (
    <div className="panel px-4 py-3">
      <div className="text-[11.5px] font-medium uppercase tracking-wider text-[color:var(--text-3)]">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight" style={accent ? { color: accent } : undefined}>{value}</div>
      {hint && <div className="mt-0.5 truncate text-[11.5px] text-[color:var(--text-3)]">{hint}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, sub, action }: { icon?: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && <div className="mb-3 text-[color:var(--text-3)]">{icon}</div>}
      <div className="text-sm font-semibold text-[color:var(--text)]">{title}</div>
      {sub && <p className="mt-1 max-w-sm text-[12.5px] text-[color:var(--text-2)]">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function SkeletonList({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="panel p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2.5 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="mt-1 h-2.5 w-2.5 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-1.5 h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Form controls ───────────────────────────────────────────────────────────
export function inputCls(className?: string) {
  return cn(
    "h-9 w-full rounded-lg bg-[color:var(--panel-2)] px-3 text-[13px] text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--border)] placeholder:text-[color:var(--text-3)] outline-none transition focus:ring-2 focus:ring-cyan-400/50",
    className,
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputCls(className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputCls(), "appearance-none pr-8 [background-image:linear-gradient(45deg,transparent_50%,var(--text-3)_50%),linear-gradient(135deg,var(--text-3)_50%,transparent_50%)] [background-position:calc(100%-14px)_55%,calc(100%-10px)_55%] [background-size:4px_4px] [background-repeat:no-repeat]", className)} {...props}>
      {children}
    </select>
  );
}

// ── Shared info line ────────────────────────────────────────────────────────
export function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[color:var(--text-3)]", className)}>{children}</div>;
}

export function TimeStamp({ date, className, withAgo = true }: { date: Date | string; className?: string; withAgo?: boolean }) {
  return (
    <time dateTime={new Date(date).toISOString()} className={className}>
      {withAgo ? timeAgo(date) : fmtDate(date)}
    </time>
  );
}

export function ExternalLink({ href, children, className }: { href?: string | null; children: ReactNode; className?: string }) {
  if (!href) return <span className={className}>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn("text-[color:var(--text-2)] underline-offset-2 hover:text-cyan-600 hover:underline dark:hover:text-cyan-300", className)}>
      {children}
    </a>
  );
}

export function Stars({ n, className }: { n?: number | null; className?: string }) {
  if (!n) return null;
  return <span className={cn("text-[color:var(--text-3)]", className)}>★ {formatCount(n)}</span>;
}

export function BrandAvatar({ name, accent, size = 34, className }: { name: string; accent?: string | null; size?: number; className?: string }) {
  const initials = name
    .replace(/[^A-Za-z0-9]/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-lg font-bold ring-1 ring-inset ring-white/10", className)}
      style={{ width: size, height: size, background: accent ? `${accent}26` : "var(--panel-2)", color: accent ?? "var(--text-2)", fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials || "?"}
    </span>
  );
}
