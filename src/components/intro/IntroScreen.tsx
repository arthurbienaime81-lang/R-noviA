"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { spaceGrotesk } from "@/lib/fonts";
import { playBonjour, playChime } from "@/lib/introAudio";

const DUREE_TEXTE_MS = 3000;
const DUREE_ALLUMAGE_MS = 700;
const DUREE_REVELATION_MS = 650;

type Phase = "texte" | "allumage" | "revelation";

type Props = {
  /** Clé sessionStorage utilisée pour n'afficher l'intro qu'une fois par session. */
  storageKey: string;
  /**
   * "auto" : s'affiche par défaut au montage, sauf si déjà vue cette session
   * (cas de la page d'accueil).
   * "flag" : ne s'affiche que si `storageKey` vaut "1" dans sessionStorage —
   * posé explicitement par l'action qui précède (ex. clic sur "Se connecter").
   */
  trigger: "auto" | "flag";
};

export function IntroScreen({ storageKey, trigger }: Props) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("texte");

  useEffect(() => {
    const shouldShow =
      trigger === "auto"
        ? !sessionStorage.getItem(storageKey)
        : sessionStorage.getItem(storageKey) === "1";
    if (!shouldShow) return;

    setVisible(true);
    playBonjour();

    const versAllumage = setTimeout(() => {
      setPhase("allumage");
      playChime();
    }, DUREE_TEXTE_MS);
    const versRevelation = setTimeout(
      () => setPhase("revelation"),
      DUREE_TEXTE_MS + DUREE_ALLUMAGE_MS,
    );
    const versFin = setTimeout(() => {
      setVisible(false);
      // Marquage différé à la toute fin de la séquence (pas au démarrage) :
      // en dev, React StrictMode monte cet effet deux fois de suite
      // (monte → nettoie → remonte). Si la clé était écrite/retirée
      // immédiatement, le second montage verrait un état déjà modifié par
      // le premier montage et n'ancrerait jamais ses propres minuteurs.
      if (trigger === "auto") {
        sessionStorage.setItem(storageKey, "1");
      } else {
        sessionStorage.removeItem(storageKey);
      }
    }, DUREE_TEXTE_MS + DUREE_ALLUMAGE_MS + DUREE_REVELATION_MS);

    return () => {
      clearTimeout(versAllumage);
      clearTimeout(versRevelation);
      clearTimeout(versFin);
    };
  }, [storageKey, trigger]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`${spaceGrotesk.variable} fixed inset-0 z-[999] flex items-center justify-center bg-black`}
          animate={{ opacity: phase === "revelation" ? 0 : 1 }}
          transition={{ duration: DUREE_REVELATION_MS / 1000, ease: "easeInOut" }}
        >
          <AnimatePresence>
            {phase === "texte" && (
              <motion.div
                key="texte"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-3"
              >
                <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  RenovIA
                </p>
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 11.5L12 4l9 7.5" />
                  <path d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9" />
                  <path d="M9.5 20v-6h5v6" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {(phase === "allumage" || phase === "revelation") && (
            // Le centrage (-50%) est confié à Framer Motion via x/y plutôt
            // qu'aux classes de translation Tailwind : Framer Motion pilote
            // "transform" directement en JS, ce qui écraserait silencieusement
            // toute translation posée par ailleurs via des classes CSS.
            //
            // La croissance anime width/height plutôt qu'un scale() : agrandir
            // un élément avec box-shadow via transform:scale() démultiplie le
            // flou dans les mêmes proportions et produit un artefact en
            // grille à fort facteur d'échelle. En animant la taille réelle,
            // le flou (fixé en px) reste net et constant.
            <motion.div
              initial={{ x: "-50%", y: "-50%", width: 12, height: 12, opacity: 0.6 }}
              animate={{
                x: "-50%",
                y: "-50%",
                width: "220vmax",
                height: "220vmax",
                opacity: 1,
              }}
              transition={{
                duration: DUREE_ALLUMAGE_MS / 1000,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="absolute left-1/2 top-1/2 rounded-full bg-[#ffe9a8]"
              style={{ boxShadow: "0 0 60px 30px rgba(255,233,168,0.9)" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
