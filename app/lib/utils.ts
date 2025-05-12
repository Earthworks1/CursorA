import { format, isBefore, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(date: string | Date, dateFormat = 'dd/MM/yyyy') {
  try {
    return format(new Date(date), dateFormat);
  } catch {
    return '';
  }
}

export function isDatePassed(date: string | Date) {
  try {
    return isBefore(new Date(date), new Date());
  } catch {
    return false;
  }
}

// Fonction utilitaire pour concaténer des classes conditionnelles (supporte string, object, array)
export function cn(...inputs: (string | undefined | false | null | Record<string, boolean>)[]): string {
  return inputs
    .map(input => {
      if (!input) return '';
      if (typeof input === 'string') return input;
      if (typeof input === 'object') {
        return Object.entries(input)
          .filter(([_, value]) => !!value)
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

// Retourne une couleur en fonction du pourcentage de progression
export function getProgressColor(value: number): string {
  if (value < 30) return '#ef4444'; // rouge
  if (value < 70) return '#eab308'; // jaune
  return '#22c55e'; // vert
}

// Retourne une couleur en fonction du statut
export function getStatusColor(status: string): string {
  switch (status) {
    case 'termine':
    case 'done':
      return '#22c55e'; // vert
    case 'en_cours':
    case 'in_progress':
      return '#3b82f6'; // bleu
    case 'annule':
    case 'cancelled':
      return '#94a3b8'; // gris
    default:
      return '#eab308'; // jaune
  }
}

// Retourne un texte lisible pour le statut
export function getStatusText(status: string): string {
  switch (status) {
    case 'termine':
    case 'done':
      return 'Terminé';
    case 'en_cours':
    case 'in_progress':
      return 'En cours';
    case 'annule':
    case 'cancelled':
      return 'Annulé';
    case 'planifie':
    case 'planned':
      return 'Planifié';
    default:
      return status;
  }
}

// Formate une date avec l'heure (ex: 01/05/2024 14:30)
export function formatDateWithTime(date: string | Date, dateFormat = 'dd/MM/yyyy HH:mm') {
  try {
    return format(new Date(date), dateFormat);
  } catch {
    return '';
  }
}

// Retourne le temps écoulé depuis une date sous forme relative (ex: 'il y a 2 jours')
export function getTimeAgo(date: string | Date) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  } catch {
    return '';
  }
} 