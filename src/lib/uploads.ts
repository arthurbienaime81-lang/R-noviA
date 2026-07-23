export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
export const MAX_PHOTOS_RECLAMATION = 3;

export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Valide un fichier image côté serveur : type MIME et taille. Retourne un
 * message d'erreur en français si le fichier est invalide, `null` sinon.
 * Ne jamais faire confiance au seul contrôle côté client (HTML `accept`,
 * JS) : cette validation doit systématiquement être répétée côté serveur,
 * y compris pour un appel API direct qui contournerait le formulaire.
 */
export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
    return `Le fichier « ${file.name} » n'est pas une image valide (JPG, PNG ou WEBP uniquement).`;
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return `Le fichier « ${file.name} » dépasse la taille maximale de 5 Mo.`;
  }
  return null;
}

/** Extension de fichier dérivée du type MIME validé (jamais du nom de fichier fourni par le client). */
export function extensionFromMimeType(mimeType: string): string {
  return MIME_EXTENSIONS[mimeType] ?? "jpg";
}
