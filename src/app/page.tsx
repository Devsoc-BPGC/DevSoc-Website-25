import { Dusk } from "@/components/scenes/Dusk";
import { Society } from "@/components/scenes/Society";
import { Rooms } from "@/components/scenes/Rooms";
import { NightShift } from "@/components/scenes/NightShift";
import { Log } from "@/components/scenes/Log";
import { FirstMonth } from "@/components/scenes/FirstMonth";
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
      <NightShift />
      <Log />
      <FirstMonth />
      <Pending id="roll" name="186" />
      <Pending id="devfest" name="DevFest" />
      <Pending id="crew" name="The crew" />
      <Pending id="dawn" name="Dawn" />
      <Pending id="colophon" name="Colophon" />
    </main>
  );
}
