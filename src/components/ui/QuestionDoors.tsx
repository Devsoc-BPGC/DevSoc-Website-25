"use client";

/**
 * The questions, as doors.
 *
 * A flat list with every answer already open is not a section, it is a page of
 * text: nothing to do, nothing moving, no hierarchy. So this is an accordion,
 * and exactly one door is open at a time.
 *
 * The mechanic is the site's own metaphor taken literally. A society is a room
 * with the light on, and you find a lit room from the corridor by the light
 * under its door. So opening a question runs a line of light down the edge of
 * that door and closing it takes the light away again. Exactly one edge is lit
 * at a time.
 *
 * There was a warm wash behind the open answer as well, which is the obvious
 * second half of that idea and had to go: this section sits on the dawn ground,
 * where a warm tint over a warm ground stops reading as spilled light and
 * starts reading as a grey smudge. The lit edge survives because it works on
 * either ground.
 *
 * Height is animated with `grid-template-rows: 0fr -> 1fr`, which needs no
 * measurement and therefore cannot go stale when the text rewraps at a
 * different width. The answer is masked, so it rises out from behind the
 * question rather than appearing in place, which is the same treatment body
 * copy gets everywhere else on the site.
 *
 * One door is open on arrival. An accordion that starts fully closed reads as
 * broken, and the first question is the one everybody has.
 */

import { useId, useState } from "react";
import { useReducedMotion } from "@/lib/useMedia";
import type { Faq } from "@/content/faq";

/** expo.out, matching EASE.out in the timing language. */
const OPEN = "cubic-bezier(0.16, 1, 0.3, 1)";

export function QuestionDoors({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState(0);
  const reduced = useReducedMotion();
  const uid = useId();

  return (
    <div>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className="relative border-t border-rule/25 last:border-b"
            style={{ ["--lit" as string]: isOpen ? 1 : 0 }}
          >
            {/* The light down the edge of the door. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 w-px origin-top bg-warm"
              style={{
                height: "100%",
                transform: `scaleY(${isOpen ? 1 : 0})`,
                transition: reduced ? "none" : `transform 620ms ${OPEN}`,
              }}
            />

            <h3>
              <button
                type="button"
                onClick={() => setOpen((prev) => (prev === i ? -1 : i))}
                aria-expanded={isOpen}
                aria-controls={`${uid}-${i}`}
                className="group flex w-full items-baseline gap-5 py-6 pl-5 pr-2 text-left"
                data-cursor={isOpen ? "Close" : "Open"}
              >
                <span className="meta shrink-0 text-muted">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className="flex-1 text-[clamp(1.05rem,1.5vw,1.35rem)] leading-snug transition-colors duration-300"
                  style={{ color: isOpen ? "var(--text-primary)" : undefined }}
                >
                  {f.q}
                </span>
                {/* Two strokes that make a plus, and lose one to make a minus. */}
                <span aria-hidden="true" className="relative mt-2 h-px w-4 shrink-0 self-start">
                  <span className="absolute inset-0 bg-rule" />
                  <span
                    className="absolute inset-0 bg-warm"
                    style={{
                      transform: `rotate(${isOpen ? 0 : 90}deg) scaleX(${isOpen ? 1 : 1})`,
                      opacity: isOpen ? 1 : 0.55,
                      transition: reduced ? "none" : `transform 620ms ${OPEN}, opacity 400ms linear`,
                    }}
                  />
                </span>
              </button>
            </h3>

            <div
              id={`${uid}-${i}`}
              role="region"
              className="grid pl-5"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: reduced ? "none" : `grid-template-rows 620ms ${OPEN}`,
              }}
            >
              <div className="overflow-hidden">
                <div
                  className="relative pb-8 pr-8"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: `translateY(${isOpen ? 0 : 8}px)`,
                    transition: reduced ? "none" : `opacity 520ms linear, transform 620ms ${OPEN}`,
                  }}
                >
                  <p className="body-copy relative max-w-[54ch]">{f.a}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
