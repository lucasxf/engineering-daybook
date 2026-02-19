import { type ReactNode } from 'react';
import { Label } from './Label';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

/**
 * Form field wrapper with label, input slot, error message, and optional hint.
 * Provides error/hint element IDs; consumers should wire up aria-describedby on their inputs.
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FormFieldProps) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;

  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      <div>{children}</div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
