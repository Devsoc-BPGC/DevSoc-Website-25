"use client";

/**
 * Chrome tone.
 *
 * The fixed chrome (wordmark, menu, rail, corner brackets) floats over whatever
 * section happens to be under it, and most of this site is a dark ground it
 * reads fine against. Two places are not: the ink flood in the premise, and the
 * dawn light the questions stand in. Over those it is light type on a light
 * ground and effectively invisible.
 *
 * Sections therefore declare a relationship rather than a colour. They say "the
 * ground behind the chrome is now inverted" and the chrome decides what to do
 * about it, in one place, in `globals.css` under `[data-ink="1"] .chrome`.
 *
 * The window is deliberately the top edge of the viewport, not the middle: the
 * chrome sits at the top, so what matters is which section is behind *there*,
 * not which section is nearest the centre of the screen.
 */

import { ScrollTrigger, useGSAP } from "@/lib/gsap";

/** "" normal, "cross" hidden, "1" inverted. */
export function setInk(v: string) {
  const el = document.documentElement;
  if (v) {
    if (el.dataset.ink !== v) el.dataset.ink = v;
  } else if (el.dataset.ink) {
    delete el.dataset.ink;
  }
}

/**
 * Holds `data-ink` while `ref` is the thing behind the chrome. Always clears on
 * teardown, so a route change or a hot reload cannot strand the chrome in the
 * wrong tone.
 */
export function useInkOver(ref: React.RefObject<HTMLElement | null>, value = "1", enabled = true) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !enabled) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 6%",
        end: "bottom 6%",
        onToggle: (self) => setInk(self.isActive ? value : ""),
      });
      return () => {
        st.kill();
        setInk("");
      };
    },
    { dependencies: [enabled, value] },
  );
}
