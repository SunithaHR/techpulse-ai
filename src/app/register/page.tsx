import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const session = await getSession();
  if (session) redirect(sp.next ?? "/dashboard");
  const next = sp.next ?? "/dashboard";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8"><Logo size={30} /></Link>
      <div className="w-full max-w-sm">
        <h1 className="text-center text-xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-center text-[13px] text-[color:var(--text-2)]">Track releases, models and security — and ask TechPulse AI anything.</p>
        <AuthForm mode="register" next={next} />
        <p className="mt-4 text-center text-[12.5px] text-[color:var(--text-3)]">
          Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-cyan-500 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}