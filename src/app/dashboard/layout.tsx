import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
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
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header nomEntreprise={entreprise?.nom ?? ""} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
