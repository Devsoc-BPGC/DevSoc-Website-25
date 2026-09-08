import type { Metadata } from "next";
import { ProjectsGrid } from "./ProjectsGrid";
import { ScrubFilm } from "./ScrubFilm";

export const metadata: Metadata = {
  title: "The log",
  description: "Everything DevSoc has shipped: fest websites, fest apps, tools and client work.",
};

export default function ProjectsPage() {
  return (
    <main className="pb-[16vh] pt-[calc(var(--nav-h)+8vh)]">
      <div className="gutter">
        <h1 className="display text-[clamp(2.6rem,7vw,7rem)] text-primary">The log</h1>
        <p className="body-copy mt-6">
          Every build with a name. Fest websites, fest apps, tools that fix a Tuesday, and work for clients off campus.
        </p>
        <p className="meta mt-6 text-muted">
          No live links here. These are screenshots of things that shipped, not a portfolio. Ask a room head for a demo.
        </p>
      </div>
      <ScrubFilm />
      <ProjectsGrid />
    </main>
  );
}
