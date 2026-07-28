import Image from "next/image";
import styles from "./dashboard.module.css";

/**
 * Fond animé du dashboard : photo de chantier (échafaudage métallique,
 * lumière dorée — cohérent avec l'identité or/brique) en lent va-et-vient
 * façon dérive de nuages, sous un voile aux couleurs de la marque. Photo
 * "Black scaffolding golden hour" par Xiong Yan, Unsplash License (usage
 * commercial libre, sans attribution requise) — unsplash.com/photos/l7HysfP9BPU.
 */
export function DashboardBackground() {
  return (
    <div className={styles.bgLayer} aria-hidden="true">
      <Image
        src="/images/dashboard-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.bgImage}
      />
      <div className={styles.bgOverlay} />
    </div>
  );
}
