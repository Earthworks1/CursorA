import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConflictChecker } from '../ConflictChecker';
import { Task } from '@/types';

// Données de test
const mockTasks: Task[] = [
  {
    id: '1',
    type: 'FORMATION',
    description: 'Formation React',
    startTime: '2024-04-01T09:00:00Z',
    endTime: '2024-04-01T17:00:00Z',
    status: 'PLANIFIE',
    chantier: { id: '1', nom: 'Projet A' },
    pilote: { id: '1', prenom: 'John', nom: 'Doe' },
    assignedUser: { id: '2', prenom: 'Jane', nom: 'Smith' },
    assignedTo: '2',
    chantierId: '1',
    piloteId: '1',
  },
  {
    id: '2',
    type: 'INTERVENTION',
    description: 'Intervention client',
    startTime: '2024-04-01T10:00:00Z', // Chevauchement avec la tâche 1
    endTime: '2024-04-01T12:00:00Z',
    status: 'EN_COURS',
    chantier: { id: '1', nom: 'Projet A' }, // Même chantier que la tâche 1
    pilote: { id: '2', prenom: 'Jane', nom: 'Smith' },
    assignedUser: { id: '2', prenom: 'Jane', nom: 'Smith' }, // Même utilisateur que la tâche 1
    assignedTo: '2',
    chantierId: '1',
    piloteId: '2',
  },
  {
    id: '3',
    type: 'REUNION',
    description: 'Réunion équipe',
    startTime: '2024-04-02T14:00:00Z', // Pas de chevauchement
    endTime: '2024-04-02T15:00:00Z',
    status: 'PLANIFIE',
    chantier: { id: '2', nom: 'Projet B' },
    pilote: { id: '1', prenom: 'John', nom: 'Doe' },
    assignedUser: { id: '1', prenom: 'John', nom: 'Doe' },
    assignedTo: '1',
    chantierId: '2',
    piloteId: '1',
  },
];

describe('ConflictChecker', () => {
  const mockOnResolveConflict = jest.fn();

  beforeEach(() => {
    mockOnResolveConflict.mockClear();
  });

  it('renders nothing when there are no conflicts', () => {
    const { container } = render(
      <ConflictChecker tasks={[mockTasks[2]]} onResolveConflict={mockOnResolveConflict} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('detects and displays resource conflicts (same user, overlapping time)', () => {
    render(
      <ConflictChecker tasks={[mockTasks[0], mockTasks[1]]} onResolveConflict={mockOnResolveConflict} />
    );

    // Vérifie l'affichage de l'alerte de conflit critique
    expect(screen.getByText('Conflits critiques détectés')).toBeInTheDocument();
    expect(screen.getByText(/conflit\(s\) de ressource détecté\(s\)/i)).toBeInTheDocument();
  });

  it('detects and displays chantier conflicts (same chantier, overlapping time)', () => {
    render(
      <ConflictChecker tasks={[mockTasks[0], mockTasks[1]]} onResolveConflict={mockOnResolveConflict} />
    );

    // Vérifie l'affichage de l'alerte d'avertissement
    expect(screen.getByText('Avertissements')).toBeInTheDocument();
    expect(screen.getByText(/chevauchement\(s\) détecté\(s\)/i)).toBeInTheDocument();
  });

  it('shows conflict details when clicking the details button', () => {
    render(
      <ConflictChecker tasks={[mockTasks[0], mockTasks[1]]} onResolveConflict={mockOnResolveConflict} />
    );

    const detailsButton = screen.getByText(/voir les détails des conflits/i);
    fireEvent.click(detailsButton);

    // Vérifie l'affichage des détails des conflits
    expect(screen.getByText('Détails des conflits')).toBeInTheDocument();
    expect(screen.getByText('Conflit de ressource')).toBeInTheDocument();
    expect(screen.getByText('Conflit de chantier')).toBeInTheDocument();
  });

  it('calls onResolveConflict with correct parameters when resolving conflicts', () => {
    render(
      <ConflictChecker tasks={[mockTasks[0], mockTasks[1]]} onResolveConflict={mockOnResolveConflict} />
    );

    // Ouvre les détails des conflits
    const detailsButton = screen.getByText(/voir les détails des conflits/i);
    fireEvent.click(detailsButton);

    // Teste les différentes options de résolution
    const keepTask1Button = screen.getByText('Garder la tâche 1');
    fireEvent.click(keepTask1Button);
    expect(mockOnResolveConflict).toHaveBeenCalledWith(
      expect.objectContaining({
        task1: mockTasks[0],
        task2: mockTasks[1],
        type: 'SAME_USER',
        severity: 'ERROR',
      }),
      'KEEP_TASK1'
    );

    const modifyTask2Button = screen.getByText('Modifier la tâche 2');
    fireEvent.click(modifyTask2Button);
    expect(mockOnResolveConflict).toHaveBeenCalledWith(
      expect.objectContaining({
        task1: mockTasks[0],
        task2: mockTasks[1],
        type: 'SAME_USER',
        severity: 'ERROR',
      }),
      'MODIFY_TASK2'
    );
  });

  it('handles tasks with missing optional data', () => {
    const tasksWithMissingData: Task[] = [
      {
        id: '4',
        type: 'FORMATION',
        description: 'Formation sans pilote',
        startTime: '2024-04-03T09:00:00Z',
        endTime: '2024-04-03T17:00:00Z',
        status: 'PLANIFIE',
        chantier: null,
        pilote: null,
        assignedUser: null,
        assignedTo: null,
        chantierId: null,
        piloteId: null,
      },
      {
        id: '5',
        type: 'INTERVENTION',
        description: 'Intervention sans chantier',
        startTime: '2024-04-03T10:00:00Z',
        endTime: '2024-04-03T12:00:00Z',
        status: 'PLANIFIE',
        chantier: null,
        pilote: { id: '1', prenom: 'John', nom: 'Doe' },
        assignedUser: { id: '1', prenom: 'John', nom: 'Doe' },
        assignedTo: '1',
        chantierId: null,
        piloteId: '1',
      },
    ];

    render(
      <ConflictChecker tasks={tasksWithMissingData} onResolveConflict={mockOnResolveConflict} />
    );

    // Vérifie que le composant gère correctement les données manquantes
    expect(screen.getByText(/voir les détails des conflits/i)).toBeInTheDocument();
  });
}); 