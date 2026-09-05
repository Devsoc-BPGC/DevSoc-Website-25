"use client";

/**
 * FitText
 * Scales a single line of text so it spans exactly the width of its box,
 * re-measuring on resize and after fonts load. Used for the wordmark.
 *
 * <FitText className="display"><span>DEV</span><span>SOC</span></FitText>
 */

import { useEffect, useRef, type ReactNode } from "react";

export function FitText({
  children,
  className,
  innerClassName,
  share = 1,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Fraction of the box width the text should fill. */
  share?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const b = box.current;
    const l = line.current;
    if (!b || !l) return;
    const fit = () => {
      const w = b.clientWidth;
      if (!w) return;
      l.style.fontSize = "100px";
      const tw = l.getBoundingClientRect().width || 1;
      l.style.fontSize = `${(100 * w * share) / tw}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    return () => ro.disconnect();
  }, [share]);

  return (
    <div ref={box} className={className}>
      <span ref={line} className={`inline-block whitespace-nowrap ${innerClassName ?? ""}`}>
        {children}
      </span>
    </div>
  );
}
