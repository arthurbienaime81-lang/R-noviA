import goldBg from "@/styles/goldBackground.module.css";
import styles from "./dashboard.module.css";

/**
 * Fond animé du dashboard : même dégradé or animé que /login et /register
 * (goldBackgroundAnimated, source commune dans goldBackground.module.css),
 * pour une identité visuelle cohérente sur toute l'app.
 */
export function DashboardBackground() {
  return (
    <div
      className={`${styles.bgLayer} ${goldBg.goldBackgroundAnimated}`}
      aria-hidden="true"
    />
  );
}
