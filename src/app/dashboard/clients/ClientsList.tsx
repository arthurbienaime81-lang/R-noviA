"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { ClientAgregat } from "./page";

export function ClientsList({ clients }: { clients: ClientAgregat[] }) {
  const [recherche, setRecherche] = useState("");

  const rechercheNormalisee = recherche.trim().toLowerCase();
  const filtres = clients.filter(
    (c) =>
      !rechercheNormalisee ||
      c.nom.toLowerCase().includes(rechercheNormalisee) ||
      c.email.toLowerCase().includes(rechercheNormalisee) ||
      (c.tel ?? "").toLowerCase().includes(rechercheNormalisee),
  );

  return (
    <div>
      <input
        type="search"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher par nom, email, téléphone..."
        className="mb-6 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {filtres.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            {clients.length === 0
              ? "Aucun client pour le moment."
              : "Aucun client ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtres.map((client) => (
            <div
              key={client.email}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">
                  {client.nom}
                </h3>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {client.nombreChantiers} chantier
                  {client.nombreChantiers > 1 ? "s" : ""}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{client.email}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-sm text-slate-500">
                <span>{client.tel ?? "Téléphone non renseigné"}</span>
                <span className="text-slate-300">•</span>
                <span>Client depuis le {formatDate(client.clientDepuis)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
