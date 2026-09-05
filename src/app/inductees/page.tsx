import type { Metadata } from "next";
import { InducteesList } from "./InducteesList";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Inductees ${site.inducteesYear}`,
  description: `The ${site.inducteesYear} DevSoc inductees, BITS Pilani Goa.`,
};

export default function InducteesPage() {
  return (
    <main className="pb-[16vh] pt-[calc(var(--nav-h)+8vh)]">
      <div className="gutter">
        <h1 className="voice text-[clamp(2.2rem,5vw,5rem)] text-bone">The {site.inducteesYear} list.</h1>
        <p className="body-copy mt-6">Welcome to the room. Find your name; the ID copies on click.</p>
      </div>
      <InducteesList />
    </main>
  );
}
