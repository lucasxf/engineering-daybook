'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  /** 'full' for detail pages, 'compact' for profile/list views */
  variant?: 'full' | 'compact';
  className?: string;
}

export function MarkdownContent({ content, variant = 'full', className }: MarkdownContentProps) {
  const proseClass = variant === 'full'
    ? 'prose prose-gray max-w-none dark:prose-invert'
    : 'prose prose-sm prose-gray max-w-none dark:prose-invert';

  return (
    <div className={cn(proseClass, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
