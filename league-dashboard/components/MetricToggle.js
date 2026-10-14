import Link from "next/link";

const OPTIONS = [
  { value: "ros", label: "Rest of season" },
  { value: "next", label: "Next GW" },
];

export default function MetricToggle({ metric, basePath }) {
  return (
    <div className="inline-flex rounded-md border border-pitch-border bg-pitch-surface2 p-0.5">
      {OPTIONS.map((opt) => (
        <Link
          key={opt.value}
          href={opt.value === "ros" ? basePath : `${basePath}?metric=${opt.value}`}
          className={`rounded px-3 py-1 font-display text-xs font-bold uppercase tracking-wide ${
            metric === opt.value
              ? "bg-gold text-pitch-bg"
              : "text-ink-dim hover:text-ink"
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}
