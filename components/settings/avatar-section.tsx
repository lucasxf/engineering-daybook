"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, Loader2, AlertCircle } from "lucide-react";

type AvatarState = "idle" | "uploading" | "error";

interface AvatarSectionProps {
  displayName: string;
  avatarUrl?: string | null;
  lang: "en" | "pt";
}

const t = {
  en: {
    heading: "Avatar",
    upload: "Upload photo",
    remove: "Remove",
    hint: "JPEG, PNG or WebP · max 2 MB",
    uploadError: "File must be JPEG, PNG, or WebP and under 2 MB",
  },
  pt: {
    heading: "Avatar",
    upload: "Enviar foto",
    remove: "Remover",
    hint: "JPEG, PNG ou WebP · máx 2 MB",
    uploadError: "O arquivo deve ser JPEG, PNG ou WebP e menor que 2 MB",
  },
};

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

function getInitialsBg(name: string): string {
  const colors = [
    "#2B4A78", "#1A365D", "#3B5F9A", "#1E4D7A", "#2A5298",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function AvatarSection({ displayName, avatarUrl: initialAvatarUrl, lang }: AvatarSectionProps) {
  const tx = t[lang];
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [state, setState] = useState<AvatarState>("idle");

  const initial = (displayName?.trim()[0] ?? "?").toUpperCase();
  const hasAvatar = !!avatarUrl;
  const bgColor = getInitialsBg(displayName || "L");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VALID_TYPES.includes(file.type) || file.size > MAX_BYTES) {
      setState("error");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setState("uploading");
    const reader = new FileReader();
    reader.onload = () => {
      // Simulate upload delay
      setTimeout(() => {
        setAvatarUrl(reader.result as string);
        setState("idle");
      }, 1200);
    };
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    setAvatarUrl(null);
    setState("idle");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <section
      aria-labelledby="avatar-heading"
      className="rounded-2xl border border-card-border bg-card shadow-sm overflow-hidden"
    >
      {/* Top accent */}
      <div className="h-0.5 w-full bg-ember-stroke" aria-hidden="true" />

      <div className="px-6 py-6 flex flex-col items-center gap-5">
        <h2 id="avatar-heading" className="w-full font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {tx.heading}
        </h2>

        {/* Avatar circle */}
        <div className="relative">
          <div
            className="h-24 w-24 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-card-border"
            aria-label={hasAvatar ? "Foto de perfil" : `Avatar com inicial ${initial}`}
          >
            {state === "uploading" ? (
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
              >
                <Loader2 className="h-7 w-7 animate-spin text-white/70" aria-hidden="true" />
              </div>
            ) : hasAvatar ? (
              <img
                src={avatarUrl!}
                alt="Foto de perfil"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="h-24 w-24 rounded-full flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
              >
                <span className="font-heading text-3xl font-semibold text-white select-none">
                  {initial}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={state === "uploading"}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors duration-150 hover:bg-input-border/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "uploading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {tx.upload}
          </button>

          <button
            type="button"
            disabled={!hasAvatar || state === "uploading"}
            onClick={handleRemove}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-[#C0392B] transition-colors duration-150 hover:bg-[#C0392B]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C0392B] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {tx.remove}
          </button>
        </div>

        {/* Hint or error */}
        {state === "error" ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {tx.uploadError}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{tx.hint}</p>
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleFileChange}
        />
      </div>
    </section>
  );
}
