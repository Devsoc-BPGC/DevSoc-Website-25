"use client";

/**
 * Lightbox
 * One photo at a time over the obsidian ground, dissolving between neighbours.
 * Arrow keys move, Escape closes, the scrim closes.
 */

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { LitImage } from "@/components/motion/LitImage";
import type { Photo } from "@/content/gallery";
import { EASE_OUT_ARR } from "@/lib/easings";

export function Lightbox({
  photos,
  index,
  onClose,
  onChange,
}: {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onChange: (next: number) => void;
}) {
  const lenis = useLenis();
  const open = index !== null;
  const i = index ?? 0;
  const next = () => onChange((i + 1) % photos.length);
  const prev = () => onChange((i - 1 + photos.length) % photos.length);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((i + 1) % photos.length);
      if (e.key === "ArrowLeft") onChange((i - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, onChange, i, photos.length, lenis]);

  const images = photos.map((p) => ({ src: p.src, alt: p.alt }));

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Photo"
          className="fixed inset-0 grid place-items-center bg-base/95 gutter"
          style={{ zIndex: "var(--z-menu)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_ARR }}
          onClick={onClose}
          data-lenis-prevent
        >
          <div className="w-full max-w-[min(92vw,140vh)]" onClick={(e) => e.stopPropagation()}>
            <LitImage images={images} index={i} className="aspect-[3/2] w-full" />
            <div className="meta mt-4 flex items-center justify-between text-muted">
              <span>
                {String(i + 1).padStart(2, "0")} of {String(photos.length).padStart(2, "0")}
              </span>
              <span className="flex gap-6">
                <button type="button" onClick={prev} className="text-link hover:text-primary">
                  Prev
                </button>
                <button type="button" onClick={next} className="text-link hover:text-primary">
                  Next
                </button>
                <button type="button" onClick={onClose} className="text-link hover:text-primary">
                  Close
                </button>
              </span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
