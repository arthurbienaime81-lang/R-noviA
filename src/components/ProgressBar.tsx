export function ProgressBar({
  progression,
  size = "md",
}: {
  progression: number;
  size?: "sm" | "md" | "lg";
}) {
  const height = size === "lg" ? "h-3.5" : size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${height}`}>
      <div
        className="h-full rounded-full bg-[#2563EB] transition-all"
        style={{ width: `${Math.min(100, Math.max(0, progression))}%` }}
      />
    </div>
  );
}
