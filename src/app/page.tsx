import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="max-w-xl text-center">
        <p className="text-sm font-medium text-slate-500">RenovIA</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          La gestion de chantiers, simplifiée pour les entreprises TCE
        </h1>
        <p className="mt-4 text-slate-600">
          Suivez l&apos;avancement de vos chantiers, partagez un lien de suivi
          avec vos clients et centralisez leurs réclamations, le tout en un
          seul outil.
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Accéder au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}
