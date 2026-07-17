import { headers } from "next/headers";

export function getOrigin() {
  const h = headers();
  const origin = h.get("origin");
  if (origin) return origin;

  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
