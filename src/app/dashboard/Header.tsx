import { signOut } from "./actions";
import { MobileNav } from "./MobileNav";

export function Header({ nomEntreprise }: { nomEntreprise: string }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3 sm:hidden">
        <MobileNav />
        <p className="text-base font-semibold text-slate-900">RenovIA</p>
      </div>
      <p className="text-sm font-medium text-slate-700">{nomEntreprise}</p>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Déconnexion
        </button>
      </form>
    </header>
  );
}
