import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('adds an idea from the form', () => {
    render(<App />);
    const input = screen.getByLabelText('New idea');

    fireEvent.change(input, { target: { value: 'Ship a prototype' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Ship a prototype')).toBeInTheDocument();
  });

  it('removes an idea', () => {
    render(<App />);
    const input = screen.getByLabelText('New idea');
    fireEvent.change(input, { target: { value: 'Temporary idea' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    fireEvent.click(screen.getByRole('button', { name: 'Remove Temporary idea' }));

    expect(screen.queryByText('Temporary idea')).not.toBeInTheDocument();
  });
});
