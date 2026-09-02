import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Copy, Search, Sparkles, X } from "lucide-react";
import rawInductees from "../selected_inductees.json";

const titleCase = (value) =>
  value
    .split(" ")
    .map((word) =>
      word === word.toLowerCase() ? word.charAt(0).toUpperCase() + word.slice(1) : word
    )
    .join(" ");

const cleanName = (value) => titleCase(value.replace(/\s*\([^)]*\)\s*/g, " ").trim());

// Entries were collected from a form, so IDs arrive with stray casing, an "f"
// prefix, or the applicant's name typed into the wrong field.
const cleanId = (value, name) => {
  const id = value.trim().replace(/^f/i, "").toUpperCase();
  if (!id || id.toUpperCase() === name.toUpperCase()) return null;
  return id;
};

const inductees = rawInductees
  .map((entry) => {
    const name = cleanName(entry.name);
    return { name, bitsId: cleanId(entry.bits_id, name) };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

const InducteeCard = ({ name, bitsId }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = () => {
    if (!bitsId) return;
    navigator.clipboard?.writeText(bitsId).then(() => setCopied(true));
  };

  const trackPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - bounds.top}px`);
  };

  return (
    <div
      onMouseMove={trackPointer}
      className="inductee-card spotlight-card group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-500 hover:-translate-y-1 hover:border-teal-400/70 hover:shadow-[0_16px_40px_-16px_rgba(13,148,136,0.45)]"
    >
      <div className="shine-sweep" aria-hidden="true" />

      <div className="relative flex items-center gap-4">
        <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl font-display text-sm font-bold text-white bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[0.98rem] font-semibold tracking-tight text-slate-900 dark:text-white truncate">
            {name}
          </h3>
          <p className="font-mono text-[0.7rem] tracking-[0.12em] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {bitsId ?? "ID not provided"}
          </p>
        </div>

        {bitsId && (
          <button
            onClick={handleCopy}
            aria-label={`Copy BITS ID of ${name}`}
            className="shrink-0 grid place-items-center w-8 h-8 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 focus:opacity-100 transition-all duration-300"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-teal-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const Inductees = () => {
  const [query, setQuery] = useState("");
  const heroRef = useRef(null);
  const gridRef = useRef(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return inductees;
    return inductees.filter(
      ({ name, bitsId }) =>
        name.toLowerCase().includes(term) ||
        (bitsId && bitsId.toLowerCase().includes(term))
    );
  }, [query]);

  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .fromTo(".hero-rise", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 })
      .fromTo(".hero-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, "-=0.4");

    return () => timeline.kill();
  }, []);

  // Cards fade in as they scroll into view; re-run whenever the filter changes
  // so freshly rendered cards get their own reveal.
  useEffect(() => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll(".inductee-card");
    const triggers = ScrollTrigger.batch(cards, {
      start: "top 96%",
      batchMax: 12,
      onEnter: (batch) =>
        gsap.fromTo(
          batch,
          { y: 24, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.05, ease: "power2.out", overwrite: true }
        ),
    });

    return () => triggers.forEach((trigger) => trigger.kill());
  }, [filtered]);

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-gray-950">
      <div className="aurora" aria-hidden="true">
        <span className="aurora-blob aurora-blob--teal" />
        <span className="aurora-blob aurora-blob--cyan" />
      </div>
      <div className="dot-grid" aria-hidden="true" />

      <div className="relative container mx-auto max-w-6xl px-6 pt-32 pb-28">
        <header className="text-center mb-16">
          <span className="hero-rise inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[0.68rem] font-medium tracking-[0.22em] uppercase text-teal-700 dark:text-teal-300 bg-white/70 dark:bg-white/5 border border-teal-200/70 dark:border-teal-400/20 backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            Inductions 2026
          </span>

          <h1 className="hero-rise font-display text-[2.6rem] leading-[1.05] md:text-7xl font-extralight tracking-tight mt-7 text-slate-900 dark:text-white">
            Selected
            <br className="sm:hidden" />{" "}
            <span className="font-bold bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
              Inductees
            </span>
          </h1>

          <div className="hero-rule w-24 h-px mx-auto my-8 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />

          <p className="hero-rise text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Welcome to DevSoc. Find your name below &mdash; we cannot wait to build
            alongside you.
          </p>
        </header>

        <div className="hero-rise relative max-w-md mx-auto mb-14 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-300" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your name or BITS ID"
            aria-label="Search inductees"
            className="w-full pl-11 pr-11 py-3.5 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-teal-400 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.12)] transition-all duration-300"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-16">
            Nothing matches &ldquo;{query}&rdquo;. Try a different spelling.
          </p>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map(({ name, bitsId }, index) => (
              <InducteeCard key={`${name}-${bitsId ?? index}`} name={name} bitsId={bitsId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inductees;
