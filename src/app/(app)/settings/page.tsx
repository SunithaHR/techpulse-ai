import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, loadUser } from "@/lib/auth";
import { SettingsForm } from "./settings-form";
import { NEWS_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/settings");
  const user = await loadUser(session);
  if (!user) redirect("/login");

  const prefs = (user.prefs ?? {}) as Record<string, unknown>;
  const dashboardCategories = Array.isArray(prefs.dashboardCategories) ? (prefs.dashboardCategories as string[]) : NEWS_CATEGORIES.map((c) => c.key);
  const notifPrefs = (prefs.notifPrefs ?? {}) as Record<string, boolean>;
  const digest = (prefs.digest ?? { enabled: false, scope: "DAILY" }) as { enabled?: boolean; scope?: string; time?: string };

  return (
    <SettingsForm
      user={{ id: user.id, name: user.name, email: user.email, headline: user.headline, bio: user.bio }}
      categories={NEWS_CATEGORIES}
      dashboardCategories={dashboardCategories}
      notifPrefs={notifPrefs}
      digest={digest}
    />
  );
}