"use client";

/**
 * Menu
 * Full-screen overlay. Routes stacked in expanded display type at the left;
 * a LitImage at the right previews whatever is hovered; socials and the
 * email sit in a row at the bottom. Opens with a downward wipe.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { LitImage } from "@/components/motion/LitImage";
import { routes, site } from "@/content/site";
import { EASE_OUT_ARR } from "@/lib/easings";
import { useIsMobile } from "@/lib/useMedia";

// One per route, in the order the routes are listed.
const previews = [
  { src: "/images/hero/facade-night-wide.jpg", alt: "The building at night with six windows lit" },
  { src: "/images/work/waves-web.jpg", alt: "A fest website" },
  { src: "/images/people/utkarsh.jpg", alt: "A member of the crew" },
  { src: "/images/gallery/g11.jpg", alt: "Members on campus" },
  { src: "/images/dawn/door-wide.jpg", alt: "The building at dawn with the door open" },
];

export function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [hover, setHover] = useState(0);
  const pathname = usePathname();
  const lenis = useLenis();
  const first = useRef<HTMLAnchorElement>(null);
  const mobile = useIsMobile();

  useEffect(() => {
    if (open) {
      lenis?.stop();
      document.documentElement.classList.add("lenis-stopped");
      setTimeout(() => first.current?.focus(), 500);
    } else {
      lenis?.start();
      document.documentElement.classList.remove("lenis-stopped");
    }
    return () => {
      lenis?.start();
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [open, lenis]);

  // Close on navigation.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 bg-base"
          style={{ zIndex: "var(--z-menu)" }}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(100% 0 0 0)" }}
          transition={{ duration: 0.9, ease: EASE_OUT_ARR }}
          data-lenis-prevent
        >
          <div className="ambient" style={{ "--lx": "72%", "--ly": "50%" } as React.CSSProperties} />
          <div className="grid-12 relative h-full gutter pb-10 pt-[calc(var(--nav-h)+2vh)]">
            <nav className="col-span-12 flex flex-col justify-center lg:col-span-7" aria-label="Pages">
              <ul className="flex flex-col">
                {routes.map((r, i) => (
                  <motion.li
                    key={r.href}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, delay: 0.25 + i * 0.06, ease: EASE_OUT_ARR }}
                  >
                    <Link
                      ref={i === 0 ? first : undefined}
                      href={r.href}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      className={`display block py-[0.6vh] text-[clamp(2.6rem,7vw,7.25rem)] transition-colors duration-500 ${
                        pathname === r.href ? "text-primary" : "text-muted/50 hover:text-primary focus-visible:text-primary"
                      }`}
                      data-cursor="Go"
                    >
                      {r.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="hidden lg:col-span-4 lg:col-start-9 lg:flex lg:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
            >
              <LitImage images={previews} index={hover} className="aspect-[4/5] w-full max-h-[64vh]" simple={mobile} />
            </motion.div>
            <motion.div
              className="meta col-span-12 flex flex-wrap items-end justify-between gap-6 self-end text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              <ul className="flex flex-wrap gap-6">
                {site.socials.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="text-link hover:text-primary" data-cursor="Open">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <a href={`mailto:${site.email}`} className="text-link hover:text-primary" data-cursor="Write">
                {site.email}
              </a>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
