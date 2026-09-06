"use client";

/**
 * Rail
 * Six brass ticks on the right edge, one per chapter, for the home page.
 * The tick for the chapter in view lengthens; its name appears beside it
 * and is echoed in the nav (see ChapterLabel). Desktop only. Hidden in the hero.
 */

import { useEffect, useState } from "react";
import { chapters } from "@/content/site";

export const CHAPTER_EVENT = "devsoc:chapter";

export function Rail() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
        else if (window.scrollY < window.innerHeight * 0.6) setActive("");
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const label = chapters.find((c) => c.id === active)?.label ?? "";
    window.dispatchEvent(new CustomEvent(CHAPTER_EVENT, { detail: label }));
  }, [active]);

  return (
    <nav
      aria-label="Chapters"
      className={`fixed right-5 top-1/2 hidden -translate-y-1/2 transition-opacity duration-1000 lg:block ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{ zIndex: "var(--z-nav)" }}
      aria-hidden={active ? undefined : true}
    >
      <ul className="flex flex-col items-end gap-4">
        {chapters.map((c) => {
          const on = active === c.id;
          return (
            <li key={c.id} className="group relative flex items-center justify-end">
              <a
                href={c.href}
                className="flex items-center gap-3 py-1"
                aria-current={on ? "true" : undefined}
                aria-label={c.label}
                data-cursor="Go"
              >
                <span
                  className={`mono whitespace-nowrap transition-opacity duration-500 ${
                    on ? "text-primary opacity-100" : "text-muted opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {c.label}
                </span>
                <span
                  className={`block h-px transition-all duration-700 ease-[var(--ease-out-expo)] ${
                    on ? "w-7 bg-rule" : "w-3 bg-rule/40 group-hover:w-5 group-hover:bg-rule/80"
                  }`}
                  aria-hidden="true"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Mono label in the nav that names the chapter in view. */
export function ChapterLabel({ className }: { className?: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const on = (e: Event) => setLabel((e as CustomEvent<string>).detail ?? "");
    window.addEventListener(CHAPTER_EVENT, on);
    return () => window.removeEventListener(CHAPTER_EVENT, on);
  }, []);
  return (
    <span
      className={`mono text-muted transition-opacity duration-700 ${label ? "opacity-100" : "opacity-0"} ${className ?? ""}`}
      aria-live="polite"
    >
      {label}
    </span>
  );
}
