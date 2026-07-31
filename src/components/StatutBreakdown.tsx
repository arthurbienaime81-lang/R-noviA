import styles from "./StatutBreakdown.module.css";

type Item = { label: string; count: number };

export function StatutBreakdown({ items }: { items: Item[] }) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = Math.round((item.count / max) * 100);
        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-500">{item.count}</span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ "--target-width": `${pct}%` } as React.CSSProperties}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
