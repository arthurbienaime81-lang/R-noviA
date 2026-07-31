"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { spaceGrotesk, inter, ibmPlexMono } from "@/lib/fonts";
import { Porthole } from "./Porthole";
import { container, slideUp } from "./variants";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <motion.div
      data-gold-bg
      className={`${styles.hero} ${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <nav className={styles.nav}>
        <motion.div variants={slideUp}>
          <Link href="/" className={`${styles.logo} ${styles.pill}`}>
            Réno<span className={styles.logoAccent}>via</span>
          </Link>
        </motion.div>
        <div className={styles.navRight}>
          <motion.div variants={slideUp}>
            <Link
              href="/fonctionnalites#comment-ca-marche"
              className={`${styles.navLogin} ${styles.pill}`}
            >
              Fonctionnement
            </Link>
          </motion.div>
          <motion.div variants={slideUp}>
            <Link href="/login" className={`${styles.navLogin} ${styles.pill}`}>
              Se connecter
            </Link>
          </motion.div>
          <motion.div
            className={`${styles.navcontact} ${styles.pill}`}
            variants={slideUp}
          >
            contact@renovia.fr
          </motion.div>
        </div>
      </nav>

      <div className={styles.stage}>
        <motion.div className={styles.headlineBlock} variants={slideUp}>
          <h1 className={styles.heading}>
            On maîtrise
            <br />
            le <span className={styles.accent}>chantier.</span>
          </h1>
          <p className={styles.sub}>
            Suivi d&apos;avancement, réclamations et avis clients — tout au
            même endroit, pensé pour les entreprises TCE.
          </p>
          <div className={styles.divider} />
          <div className={styles.ctaRow}>
            <Link href="/register" className={styles.cta}>
              Essayer RenovIA
              <span className={styles.ctaIcon}>→</span>
            </Link>
          </div>
        </motion.div>

        <Porthole />

        <motion.div className={styles.headlineRight} variants={slideUp}>
          <h1 className={styles.heading}>
            On livre
            <br />
            la <span className={styles.accent}>confiance.</span>
          </h1>
        </motion.div>
      </div>
    </motion.div>
  );
}
