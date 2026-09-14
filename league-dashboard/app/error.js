"use client";

export default function Error({ error, reset }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Couldn&rsquo;t load this page</h1>
      <p className="text-sm text-ink-dim">
        One of the FPL APIs this dashboard depends on didn&rsquo;t respond in
        time. This is usually transient &mdash; try again in a moment.
      </p>
      {error?.digest && (
        <p className="font-mono text-xs text-ink-dim">Error digest: {error.digest}</p>
      )}
      <button
        onClick={() => reset()}
        className="rounded-md bg-gold px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-pitch-bg hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
