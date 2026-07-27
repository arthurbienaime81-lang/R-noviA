import { Hero } from "@/components/hero/Hero";
import { IntroScreen } from "@/components/intro/IntroScreen";

export default function Home() {
  return (
    <>
      <IntroScreen storageKey="renovia-intro-vue" trigger="auto" />
      <Hero />
    </>
  );
}
