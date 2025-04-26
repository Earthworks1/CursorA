import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from './TaskForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock du hook useToast avec Vitest
export const toastMock = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock })
}));

const defaultProps = {
  isOpen: true,
  onRequestClose: vi.fn(),
  taskToEdit: null,
  onSave: vi.fn(),
};

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('TaskForm', () => {
  it('affiche tous les champs du formulaire', () => {
    renderWithQueryClient(<TaskForm {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Description de la tâche/i)).toBeInTheDocument();
    expect(screen.getByText(/Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Site/i)).toBeInTheDocument();
    expect(screen.getByText(/Assigné à/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Début/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fin/i)).toBeInTheDocument();
    expect(screen.getByText(/Statut/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Notes/i)).toBeInTheDocument();
  });

  it('valide la présence de la description', async () => {
    renderWithQueryClient(<TaskForm {...defaultProps} />);
    fireEvent.click(screen.getByText(/Sauvegarder/i));
    const descriptionInput = screen.getByPlaceholderText(/Description de la tâche/i);
    fireEvent.focus(descriptionInput);
    fireEvent.blur(descriptionInput);
    await screen.findByText(/Requis/i, { exact: false });
  });

  it('valide que la date de fin doit être après la date de début', async () => {
    const { container } = renderWithQueryClient(<TaskForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test tâche' } });
    fireEvent.change(screen.getByLabelText(/Début/i), { target: { value: '2024-05-01T10:00' } });
    fireEvent.change(screen.getByLabelText(/Fin/i), { target: { value: '2024-05-01T09:00' } });
    fireEvent.click(screen.getByText(/Sauvegarder/i));
    await waitFor(() => {
      // Vérifie que le toast mock a été appelé avec le bon message
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
        description: expect.stringContaining('date de fin doit être après la date de début')
      }));
    });
  });

  it('appelle onSave avec les bonnes données lors de la soumission', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderWithQueryClient(<TaskForm {...defaultProps} onSave={onSave} />);
    fireEvent.change(screen.getByPlaceholderText(/Description de la tâche/i), { target: { value: 'Nouvelle tâche' } });
    fireEvent.change(screen.getByLabelText(/Début/i), { target: { value: '2024-05-01T10:00' } });
    fireEvent.change(screen.getByLabelText(/Fin/i), { target: { value: '2024-05-01T12:00' } });
    fireEvent.click(screen.getByText(/Sauvegarder/i));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
      expect(onSave.mock.calls[0][0].description).toBe('Nouvelle tâche');
    });
  });
}); 