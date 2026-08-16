"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { uploadPhoto, type ChantierActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: ChantierActionState = { error: null, success: false };

export function PhotoUpload({ chantierId }: { chantierId: string }) {
  const action = uploadPhoto.bind(null, chantierId);
  const [state, formAction] = useFormState(action, initialState);
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

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {state.error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-inset ring-red-200">
          {state.error}
        </div>
      )}
      <input
        type="file"
        name="photo"
        accept="image/*"
        required
        onChange={handleFileChange}
        className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
      />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Aperçu de la photo"
          className="h-32 w-32 rounded-md border border-slate-200 object-cover"
        />
      )}
      <input
        type="text"
        name="caption"
        placeholder="Légende (optionnel)"
        maxLength={200}
        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <SubmitButton pendingLabel="Envoi...">Ajouter la photo</SubmitButton>
    </form>
  );
}
