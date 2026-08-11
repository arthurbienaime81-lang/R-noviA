"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { uploadLogo, type ProfilActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { DARK_GOLD_BUTTON_CLASSES } from "@/lib/styles";

const initialState: ProfilActionState = { error: null, success: false };

export function LogoUpload({ logoUrl }: { logoUrl: string | null }) {
  const [state, formAction] = useFormState(uploadLogo, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setPreview(null);
    }
  }, [state.success]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  const displayUrl = preview ?? logoUrl;

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {state.error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-inset ring-red-200">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-4">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt="Logo de l'entreprise"
            className="h-16 w-16 rounded-md border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-slate-300 text-xs text-slate-400">
            Logo
          </div>
        )}
        <input
          type="file"
          name="logo"
          accept="image/*"
          required
          onChange={handleFileChange}
          className="block text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
      </div>

      <SubmitButton className={DARK_GOLD_BUTTON_CLASSES} pendingLabel="Envoi...">
        Mettre à jour le logo
      </SubmitButton>
    </form>
  );
}
