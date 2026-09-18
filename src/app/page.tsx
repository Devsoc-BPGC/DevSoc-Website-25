import { Dusk } from "@/components/scenes/Dusk";
import { Society } from "@/components/scenes/Society";
import { Rooms } from "@/components/scenes/Rooms";
import { Pending } from "@/components/scenes/Pending";

/**
 * One night, eleven chapters, one continuous camera. Each scene hands a
 * physical object to the next; see DESIGN.md for the route the light takes.
 */
export default function Home() {
  return (
    <main className="relative">
      <Dusk />
      <Society />
      <Rooms />
      <Pending id="nightshift" name="The Night Shift" />
      <Pending id="log" name="The log" />
      <Pending id="first-month" name="Your first month" />
      <Pending id="roll" name="186" />
      <Pending id="devfest" name="DevFest" />
      <Pending id="crew" name="The crew" />
      <Pending id="dawn" name="Dawn" />
      <Pending id="colophon" name="Colophon" />
    </main>
  );
}
