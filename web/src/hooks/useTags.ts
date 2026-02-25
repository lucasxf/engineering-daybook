'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tag, tagApi } from '@/lib/tagApi';

interface UseTagsReturn {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
  createTag: (name: string) => Promise<Tag | null>;
  deleteTag: (tagId: string) => Promise<void>;
  assignTag: (pokId: string, tagId: string) => Promise<void>;
  removeTag: (pokId: string, tagId: string) => Promise<void>;
}

/**
 * Hook for managing user tag subscriptions and POK–tag assignments.
 *
 * Loads the user's tags on mount and provides mutation methods that keep
 * the local state in sync without requiring a full refetch.
 */
export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    tagApi.list()
      .then((data) => {
        if (!cancelled) {
          setTags(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load tags');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const createTag = useCallback(async (name: string): Promise<Tag | null> => {
    try {
      const tag = await tagApi.create({ name });
      setTags((prev) => {
        // Idempotent — don't add duplicates
        if (prev.some((t) => t.id === tag.id)) return prev;
        return [...prev, tag];
      });
      return tag;
    } catch {
      setError('Failed to create tag');
      return null;
    }
  }, []);

  const deleteTag = useCallback(async (tagId: string): Promise<void> => {
    try {
      await tagApi.delete(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch {
      setError('Failed to delete tag');
    }
  }, []);

  const assignTag = useCallback(async (pokId: string, tagId: string): Promise<void> => {
    await tagApi.assign(pokId, tagId);
  }, []);

  const removeTag = useCallback(async (pokId: string, tagId: string): Promise<void> => {
    await tagApi.remove(pokId, tagId);
  }, []);

  return { tags, isLoading, error, createTag, deleteTag, assignTag, removeTag };
}
