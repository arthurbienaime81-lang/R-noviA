// Classes Tailwind partagées pour les styles réutilisés à plusieurs endroits
// de l'app, afin d'éviter de dupliquer (et risquer de désynchroniser) les
// mêmes couleurs à chaque usage.

/** Bouton sombre/or (#23261c / #d4a94a) — variante des boutons d'action
 * primaires sur fond clair, à la place du bleu par défaut. */
export const DARK_GOLD_BUTTON_CLASSES =
  "!bg-[#23261c] !text-[#d4a94a] hover:!bg-[#3a3d2e]";

/** Texte affiché directement sur le fond or animé (goldBackgroundAnimated),
 * sans carte opaque en dessous (sous-titres de page, états d'erreur) —
 * passe AA (≥4.5:1) à tous les points du dégradé animé, contrairement à
 * text-slate-500 qui y tombe autour de 1.5:1–2.9:1 selon la position. */
export const GOLD_BG_TEXT_CLASS = "text-[#23261c]";
