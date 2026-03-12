"use client";

import { useId, useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";

type SaveState = "idle" | "saving" | "saved";

interface ProfileSectionProps {
  initialDisplayName?: string;
  initialBio?: string;
  lang: "en" | "pt";
}

const t = {
  en: {
    heading: "Profile",
    nameLabel: "Display name",
    namePlaceholder: "Your display name",
    nameError: "Display name is required",
    bioLabel: "Bio",
    bioPlaceholder: "Tell others what you're learning about…",
    bioUrlError: "Bio cannot contain links",
    save: "Save changes",
    saved: "Saved \u2713",
  },
  pt: {
    heading: "Perfil",
    nameLabel: "Nome de exibição",
    namePlaceholder: "Seu nome de exibição",
    nameError: "Nome de exibição é obrigatório",
    bioLabel: "Bio",
    bioPlaceholder: "Conte o que você está aprendendo…",
    bioUrlError: "Bio não pode conter links",
    save: "Salvar alterações",
    saved: "Salvo \u2713",
  },
};

const URL_REGEX = /https?:\/\/|www\./i;
const BIO_MAX = 200;
const NAME_MAX = 100;

export function ProfileSection({ initialDisplayName = "Lucas", initialBio = "", lang }: ProfileSectionProps) {
  const tx = t[lang];
  const nameId = useId();
  const bioId = useId();

  const [name, setName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [nameTouched, setNameTouched] = useState(false);
  const [bioTouched, setBioTouched] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const nameError = nameTouched && !name.trim() ? tx.nameError : null;
  const bioError = bioTouched && URL_REGEX.test(bio) ? tx.bioUrlError : null;

  const isDirty = name !== initialDisplayName || bio !== initialBio;
  const canSave = isDirty && !nameError && !bioError;

  // Reset saved state after 2s
  useEffect(() => {
    if (saveState === "saved") {
      const t = setTimeout(() => setSaveState("idle"), 2000);
      return () => clearTimeout(t);
    }
  }, [saveState]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameTouched(true);
    setBioTouched(true);
    if (!name.trim() || URL_REGEX.test(bio)) return;

    setSaveState("saving");
    await new Promise((res) => setTimeout(res, 1000));
    setSaveState("saved");
  }

  return (
    <section
      aria-labelledby="profile-heading"
      className="rounded-2xl border border-card-border bg-card shadow-sm overflow-hidden"
    >
      <div className="h-0.5 w-full bg-ember-stroke" aria-hidden="true" />

      <div className="px-6 py-6">
        <h2 id="profile-heading" className="mb-5 font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {tx.heading}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Display name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={nameId} className="text-sm font-medium text-card-foreground">
              {tx.nameLabel}
            </label>
            <input
              id={nameId}
              type="text"
              maxLength={NAME_MAX}
              required
              placeholder={tx.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? `${nameId}-error` : undefined}
              className={[
                "w-full rounded-lg border px-3.5 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground/50",
                "bg-input outline-none transition-colors duration-150",
                nameError
                  ? "border-error focus:ring-1 focus:ring-error"
                  : "border-input-border focus:border-[var(--color-input-focus)] focus:ring-1 focus:ring-[var(--color-input-focus)]",
              ].join(" ")}
            />
            {nameError && (
              <p id={`${nameId}-error`} role="alert" className="text-xs text-error">
                {nameError}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={bioId} className="text-sm font-medium text-card-foreground">
              {tx.bioLabel}
            </label>
            <div className="relative">
              <textarea
                id={bioId}
                maxLength={BIO_MAX}
                rows={3}
                placeholder={tx.bioPlaceholder}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                onBlur={() => setBioTouched(true)}
                aria-invalid={!!bioError}
                aria-describedby={bioError ? `${bioId}-error` : `${bioId}-counter`}
                className={[
                  "w-full resize-none rounded-lg border px-3.5 py-2.5 pb-7 text-sm text-card-foreground placeholder:text-muted-foreground/50",
                  "bg-input outline-none transition-colors duration-150",
                  bioError
                    ? "border-error focus:ring-1 focus:ring-error"
                    : "border-input-border focus:border-[var(--color-input-focus)] focus:ring-1 focus:ring-[var(--color-input-focus)]",
                ].join(" ")}
              />
              {/* Character counter */}
              <span
                id={`${bioId}-counter`}
                aria-label={`${bio.length} de ${BIO_MAX} caracteres`}
                className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground select-none"
              >
                {bio.length} / {BIO_MAX}
              </span>
            </div>
            {bioError && (
              <p id={`${bioId}-error`} role="alert" className="text-xs text-error">
                {bioError}
              </p>
            )}
          </div>

          {/* Save button — right-aligned */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canSave || saveState === "saving" || saveState === "saved"}
              className={[
                "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]",
                canSave || saveState === "saving" || saveState === "saved"
                  ? "bg-primary hover:bg-primary-hover"
                  : "cursor-not-allowed bg-primary/40",
                saveState === "saved" ? "bg-primary/70" : "",
              ].join(" ")}
            >
              {saveState === "saving" && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              )}
              {saveState === "saved" && (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {saveState === "saving"
                ? (lang === "pt" ? "Salvando…" : "Saving…")
                : saveState === "saved"
                ? tx.saved
                : tx.save}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
