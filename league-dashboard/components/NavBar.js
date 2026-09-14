"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DRAFT_LINKS = [
  { href: "/", label: "Standings & Squad" },
  { href: "/matchups", label: "Matchups" },
  { href: "/free-agents", label: "Free Agents" },
  { href: "/rankings", label: "Season Rankings" },
  { href: "/trades", label: "Trade Targets" },
  { href: "/lineup", label: "Start/Sit" },
  { href: "/optimizer", label: "Optimizer" },
];

const CLASSIC_LINKS = [{ href: "/classic", label: "Classic Team" }];

function NavLink({ href, label, active }) {
  return (
    <Link
      href={href}
      className={`shrink-0 whitespace-nowrap rounded-t-md border border-b-0 px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide ${
        active
          ? "border-pitch-border bg-pitch-surface text-gold"
          : "border-transparent text-ink-dim hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 pt-6 sm:px-8">
      {DRAFT_LINKS.map((link) => (
        <NavLink key={link.href} {...link} active={pathname === link.href} />
      ))}
      <span className="mx-1 h-5 w-px shrink-0 bg-pitch-border" />
      {CLASSIC_LINKS.map((link) => (
        <NavLink key={link.href} {...link} active={pathname === link.href} />
      ))}
    </nav>
  );
}
