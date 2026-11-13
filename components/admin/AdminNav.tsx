"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Analytics", match: (p: string) => p === "/admin" || p.startsWith("/admin/sessions") },
  { href: "/admin/content", label: "Content", match: (p: string) => p.startsWith("/admin/content") && p !== "/admin/content/site" },
  { href: "/admin/content/site", label: "Settings & accent", match: (p: string) => p === "/admin/content/site" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="adm-nav" aria-label="Dashboard">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={l.match(pathname) ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
