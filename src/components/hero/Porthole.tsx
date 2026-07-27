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
