'use client';

import { useTranslations } from 'next-intl';
import { Select } from '@/components/ui/Select';
import type { Visibility } from './VisibilityBadge';

interface VisibilityPickerProps {
  value: Visibility;
  onChange: (visibility: Visibility) => void;
}

/**
 * Dropdown control for selecting a learning's visibility (private or public).
 * Warns users that making a learning public is irreversible.
 */
export function VisibilityPicker({ value, onChange }: VisibilityPickerProps) {
  const t = useTranslations('poks.visibility');

  const options = [
    { value: 'PRIVATE' as Visibility, label: `🔒 ${t('private')}` },
    { value: 'PUBLIC' as Visibility, label: `🌐 ${t('public')}` },
  ];

  return (
    <div>
      <Select
        options={options}
        value={value}
        onChange={(v) => onChange(v as Visibility)}
        label={t('pickerLabel')}
      />
      {value === 'PUBLIC' && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
          {t('publicWarning')}
        </p>
      )}
    </div>
  );
}
