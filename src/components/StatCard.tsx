const DOT_COLORS = {
  blue: "bg-blue-500",
  red: "bg-red-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
} as const;

export function StatCard({
  label,
  value,
  subtext,
  dot,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  dot: keyof typeof DOT_COLORS;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT_COLORS[dot]}`} aria-hidden="true" />
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}
