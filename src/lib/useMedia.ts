"use client";

import { useEffect, useState } from "react";

function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** True when the visitor asked for reduced motion. Static layouts everywhere. */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True on mouse and trackpad devices. Cursor and hover effects only here. */
export function useFinePointer() {
  return useMediaQuery("(pointer: fine)");
}

/** Below the lg breakpoint. Pins unpin, shaders become crossfades. */
export function useIsMobile() {
  return useMediaQuery("(max-width: 63.98rem)");
}

/** Reads the same flags synchronously for non-React code paths. */
export function motionAllowed() {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
