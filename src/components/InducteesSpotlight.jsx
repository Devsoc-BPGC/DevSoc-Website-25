import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

const WORD = "INDUCTEES";

const InducteesSpotlight = () => {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const wordRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        toggleActions: "play none none reverse",
      },
    });

    timeline
      .fromTo(".spotlight-reveal", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 })
      .fromTo(
        ".spotlight-letter",
        { y: 46, opacity: 0, rotateX: -60 },
        { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.045, ease: "back.out(1.6)" },
        "-=0.35"
      );

    const nudge = gsap.to(".spotlight-arrow", {
      x: 6,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      nudge.kill();
      ScrollTrigger.refresh();
    };
  }, []);

  // The ambient glow is positioned against the whole panel, but the word's
  // reveal mask needs coordinates relative to the word itself.
  const trackPointer = (event) => {
    const stage = stageRef.current;
    const word = wordRef.current;
    if (!stage) return;

    const stageBounds = stage.getBoundingClientRect();
    stage.style.setProperty("--mx", `${event.clientX - stageBounds.left}px`);
    stage.style.setProperty("--my", `${event.clientY - stageBounds.top}px`);

    if (!word) return;
    const wordBounds = word.getBoundingClientRect();
    word.style.setProperty("--mx", `${event.clientX - wordBounds.left}px`);
    word.style.setProperty("--my", `${event.clientY - wordBounds.top}px`);
  };

  return (
    <section ref={sectionRef} className="px-6 py-16">
      <div className="container mx-auto max-w-5xl">
        <Link
          to="/inductees"
          onMouseMove={trackPointer}
          ref={stageRef}
          className="spotlight-stage group relative block overflow-hidden rounded-[2rem] bg-gray-950 px-6 py-16 sm:py-20 text-center"
        >
          <span className="spotlight-beam" aria-hidden="true" />
          <span className="spotlight-pool" aria-hidden="true" />
          <span className="spotlight-cursor" aria-hidden="true" />

          <div className="relative">
            <span className="spotlight-reveal inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[0.65rem] font-medium uppercase tracking-[0.24em] text-teal-300 border border-teal-400/25 bg-teal-400/5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-teal-400 animate-ping" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-teal-400" />
              </span>
              Results are out
            </span>

            <h2
              ref={wordRef}
              className="spotlight-word font-display font-extrabold tracking-tight mt-8 mb-6 text-[15vw] sm:text-[9rem] leading-[0.9]"
            >
              <span className="sr-only">{WORD}</span>
              <span className="spotlight-word__layer spotlight-word__base" aria-hidden="true">
                {WORD.split("").map((letter, index) => (
                  <span key={index} className="spotlight-letter inline-block">
                    {letter}
                  </span>
                ))}
              </span>
              <span className="spotlight-word__layer spotlight-word__lit" aria-hidden="true">
                {WORD}
              </span>
            </h2>

            <p className="spotlight-reveal text-slate-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              The selected list is live. Step into the light and find your name.
            </p>

            <span className="spotlight-reveal mt-9 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-semibold text-gray-950 bg-white transition-all duration-300 group-hover:bg-teal-400 group-hover:shadow-[0_0_36px_-4px_rgba(45,212,191,0.7)]">
              See the selected list
              <ArrowRight className="spotlight-arrow w-4 h-4" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default InducteesSpotlight;
