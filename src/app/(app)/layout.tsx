import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <AppShell
      user={
        session
          ? {
              id: session.sub,
              email: session.email,
              name: session.name,
              role: session.role,
              prefs: {},
            }
          : null
      }
    >
      {children}
    </AppShell>
  );
}
