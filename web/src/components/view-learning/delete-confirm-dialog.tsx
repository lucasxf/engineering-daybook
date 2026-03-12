"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface DeleteConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ onCancel, onConfirm }: DeleteConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const warningId = "delete-warning-text";

  // Focus the cancel button when the dialog opens
  useEffect(() => {
    cancelBtnRef.current?.focus();
  }, []);

  // Trap focus inside the dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        aria-hidden="true"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby={warningId}
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-card-border bg-card p-6 shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          aria-label="Fechar diálogo"
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Title */}
        <h2
          id="delete-dialog-title"
          className="mb-3 font-heading text-lg font-semibold text-foreground"
        >
          Excluir este aprendizado?
        </h2>

        {/* Body */}
        <p id={warningId} className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Este aprendizado será ocultado da sua lista.{" "}
          <span className="font-medium text-foreground">Isso não pode ser desfeito.</span>
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-[#2B4A78] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            aria-describedby={warningId}
            className="rounded-lg bg-[#E53E3E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#C53030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E53E3E] focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            Excluir
          </button>
        </div>
      </div>
    </>
  );
}
