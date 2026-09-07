import { Dusk } from "@/components/chapters/Dusk";
import { Society } from "@/components/chapters/Society";
import { Rooms } from "@/components/chapters/Rooms";
import { Log } from "@/components/chapters/Log";
import { DevFest } from "@/components/chapters/DevFest";
import { Crew } from "@/components/chapters/Crew";
import { Dawn } from "@/components/chapters/Dawn";
import { Colophon } from "@/components/chapters/Colophon";
import { Rail } from "@/components/shell/Rail";

export default function Home() {
  return (
    <>
      <Rail />
      <main className="relative">
        <Dusk />
        <Society />
        <Rooms />
        <Log />
        <DevFest />
        <Crew />
        <Dawn />
      </main>
      <Colophon />
    </>
  );
}
