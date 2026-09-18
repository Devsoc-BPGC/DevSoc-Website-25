import { Dusk } from "@/components/scenes/Dusk";
import { Society } from "@/components/scenes/Society";
import { Rooms } from "@/components/scenes/Rooms";
import { NightShift } from "@/components/scenes/NightShift";
import { Log } from "@/components/scenes/Log";
import { FirstMonth } from "@/components/scenes/FirstMonth";
import { Roll } from "@/components/scenes/Roll";
import { DevFest } from "@/components/scenes/DevFest";
import { Coordinators } from "@/components/scenes/Coordinators";
import { Dawn } from "@/components/scenes/Dawn";
import { Colophon } from "@/components/scenes/Colophon";
import { Overture } from "@/components/scenes/Overture";

/**
 * One night, eleven chapters, one continuous camera. Each scene hands a
 * physical object to the next; see DESIGN.md for the route the light takes.
 */
export default function Home() {
  return (
    <main className="relative">
      <Overture />
      <Dusk />
      <Society />
      <Rooms />
      <NightShift />
      <Log />
      <FirstMonth />
      <Roll />
      <DevFest />
      <Coordinators />
      <Dawn />
      <Colophon />
    </main>
  );
}
