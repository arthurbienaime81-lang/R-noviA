"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { spaceGrotesk } from "@/lib/fonts";

const SESSION_KEY = "renovia-intro-vue";
const DUREE_TEXTE_MS = 5000;
const DUREE_ALLUMAGE_MS = 700;
const DUREE_REVELATION_MS = 650;

type Phase = "texte" | "allumage" | "revelation";

export function IntroScreen() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("texte");

  useEffect(() => {
    // Une seule fois par session : ne rejoue pas si le visiteur revient sur
    // la page d'accueil plus tard dans le même onglet.
    //
    // Le marquage sessionStorage n'a lieu qu'à la fin de la séquence, pas
    // au démarrage : en développement, React StrictMode monte cet effet
    // deux fois de suite (monte → nettoie → remonte). Si la clé était
    // écrite immédiatement, le second montage la trouverait déjà posée et
    // n'ancrerait jamais ses propres minuteurs, laissant l'écran bloqué
    // sur la phase texte indéfiniment.
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);

    const versAllumage = setTimeout(() => setPhase("allumage"), DUREE_TEXTE_MS);
    const versRevelation = setTimeout(
      () => setPhase("revelation"),
      DUREE_TEXTE_MS + DUREE_ALLUMAGE_MS,
    );
    const versFin = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, DUREE_TEXTE_MS + DUREE_ALLUMAGE_MS + DUREE_REVELATION_MS);

    return () => {
      clearTimeout(versAllumage);
      clearTimeout(versRevelation);
      clearTimeout(versFin);
    };
  }, []);

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
              <motion.p
                key="texte"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                RenovIA
              </motion.p>
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
