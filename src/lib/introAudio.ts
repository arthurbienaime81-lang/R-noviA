"use client";

let bonjourEl: HTMLAudioElement | null = null;
let chimeEl: HTMLAudioElement | null = null;
let primed = false;

function getElements() {
  if (typeof window === "undefined") {
    throw new Error("introAudio ne peut être utilisé que côté client.");
  }
  if (!bonjourEl) {
    bonjourEl = new Audio("/audio/bonjour.m4a");
    bonjourEl.preload = "auto";
  }
  if (!chimeEl) {
    chimeEl = new Audio("/audio/chime.m4a");
    chimeEl.preload = "auto";
  }
  return { bonjourEl, chimeEl };
}

/**
 * À appeler de façon synchrone dans un gestionnaire d'évènement utilisateur
 * (clic, submit) — avant toute navigation ou attente asynchrone. Safari/
 * WebKit exige que le déblocage de la lecture audio ait lieu dans la
 * continuité synchrone d'un geste utilisateur ; jouer puis mettre aussitôt
 * en pause chaque piste "débloque" ces mêmes éléments <audio> pour des
 * appels ultérieurs à .play(), même après une navigation côté client
 * (même document, donc l'autorisation reste acquise).
 */
export function primeIntroAudio() {
  if (primed || typeof window === "undefined") return;
  primed = true;
  const { bonjourEl, chimeEl } = getElements();
  for (const el of [bonjourEl, chimeEl]) {
    el.play()
      .then(() => {
        el.pause();
        el.currentTime = 0;
      })
      .catch(() => {
        // Lecture bloquée par le navigateur : l'écran d'intro s'affichera
        // simplement sans son.
      });
  }
}

export function playBonjour() {
  const { bonjourEl } = getElements();
  bonjourEl.currentTime = 0;
  return bonjourEl.play().catch(() => {});
}

export function playChime() {
  const { chimeEl } = getElements();
  chimeEl.currentTime = 0;
  return chimeEl.play().catch(() => {});
}
