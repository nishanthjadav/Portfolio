"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "life", label: "Life" },
];

const SCROLL_OFFSET = 72;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY: number) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    window.scrollTo(0, targetY);
    return;
  }

  const duration = Math.min(1100, Math.max(450, Math.abs(distance) * 0.55));
  const start = performance.now();

  function step(now: number) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);
    window.scrollTo(0, startY + distance * easeInOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export default function PortfolioNav() {
  const [active, setActive] = useState<string>("top");

  useEffect(() => {
    const trackable = SECTIONS.filter((s) => s.id !== "top");
    const els = trackable
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));

    function onScroll() {
      if (window.scrollY < 120) setActive("top");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    if (id === "top") {
      smoothScrollTo(0);
      history.pushState(null, "", "#top");
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    const targetY = window.scrollY + el.getBoundingClientRect().top - SCROLL_OFFSET;
    smoothScrollTo(targetY);
    history.pushState(null, "", `#${id}`);
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-paper/70 border-b border-hair">
      <div className="px-8 py-4 flex items-center justify-between text-sm">
        <Link href="/" className="font-medium hover:text-muted transition-colors">
          Nishanth Jadav
        </Link>
        <nav className="flex gap-6">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                className={`text-ink transition-colors hover:text-muted pb-0.5 border-b-2 ${
                  isActive ? "border-accent" : "border-transparent"
                }`}
              >
                {s.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
