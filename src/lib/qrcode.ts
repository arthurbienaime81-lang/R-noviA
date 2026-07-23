import QRCode from "qrcode";

/**
 * Génère un QR code PNG (buffer) pointant vers l'URL donnée.
 * - Correction d'erreur "M" : suffisant pour un lien de suivi, sans
 *   alourdir inutilement l'image.
 * - Marge (quiet zone) de 4 modules — le minimum recommandé par la norme
 *   QR pour rester scannable, y compris sur un écran de téléphone
 *   photographié depuis un autre écran.
 * - Fond blanc opaque explicite (nécessaire pour que la quiet zone soit
 *   réellement blanche une fois insérée dans l'email, quel que soit le
 *   fond du client mail).
 */
export async function genererQrCodePng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "M",
    width: 200,
    margin: 4,
    color: {
      dark: "#000000ff",
      light: "#ffffffff",
    },
  });
}
