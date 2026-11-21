import { Loader } from "@/components/Loader";
import { Navbar } from "@/components/Navbar";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { BrandIntro } from "@/components/sections/BrandIntro";
import { Founder } from "@/components/sections/Founder";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Loader />
      <Navbar />
      <main>
        <Hero />
        <BrandIntro />
        <Services />
        <Projects />
        <About />
        <Founder />
        <Process />
        <Pricing />
        {/* Section 09 (FAQ) is built in the next step */}
        <section className="relative z-[75] grid min-h-[60vh] place-items-center rounded-t-[32px] border-t border-white/[0.08] bg-obsidian px-5 md:rounded-t-[56px]">
          <p className="font-display text-sm tracking-[0.3em] text-lavender/60">SECTION 09: COMING NEXT</p>
        </section>
      </main>
    </>
  );
}
