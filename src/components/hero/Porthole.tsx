import styles from "./Hero.module.css";

export function Porthole() {
  return (
    <div className={styles.portholeWrap}>
      <div className={styles.porthole}>
        <div className={styles.plasterEdge} />
        <div className={styles.portholeInner}>
          <div className={styles.siteLight} />
          <div className={styles.brickWall} />
          <div className={styles.scaffold} />
          <div className={styles.scaffold2} />
          <div className={styles.bulbCord} />
          <div className={styles.bulbGlow} />
          <div className={styles.bulb} />
          <div className={styles.wordmark}>Rénovia</div>
        </div>
      </div>
    </div>
  );
}
