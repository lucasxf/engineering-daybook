"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { Learning } from "@/lib/types";

interface LearningCardProps {
  learning: Learning;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
  return formatDate(dateString);
}

export function LearningCard({ learning, onEdit, onDelete }: LearningCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Card
      className="group relative cursor-pointer hover:border-l-[3px] hover:border-l-[var(--accent)] hover:shadow-md dark:hover:shadow-[var(--accent)]/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-2 pr-16">{learning.title}</CardTitle>

          {/* Quick actions */}
          <div
            className={`absolute right-4 top-4 flex gap-1 transition-opacity duration-150 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(learning.id);
              }}
              className="rounded p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--secondary)]/20 hover:text-[var(--foreground)]"
              aria-label="Editar aprendizado"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(learning.id);
              }}
              className="rounded p-1.5 text-[var(--muted)] transition-colors hover:bg-red-500/10 hover:text-red-500"
              aria-label="Excluir aprendizado"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">
          {learning.content}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3">
        {/* Tags */}
        {learning.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {learning.tags.map((tag) => (
              <Badge key={tag.id} variant="tag">
                {tag.displayName}
              </Badge>
            ))}
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-[var(--muted-foreground)]">
          <span>Criado em {formatDate(learning.createdAt)}</span>
          <span className="mx-1.5">·</span>
          <span>Atualizado {formatRelativeDate(learning.updatedAt)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
