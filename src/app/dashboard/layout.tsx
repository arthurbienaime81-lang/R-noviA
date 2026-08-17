import type { Viewport } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IntroScreen } from "@/components/intro/IntroScreen";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DashboardBackground } from "./DashboardBackground";
import { PageTransition } from "./PageTransition";
import styles from "./dashboard.module.css";

// Même couleur de base que le fond or animé (goldBackground.module.css) —
// voir la note dans src/app/page.tsx.
export const viewport: Viewport = {
  themeColor: "#d4a94a",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: entreprise } = await supabase
    .from("entreprises")
    .select("nom")
    .eq("user_id", user.id)
    .single();

  return (
    <div data-gold-bg className={`flex min-h-screen ${styles.dashboardBg}`}>
      <DashboardBackground />
      <IntroScreen storageKey="renovia-show-login-intro" trigger="flag" />
      <Sidebar />
      <div className="relative z-10 flex flex-1 flex-col">
        <Header nomEntreprise={entreprise?.nom ?? ""} />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
