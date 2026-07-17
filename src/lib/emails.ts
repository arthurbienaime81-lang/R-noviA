import { Resend } from "resend";

const DEFAULT_FROM = process.env.EMAIL_FROM ?? "RenovIA <onboarding@resend.dev>";
const FROM_ADDRESS = DEFAULT_FROM.match(/<(.+)>/)?.[1] ?? DEFAULT_FROM;

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Identité d'expédition utilisée pour tout email vu par le client final : le
 * nom affiché est celui de l'entreprise TCE, jamais « RenovIA ».
 */
function clientFrom(nomEntreprise: string) {
  return `${nomEntreprise} <${FROM_ADDRESS}>`;
}

function sendAuClient(
  nomEntreprise: string,
  opts: { to: string; subject: string; html: string },
) {
  return getResend().emails.send({ from: clientFrom(nomEntreprise), ...opts });
}

function sendEnInterne(opts: { to: string; subject: string; html: string }) {
  return getResend().emails.send({ from: DEFAULT_FROM, ...opts });
}

// ━━━ Étapes de chantier ━━━

export async function sendEtapeUpdate(
  emailClient: string,
  nomEntreprise: string,
  nomChantier: string,
  nomEtape: string,
) {
  return sendAuClient(nomEntreprise, {
    to: emailClient,
    subject: `Avancement du chantier « ${nomChantier} »`,
    html: `
      <p>Bonjour,</p>
      <p>Bonne nouvelle ! L'étape <strong>${nomEtape}</strong> de votre chantier « ${nomChantier} » est terminée.</p>
      <p>${nomEntreprise}</p>
    `,
  });
}

export async function sendRetardAlert(
  emailEntreprise: string,
  nomClient: string,
  dateFinPrevue: string,
) {
  return sendEnInterne({
    to: emailEntreprise,
    subject: `Chantier en retard : ${nomClient}`,
    html: `
      <p>Attention : le chantier de <strong>${nomClient}</strong> est en retard (prévu le ${dateFinPrevue}).</p>
    `,
  });
}

// ━━━ Messagerie ━━━

export async function sendNouveauMessageClient(
  emailClient: string,
  nomEntreprise: string,
) {
  return sendAuClient(nomEntreprise, {
    to: emailClient,
    subject: "Nouveau message concernant votre chantier",
    html: `
      <p>Vous avez un nouveau message de <strong>${nomEntreprise}</strong> concernant votre chantier.</p>
      <p>Connectez-vous à votre page de suivi pour le consulter.</p>
    `,
  });
}

export async function sendNouveauMessageEntreprise(
  emailEntreprise: string,
  nomClient: string,
) {
  return sendEnInterne({
    to: emailEntreprise,
    subject: "Nouveau message concernant un chantier",
    html: `
      <p>Vous avez un nouveau message de <strong>${nomClient}</strong> concernant son chantier.</p>
      <p>Connectez-vous à votre tableau de bord pour le consulter.</p>
    `,
  });
}

// ━━━ Étape 02 — Accusé de réception ━━━

export async function sendReclamationConfirmation(
  emailClient: string,
  nomEntreprise: string,
  numeroTicket: string,
  horsHeuresOuvrees: boolean,
) {
  const delaiHtml = horsHeuresOuvrees
    ? `<p>Votre demande a été reçue en dehors de nos horaires d'ouverture. Nous vous répondons dès 9h le prochain jour ouvré.</p>`
    : `<p>Nous nous engageons à vous répondre sous <strong>2h en heures ouvrées</strong>.</p>`;

  return sendAuClient(nomEntreprise, {
    to: emailClient,
    subject: `Réclamation reçue — ${numeroTicket}`,
    html: `
      <p>Bonjour,</p>
      <p>Votre réclamation a bien été reçue par <strong>${nomEntreprise}</strong>.</p>
      <p>Numéro de suivi : <strong>${numeroTicket}</strong></p>
      ${delaiHtml}
      <p>${nomEntreprise}</p>
    `,
  });
}

export async function sendReclamationNotification(
  emailEntreprise: string,
  numeroTicket: string,
  priorite: string,
  nomClient: string,
  emailClient: string,
  telClient: string | null,
  chantierAdresse: string,
  sujet: string,
  message: string,
  photosUrls: string[],
) {
  const photosHtml =
    photosUrls.length > 0
      ? `<p>Photos jointes :</p><ul>${photosUrls.map((url) => `<li><a href="${url}">${url}</a></li>`).join("")}</ul>`
      : "";

  return sendEnInterne({
    to: emailEntreprise,
    subject: `Nouvelle réclamation reçue ${numeroTicket} de ${nomClient}`,
    html: `
      <p>Nouvelle réclamation <strong>${numeroTicket}</strong> — priorité <strong>${priorite}</strong></p>
      <p><strong>Chantier :</strong> ${chantierAdresse}</p>
      <p><strong>Client :</strong> ${nomClient} — ${emailClient}${telClient ? ` — ${telClient}` : ""}</p>
      <p><strong>Sujet :</strong> ${sujet}</p>
      <p><strong>Message :</strong> ${message}</p>
      ${photosHtml}
    `,
  });
}

// ━━━ Étape 04 — Prise en charge ━━━

export async function sendPriseEnCharge(
  emailClient: string,
  nomEntreprise: string,
  numeroTicket: string,
) {
  return sendAuClient(nomEntreprise, {
    to: emailClient,
    subject: `Votre demande ${numeroTicket} est prise en charge`,
    html: `
      <p>Bonjour,</p>
      <p>Votre demande <strong>${numeroTicket}</strong> est prise en charge par notre équipe.</p>
      <p>${nomEntreprise}</p>
    `,
  });
}

// ━━━ Étape 05 — Relances ━━━

export async function sendRelanceNiveau1(
  emailEntreprise: string,
  numeroTicket: string,
  nomClient: string,
) {
  return sendEnInterne({
    to: emailEntreprise,
    subject: `Relance — ${numeroTicket} sans mise à jour depuis 24h`,
    html: `<p>Le ticket <strong>${numeroTicket}</strong> de ${nomClient} n'a pas été mis à jour depuis 24h.</p>`,
  });
}

export async function sendRelanceNiveau2(
  emailEntreprise: string,
  numeroTicket: string,
  nomClient: string,
) {
  return sendEnInterne({
    to: emailEntreprise,
    subject: `Escalade — ${numeroTicket} sans réponse depuis 48h`,
    html: `
      <p>Le ticket <strong>${numeroTicket}</strong> de ${nomClient} est sans réponse depuis 48h.</p>
      <p><strong>Intervention Arthur requise.</strong></p>
    `,
  });
}

export async function sendRelanceNiveau3Entreprise(
  emailEntreprise: string,
  numeroTicket: string,
  nomClient: string,
) {
  return sendEnInterne({
    to: emailEntreprise,
    subject: `URGENT — ${numeroTicket} sans réponse depuis 72h`,
    html: `<p><strong>Alerte critique :</strong> le ticket ${numeroTicket} de ${nomClient} est sans réponse depuis 72h.</p>`,
  });
}

export async function sendRelanceNiveau3Client(
  emailClient: string,
  nomEntreprise: string,
  numeroTicket: string,
) {
  return sendAuClient(nomEntreprise, {
    to: emailClient,
    subject: `Votre demande ${numeroTicket} — mise à jour`,
    html: `
      <p>Bonjour,</p>
      <p>Nous traitons votre demande <strong>${numeroTicket}</strong> en priorité. Merci de votre patience.</p>
      <p>${nomEntreprise}</p>
    `,
  });
}

// ━━━ Étape 06 — Résolution / clôture / contestation ━━━

export async function sendCloture(
  emailClient: string,
  nomEntreprise: string,
  numeroTicket: string,
  descriptionResolution: string,
  photoUrl: string,
) {
  return sendAuClient(nomEntreprise, {
    to: emailClient,
    subject: `Votre demande ${numeroTicket} est résolue`,
    html: `
      <p>Bonjour,</p>
      <p>Votre demande <strong>${numeroTicket}</strong> a été traitée :</p>
      <p>${descriptionResolution}</p>
      <p><img src="${photoUrl}" alt="Photo après intervention" style="max-width:400px" /></p>
      <p>Si tout est conforme, aucune action n'est nécessaire. Vous disposez de 72h pour contester cette clôture depuis votre page de suivi.</p>
      <p>${nomEntreprise}</p>
    `,
  });
}

export async function sendContestationAlert(
  emailEntreprise: string,
  numeroTicket: string,
  nomClient: string,
) {
  return sendEnInterne({
    to: emailEntreprise,
    subject: `Contestation — ${numeroTicket}`,
    html: `<p><strong>${nomClient}</strong> a contesté la clôture du ticket <strong>${numeroTicket}</strong>. Il repasse en priorité P1.</p>`,
  });
}

// ━━━ Étape 07 — Avis ━━━

export async function sendDemandeAvis(
  emailClient: string,
  nomEntreprise: string,
  lienAvis: string,
) {
  return sendAuClient(nomEntreprise, {
    to: emailClient,
    subject: `Votre avis compte pour ${nomEntreprise}`,
    html: `
      <p>Bonjour,</p>
      <p>Votre chantier avec <strong>${nomEntreprise}</strong> est terminé. Pourriez-vous prendre un instant pour nous laisser votre avis ?</p>
      <p><a href="${lienAvis}">Donner mon avis</a></p>
      <p>${nomEntreprise}</p>
    `,
  });
}

export async function sendAvisAlerteInterne(
  emailEntreprise: string,
  note: number,
  commentaire: string | null,
  nomClient: string,
) {
  return sendEnInterne({
    to: emailEntreprise,
    subject: `Avis client à surveiller — ${note}/5`,
    html: `
      <p><strong>${nomClient}</strong> a laissé un avis de <strong>${note}/5</strong>.</p>
      ${commentaire ? `<p>Commentaire : ${commentaire}</p>` : ""}
    `,
  });
}
