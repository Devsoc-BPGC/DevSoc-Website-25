import { SplitLines } from "@/components/motion/SplitLines";
import { Magnetic } from "@/components/motion/Magnetic";
import { site } from "@/content/site";

// Temporary specimen page to verify tokens, fonts and the motion baseline.
// Replaced by the chapters in the next task.
export default function Home() {
  return (
    <main className="gutter min-h-[100dvh] py-24">
      <p className="mono text-ash">Specimen</p>
      <h1 className="display mt-6 text-[clamp(4rem,22vw,20rem)] text-bone">Devsoc</h1>
      <SplitLines as="p" className="voice mt-10 max-w-3xl text-[clamp(1.75rem,3.5vw,3.25rem)] text-bone">
        {site.line}
      </SplitLines>
      <p className="body-copy mt-8">{site.description}</p>
      <p className="mono mt-10 text-ash">
        01 {site.campus} <span className="text-verdigris">verdigris</span>{" "}
        <span className="text-brass">brass</span> <span className="text-ember">ember</span>
      </p>
      <p className="hud mt-4 text-verdigris">00:00:00</p>
      <div className="mt-12 flex gap-10">
        <Magnetic>
          <a href={`mailto:${site.email}`} className="text-link mono text-bone" data-cursor="Write">
            Write to us
          </a>
        </Magnetic>
        <div className="flex gap-3">
          <div className="h-10 w-10 border border-soot bg-obsidian" title="obsidian" />
          <div className="h-10 w-10 bg-soot" title="soot" />
          <div className="h-10 w-10 bg-bone" title="bone" />
          <div className="h-10 w-10 bg-ash" title="ash" />
          <div className="h-10 w-10 bg-verdigris" title="verdigris" />
          <div className="h-10 w-10 bg-verdigris-deep" title="verdigris-deep" />
          <div className="h-10 w-10 bg-ember" title="ember" />
          <div className="h-10 w-10 bg-brass" title="brass" />
        </div>
      </div>
      <div className="mt-[60vh] duotone aspect-video max-w-xl">
        <img src="/images/gallery/g11.jpg" alt="Members on campus" />
      </div>
    </main>
  );
}
