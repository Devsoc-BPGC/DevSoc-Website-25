import type { Metadata } from "next";
import { Archive } from "@/components/chapters/Archive";
import { gallery } from "@/content/gallery";

export const metadata: Metadata = {
  title: "The archive",
  description: "Photographs from the DevSoc archive: beach days, DevFest nights, the room after a ship.",
};

export default function GalleryPage() {
  return (
    <main className="pt-[var(--nav-h)]">
      <Archive photos={gallery} all />
    </main>
  );
}
