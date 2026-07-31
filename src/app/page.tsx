import type { Viewport } from "next";
import { Hero } from "@/components/hero/Hero";
import { IntroScreen } from "@/components/intro/IntroScreen";

// Couleur de barre d'adresse/outils sur Safari iOS (voir le composant
// Hero.tsx qui porte data-gold-bg) — #d4a94a est la couleur de base var(--bg)
// du dégradé (goldBackground.module.css), les bandes diagonales ne sont que
// des surcouches translucides autour de cette teinte, donc représentative
// de l'ensemble du fond.
export const viewport: Viewport = {
  themeColor: "#d4a94a",
};

export default function Home() {
  return (
    <>
      <IntroScreen storageKey="renovia-intro-vue" trigger="auto" />
      <Hero />
    </>
  );
}
