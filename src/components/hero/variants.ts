import type { Variants } from "framer-motion";

/** Orchestre l'entrée en cascade des enfants directs (variants héritées). */
export const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

/** Glissement du bas vers le haut, façon "coulissant", jusqu'à l'arrêt fixe. */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 70 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};
