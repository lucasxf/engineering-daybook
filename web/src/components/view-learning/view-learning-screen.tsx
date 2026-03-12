"use client";

import { useState, useEffect } from "react";
import { LearningNavBar } from "./learning-nav-bar";
import { LearningBreadcrumb } from "./learning-breadcrumb";
import { LearningContent } from "./learning-content";
import { LearningLoading } from "./learning-loading";
import { LearningError } from "./learning-error";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

export type ScreenState =
  | "loaded"
  | "no-title"
  | "loading"
  | "not-found"
  | "forbidden"
  | "delete-open"
  | "error-404"
  | "error-403"
  | "deleting"
  | "deleted";

interface ViewLearningScreenProps {
  theme?: "dark" | "light";
  screenState?: ScreenState;
  /** For demo page: accepts simplified state names */
  initialState?: string;
}

const MOCK_LEARNING = {
  id: "abc123",
  title: "Princípio da Inversão de Dependência (DIP)",
  content: `O **DIP** afirma que módulos de alto nível não devem depender de módulos de baixo nível — ambos devem depender de **abstrações**.

Isso significa que, ao invés de uma classe instanciar diretamente suas dependências, ela deve recebê-las via injeção (construtor, propriedade ou método).

### Exemplo em TypeScript

\`\`\`ts
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message);
  }
}

class UserService {
  constructor(private logger: Logger) {}

  createUser(name: string) {
    this.logger.log(\`Criando usuário: \${name}\`);
  }
}
\`\`\`

Benefícios:
- Facilita **testes unitários** com mocks
- Reduz acoplamento entre camadas
- Permite trocar implementações sem alterar o código cliente

> "Depend upon abstractions, not concretions." — Robert C. Martin`,
  createdAt: "2026-02-14T18:30:00.000Z",
  updatedAt: "2026-02-15T12:00:00.000Z",
  tags: ["SOLID", "TypeScript", "Design Patterns", "Clean Code"],
};

const MOCK_NO_TITLE = {
  ...MOCK_LEARNING,
  title: "",
  content: `Descobri que usar \`useMemo\` indiscriminadamente pode na verdade piorar a performance em componentes simples, porque o React ainda precisa comparar as dependências a cada render. A otimização prematura é o inimigo da clareza — só use quando o profiling confirmar o gargalo.`,
};

export function ViewLearningScreen({ theme, screenState, initialState }: ViewLearningScreenProps) {
  // Map demo state names to internal state names
  const mapState = (state?: string): ScreenState => {
    if (!state) return "loaded";
    switch (state) {
      case "error-404": return "not-found";
      case "error-403": return "forbidden";
      case "deleting": return "delete-open";
      case "deleted": return "loaded"; // Show loaded state with toast simulation
      default: return state as ScreenState;
    }
  };

  const currentState = mapState(initialState || screenState);
  const [deleteOpen, setDeleteOpen] = useState(currentState === "delete-open");
  const [showDeletedToast, setShowDeletedToast] = useState(initialState === "deleted");
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect system theme after hydration to avoid mismatch
  useEffect(() => {
    if (typeof window !== "undefined" && !theme) {
      setSystemDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    setMounted(true);
  }, [theme]);

  const isDark = theme ? theme === "dark" : systemDark;
  const isDeleteOpen = deleteOpen || currentState === "delete-open";

  const handleDeleteClick = () => setDeleteOpen(true);
  const handleDeleteCancel = () => setDeleteOpen(false);
  const handleDeleteConfirm = () => setDeleteOpen(false);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex min-h-screen flex-col bg-background font-sans">
        {/* Skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-card-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
        >
          Ir para o conteúdo principal
        </a>

        {/* Nav bar */}
        <LearningNavBar />

        {/* Main */}
        <main id="main-content" className="flex flex-1 flex-col px-4 py-8">
          <div className="mx-auto w-full max-w-[720px]">
            {currentState === "loading" ? (
              <LearningLoading />
            ) : currentState === "not-found" ? (
              <LearningError type="not-found" />
            ) : currentState === "forbidden" ? (
              <LearningError type="forbidden" />
            ) : (
              <>
                {/* Breadcrumb */}
                <LearningBreadcrumb />

                {/* Content */}
                <LearningContent
                  learning={currentState === "no-title" ? MOCK_NO_TITLE : MOCK_LEARNING}
                  onDeleteClick={handleDeleteClick}
                />
              </>
            )}

            {/* Deleted toast simulation */}
            {showDeletedToast && (
              <div
                role="status"
                aria-live="polite"
                className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
              >
                Aprendizado excluído com sucesso
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} learnimo
          </p>
        </footer>

        {/* Delete confirmation dialog */}
        {isDeleteOpen && (
          <DeleteConfirmDialog
            onCancel={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </div>
  );
}
