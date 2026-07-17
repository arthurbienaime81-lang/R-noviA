"use client";

import { useState } from "react";

export function StarRating({ name }: { name: string }) {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={selected} />
      {[1, 2, 3, 4, 5].map((valeur) => {
        const rempli = valeur <= (hovered || selected);
        return (
          <button
            key={valeur}
            type="button"
            onClick={() => setSelected(valeur)}
            onMouseEnter={() => setHovered(valeur)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${valeur} étoile${valeur > 1 ? "s" : ""}`}
            className="p-1"
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-9 w-9 ${rempli ? "fill-yellow-400" : "fill-slate-200"}`}
            >
              <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.8L10 14.77l-5.21 2.75 1-5.8-4.21-4.1 5.82-.85L10 1.5z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
