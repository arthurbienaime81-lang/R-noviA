import Link from "next/link";
import type { Metadata } from "next";
import { spaceGrotesk, inter, ibmPlexMono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Fonctionnalités | RenovIA",
  description:
    "Comment RenovIA automatise le suivi de chantier et le service après-vente des entreprises de rénovation TCE : SOP en 7 étapes et fonctionnalités automatisées.",
};

const ETAPES_SOP = [
  {
    numero: "01",
    titre: "Réception de la demande",
    delai: "Immédiat",
    description:
      "Votre client vous contacte par le canal de son choix — formulaire de suivi, WhatsApp, email ou téléphone. RenovIA capture la demande et crée un ticket unique et horodaté, relié automatiquement au bon chantier. Aucune demande ne se perd plus entre plusieurs canaux.",
  },
  {
    numero: "02",
    titre: "Accusé de réception automatique",
    delai: "< 5 minutes",
    description:
      "Le client reçoit immédiatement un message avec son numéro de ticket et le délai de réponse engagé (moins de 2h en heures ouvrées). Hors horaires d'ouverture, un message adapté annonce une reprise dès 9h le jour ouvré suivant. L'email est signé du nom de votre entreprise — jamais de « RenovIA » visible côté client.",
  },
  {
    numero: "03",
    titre: "Qualification et priorité",
    delai: "< 30 minutes",
    description:
      "Chaque ticket est classé selon 4 catégories : Urgence P1 (fuite, panne — 4h), Malfaçon P2 (retouche, défaut — 48h), Réclamation P2 (facturation — 48h), Question P3 (info, délai — 5 jours). Vous pouvez ajuster la priorité et ajouter une note interne, invisible du client.",
  },
  {
    numero: "04",
    titre: "Transmission à l'entreprise",
    delai: "< 1h (P1) / 4h (P2)",
    description:
      "Vous recevez le ticket complet — description, photos, coordonnées client, chantier concerné — et cliquez sur « Prendre en charge » pour valider formellement. Le client reçoit alors une confirmation automatique.",
  },
  {
    numero: "05",
    titre: "Suivi actif et relances",
    delai: "Continu",
    description:
      "RenovIA surveille chaque ticket ouvert et relance automatiquement en 3 paliers si aucune mise à jour n'est enregistrée : 24h, 48h, puis 72h sans réponse. Le client voit un journal d'activité daté sur sa page de suivi — il n'a jamais à relancer lui-même.",
  },
  {
    numero: "06",
    titre: "Résolution et clôture",
    delai: "Après intervention",
    description:
      "Clore un ticket exige une description de l'intervention et une photo « après » obligatoire — impossible de clore sans preuve. Le client dispose ensuite de 72h pour valider ou contester ; une contestation rouvre automatiquement le ticket en priorité P1.",
  },
  {
    numero: "07",
    titre: "Avis client et réputation",
    delai: "24h après clôture",
    description:
      "24h après une clôture validée, le client reçoit une demande d'avis (1 à 5 étoiles + commentaire). Une note de 4 ou 5 redirige automatiquement vers votre fiche Google Maps ; une note de 3 ou moins reste interne et déclenche une alerte, sans jamais exposer un avis négatif publiquement.",
  },
];

const FONCTIONNALITES = [
  {
    titre: "Avancement automatique du chantier",
    description:
      "La progression (0, 25, 50, 75, 100 %) se calcule seule à partir des étapes cochées — Démolition, Gros œuvre, Finitions, Livraison. Aucune saisie manuelle de pourcentage.",
  },
  {
    titre: "Emails automatiques à chaque étape clé",
    description:
      "Bienvenue à la création du chantier, accusé de réception, prise en charge, clôture, relances, demande d'avis — tous signés du nom de votre entreprise, jamais de « RenovIA » visible du client.",
  },
  {
    titre: "QR code de suivi",
    description:
      "Chaque email de bienvenue inclut un QR code généré automatiquement, à scanner pour accéder directement à la page de suivi du chantier depuis un mobile.",
  },
  {
    titre: "Messagerie intégrée",
    description:
      "Un fil de discussion par chantier, entre vous et votre client, consultable des deux côtés sans passer par email ou SMS.",
  },
  {
    titre: "Réclamations tracées et priorisées",
    description:
      "Numéro de ticket unique (SAV-AAAA-XXXX), priorité P1/P2/P3 déduite automatiquement du sujet, photos jointes par le client, journal d'activité visible.",
  },
  {
    titre: "Relances automatiques à 3 niveaux",
    description:
      "24h, 48h puis 72h sans mise à jour : RenovIA relance seul, sans que vous ayez à surveiller chaque ticket manuellement.",
  },
  {
    titre: "Clôture avec preuve photo",
    description:
      "Impossible de clore une réclamation ou un chantier sans description et photo de l'intervention réalisée — une protection pour vous comme pour le client.",
  },
  {
    titre: "Fenêtre de contestation de 72h",
    description:
      "Le client peut contester une clôture pendant 72h ; passé ce délai sans réaction, le ticket est archivé définitivement.",
  },
  {
    titre: "Avis clients avec redirection intelligente",
    description:
      "Seuls les avis 4 et 5 étoiles sont redirigés vers votre fiche Google Maps ; les notes plus basses restent internes et déclenchent une alerte pour vous permettre d'agir.",
  },
  {
    titre: "Rapports et indicateurs",
    description:
      "Note moyenne, volume de tickets par priorité, délai moyen de résolution, taux de contestation, taux de réponse aux avis — en un coup d'œil dans votre tableau de bord.",
  },
];

export default function FonctionnalitesPage() {
  return (
    <main
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} bg-[#faf6ec] font-[family-name:var(--font-inter)] text-[#23261c]`}
    >
      <header className="flex items-center justify-between px-6 py-8 sm:px-14">
        <Link
          href="/"
          className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold"
        >
          Réno<span className="text-[#a15d40]">via</span>
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-[#23261c] px-6 py-2.5 text-sm font-semibold text-[#d4a94a] transition hover:bg-[#4a5a63]"
        >
          Essayer RenovIA
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-14">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs uppercase tracking-[0.15em] text-[#a15d40]">
          Fonctionnalités
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-space-grotesk)] text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl">
          Le SAV de vos chantiers,
          <br />
          <span className="text-[#a15d40]">sans rien faire manuellement.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#5c4a1e]">
          RenovIA centralise le suivi d&apos;avancement, les réclamations et les
          avis clients des entreprises TCE. Chaque demande reçoit un accusé de
          réception en moins de 5 minutes, chaque ticket est relancé
          automatiquement, chaque clôture est documentée — sans que vous ayez
          à y penser.
        </p>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 pb-16 sm:grid-cols-3 sm:px-14">
        {[
          {
            chiffre: "< 2h",
            legende: "Délai de réponse engagé en heures ouvrées",
          },
          {
            chiffre: "3 niveaux",
            legende: "D'escalade automatique si un ticket reste sans réponse",
          },
          {
            chiffre: "100 %",
            legende: "Des tickets tracés, horodatés et archivés",
          },
        ].map((stat) => (
          <div
            key={stat.chiffre}
            className="rounded-2xl border border-[#e3d6b8] bg-white/60 p-6 text-center"
          >
            <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[#a15d40]">
              {stat.chiffre}
            </p>
            <p className="mt-2 text-sm text-[#5c4a1e]">{stat.legende}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-[#e3d6b8] bg-white/40 py-8 text-center">
        <p className="mx-auto max-w-2xl px-6 text-sm text-[#5c4a1e]">
          <strong className="text-[#23261c]">Le gain de temps concret :</strong>{" "}
          plus de relances manuelles à faire, plus de demandes perdues entre
          WhatsApp, email et téléphone, plus de « on m&apos;a oublié » — le
          client sait toujours où en est son chantier, et vous savez toujours
          quel ticket attend une action.
        </p>
      </section>

      <section
        id="comment-ca-marche"
        className="mx-auto max-w-3xl scroll-mt-10 px-6 py-20 sm:px-14"
      >
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs uppercase tracking-[0.15em] text-[#a15d40]">
          Fonctionnement
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Comment ça marche
        </h2>
        <p className="mt-4 max-w-xl text-[#5c4a1e]">
          7 étapes, du premier message du client jusqu&apos;à l&apos;avis
          Google — chacune automatisée ou assistée par RenovIA.
        </p>

        <ol className="mt-12 space-y-10">
          {ETAPES_SOP.map((etape) => (
            <li
              key={etape.numero}
              className="flex flex-col gap-4 border-l-2 border-[#e3d6b8] pl-6 sm:flex-row sm:gap-8"
            >
              <div className="shrink-0 sm:w-32">
                <span className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#a15d40]">
                  {etape.numero}
                </span>
                <p className="mt-1 font-[family-name:var(--font-ibm-plex-mono)] text-xs uppercase tracking-wide text-[#5c4a1e]">
                  {etape.delai}
                </p>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold">
                  {etape.titre}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5c4a1e]">
                  {etape.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-[#e3d6b8] bg-white/40 px-6 py-20 sm:px-14">
        <div className="mx-auto max-w-4xl">
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs uppercase tracking-[0.15em] text-[#a15d40]">
            Détail technique
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Tout ce qui est automatisé
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FONCTIONNALITES.map((f) => (
              <div
                key={f.titre}
                className="rounded-2xl border border-[#e3d6b8] bg-white/70 p-6"
              >
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-base font-bold">
                  {f.titre}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5c4a1e]">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center sm:px-14">
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          On maîtrise le chantier.
          <br />
          <span className="text-[#a15d40]">On livre la confiance.</span>
        </h2>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#23261c] px-8 py-3.5 text-sm font-semibold text-[#d4a94a] transition hover:bg-[#4a5a63]"
        >
          Essayer RenovIA
          <span>→</span>
        </Link>
      </section>
    </main>
  );
}
