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
 * It is drawn in difference mode, so its bone type inverts against whatever
 * passes under it: bone over the night, ink over the lit sign on the roof as
 * the camera pushes into it, ink again over the dawn ground. No scene has to
 * tell it what is underneath, and it is never illegible in between.
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
  Coordinators: "The seven",
  Inductees: "This year's list",
};

export function Directory() {
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const home = path === "/";
  const href = (h: string) => (home && h.startsWith("/#") ? h.slice(1) : h);

  return (
    <header
      className="fixed inset-x-0 top-0 flex h-[calc(var(--nav-h)+env(safe-area-inset-top,0px))] items-center justify-between pt-[env(safe-area-inset-top,0px)] text-[var(--c-bone)] mix-blend-difference gutter"
      style={{ zIndex: "var(--z-chrome)" }}
    >
      <Link href="/" className="relative before:absolute before:-inset-x-3 before:-inset-y-3.5 before:content-[''] display text-[1.35rem] leading-none tracking-[0.02em]" data-cursor="Home">
        Devsoc
      </Link>

      <nav aria-label="Directory" className="hidden md:block">
        <ul className="flex items-center gap-7">
          {directory.map((d) => (
            <li key={d.label}>
              <a href={href(d.href)} className="meta opacity-75 transition-opacity duration-500 hover:opacity-100">
                {d.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <button
        type="button"
        className="relative before:absolute before:-inset-x-3 before:-inset-y-3.5 before:content-[''] meta md:hidden"
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
            <button type="button" className="relative before:absolute before:-inset-x-3 before:-inset-y-3.5 before:content-[''] meta" onClick={() => dialog.current?.close()}>
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
