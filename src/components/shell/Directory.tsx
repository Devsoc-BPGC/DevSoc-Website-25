"use client";

/**
 * Directory
 * The site's navigation, drawn as a building directory rather than a navbar.
 *
 * On a wide screen it is one quiet line in the top corners: the name on the
 * left, four destinations on the right. On a phone the four destinations fold
 * into a lobby directory board that opens over the page, where each entry
 * carries what you will find there, the way a directory lists a floor.
 *
 * It sits in `.chrome`, so a scene that puts a light ground under it flips its
 * tone through `data-ink` and it never has to know which scene it is over.
 *
 * On the home page the destinations are plain hash links so the smooth scroll
 * layer can carry you there; anywhere else they are absolute, so they route
 * home first.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { directory } from "@/content/home/directory";

/** What each destination holds, printed beside it on the phone's board. */
const holds: Record<string, string> = {
  Rooms: "R-01 to R-06",
  Work: "The log",
  Crew: "Call sheet",
  Inductees: "This year's list",
};

export function Directory() {
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const home = path === "/";
  const href = (h: string) => (home && h.startsWith("/#") ? h.slice(1) : h);

  return (
    <header className="chrome fixed inset-x-0 top-0 flex h-[var(--nav-h)] items-center justify-between gutter" style={{ zIndex: "var(--z-chrome)" }}>
      <Link href="/" className="display text-[1.35rem] leading-none tracking-[0.02em] text-primary" data-cursor="Home">
        Devsoc
      </Link>

      <nav aria-label="Directory" className="hidden md:block">
        <ul className="flex items-center gap-7">
          {directory.map((d) => (
            <li key={d.label}>
              <a href={href(d.href)} className="meta text-primary/70 transition-colors duration-500 hover:text-primary">
                {d.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className="meta text-primary md:hidden"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
      >
        Directory
      </button>

      <dialog
        ref={dialog}
        aria-label="Directory"
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-[var(--c-ink)] p-0 text-[var(--c-bone)] backdrop:bg-transparent"
      >
        <div className="flex h-full flex-col gutter pb-10 pt-6">
          <div className="flex items-center justify-between">
            <span className="display text-[1.35rem] leading-none">Devsoc</span>
            <button type="button" className="meta" onClick={() => dialog.current?.close()}>
              Close
            </button>
          </div>
          <ul className="mt-auto border-t border-[var(--c-steel)]/60">
            {directory.map((d) => (
              <li key={d.label} className="border-b border-[var(--c-steel)]/60">
                <a
                  href={href(d.href)}
                  onClick={() => dialog.current?.close()}
                  className="flex items-baseline justify-between gap-6 py-4"
                >
                  <span className="display text-[3rem] leading-none">{d.label}</span>
                  <span className="meta text-[var(--c-gray)]">{holds[d.label]}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </header>
  );
}
