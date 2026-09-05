import type { Metadata } from "next";
import { Credits } from "@/components/chapters/Credits";

export const metadata: Metadata = {
  title: "The makers",
  description: "The coordinators of DevSoc, BITS Pilani Goa, and the heads of its six rooms.",
};

export default function TeamPage() {
  return (
    <main className="pt-[var(--nav-h)]">
      <Credits all />
    </main>
  );
}
