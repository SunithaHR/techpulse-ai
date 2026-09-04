"use client";

/** Dropdown that updates one search param and navigates (works in server components). */
export function NavSelect({
  value,
  options,
  param,
  label,
  clearValue = "",
  className,
}: {
  value: string;
  options: { value: string; label: string }[];
  param: string;
  label: string;
  clearValue?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(e) => {
        const v = e.target.value;
        const u = new URLSearchParams(window.location.search);
        if (v === "" || v === clearValue) u.delete(param);
        else u.set(param, v);
        u.delete("page");
        window.location.href = `${window.location.pathname}?${u.toString()}`;
      }}
      className={
        className ??
        "h-8 rounded-lg bg-[color:var(--panel-2)] px-2 text-[12px] text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--border)] outline-none"
      }
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
