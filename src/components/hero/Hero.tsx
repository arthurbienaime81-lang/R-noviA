import Link from "next/link";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { Porthole } from "./Porthole";
import styles from "./Hero.module.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-ibm-plex-mono",
});

export function Hero() {
  return (
    <div
      className={`${styles.hero} ${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          Réno<span className={styles.logoAccent}>via</span>
        </Link>
        <div className={styles.navlinks}>
          <a href="#">Fonctionnalités</a>
          <a href="#">Sécurité</a>
          <a href="#">Tarifs</a>
        </div>
        <div className={styles.navcontact}>contact@renovia.fr</div>
      </nav>

      <div className={styles.stage}>
        <div className={styles.headlineBlock}>
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
            <button type="button" className={styles.ctaSecondary}>
              Voir une démo
            </button>
          </div>
        </div>

        <Porthole />

        <div className={styles.headlineRight}>
          <h1 className={styles.heading}>
            On livre
            <br />
            la <span className={styles.accent}>confiance.</span>
          </h1>
        </div>

        <div className={styles.scrollCue}>
          <span>▾ DÉFILER</span>
          <span className={styles.scrollLine} />
          <span>POUR VOIR COMMENT</span>
        </div>
      </div>
    </div>
  );
}
