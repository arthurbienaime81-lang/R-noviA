"use client";

import styles from "./VolumeChart.module.css";

type Point = { label: string; value: number };

// Opacité or croissante à mesure qu'on approche du mois courant, qui est
// lui-même mis en évidence en sombre plutôt qu'en dégradé (dernier point).
function couleurBarre(index: number, total: number) {
  if (index === total - 1) return "#23261c";
  const t = total > 2 ? index / (total - 2) : 1;
  const opacite = 0.3 + 0.6 * t;
  return `rgba(212, 169, 74, ${opacite})`;
}

export function VolumeChart({ data }: { data: Point[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div>
      <div
        className={styles.chartTrack}
        role="img"
        aria-label={`Volume mensuel des chantiers livrés sur les ${data.length} derniers mois : ${data
          .map((d) => `${d.label} ${d.value}`)
          .join(", ")}`}
      >
        {data.map((point, i) => {
          const pct = Math.round((point.value / max) * 100);
          return (
            <div key={`${point.label}-${i}`} className={styles.barColumn} aria-hidden="true">
              <span className="mb-1 text-xs font-medium text-slate-500">{point.value}</span>
              <div
                className={styles.barFill}
                style={
                  {
                    "--target-height": `${pct}%`,
                    backgroundColor: couleurBarre(i, data.length),
                  } as React.CSSProperties
                }
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((point, i) => (
          <span
            key={`${point.label}-${i}`}
            className="flex-1 text-center text-xs text-slate-600"
            aria-hidden="true"
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
