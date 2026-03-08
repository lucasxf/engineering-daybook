"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  XCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Locale = "en" | "pt-BR";
type HandleStatus = "idle" | "checking" | "available" | "taken";
type PasswordStrength = "weak" | "medium" | "strong" | null;

interface FormData {
  displayName: string;
  email: string;
  handle: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  displayName?: string;
  email?: string;
  handle?: string;
  password?: string;
  confirmPassword?: string;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

const t = {
  en: {
    heading: "Create your account",
    subheading: "Capture and grow your knowledge.",
    displayName: "Display name",
    displayNamePlaceholder: "Jane Doe",
    email: "Email",
    emailPlaceholder: "jane@example.com",
    handle: "Handle",
    handlePlaceholder: "janedoe",
    handleAvailable: "Handle available",
    handleTaken: "Handle taken",
    password: "Password",
    confirmPassword: "Confirm password",
    submit: "Create account",
    submitting: "Creating account…",
    loginPrompt: "Already have an account?",
    loginLink: "Log in",
    errorEmail: "Invalid email format",
    errorPassword:
      "Min. 8 characters, 1 uppercase, 1 lowercase, 1 number",
    errorConfirm: "Passwords do not match",
    errorHandle:
      "Handle must be 3–30 lowercase letters, numbers, or hyphens",
    strengthWeak: "Weak",
    strengthMedium: "Medium",
    strengthStrong: "Strong",
    serverErrorEmail: "Email already in use",
    serverErrorHandle: "Handle already taken",
    required: "This field is required",
  },
  "pt-BR": {
    heading: "Crie sua conta",
    subheading: "Capture e expanda seu conhecimento.",
    displayName: "Nome de exibição",
    displayNamePlaceholder: "Jane Doe",
    email: "Email",
    emailPlaceholder: "jane@exemplo.com",
    handle: "Identificador",
    handlePlaceholder: "janedoe",
    handleAvailable: "Identificador disponível",
    handleTaken: "Identificador já em uso",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    submit: "Criar conta",
    submitting: "Criando conta…",
    loginPrompt: "Já tem uma conta?",
    loginLink: "Entrar",
    errorEmail: "Formato de e-mail inválido",
    errorPassword:
      "Mín. 8 caracteres, 1 maiúsculo, 1 minúsculo, 1 número",
    errorConfirm: "As senhas não coincidem",
    errorHandle:
      "O identificador deve ter 3–30 letras minúsculas, números ou hifens",
    strengthWeak: "Fraca",
    strengthMedium: "Média",
    strengthStrong: "Forte",
    serverErrorEmail: "E-mail já cadastrado",
    serverErrorHandle: "Identificador já em uso",
    required: "Este campo é obrigatório",
  },
} as const;

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validateHandle(v: string) {
  return /^[a-z0-9-]{3,30}$/.test(v);
}

function validatePassword(v: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
}

function getPasswordStrength(v: string): PasswordStrength {
  if (!v) return null;
  const hasLower = /[a-z]/.test(v);
  const hasUpper = /[A-Z]/.test(v);
  const hasDigit = /\d/.test(v);
  const hasSpecial = /[^a-zA-Z0-9]/.test(v);
  const long = v.length >= 12;
  const score =
    (hasLower ? 1 : 0) +
    (hasUpper ? 1 : 0) +
    (hasDigit ? 1 : 0) +
    (hasSpecial ? 1 : 0) +
    (long ? 1 : 0);
  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-error" role="alert">
      {message}
    </p>
  );
}

function PasswordStrengthBar({
  strength,
  locale,
}: {
  strength: PasswordStrength;
  locale: Locale;
}) {
  const tx = t[locale];
  const labels: Record<NonNullable<PasswordStrength>, string> = {
    weak: tx.strengthWeak,
    medium: tx.strengthMedium,
    strong: tx.strengthStrong,
  };
  const segments = [
    {
      filled: strength !== null,
      color: "#E53E3E",
    },
    {
      filled: strength === "medium" || strength === "strong",
      color: "#DD6B20",
    },
    {
      filled: strength === "strong",
      color: "#38A169",
    },
  ];

  return (
    <div className="mt-2" aria-live="polite" aria-label="Força da senha">
      <div className="flex gap-1 mb-1">
        {segments.map((s, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: s.filled ? s.color : "var(--strength-track)",
            }}
          />
        ))}
      </div>
      {strength && (
        <p
          className="text-xs"
          style={{
            color:
              strength === "weak"
                ? "#E53E3E"
                : strength === "medium"
                ? "#DD6B20"
                : "#38A169",
          }}
        >
          {labels[strength]}
        </p>
      )}
    </div>
  );
}

function HandleStatus({
  status,
  locale,
}: {
  status: HandleStatus;
  locale: Locale;
}) {
  const tx = t[locale];
  if (status === "idle") return null;
  return (
    <div className="mt-1 flex items-center gap-1.5 text-xs" aria-live="polite">
      {status === "checking" && (
        <>
          <Loader2 size={12} className="animate-spin text-muted" />
          <span className="text-muted">…</span>
        </>
      )}
      {status === "available" && (
        <>
          <CheckCircle2 size={12} className="text-handle-available" />
          <span className="text-handle-available">{tx.handleAvailable}</span>
        </>
      )}
      {status === "taken" && (
        <>
          <XCircle size={12} className="text-handle-taken" />
          <span className="text-handle-taken">{tx.handleTaken}</span>
        </>
      )}
    </div>
  );
}

// ─── RegisterForm ─────────────────────────────────────────────────────────────

interface RegisterFormProps {
  locale: Locale;
  /** For demo preview: simulate server error type */
  simulateError?: "email" | "handle" | null;
  /** For demo preview: force submitting state */
  forceSubmitting?: boolean;
}

export function RegisterForm({
  locale,
  simulateError = null,
  forceSubmitting = false,
}: RegisterFormProps) {
  const tx = t[locale];

  const [form, setForm] = useState<FormData>({
    displayName: "",
    email: "",
    handle: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const submitting = forceSubmitting || isSubmitting;

  // ── Validation on blur ───────────────────────────────────────────────────────

  const validate = useCallback(
    (field: keyof FormData, value: string): string | undefined => {
      switch (field) {
        case "displayName":
          return !value.trim() ? tx.required : undefined;
        case "email":
          return !value.trim()
            ? tx.required
            : !validateEmail(value)
            ? tx.errorEmail
            : undefined;
        case "handle":
          return !value.trim()
            ? tx.required
            : !validateHandle(value)
            ? tx.errorHandle
            : undefined;
        case "password":
          return !value
            ? tx.required
            : !validatePassword(value)
            ? tx.errorPassword
            : undefined;
        case "confirmPassword":
          return !value
            ? tx.required
            : value !== form.password
            ? tx.errorConfirm
            : undefined;
      }
    },
    [form.password, tx]
  );

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validate(field, form[field]),
    }));
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
    }
  };

  // ── Handle availability check ────────────────────────────────────────────────

  useEffect(() => {
    if (!form.handle || !validateHandle(form.handle)) {
      setHandleStatus("idle");
      return;
    }
    setHandleStatus("checking");
    const timer = setTimeout(() => {
      // Simulate API check — "admin" and "test" are taken
      const taken = ["admin", "test"].includes(form.handle.toLowerCase());
      setHandleStatus(taken ? "taken" : "available");
    }, 800);
    return () => clearTimeout(timer);
  }, [form.handle]);

  // ── Server error simulation ───────────────────────────────────────────────────

  useEffect(() => {
    if (simulateError === "email") {
      setServerError(tx.serverErrorEmail);
    } else if (simulateError === "handle") {
      setServerError(tx.serverErrorHandle);
    } else {
      setServerError(null);
    }
  }, [simulateError, tx]);

  // ── Form validity ────────────────────────────────────────────────────────────

  const isFormValid =
    !!form.displayName.trim() &&
    validateEmail(form.email) &&
    validateHandle(form.handle) &&
    handleStatus === "available" &&
    validatePassword(form.password) &&
    form.password === form.confirmPassword;

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;
    setIsSubmitting(true);
    setServerError(null);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setServerError(tx.serverErrorEmail);
  };

  // ── Field shared classes ──────────────────────────────────────────────────────

  const inputBase =
    "w-full rounded-md border px-3 py-2 text-sm font-sans transition-colors outline-none " +
    "bg-input border-input text-heading placeholder:text-placeholder " +
    "focus:border-[#D4854A] focus:ring-1 focus:ring-[#D4854A] " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const labelClass = "block text-xs font-medium text-label mb-1 font-sans";

  const strength = getPasswordStrength(form.password);

  return (
    <div
      className="w-full max-w-[420px] mx-auto rounded-xl border border-card shadow-lg"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div className="p-6 sm:p-8">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-semibold text-heading text-balance">
            {tx.heading}
          </h1>
          <p className="mt-1 text-sm text-muted">{tx.subheading}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Display Name */}
          <div className="mb-4">
            <label htmlFor="displayName" className={labelClass}>
              {tx.displayName}
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              placeholder={tx.displayNamePlaceholder}
              value={form.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
              onBlur={() => handleBlur("displayName")}
              disabled={submitting}
              aria-invalid={!!errors.displayName}
              aria-describedby={errors.displayName ? "err-displayName" : undefined}
              className={inputBase}
            />
            <FieldError message={touched.displayName ? errors.displayName : undefined} />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className={labelClass}>
              {tx.email}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={tx.emailPlaceholder}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              disabled={submitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "err-email" : undefined}
              className={inputBase}
            />
            <FieldError message={touched.email ? errors.email : undefined} />
          </div>

          {/* Handle */}
          <div className="mb-4">
            <label htmlFor="handle" className={labelClass}>
              {tx.handle}
            </label>
            <div className="relative flex items-center">
              <span
                className="absolute left-3 text-sm select-none"
                style={{ color: "var(--handle-prefix)" }}
                aria-hidden="true"
              >
                @
              </span>
              <input
                id="handle"
                type="text"
                autoComplete="username"
                placeholder={tx.handlePlaceholder}
                value={form.handle}
                onChange={(e) =>
                  handleChange("handle", e.target.value.toLowerCase())
                }
                onBlur={() => handleBlur("handle")}
                disabled={submitting}
                aria-invalid={!!errors.handle}
                aria-describedby={errors.handle ? "err-handle" : undefined}
                className={`${inputBase} pl-7`}
              />
            </div>
            <HandleStatus status={handleStatus} locale={locale} />
            <FieldError message={touched.handle ? errors.handle : undefined} />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className={labelClass}>
              {tx.password}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                disabled={submitting}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "err-password" : undefined}
                className={`${inputBase} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4854A] rounded"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <PasswordStrengthBar strength={strength} locale={locale} />
            )}
            <FieldError message={touched.password ? errors.password : undefined} />
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label htmlFor="confirmPassword" className={labelClass}>
              {tx.confirmPassword}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                disabled={submitting}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "err-confirmPassword" : undefined
                }
                className={`${inputBase} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4854A] rounded"
                aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError
              message={
                touched.confirmPassword ? errors.confirmPassword : undefined
              }
            />
          </div>

          {/* Server error banner */}
          {serverError && (
            <div
              className="mb-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm"
              style={{
                backgroundColor: "var(--error-banner-bg)",
                borderColor: "var(--error-banner-border)",
                color: "var(--error-banner-text)",
              }}
              role="alert"
            >
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="w-full flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4854A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#D4854A" }}
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {submitting ? tx.submitting : tx.submit}
          </button>

          {/* Login link */}
          <p className="mt-4 text-center text-sm text-muted">
            {tx.loginPrompt}{" "}
            <a
              href="/login"
              className="font-medium hover:opacity-80 transition-opacity focus:outline-none focus-visible:underline"
              style={{ color: "#D4854A" }}
            >
              {tx.loginLink}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
