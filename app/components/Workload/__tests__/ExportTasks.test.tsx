import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportTasks } from '../ExportTasks';
import { Task } from '@/types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

// Mock des dépendances externes
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

jest.mock('jspdf', () => {
  const mockJsPDF = jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
    internal: {
      pageSize: {
        getWidth: () => 210,
      },
    },
    autoTable: jest.fn(),
  }));
  return mockJsPDF;
});

// Données de test
const mockTasks: Task[] = [
  {
    id: '1',
    type: 'FORMATION',
    description: 'Formation React',
    startTime: '2024-04-01T09:00:00Z',
    endTime: '2024-04-01T17:00:00Z',
    status: 'PLANIFIE',
    chantier: {
      id: '1',
      nom: 'Projet Test',
    },
    pilote: {
      id: '1',
      prenom: 'John',
      nom: 'Doe',
    },
    assignedUser: {
      id: '2',
      prenom: 'Jane',
      nom: 'Smith',
    },
    assignedTo: '2',
    chantierId: '1',
    piloteId: '1',
  },
  {
    id: '2',
    type: 'INTERVENTION',
    description: 'Intervention client',
    startTime: '2024-04-02T10:00:00Z',
    endTime: '2024-04-02T12:00:00Z',
    status: 'EN_COURS',
    chantier: {
      id: '2',
      nom: 'Projet Client',
    },
    pilote: null,
    assignedUser: {
      id: '1',
      prenom: 'John',
      nom: 'Doe',
    },
    assignedTo: '1',
    chantierId: '2',
    piloteId: null,
  },
];

describe('ExportTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders export button correctly', () => {
    render(<ExportTasks tasks={mockTasks} />);
    
    const exportButton = screen.getByRole('button', { name: /exporter/i });
    expect(exportButton).toBeInTheDocument();
  });

  it('shows export options when clicking the button', () => {
    render(<ExportTasks tasks={mockTasks} />);
    
    const exportButton = screen.getByRole('button', { name: /exporter/i });
    fireEvent.click(exportButton);

    expect(screen.getByText('Exporter en Excel')).toBeInTheDocument();
    expect(screen.getByText('Exporter en PDF')).toBeInTheDocument();
  });

  it('exports to Excel with correct data format', () => {
    render(<ExportTasks tasks={mockTasks} />);
    
    const exportButton = screen.getByRole('button', { name: /exporter/i });
    fireEvent.click(exportButton);
    
    const excelOption = screen.getByText('Exporter en Excel');
    fireEvent.click(excelOption);

    // Vérifie que les fonctions XLSX ont été appelées correctement
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalled();
  });

  it('exports to PDF with correct data format', () => {
    render(<ExportTasks tasks={mockTasks} />);
    
    const exportButton = screen.getByRole('button', { name: /exporter/i });
    fireEvent.click(exportButton);
    
    const pdfOption = screen.getByText('Exporter en PDF');
    fireEvent.click(pdfOption);

    // Vérifie que jsPDF a été instancié et que les méthodes ont été appelées
    expect(jsPDF).toHaveBeenCalled();
    const pdfInstance = (jsPDF as jest.Mock).mock.results[0].value;
    expect(pdfInstance.setFontSize).toHaveBeenCalled();
    expect(pdfInstance.text).toHaveBeenCalled();
    expect(pdfInstance.autoTable).toHaveBeenCalled();
    expect(pdfInstance.save).toHaveBeenCalled();
  });

  it('handles empty tasks array', () => {
    render(<ExportTasks tasks={[]} />);
    
    const exportButton = screen.getByRole('button', { name: /exporter/i });
    fireEvent.click(exportButton);
    
    const excelOption = screen.getByText('Exporter en Excel');
    fireEvent.click(excelOption);

    // Vérifie que l'export fonctionne même avec un tableau vide
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([]);
  });

  it('handles tasks with missing optional data', () => {
    const tasksWithMissingData: Task[] = [{
      id: '3',
      type: 'REUNION',
      description: 'Réunion sans pilote',
      startTime: '2024-04-03T14:00:00Z',
      endTime: '2024-04-03T15:00:00Z',
      status: 'PLANIFIE',
      chantier: null,
      pilote: null,
      assignedUser: null,
      assignedTo: null,
      chantierId: null,
      piloteId: null,
    }];

    render(<ExportTasks tasks={tasksWithMissingData} />);
    
    const exportButton = screen.getByRole('button', { name: /exporter/i });
    fireEvent.click(exportButton);
    
    const pdfOption = screen.getByText('Exporter en PDF');
    fireEvent.click(pdfOption);

    // Vérifie que l'export fonctionne avec des données manquantes
    expect(jsPDF).toHaveBeenCalled();
    const pdfInstance = (jsPDF as jest.Mock).mock.results[0].value;
    expect(pdfInstance.autoTable).toHaveBeenCalled();
  });
}); 