'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function SupportContent() {
  const t = useTranslations('support');
  const params = useParams<{ locale: string }>();

  return (
    <div className="mx-auto max-w-2xl py-12 px-4">
      <h1 className="mb-6 text-3xl font-bold">{t('title')}</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400">{t('intro')}</p>

      <div className="space-y-8 text-slate-700 dark:text-slate-300">

        {/* Contact section */}
        <Section title={t('contact.heading')}>
          <p>
            {t('contact.body')}{' '}
            <a
              href="mailto:support@learnimo.net"
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              {t('contact.emailLabel')}
            </a>
          </p>
        </Section>

        {/* FAQ section */}
        <Section title={t('faq.heading')}>
          <dl className="space-y-6">

            {/* Delete account */}
            <div>
              <dt className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {t('faq.deleteAccount.q')}
              </dt>
              <dd className="text-sm leading-relaxed">
                {t('faq.deleteAccount.a')}
              </dd>
            </div>

            {/* Change handle */}
            <div>
              <dt className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {t('faq.changeHandle.q')}
              </dt>
              <dd className="text-sm leading-relaxed">
                {t('faq.changeHandle.a')}
              </dd>
            </div>

            {/* Data privacy */}
            <div>
              <dt className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {t('faq.dataPrivacy.q')}
              </dt>
              <dd className="text-sm leading-relaxed">
                {t('faq.dataPrivacy.a')}
              </dd>
              <Link
                href={`/${params.locale}/privacy` as never}
                className="text-sm text-primary-600 hover:underline dark:text-primary-400"
              >
                {t('faq.dataPrivacy.policyLink')}
              </Link>
            </div>

            {/* Theme / language */}
            <div>
              <dt className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {t('faq.themeLanguage.q')}
              </dt>
              <dd className="text-sm leading-relaxed">
                {t('faq.themeLanguage.a')}
              </dd>
            </div>

            {/* Report bug */}
            <div>
              <dt className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {t('faq.reportBug.q')}
              </dt>
              <dd className="text-sm leading-relaxed">
                {t('faq.reportBug.a')}
              </dd>
              <a
                href="https://github.com/lucasxf/engineering-daybook/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t('faq.reportBug.linkLabel')} (opens in new tab)`}
                className="text-sm text-primary-600 hover:underline dark:text-primary-400"
              >
                {t('faq.reportBug.linkLabel')}
              </a>
            </div>

          </dl>
        </Section>

      </div>

      <div className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-700">
        <Link
          href={`/${params.locale}/` as never}
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          {t('backLink')}
        </Link>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense>
      <SupportContent />
    </Suspense>
  );
}
