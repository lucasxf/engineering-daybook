'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PokForm } from '@/components/poks/PokForm';
import { Toast } from '@/components/ui/Toast';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import type { PokFormSubmitData } from '@/components/poks/PokForm';

const DEMO_POK = {
  title: 'React useEffect cleanup functions',
  content:
    'Aprendi que toda vez que um `useEffect` assina um recurso externo (event listener, subscription, timer), a função de cleanup deve cancelar essa assinatura para evitar memory leaks.\n\nO cleanup roda antes de o efeito ser re-executado e quando o componente é desmontado.',
  visibility: 'PRIVATE' as const,
};

type DemoState = 'idle' | 'saving' | 'success' | 'error';

/**
 * Demo page for the Edit Learning screen.
 * Does not require authentication — uses static mock data.
 * NOT to be committed as a permanent route.
 */
export default function DemoEditLearningPage() {
  const params = useParams<{ locale: string }>();
  const [state, setState] = useState<DemoState>('idle');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (_data: PokFormSubmitData) => {
    setState('saving');
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1400));
    // Randomly simulate success (80%) or error (20%) for demo purposes
    if (Math.random() > 0.2) {
      setState('success');
      setShowToast(true);
    } else {
      setState('error');
    }
  };

  const handleDismissToast = () => {
    setShowToast(false);
    setState('idle');
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Demo banner */}
      <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
        Modo demo — sem autenticação. Dados fictícios pré-preenchidos. O envio simula uma chamada de API (80% sucesso, 20% erro).
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Editar aprendizado
        </h1>
        <Link href={`/${params.locale}/demo/edit-learning` as never}>
          <Button variant="secondary">Cancelar</Button>
        </Link>
      </div>

      {state === 'error' && (
        <Alert variant="error" className="mb-4">
          Ocorreu um erro ao salvar. Tente novamente.
        </Alert>
      )}

      <PokForm
        onSubmit={handleSubmit}
        mode="edit"
        initialData={DEMO_POK}
      />

      {showToast && (
        <Toast
          message="Aprendizado atualizado com sucesso."
          onDismiss={handleDismissToast}
        />
      )}
    </div>
  );
}
