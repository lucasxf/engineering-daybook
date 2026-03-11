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
 * Provides error/hint element IDs; consumers should wire up aria-describedby on their inputs.
 * When htmlFor is omitted (e.g. when the child wires its own aria-labelledby), the label
 * is rendered without a for attribute — purely as a visible group heading.
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
        <p id={hintId ?? undefined} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId ?? undefined}
          role="alert"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
