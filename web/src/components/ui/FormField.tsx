import { type ReactNode } from 'react';
import { Label } from './Label';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

/**
 * Form field wrapper with label, input slot, error message, and optional hint.
 * Uses Library at Dusk design tokens for consistent styling.
 * Provides error/hint element IDs; consumers should wire up aria-describedby on their inputs.
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FormFieldProps) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;

  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      <div>{children}</div>
      {hint && !error && (
        <p id={hintId ?? undefined} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId ?? undefined}
          role="alert"
          aria-live="polite"
          className="text-xs text-[#C0392B] dark:text-[#FF8A8A]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
