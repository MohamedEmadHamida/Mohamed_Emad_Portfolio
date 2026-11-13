"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, site } from "@/lib/content";
import { vars } from "@/lib/client";

/**
 * On the homepage, section links are plain "#id" anchors (smooth scrolled by SmoothScroll).
 * On other pages they become "/#id" links that soft-navigate back to the homepage section.
 */
function resolveHref(href: string, onHome: boolean) {
  return onHome && href.startsWith("/#") ? href.slice(1) : href;
}

function NavLink({ href, className, onClick, children }: { href: string; className?: string; onClick?: () => void; children: React.ReactNode }) {
  // In-page anchors stay plain <a> so the smooth-scroll handler can take them.
  if (href.startsWith("#")) return <a href={href} className={className} onClick={onClick}>{children}</a>;
  return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
}

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [spied, setSpied] = useState<string | null>(null);

  // Homepage: highlight the link of the section in view.
  useEffect(() => {
    setSpied(null);
    if (!onHome) return;
    const spy = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) setSpied("#" + e.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    const raf = requestAnimationFrame(() => {
      ["#top", ...navLinks.map((l) => resolveHref(l.href, true)).filter((h) => h.startsWith("#"))].forEach((h) => {
        const el = document.querySelector(h);
        if (el) spy.observe(el);
      });
    });
    return () => { cancelAnimationFrame(raf); spy.disconnect(); };
  }, [onHome]);

  const isActive = (l: (typeof navLinks)[number]) =>
    onHome ? spied === resolveHref(l.href, true) : !!l.match && pathname.startsWith(l.match);

  const initials = site.name.split(" ").map((p) => p[0]).join("");
  const close = () => setOpen(false);

  return (
    <>
      <header className="nav">
        <nav aria-label="Main">
          <NavLink className="logo glass" href={onHome ? "#top" : "/"}>
            <span className="mono">{initials}</span>
            <span className="label">{site.name}</span>
          </NavLink>
          <ul className="links glass">
            {navLinks.map((l) => (
              <li key={l.href}>
                <NavLink href={resolveHref(l.href, onHome)} className={isActive(l) ? "on" : undefined}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <a className="nav-cta glass" href="#contact">
            Let&apos;s talk
          </a>
          <button
            className="burger glass"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>
      <div className={open ? "menu open" : "menu"} id="menu">
        <ul>
          {navLinks.map((l, i) => (
            <li key={l.href} style={vars({ "--i": i })}>
              <NavLink className="display" href={resolveHref(l.href, onHome)} onClick={close}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
