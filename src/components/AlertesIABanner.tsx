/**
 * Bandeau d'alertes : agrège les tickets P1 urgents et les chantiers en
 * retard en un seul indicateur "à traiter aujourd'hui". Il ne s'agit pas
 * d'une véritable intelligence artificielle — seulement une consolidation
 * de règles déjà existantes (priorité, échéance dépassée) — mais habillée
 * sous ce libellé pour cette maquette.
 */
export function AlertesIABanner({
  items,
}: {
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-lg bg-[#23261c] p-5">
      <div className="flex items-center gap-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d4a94a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M12 2a7 7 0 0 0-7 7c0 3 1.5 4.5 2.5 5.5S9 16 9 18h6c0-2 .5-2.5 1.5-3.5S19 12 19 9a7 7 0 0 0-7-7Z" />
          <path d="M9 21h6" />
        </svg>
        <p className="text-sm font-semibold text-[#d4a94a]">Alertes IA</p>
        <span className="ml-auto inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-[#d4a94a] px-2 py-0.5 text-xs font-bold text-[#23261c]">
          {items.length}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-[#d4a94a]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
