import { render, screen } from '@testing-library/react';
import { VisibilityBadge } from '@/components/poks/VisibilityBadge';
import { NextIntlClientProvider } from 'next-intl';

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

function renderBadge(visibility: 'PRIVATE' | 'PUBLIC') {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <VisibilityBadge visibility={visibility} />
    </NextIntlClientProvider>
  );
}

describe('VisibilityBadge', () => {
  it('renders "Private" label for PRIVATE visibility', () => {
    renderBadge('PRIVATE');
    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('renders "Public" label for PUBLIC visibility', () => {
    renderBadge('PUBLIC');
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('private badge has accessible aria-label', () => {
    renderBadge('PRIVATE');
    expect(screen.getByLabelText('Private')).toBeInTheDocument();
  });

  it('public badge has accessible aria-label', () => {
    renderBadge('PUBLIC');
    expect(screen.getByLabelText('Public')).toBeInTheDocument();
  });
});
