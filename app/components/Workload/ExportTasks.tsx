import React from 'react';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportTasksProps {
  tasks: Task[];
  className?: string;
}

export function ExportTasks({ tasks, className }: ExportTasksProps) {
  const exportToExcel = () => {
    // Préparation des données pour Excel
    const data = tasks.map(task => ({
      'Type': task.type,
      'Description': task.description,
      'Date de début': format(new Date(task.startTime), 'dd/MM/yyyy HH:mm', { locale: fr }),
      'Date de fin': format(new Date(task.endTime), 'dd/MM/yyyy HH:mm', { locale: fr }),
      'Statut': task.status,
      'Chantier': task.chantier?.nom || 'Non assigné',
      'Pilote': task.pilote ? `${task.pilote.prenom} ${task.pilote.nom}` : 'Non assigné',
      'Assigné à': task.assignedUser ? `${task.assignedUser.prenom} ${task.assignedUser.nom}` : 'Non assigné',
    }));

    // Création du workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tâches');

    // Génération du fichier
    const fileName = `taches_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // En-tête
    doc.setFontSize(20);
    doc.text('Planning des tâches', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, pageWidth / 2, 30, { align: 'center' });

    // Préparation des données pour le tableau
    const tableData = tasks.map(task => [
      task.type,
      task.description,
      format(new Date(task.startTime), 'dd/MM/yyyy HH:mm', { locale: fr }),
      format(new Date(task.endTime), 'dd/MM/yyyy HH:mm', { locale: fr }),
      task.status,
      task.chantier?.nom || 'Non assigné',
      task.assignedUser ? `${task.assignedUser.prenom} ${task.assignedUser.nom}` : 'Non assigné',
    ]);

    // Configuration du tableau
    (doc as any).autoTable({
      startY: 40,
      head: [['Type', 'Description', 'Début', 'Fin', 'Statut', 'Chantier', 'Assigné à']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Type
        1: { cellWidth: 40 }, // Description
        2: { cellWidth: 25 }, // Début
        3: { cellWidth: 25 }, // Fin
        4: { cellWidth: 20 }, // Statut
        5: { cellWidth: 30 }, // Chantier
        6: { cellWidth: 30 }, // Assigné à
      },
    });

    // Génération du fichier
    const fileName = `taches_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exporter en Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exporter en PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 