"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = {
  draft: {
    label: "Draft League",
    links: [
      { href: "/", label: "Standings & Squad" },
      { href: "/matchups", label: "Matchups" },
      { href: "/free-agents", label: "Free Agents" },
      { href: "/rankings", label: "Season Rankings" },
      { href: "/trades", label: "Trade Targets" },
      { href: "/lineup", label: "Start/Sit" },
      { href: "/optimizer", label: "Optimizer" },
    ],
  },
  classic: {
    label: "Classic Team",
    links: [
      { href: "/classic", label: "Standings & Squad" },
      { href: "/classic/optimizer", label: "Optimizer" },
    ],
  },
};

export default function NavBar() {
  const pathname = usePathname();
  const activeKey = pathname.startsWith("/classic") ? "classic" : "draft";

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
      <div className="mb-2 flex gap-2">
        {Object.entries(SECTIONS).map(([key, section]) => (
          <Link
            key={key}
            href={section.links[0].href}
            className={`rounded-full px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wide ${
              activeKey === key
                ? "bg-gold text-pitch-bg"
                : "bg-pitch-surface2 text-ink-dim hover:text-ink"
            }`}
          >
            {section.label}
          </Link>
        ))}
      </div>
      <nav className="flex gap-1 overflow-x-auto">
        {SECTIONS[activeKey].links.map((link) => {
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
    </div>
  );
}
