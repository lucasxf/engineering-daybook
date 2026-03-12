'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Card } from '@/components/ui/Card';

/**
 * Demo Index Page
 *
 * Lists all available component/feature demos for validation.
 * Navigate to /en/__demos__ or /pt-BR/__demos__ to access.
 *
 * ⚠️ DELETE THIS ENTIRE __demos__ FOLDER BEFORE OPENING A PR TO PRODUCTION
 */

interface DemoEntry {
  slug: string;
  titleEn: string;
  titlePt: string;
  descriptionEn: string;
  descriptionPt: string;
}

const DEMOS: DemoEntry[] = [
  {
    slug: 'timeline',
    titleEn: 'Timeline Screen',
    titlePt: 'Tela de Linha do Tempo',
    descriptionEn: 'Learnings grouped by month with search, sort, and all UI states (loading, empty, error, no-results).',
    descriptionPt: 'Aprendizados agrupados por mês com busca, ordenação e todos os estados de UI (carregando, vazio, erro, sem resultados).',
  },
];

export default function DemosIndexPage() {
  const params = useParams<{ locale: string }>();
  const locale = useLocale();
  const isPt = locale === 'pt-BR';

  return (
    <div className="mx-auto max-w-2xl">
      {/* Warning banner */}
      <div className="mb-8 rounded-lg border border-warning/50 bg-warning/10 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-warning">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          {isPt ? 'Páginas de Demo' : 'Demo Pages'}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isPt
            ? 'Estas páginas são apenas para validação durante o desenvolvimento. Exclua a pasta __demos__ inteira antes de abrir um PR para produção.'
            : 'These pages are for validation during development only. Delete the entire __demos__ folder before opening a PR to production.'}
        </p>
      </div>

      <h1 className="mb-6 text-3xl font-bold text-foreground">
        {isPt ? 'Demos Disponíveis' : 'Available Demos'}
      </h1>

      <div className="space-y-4">
        {DEMOS.map((demo) => (
          <Link
            key={demo.slug}
            href={`/${params.locale}/__demos__/${demo.slug}`}
            className="block"
          >
            <Card className="p-4 card-hover">
              <h2 className="mb-1 font-semibold text-foreground">
                {isPt ? demo.titlePt : demo.titleEn}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isPt ? demo.descriptionPt : demo.descriptionEn}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Locale switcher hint */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        {isPt ? (
          <>
            Testar em inglês:{' '}
            <Link href="/en/__demos__" className="text-primary hover:underline">
              /en/__demos__
            </Link>
          </>
        ) : (
          <>
            Test in Portuguese:{' '}
            <Link href="/pt-BR/__demos__" className="text-primary hover:underline">
              /pt-BR/__demos__
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
