import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VisibilityPicker } from '@/components/poks/VisibilityPicker';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';

const messages = {
  poks: {
    visibility: {
      private: 'Private',
      public: 'Public',
      pickerLabel: 'Visibility',
      publicWarning: 'Public learnings cannot be made private again.',
    },
  },
};

function renderPicker(value: 'PRIVATE' | 'PUBLIC', onChange = vi.fn()) {
  return {
    onChange,
    ...render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <VisibilityPicker value={value} onChange={onChange} />
      </NextIntlClientProvider>
    ),
  };
}

describe('VisibilityPicker', () => {
  it('shows the currently selected value', () => {
    renderPicker('PRIVATE');
    expect(screen.getByText(/Private/)).toBeInTheDocument();
  });

  it('shows public warning when PUBLIC is selected', () => {
    renderPicker('PUBLIC');
    expect(screen.getByText(/cannot be made private/i)).toBeInTheDocument();
  });

  it('does not show public warning when PRIVATE is selected', () => {
    renderPicker('PRIVATE');
    expect(screen.queryByText(/cannot be made private/i)).not.toBeInTheDocument();
  });

  it('calls onChange when a new option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderPicker('PRIVATE', onChange);

    // Open the dropdown
    const button = screen.getByRole('combobox');
    await user.click(button);

    // Select Public
    const publicOption = screen.getByRole('option', { name: /public/i });
    await user.click(publicOption);

    expect(onChange).toHaveBeenCalledWith('PUBLIC');
  });
});
