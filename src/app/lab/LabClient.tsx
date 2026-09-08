"use client";

import { useState } from "react";
import { ScrollExpand } from "@/components/motion/ScrollExpand";
import { LitImage } from "@/components/motion/LitImage";
import { PointField } from "@/components/motion/PointField";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { Carousel, CarouselSlide } from "@/components/motion/Carousel";
import { ParticleText } from "@/components/motion/ParticleText";
import { FrameChrome } from "@/components/motion/FrameChrome";
import { RevealWords } from "@/components/motion/text";
import { Magnetic } from "@/components/motion/Magnetic";
import { gallery } from "@/content/gallery";
import { verticals } from "@/content/verticals";

export function LabClient() {
  const [room, setRoom] = useState(0);
  const rooms = verticals.map((v) => ({ src: v.image, alt: v.object }));

  return (
    <main className="pb-40">
      <FrameChrome />

      <section className="gutter relative min-h-[100dvh] py-32">
        <PointField image="/images/brand/mark.png" className="absolute inset-0" />
        <div className="relative">
          <p className="meta text-muted">Lab · PointField, RevealWords, Magnetic</p>
          <RevealWords as="h1" className="voice mt-8 max-w-4xl text-[clamp(2.5rem,5vw,4.5rem)]">
            The campus sleeps. Six rooms stay lit.
          </RevealWords>
          <Magnetic className="mt-10">
            <a href="#lit" className="text-link meta text-primary" data-cursor="Go">
              Next tool
            </a>
          </Magnetic>
        </div>
      </section>

      <section id="lit" className="gutter grid-12 py-32">
        <div className="col-span-12 lg:col-span-5">
          <p className="meta text-muted">LitImage</p>
          <ul className="mt-6 space-y-3">
            {verticals.map((v, i) => (
              <li key={v.id}>
                <button
                  type="button"
                  onMouseEnter={() => setRoom(i)}
                  onClick={() => setRoom(i)}
                  className={`display text-[clamp(1.5rem,3vw,2.75rem)] transition-colors duration-500 ${i === room ? "text-primary" : "text-muted/60"}`}
                >
                  {v.short}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <LitImage images={rooms} index={room} className="aspect-[4/5] max-h-[80vh] w-full" />
        </div>
      </section>

      <ScrollExpand
        media={<img src={gallery[10].src} alt={gallery[10].alt} />}
        expanded={
          <div className="gutter flex h-full items-end pb-16">
            <p className="voice text-[clamp(1.75rem,3vw,3rem)] text-primary">Shipping from the Goa campus.</p>
          </div>
        }
      >
        <p className="display text-[clamp(2rem,6vw,6rem)] text-primary">ScrollExpand</p>
      </ScrollExpand>

      <section className="gutter py-32">
        <p className="meta text-muted">MaskReveal</p>
        <MaskReveal
          className="mt-8 aspect-[16/9] max-w-4xl"
          radius={190}
          cursorLabel="Look"
          base={<img src={gallery[0].src} alt={gallery[0].alt} />}
          reveal={<img src={gallery[0].src} alt="" />}
        />
      </section>

      <section className="py-32">
        <p className="meta gutter text-muted">Carousel</p>
        <Carousel label="Archive" className="mt-8">
          <div className="w-[var(--gutter)] flex-none" aria-hidden="true" />
          {gallery.slice(0, 8).map((p) => (
            <CarouselSlide key={p.src} className="w-[70vw] md:w-[36vw]">
              <MaskReveal
                className="aspect-[3/4]"
                base={<img src={p.src} alt={p.alt} />}
                reveal={<img src={p.src} alt="" />}
              />
            </CarouselSlide>
          ))}
        </Carousel>
      </section>

      <section className="gutter py-32">
        <p className="meta text-muted">ParticleText</p>
        <ParticleText text="DEVSOC" className="display mt-8 h-[26vw] w-full" />
      </section>
    </main>
  );
}
