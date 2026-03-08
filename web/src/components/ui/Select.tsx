'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Accessible custom select dropdown.
 *
 * - Click or Enter/Space to open
 * - Arrow keys to navigate, Enter/Space to select, Escape to close
 * - Closes on outside click
 */
export function Select({ options, value, onChange, label, className, disabled = false }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const labelId = useId();
  const listId = useId();
  const optionId = useId();

  const selectedOption = options.find((o) => o.value === value) ?? options[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Scroll focused option into view
  useEffect(() => {
    if (open && focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex] as HTMLElement | null;
      item?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [open, focusedIndex]);

  function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      const idx = options.findIndex((o) => o.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        const idx = options.findIndex((o) => o.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) handleSelect(options[focusedIndex].value);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && (
        <span id={labelId} className="sr-only">
          {label}
        </span>
      )}
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? labelId : undefined}
        aria-controls={listId}
        aria-activedescendant={open && focusedIndex >= 0 ? `${optionId}-${focusedIndex}` : undefined}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="inline-flex min-w-[10rem] items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{selectedOption?.label}</span>
        <svg
          aria-hidden="true"
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150', open && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full min-w-[10rem] overflow-y-auto rounded-md border border-border bg-card py-1 shadow-lg animate-slideUp"
        >
          {options.map((option, idx) => (
            <li
              key={option.value}
              id={`${optionId}-${idx}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm transition-colors',
                idx === focusedIndex
                  ? 'bg-primary/10 text-foreground'
                  : 'text-foreground hover:bg-muted/20',
                option.value === value && idx !== focusedIndex && 'font-medium'
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
