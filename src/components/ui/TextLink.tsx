import Link from "next/link";
import type { ReactNode } from "react";

/** The one link style on the site: metadata text with a hairline that thickens to brass. */
export function TextLink({
  href,
  children,
  className,
  cursor,
  external,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  cursor?: string;
  external?: boolean;
}) {
  const cls = `text-link meta text-primary ${className ?? ""}`;
  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={cls}
        data-cursor={cursor}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} data-cursor={cursor}>
      {children}
    </Link>
  );
}
