"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Standings & Squad" },
  { href: "/matchups", label: "Matchups" },
  { href: "/free-agents", label: "Free Agents" },
  { href: "/rankings", label: "Season Rankings" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pt-6 sm:px-8">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 whitespace-nowrap rounded-t-md border border-b-0 px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide ${
              active
                ? "border-pitch-border bg-pitch-surface text-gold"
                : "border-transparent text-ink-dim hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
