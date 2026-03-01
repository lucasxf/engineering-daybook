import { render, screen, fireEvent } from '@testing-library/react';
import { Select, SelectOption } from '@/components/ui/Select';

const options: SelectOption[] = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('Select', () => {
  it('renders the selected option in the trigger', () => {
    render(<Select options={options} value="b" onChange={vi.fn()} />);
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('is closed by default', () => {
    render(<Select options={options} value="a" onChange={vi.fn()} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens on click', () => {
    render(<Select options={options} value="a" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows all options when open', () => {
    render(<Select options={options} value="a" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('calls onChange with selected value', () => {
    const onChange = vi.fn();
    render(<Select options={options} value="a" onChange={onChange} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Option C'));
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('closes after selection', () => {
    render(<Select options={options} value="a" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Option B'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    render(<Select options={options} value="a" onChange={vi.fn()} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates with ArrowDown and selects with Enter', () => {
    const onChange = vi.fn();
    render(<Select options={options} value="a" onChange={onChange} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    // Move down once (focus index 0 → 1)
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('sets aria-activedescendant to focused option id during keyboard navigation', () => {
    render(<Select options={options} value="a" onChange={vi.fn()} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    // On open, focusedIndex is set to the index of the current value ('a' = 0)
    const initialDescendant = trigger.getAttribute('aria-activedescendant');
    expect(initialDescendant).toBeTruthy();
    // Move down: focusedIndex 0 → 1
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const nextDescendant = trigger.getAttribute('aria-activedescendant');
    expect(nextDescendant).toBeTruthy();
    expect(nextDescendant).not.toBe(initialDescendant);
    // The focused option <li> must have the matching id
    const focusedOption = document.getElementById(nextDescendant!);
    expect(focusedOption).toHaveTextContent('Option B');
  });
});
