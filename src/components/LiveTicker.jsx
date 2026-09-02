import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, X } from "lucide-react";

const messages = [
  "Inductees list is live",
  "Results are out",
  "Find your name",
  "Welcome to DevSoc",
];

const LiveTicker = ({ onDismiss }) => {
  // The strip is duplicated so the track can loop seamlessly at -50%.
  const strip = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {messages.map((message, index) => (
        <span key={index} className="flex items-center">
          <span className="flex items-center gap-2 px-6 text-[0.7rem] sm:text-xs font-semibold uppercase tracking-[0.2em] whitespace-nowrap">
            <Sparkles className="w-3 h-3 shrink-0" />
            {message}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/50" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-9 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 text-white shadow-sm">
      <Link
        to="/inductees"
        className="marquee group relative flex items-center h-full overflow-hidden pr-10"
        aria-label="Inductees list is live. View the selected inductees."
      >
        <div className="marquee-track flex items-center">
          {strip}
          {strip}
        </div>

        <span className="absolute right-10 top-0 bottom-0 flex items-center gap-1.5 pl-8 pr-3 text-[0.7rem] font-semibold uppercase tracking-[0.15em] bg-gradient-to-r from-transparent via-cyan-500 to-cyan-500">
          <span className="hidden sm:inline">View</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>

      <button
        onClick={onDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors duration-200"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default LiveTicker;
