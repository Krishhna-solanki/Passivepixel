import { Footer } from "@/components/Footer";
import { Loader } from "@/components/Loader";
import { Navbar } from "@/components/Navbar";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { BrandIntro } from "@/components/sections/BrandIntro";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
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
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
