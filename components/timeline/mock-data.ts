import type { MonthGroup } from "./types";

export const MOCK_MONTH_GROUPS: MonthGroup[] = [
  {
    monthKey: "2026-03",
    monthDate: "2026-03-01T00:00:00Z",
    learnings: [
      {
        id: "1",
        title: "React Server Components na prática",
        content:
          "RSC permite renderizar componentes inteiramente no servidor, eliminando JavaScript desnecessário no cliente. A separação entre Server e Client components muda fundamentalmente como estruturamos aplicações Next.js.",
        tags: [
          { id: "t1", name: "react", displayName: "React" },
          { id: "t2", name: "nextjs", displayName: "Next.js" },
          { id: "t3", name: "performance", displayName: "Performance" },
        ],
        createdAt: "2026-03-10T14:30:00Z",
      },
      {
        id: "2",
        title: "Por que Tailwind CSS escala melhor que CSS Modules",
        content:
          "A convenção de utilidades atômicas elimina dead CSS, facilita revisões de PR e mantém bundle size previsível. A curva de aprendizado inicial vale o investimento.",
        tags: [
          { id: "t4", name: "css", displayName: "CSS" },
          { id: "t5", name: "tailwind", displayName: "Tailwind" },
        ],
        createdAt: "2026-03-07T09:15:00Z",
      },
      {
        id: "3",
        title: "",
        content:
          "Aprendi hoje que `useEffectEvent` resolve elegantemente o problema de referências obsoletas em efeitos — sem precisar adicionar a função ao array de dependências.",
        tags: [{ id: "t1", name: "react", displayName: "React" }],
        createdAt: "2026-03-03T20:00:00Z",
      },
      {
        id: "4",
        title: "TypeScript: satisfies vs as",
        content:
          "O operador `satisfies` valida um valor contra um tipo sem perder a inferência de tipo. Diferente de `as`, ele não suprime erros — ele os detecta precocemente.",
        tags: [
          { id: "t6", name: "typescript", displayName: "TypeScript" },
          { id: "t7", name: "tipagem", displayName: "Tipagem" },
        ],
        createdAt: "2026-03-01T11:00:00Z",
      },
    ],
  },
  {
    monthKey: "2026-02",
    monthDate: "2026-02-01T00:00:00Z",
    learnings: [
      {
        id: "5",
        title: "Fundamentos de banco de dados vetorial",
        content:
          "Embeddings transformam texto em vetores de alta dimensão que capturam semântica. Cosine similarity mede proximidade entre vetores, permitindo buscas por significado.",
        tags: [
          { id: "t8", name: "ia", displayName: "IA" },
          { id: "t9", name: "banco-de-dados", displayName: "Banco de Dados" },
        ],
        createdAt: "2026-02-20T16:45:00Z",
      },
      {
        id: "6",
        title: "Git: rebase interativo para histórico limpo",
        content:
          "Com `git rebase -i HEAD~n` consigo squash, reorder e editar commits antes de mergear. Melhora muito a legibilidade do histórico e facilita bisect.",
        tags: [
          { id: "t10", name: "git", displayName: "Git" },
          { id: "t11", name: "workflow", displayName: "Workflow" },
        ],
        createdAt: "2026-02-14T10:20:00Z",
      },
      {
        id: "7",
        title: "",
        content:
          "A arquitetura hexagonal (ports & adapters) separa a lógica de domínio da infraestrutura. Muito útil para tornar serviços testáveis sem depender de banco real.",
        tags: [
          { id: "t12", name: "arquitetura", displayName: "Arquitetura" },
          { id: "t13", name: "backend", displayName: "Backend" },
          { id: "t14", name: "testes", displayName: "Testes" },
          { id: "t15", name: "java", displayName: "Java" },
        ],
        createdAt: "2026-02-05T08:30:00Z",
      },
    ],
  },
  {
    monthKey: "2026-01",
    monthDate: "2026-01-01T00:00:00Z",
    learnings: [
      {
        id: "8",
        title: "HTTP/3 e QUIC: o que muda na prática",
        content:
          "QUIC usa UDP com multiplexação sem bloqueio de cabeçalho de linha. Reduções de latência de até 30% em conexões instáveis. Ainda requer infraestrutura de suporte.",
        tags: [
          { id: "t16", name: "rede", displayName: "Rede" },
          { id: "t17", name: "performance", displayName: "Performance" },
        ],
        createdAt: "2026-01-22T13:00:00Z",
      },
      {
        id: "9",
        title: "Padrão Saga para transações distribuídas",
        content:
          "Sagas coordenam transações longas em microserviços via eventos ou orquestração. Cada step tem uma ação compensatória. Mais complexo, mas elimina locks distribuídos.",
        tags: [
          { id: "t12", name: "arquitetura", displayName: "Arquitetura" },
          { id: "t18", name: "microservicos", displayName: "Microsserviços" },
        ],
        createdAt: "2026-01-10T17:30:00Z",
      },
    ],
  },
  {
    monthKey: "2025-12",
    monthDate: "2025-12-01T00:00:00Z",
    learnings: [
      {
        id: "10",
        title: "Programação funcional com fp-ts",
        content:
          "Option e Either substituem null checks e try/catch com composição explícita de erros. A curva de aprendizado é alta, mas o código fica muito mais previsível.",
        tags: [
          { id: "t19", name: "fp", displayName: "FP" },
          { id: "t6", name: "typescript", displayName: "TypeScript" },
        ],
        createdAt: "2025-12-18T15:00:00Z",
      },
      {
        id: "11",
        title: "Reflexão sobre 2025",
        content:
          "Este ano aprendi mais sobre sistemas distribuídos e observabilidade do que qualquer outra coisa. A complexidade acidental ainda é meu maior inimigo.",
        tags: [
          { id: "t20", name: "reflexao", displayName: "Reflexão" },
          { id: "t21", name: "carreira", displayName: "Carreira" },
        ],
        createdAt: "2025-12-31T23:59:00Z",
      },
    ],
  },
];

export const MOCK_SINGLE_MONTH: MonthGroup[] = [MOCK_MONTH_GROUPS[0]];
