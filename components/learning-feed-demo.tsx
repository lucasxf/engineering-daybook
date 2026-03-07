"use client";

import * as React from "react";
import { LearningFeed } from "./learning-feed/learning-feed";
import type { Learning, FeedState } from "@/lib/types";

// Mock data for demonstration
const mockLearnings: Learning[] = [
  {
    id: "1",
    title: "React Server Components permitem renderização no servidor",
    content:
      "Server Components são um novo paradigma no React que permite renderizar componentes no servidor. Isso reduz o JavaScript enviado ao cliente e melhora a performance. Eles não podem usar hooks como useState ou useEffect, mas podem fazer fetch de dados diretamente.",
    tags: [
      { id: "1", name: "react", displayName: "React" },
      { id: "2", name: "performance", displayName: "Performance" },
    ],
    createdAt: "2026-01-14T10:00:00Z",
    updatedAt: "2026-03-04T14:30:00Z",
  },
  {
    id: "2",
    title: "O princípio DRY não é sobre evitar duplicação de código",
    content:
      'DRY (Don\'t Repeat Yourself) é frequentemente mal interpretado. Não se trata de evitar código duplicado, mas sim de evitar duplicação de conhecimento. Duas funções podem ter código similar mas representar conceitos diferentes - unificá-las seria um erro.',
    tags: [
      { id: "3", name: "arquitetura", displayName: "Arquitetura" },
      { id: "4", name: "boas-praticas", displayName: "Boas Práticas" },
    ],
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "3",
    title: "PostgreSQL suporta busca vetorial com pgvector",
    content:
      "O pgvector é uma extensão do PostgreSQL que adiciona suporte a vetores e busca por similaridade. Isso permite implementar busca semântica e recomendações diretamente no banco de dados, sem necessidade de serviços externos como Pinecone ou Weaviate.",
    tags: [
      { id: "5", name: "postgresql", displayName: "PostgreSQL" },
      { id: "6", name: "ai", displayName: "AI" },
      { id: "7", name: "busca", displayName: "Busca" },
    ],
    createdAt: "2026-02-20T16:00:00Z",
    updatedAt: "2026-02-28T11:00:00Z",
  },
  {
    id: "4",
    title: "Tailwind CSS v4 usa CSS Layers nativamente",
    content:
      "A versão 4 do Tailwind CSS adota CSS Layers (@layer) do CSS nativo, abandonando a necessidade de PostCSS para muitas funcionalidades. Isso simplifica a configuração e melhora a integração com outras ferramentas CSS modernas.",
    tags: [
      { id: "8", name: "css", displayName: "CSS" },
      { id: "9", name: "tailwind", displayName: "Tailwind" },
    ],
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
];

type DemoState = FeedState;

const stateLabels: Record<DemoState, string> = {
  populated: "Populado (padrão)",
  loading: "Carregando",
  empty: "Vazio",
  noResults: "Sem resultados",
  error: "Erro",
};

export function LearningFeedDemo() {
  const [currentState, setCurrentState] = React.useState<DemoState>("populated");

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* State selector */}
      <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2">
          <span className="mr-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Estado:
          </span>
          {(Object.keys(stateLabels) as DemoState[]).map((state) => (
            <button
              key={state}
              onClick={() => setCurrentState(state)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                currentState === state
                  ? "bg-[#D4854A] text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {stateLabels[state]}
            </button>
          ))}
        </div>
      </div>

      {/* Side by side preview */}
      <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-2">
        {/* Dark mode */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-lg dark:border-neutral-800">
          <div className="bg-neutral-800 px-4 py-2 text-center text-sm font-medium text-neutral-200">
            Dark Mode
          </div>
          <div className="dark max-h-[800px] overflow-y-auto">
            <LearningFeed
              initialState={currentState}
              learnings={mockLearnings}
              totalCount={42}
              currentPage={1}
              totalPages={4}
            />
          </div>
        </div>

        {/* Light mode */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-lg dark:border-neutral-800">
          <div className="bg-neutral-100 px-4 py-2 text-center text-sm font-medium text-neutral-700">
            Light Mode
          </div>
          <div className="max-h-[800px] overflow-y-auto">
            <LearningFeed
              initialState={currentState}
              learnings={mockLearnings}
              totalCount={42}
              currentPage={1}
              totalPages={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
