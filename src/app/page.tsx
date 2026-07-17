import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-6">
      <div className="max-w-xl text-center">
        <p className="text-sm font-medium text-[#2563EB]">RenovIA</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          La gestion de chantiers, simplifiée pour les entreprises TCE
        </h1>
        <p className="mt-4 text-slate-600">
          Suivez l&apos;avancement de vos chantiers, partagez un lien de suivi
          avec vos clients et centralisez leurs réclamations, le tout en un
          seul outil.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-md bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </main>
  );
}
