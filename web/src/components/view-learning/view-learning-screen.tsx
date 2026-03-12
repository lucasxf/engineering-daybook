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
  | "loading"
  | "not-found"
  | "forbidden";

export interface Learning {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface ViewLearningScreenProps {
  /** Current screen state */
  state: ScreenState;
  /** Learning data (required when state is "loaded") */
  learning?: Learning;
  /** Callback when delete is confirmed */
  onDeleteConfirm?: () => void;
  /** Callback when edit is clicked */
  onEditClick?: () => void;
}

export function ViewLearningScreen({ 
  state, 
  learning, 
  onDeleteConfirm,
  onEditClick,
}: ViewLearningScreenProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDeleteClick = () => setDeleteOpen(true);
  const handleDeleteCancel = () => setDeleteOpen(false);
  const handleDeleteConfirmInternal = () => {
    setDeleteOpen(false);
    onDeleteConfirm?.();
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
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
          {state === "loading" ? (
            <LearningLoading />
          ) : state === "not-found" ? (
            <LearningError type="not-found" />
          ) : state === "forbidden" ? (
            <LearningError type="forbidden" />
          ) : learning ? (
            <>
              {/* Breadcrumb */}
              <LearningBreadcrumb />

              {/* Content */}
              <LearningContent
                learning={learning}
                onDeleteClick={handleDeleteClick}
                onEditClick={onEditClick}
              />
            </>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} learnimo
        </p>
      </footer>

      {/* Delete confirmation dialog */}
      {deleteOpen && (
        <DeleteConfirmDialog
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirmInternal}
        />
      )}
    </div>
  );
}
