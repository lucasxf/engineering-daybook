'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { LogoLink } from '@/components/ui/LogoLink';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Settings, ChevronRight } from 'lucide-react';

const demoScreens = [
  {
    id: 'settings',
    icon: Settings,
    title: { en: 'Settings', 'pt-BR': 'Configuracoes' },
    description: {
      en: 'User settings with profile, privacy, appearance, and language options',
      'pt-BR': 'Configuracoes do usuario com perfil, privacidade, aparencia e idioma',
    },
  },
];

export default function DemoIndexPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale as 'en' | 'pt-BR';

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 text-center text-sm text-warning">
        {locale === 'pt-BR'
          ? 'Modo demo - Telas de validacao de implementacao'
          : 'Demo mode - Implementation validation screens'}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <LogoLink />
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          {locale === 'pt-BR' ? 'Telas de Demo' : 'Demo Screens'}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {locale === 'pt-BR'
            ? 'Selecione uma tela para validar a implementacao'
            : 'Select a screen to validate the implementation'}
        </p>

        <div className="flex flex-col gap-3">
          {demoScreens.map((screen) => (
            <Link key={screen.id} href={`/${locale}/demo/${screen.id}`}>
              <Card className="group flex items-center justify-between p-4 transition-all hover:border-primary/50 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <screen.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {screen.title[locale] ?? screen.title.en}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {screen.description[locale] ?? screen.description.en}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Card>
            </Link>
          ))}
        </div>

        {/* Locale switcher */}
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/en/demo"
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              locale === 'en'
                ? 'border-primary bg-primary/5 font-medium text-foreground'
                : 'border-border text-muted-foreground hover:border-muted-foreground/30'
            }`}
          >
            English
          </Link>
          <Link
            href="/pt-BR/demo"
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              locale === 'pt-BR'
                ? 'border-primary bg-primary/5 font-medium text-foreground'
                : 'border-border text-muted-foreground hover:border-muted-foreground/30'
            }`}
          >
            Portugues (Brasil)
          </Link>
        </div>
      </main>
    </div>
  );
}
