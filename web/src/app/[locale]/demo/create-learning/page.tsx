'use client';

/**
 * DEMO PAGE - DO NOT INCLUDE IN PR
 * Navigate to /en/demo/create-learning or /pt-BR/demo/create-learning
 * to preview the Create Learning form redesign.
 */

import { useState } from 'react';
import { CreateLearningForm } from '@/components/learnings/CreateLearningForm';
import { LearningPageHeader } from '@/components/learnings/LearningPageHeader';
import { useParams } from 'next/navigation';

export default function DemoCreateLearningPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [isDark, setIsDark] = useState(true);

  const handleSubmit = async (data: { title: string; content: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return;
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-4 py-8">
          {/* Demo banner */}
          <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                DEMO MODE — não incluir no PR.
              </p>
              <p className="mt-1 text-xs text-amber-600/70 dark:text-amber-400/70">
                Locale: {locale} | Rota: /demo/create-learning
              </p>
            </div>
            <button
              onClick={() => setIsDark((d) => !d)}
              className="shrink-0 rounded-md border border-amber-500/40 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/10 dark:text-amber-300"
            >
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>
          </div>

          {/* Page Header */}
          <LearningPageHeader locale={locale} />

          {/* Create Learning Form */}
          <div className="mt-6">
            <CreateLearningForm
              locale={locale}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Demo instructions */}
          <div className="mt-8 rounded-lg border border-border bg-muted/40 p-4">
            <h3 className="text-sm font-semibold text-foreground">Funcionalidades para testar:</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>- Textarea se expande automaticamente ao digitar</li>
              <li>- Contadores de caracteres ao vivo (título: 200 máx, conteúdo: 50K máx)</li>
              <li>- Botão de salvar desabilitado até haver conteúdo</li>
              <li>- Atalhos: Cmd/Ctrl+Enter para salvar, Escape para cancelar</li>
              <li>- Submeta o formulário para ver o estado de loading e o toast de sucesso</li>
              <li>- Ultrapasse o limite de caracteres para ver os erros de validação</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
