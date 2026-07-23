// Fuseau fixé explicitement : sans cela, le formatage dépend du fuseau de la
// machine qui exécute le code, qui diffère entre le serveur (Vercel, US) et
// le navigateur du client (France) — ce qui produit un texte différent au
// rendu serveur et à l'hydratation côté client, et donc une erreur React
// d'hydratation ("Text content does not match server-rendered HTML").
const FUSEAU = "Europe/Paris";

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: FUSEAU,
  });
}

export function formatDateHeure(value: string) {
  return new Date(value).toLocaleString("fr-FR", { timeZone: FUSEAU });
}
