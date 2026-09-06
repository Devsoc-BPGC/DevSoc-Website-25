"use client";

/**
 * FrameChrome
 * Four thin brass corner marks fixed to the viewport: the film-frame device
 * from the reference boards. Purely presentational; pointer events pass through.
 * The night clock lives in the nav (see shell/NightClock).
 */

export function FrameChrome() {
  const mark = "pointer-events-none absolute h-4 w-4 border-rule/70";
  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: "var(--z-frame)" }} aria-hidden="true">
      <span className={`${mark} left-5 top-5 border-l border-t`} />
      <span className={`${mark} right-5 top-5 border-r border-t`} />
      <span className={`${mark} bottom-5 left-5 border-b border-l`} />
      <span className={`${mark} bottom-5 right-5 border-b border-r`} />
    </div>
  );
}
