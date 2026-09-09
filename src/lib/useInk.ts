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
 *
 * `handoff` is for a section whose inverted ground continues into the section
 * below it. Without it the two fight over one global: this one clears the tone
 * on its way out while the next one is still asking for it, and which of them
 * wins is decided by callback ordering rather than by anything meaningful. With
 * it, leaving downward says nothing at all and simply lets the next owner
 * speak. Leaving upward still clears, because there is nothing below to ask.
 */
export function useInkOver(
  ref: React.RefObject<HTMLElement | null>,
  value = "1",
  { enabled = true, handoff = false }: { enabled?: boolean; handoff?: boolean } = {},
) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !enabled) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 6%",
        end: "bottom 6%",
        onEnter: () => setInk(value),
        onEnterBack: () => setInk(value),
        onLeaveBack: () => setInk(""),
        onLeave: () => {
          if (!handoff) setInk("");
        },
      });
      return () => {
        st.kill();
        setInk("");
      };
    },
    { dependencies: [enabled, value, handoff] },
  );
}

/**
 * Holds `data-ink` from the top of `fromRef` until a measured distance into
 * `toRef`, as a single trigger with a single owner.
 *
 * Two sections sharing one inverted ground cannot each control the tone, even
 * with a handoff rule. One writes on a toggle and the other writes per frame,
 * so which of them lands last depends on callback ordering, and on any jump
 * (a hash link, a scroll restore, a test driving the page) the wrong one wins
 * and the chrome ends up black on black or white on white. The tone is one
 * piece of state, so it gets one owner and one span.
 *
 * The end is a function of the receding section's own height rather than a
 * fixed viewport fraction, because that section is shorter on a phone and the
 * point being measured is a share of its scroll travel, not a distance.
 */
export function useInkSpan(
  fromRef: React.RefObject<HTMLElement | null>,
  toRef: React.RefObject<HTMLElement | null>,
  /** How far through the second section the ground stops being inverted. */
  at: number,
  value = "1",
) {
  useGSAP(
    () => {
      const from = fromRef.current;
      const to = toRef.current;
      if (!from || !to) return;
      const st = ScrollTrigger.create({
        trigger: from,
        start: "top 6%",
        endTrigger: to,
        end: () => `top+=${Math.max(0, at * (to.offsetHeight - window.innerHeight))} 6%`,
        invalidateOnRefresh: true,
        onToggle: (self) => setInk(self.isActive ? value : ""),
      });
      return () => {
        st.kill();
        setInk("");
      };
    },
    { dependencies: [at, value] },
  );
}
