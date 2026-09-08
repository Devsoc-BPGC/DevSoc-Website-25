"use client";

/**
 * Nav
 * The mark at the left, turning at whatever speed you are scrolling, and the
 * chapter name and the word "Menu" at the right.
 * No bar, no blur, no border: the composition is the navigation.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "./Menu";
import { ChapterLabel } from "./Rail";
import { VelocityMark } from "./VelocityMark";

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className="chrome fixed inset-x-0 top-0 flex items-center justify-between gutter"
        style={{ height: "var(--nav-h)", zIndex: "var(--z-nav)" }}
      >
        <Link href="/" className="flex items-center gap-3" aria-label="DevSoc, home" data-cursor="Home">
          <VelocityMark size={28} />
          <span className="meta text-primary">DevSoc</span>
        </Link>
        <div className="flex items-center gap-6 md:gap-8">
          <ChapterLabel className="hidden lg:inline" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="text-link meta text-primary"
            data-cursor={open ? "Close" : "Open"}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>
      <Menu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
