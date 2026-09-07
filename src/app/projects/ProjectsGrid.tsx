"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { Reveal } from "@/components/motion/Reveal";
import { projects } from "@/content/projects";

export function ProjectsGrid() {
  const rooms = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.vertical)))], []);
  const [room, setRoom] = useState("All");
  const shown = room === "All" ? projects : projects.filter((p) => p.vertical === room);

  return (
    <>
      <ul className="meta gutter mt-12 flex flex-wrap gap-x-8 gap-y-3 text-muted" aria-label="Filter by room">
        {rooms.map((r) => (
          <li key={r}>
            <button
              type="button"
              onClick={() => setRoom(r)}
              aria-pressed={room === r}
              className={`text-link ${room === r ? "text-primary" : "hover:text-primary"}`}
            >
              {r}
            </button>
          </li>
        ))}
      </ul>

      <Reveal as="ol" stagger={0.08} className="gutter mt-12 grid grid-cols-1 gap-x-[3vw] gap-y-16 md:grid-cols-2">
        {shown.map((p, i) => (
          <li key={p.id} className={i % 2 === 1 ? "md:mt-[14vh]" : ""}>
            <MaskReveal
              className="aspect-[16/10]"
              radius={200}
              cursorLabel="Look"
              base={<Image src={p.image} alt={p.title} width={p.width} height={p.height} sizes="(min-width: 768px) 46vw, 90vw" />}
              reveal={<Image src={p.image} alt="" width={p.width} height={p.height} sizes="(min-width: 768px) 46vw, 90vw" />}
            />
            <div className="mt-5 flex items-baseline justify-between gap-6">
              <h2 className="display text-[clamp(1.4rem,2.2vw,2.2rem)] text-primary [font-variation-settings:'wdth'_110]">{p.title}</h2>
              <p className="meta shrink-0 text-muted">
                {p.year}. {p.vertical}
              </p>
            </div>
            <p className="body-copy mt-2 text-[0.95rem]">{p.blurb}</p>
          </li>
        ))}
      </Reveal>
    </>
  );
}
