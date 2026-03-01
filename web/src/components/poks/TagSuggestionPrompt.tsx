'use client';

import { useState } from 'react';
import { TagSuggestion, tagApi } from '@/lib/tagApi';

interface TagSuggestionPromptProps {
  pokId: string;
  suggestions: TagSuggestion[];
  onResolved?: () => void;
}

/**
 * Renders PENDING AI tag suggestions for a POK as inline approve/reject prompts.
 *
 * Each suggestion shows the proposed tag name with two actions:
 * - Approve: assigns the tag with AI source
 * - Reject: dismisses the suggestion
 *
 * After all suggestions are resolved, the component disappears.
 */
export function TagSuggestionPrompt({ pokId, suggestions, onResolved }: TagSuggestionPromptProps) {
  const [pending, setPending] = useState<TagSuggestion[]>(suggestions);
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (pending.length === 0) return null;

  const handleApprove = async (suggestion: TagSuggestion) => {
    setProcessingId(suggestion.id);
    try {
      await tagApi.approveSuggestion(pokId, suggestion.id);
      const remaining = pending.filter((s) => s.id !== suggestion.id);
      setPending(remaining);
      if (remaining.length === 0) onResolved?.();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (suggestion: TagSuggestion) => {
    setProcessingId(suggestion.id);
    try {
      await tagApi.rejectSuggestion(pokId, suggestion.id);
      const remaining = pending.filter((s) => s.id !== suggestion.id);
      setPending(remaining);
      if (remaining.length === 0) onResolved?.();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div
      className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-2 dark:border-blue-700 dark:bg-blue-950"
      role="region"
      aria-label="Tag suggestions"
    >
      <p className="mb-1 text-xs font-medium text-blue-700 dark:text-blue-300">
        Suggested tags
      </p>
      <div className="flex flex-wrap gap-1">
        {pending.map((suggestion) => {
          const isProcessing = processingId === suggestion.id;
          return (
            <span
              key={suggestion.id}
              className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-white px-2 py-0.5 text-xs dark:border-blue-600 dark:bg-slate-800"
            >
              <span className="text-slate-700 dark:text-slate-300">{suggestion.suggestedName}</span>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleApprove(suggestion)}
                className="text-green-600 hover:text-green-800 disabled:opacity-50 dark:text-green-400"
                aria-label={`Add tag ${suggestion.suggestedName}`}
              >
                ✓
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleReject(suggestion)}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
                aria-label={`Dismiss tag ${suggestion.suggestedName}`}
              >
                ✕
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
