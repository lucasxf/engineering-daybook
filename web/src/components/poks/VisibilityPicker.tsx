'use client';

import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/Select';
import type { PokVisibility } from '@/lib/pokApi';

interface VisibilityPickerProps {
  value: PokVisibility;
  onChange: (visibility: PokVisibility) => void;
  locked?: boolean;
}

/**
 * Dropdown control for selecting a learning's visibility (private or public).
 * Warns users that making a learning public is irreversible.
 */
export function VisibilityPicker({ value, onChange, locked = false }: VisibilityPickerProps) {
  const t = useTranslations('poks.visibility');

  const options = [
    { value: 'PRIVATE' as PokVisibility, label: `🔒 ${t('private')}` },
    { value: 'PUBLIC' as PokVisibility, label: `🌐 ${t('public')}` },
  ];

  return (
    <div>
      <Select
        options={options}
        value={value}
        onChange={locked ? () => {} : (v) => onChange(v as PokVisibility)}
        label={t('pickerLabel')}
        disabled={locked}
      />
      {value === 'PUBLIC' && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
          {t('publicWarning')}
        </p>
      )}
    </div>
  );
}
