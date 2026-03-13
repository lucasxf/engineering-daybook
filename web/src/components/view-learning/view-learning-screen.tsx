"use client";

import { useState } from "react";
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

export type ViewLearningScreenProps =
  | { state: "loaded"; learning: Learning; onDeleteConfirm?: () => void; onEditClick?: () => void }
  | { state: "loading" | "not-found" | "forbidden"; learning?: never; onDeleteConfirm?: () => void; onEditClick?: () => void };

export function ViewLearningScreen(props: ViewLearningScreenProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteClick = () => setDeleteOpen(true);
  const handleDeleteCancel = () => setDeleteOpen(false);
  const handleDeleteConfirmInternal = () => {
    setDeleteOpen(false);
    props.onDeleteConfirm?.();
  };

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
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col px-4 py-8 outline-none">
        <div className="mx-auto w-full max-w-[720px]">
          {props.state === "loading" ? (
            <LearningLoading />
          ) : props.state === "not-found" ? (
            <LearningError type="not-found" />
          ) : props.state === "forbidden" ? (
            <LearningError type="forbidden" />
          ) : props.state === "loaded" ? (
            <>
              {/* Breadcrumb */}
              <LearningBreadcrumb />

              {/* Content */}
              <LearningContent
                learning={props.learning}
                onDeleteClick={handleDeleteClick}
                onEditClick={props.onEditClick}
              />
            </>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground" suppressHydrationWarning>
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
