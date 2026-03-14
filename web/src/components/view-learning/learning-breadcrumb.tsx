"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function LearningBreadcrumb() {
  const locale = useLocale();
  const t = useTranslations("poks");

  return (
    <nav aria-label={t("view.breadcrumbLabel")} className="mb-6">
      <Link
        href={`/${locale}/poks`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-link)] transition-colors hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-focus)] rounded"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        {t("list.title")}
      </Link>
    </nav>
  );
}
