"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  learningCount: number;
  showCta?: boolean;
}

export function PageHeader({ learningCount, showCta = true }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
          Meus Aprendizados
        </h1>
        {learningCount > 0 && (
          <Badge variant="count">{learningCount} aprendizados</Badge>
        )}
      </div>

      {showCta && (
        <Button>
          <Plus className="h-4 w-4" />
          Novo Aprendizado
        </Button>
      )}
    </div>
  );
}
