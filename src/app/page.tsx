import { Hero } from "@/components/chapters/Hero";
import { Manifesto } from "@/components/chapters/Manifesto";
import { Rooms } from "@/components/chapters/Rooms";
import { Work } from "@/components/chapters/Work";
import { DevFest } from "@/components/chapters/DevFest";
import { Credits } from "@/components/chapters/Credits";
import { Archive } from "@/components/chapters/Archive";
import { Join } from "@/components/chapters/Join";
import { Colophon } from "@/components/chapters/Colophon";
import { Faq } from "@/components/ui/Faq";
import { Rail } from "@/components/shell/Rail";

export default function Home() {
  return (
    <>
      <Rail />
      <main>
        <Hero />
        <Manifesto />
        <Rooms />
        <Work />
        <DevFest />
        <Credits />
        <Archive />
        <Join />
        <Faq />
      </main>
      <Colophon />
    </>
  );
}
