/**
 * ActionLink
 * The way the site asks you to go somewhere. Not a button and not an
 * underline: the words, and a drawn line with a head that points where you are
 * going, which reaches a little further when you move toward it.
 *
 * Used for actions inside the world ("Walk through the rooms", "Open the full
 * log", "Find your name"), never for navigation chrome.
 */

import type { ReactNode } from "react";

export function ActionLink({
  href,
  children,
  className,
  cursor = "Go",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  cursor?: string;
}) {
  return (
    <a
      href={href}
      data-cursor={cursor}
      className={`group inline-flex items-center gap-3 font-medium leading-none ${className ?? ""}`}
    >
      {/* An action that wraps onto two lines stops reading as one thing. */}
      <span className="whitespace-nowrap">{children}</span>
      <span
        aria-hidden="true"
        className="relative block h-px w-9 bg-current transition-[width] duration-700 ease-[var(--ease-out-expo)] group-hover:w-14 group-focus-visible:w-14"
      >
        <span className="absolute -right-px top-1/2 block h-[7px] w-[7px] -translate-y-1/2 rotate-45 border-r border-t border-current" />
      </span>
    </a>
  );
}
