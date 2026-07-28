"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { slideUp } from "./variants";
import styles from "./Hero.module.css";

/**
 * Parallaxe légère des éléments internes du porthole (briques, échafaudage,
 * ampoule) au mouvement de la souris et au scroll. Le cercle lui-même et le
 * reste de la page restent parfaitement immobiles : seules les couches
 * internes se déplacent, via des variables CSS (--px/--py) composées avec
 * leurs transforms de centrage existants plutôt que de les remplacer.
 */
export function Porthole() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scrollY = useMotionValue(0);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    }
    function handleScroll() {
      scrollY.set(window.scrollY);
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mouseX, mouseY, scrollY]);

  // Ressort doux : le mouvement suit la souris/le scroll avec un léger
  // retard fluide plutôt que de coller instantanément (effet "flottant").
  const springConfig = { stiffness: 55, damping: 16, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const smoothScroll = useSpring(scrollY, springConfig);

  // Trois profondeurs : le mur (loin) bouge peu, l'échafaudage (milieu) un
  // peu plus, l'ampoule suspendue (proche) le plus — effet de profondeur.
  const back = useLayerOffset(smoothX, smoothY, smoothScroll, 7, 0.015);
  const mid = useLayerOffset(smoothX, smoothY, smoothScroll, 13, 0.03);
  const front = useLayerOffset(smoothX, smoothY, smoothScroll, 20, 0.045);

  return (
    <motion.div className={styles.portholeWrap} variants={slideUp}>
      {/* Définition de la découpe organique du hublot en coordonnées
          normalisées (clipPathUnits="objectBoundingBox") : contrairement à
          un clip-path CSS "path()" — dont les coordonnées sont des pixels
          absolus qui ne s'adaptent jamais à la taille réelle de l'élément —
          cette version reste toujours proportionnelle à la boîte, même
          quand le hublot est bien plus petit que le gabarit d'origine
          (560×640). Sans ça, la bordure métallique n'était complète que sur
          un hublot d'exactement cette taille en pixels, et se retrouvait
          tronquée sur tout écran plus modeste. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <clipPath id="portholeClip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5 0.009375 C 0.75 0.009375 0.928571 0.140625 0.967857 0.34375 C 1 0.515625 0.964286 0.71875 0.821429 0.875 C 0.678571 1.015625 0.321429 1.015625 0.178571 0.875 C 0.035714 0.71875 0 0.5 0.035714 0.328125 C 0.075 0.140625 0.25 0.009375 0.5 0.009375 Z" />
          </clipPath>
        </defs>
      </svg>
      <div className={styles.porthole}>
        <div className={styles.plasterEdge} />
        <div className={styles.portholeInner}>
          <motion.div className={styles.siteLight} style={back} />
          <motion.div className={styles.brickWall} style={back} />
          <motion.div className={styles.scaffold} style={mid} />
          <motion.div className={styles.scaffold2} style={mid} />
          <motion.div className={styles.bulbCord} style={front} />
          <motion.div className={styles.bulbGlow} style={front} />
          <motion.div className={styles.bulb} style={front} />
          <div className={styles.wordmark}>Rénovia</div>
        </div>
      </div>
    </motion.div>
  );
}

function useLayerOffset(
  smoothX: ReturnType<typeof useMotionValue<number>>,
  smoothY: ReturnType<typeof useMotionValue<number>>,
  smoothScroll: ReturnType<typeof useMotionValue<number>>,
  mouseIntensity: number,
  scrollIntensity: number,
) {
  const px = useTransform(smoothX, (v) => `${v * mouseIntensity}px`);
  const py = useTransform(
    [smoothY, smoothScroll],
    ([y, s]: number[]) => `${y * mouseIntensity + s * scrollIntensity}px`,
  );
  return { "--px": px, "--py": py } as React.CSSProperties;
}
