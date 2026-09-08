import { Dusk } from "@/components/chapters/Dusk";
import { Society } from "@/components/chapters/Society";
import { Rooms } from "@/components/chapters/Rooms";
import { NightShift } from "@/components/chapters/NightShift";
import { Log } from "@/components/chapters/Log";
import { FirstMonth } from "@/components/chapters/FirstMonth";
import { Roll } from "@/components/chapters/Roll";
import { DevFest } from "@/components/chapters/DevFest";
import { Crew } from "@/components/chapters/Crew";
import { Dawn } from "@/components/chapters/Dawn";
import { Colophon } from "@/components/chapters/Colophon";
import { Rail } from "@/components/shell/Rail";
import { Ticker } from "@/components/motion/Ticker";

/**
 * One night, in nine movements.
 *
 * The order is the argument. Dusk states the proposition, the Society says what
 * a society is, the flywheel divides the labour, and then the middle of the
 * page does the real work: how the build actually goes, what it produced, and
 * what your own first month would look like. Proof is deliberately sandwiched
 * between two pieces of process, because five screenshots shown cold read as a
 * thin portfolio, and the same five shown as the outcome of a deadline you just
 * watched read as evidence.
 */
export default function Home() {
  return (
    <>
      <Rail />
      <main className="relative">
        <Dusk />
        <Society />
        <Rooms />
        <Ticker
          items={["Build with intent", "Break, learn, repeat", "Stay dangerously curious", "It starts with what if"]}
        />
        <NightShift />
        <Log />
        <FirstMonth />
        <Ticker items={["Six rooms", "One society", "Every one of them ships", "The lights stay on"]} reverse />
        <Roll />
        <DevFest />
        <Crew />
        <Dawn />
      </main>
      <Colophon />
    </>
  );
}
