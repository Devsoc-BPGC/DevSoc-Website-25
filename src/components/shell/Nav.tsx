"use client";

/**
 * Nav
 * The mark at the left, the night clock, the theme switch and the word
 * "Menu" at the right.
 * No bar, no blur, no border: the composition is the navigation.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "./Menu";
import { ChapterLabel } from "./Rail";
import { ThemeToggle } from "./ThemeToggle";

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
          <Image src="/images/brand/mark.png" alt="" width={34} height={26} priority className="h-[26px] w-auto" />
          <span className="meta text-primary">DevSoc</span>
        </Link>
        <div className="flex items-center gap-6 md:gap-8">
          <ChapterLabel className="hidden lg:inline" />
          <ThemeToggle />
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
