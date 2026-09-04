import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const session = await getSession();
  if (session) redirect(sp.next ?? "/dashboard");
  const next = sp.next ?? "/dashboard";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8"><Logo size={30} /></Link>
      <div className="w-full max-w-sm">
        <h1 className="text-center text-xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-center text-[13px] text-[color:var(--text-2)]">Sign in to your technology intelligence feed.</p>
        <AuthForm mode="login" next={next} />
        <p className="mt-4 text-center text-[12.5px] text-[color:var(--text-3)]">
          No account? <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-cyan-500 hover:underline">Create one</Link>
        </p>
        <div className="mt-6 rounded-lg bg-[color:var(--panel-2)] p-3 text-[11.5px] leading-relaxed text-[color:var(--text-3)] ring-1 ring-inset ring-[color:var(--border)]">
          <span className="font-semibold text-[color:var(--text-2)]">Demo accounts</span>
          <br />admin@techpulse.dev (admin) · password <code className="font-mono text-cyan-500">admin1234</code>
          <br />demo@techpulse.dev (user) · password <code className="font-mono text-cyan-500">demo1234</code>
        </div>
      </div>
    </div>
  );
}