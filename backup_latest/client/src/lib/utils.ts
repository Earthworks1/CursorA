import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'a_faire':
      return 'bg-gray-100 text-gray-800';
    case 'en_cours':
      return 'bg-blue-100 text-blue-800';
    case 'termine':
      return 'bg-green-100 text-green-800';
    case 'en_retard':
      return 'bg-red-100 text-red-800';
    case 'en_validation':
      return 'bg-yellow-100 text-yellow-800';
    case 'en_revision':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusText(status: string): string {
  switch (status?.toLowerCase()) {
    case 'a_faire':
      return 'À faire';
    case 'en_cours':
      return 'En cours';
    case 'termine':
      return 'Terminé';
    case 'en_retard':
      return 'En retard';
    case 'en_validation':
      return 'En validation';
    case 'en_revision':
      return 'En révision';
    default:
      return status?.replace(/_/g, ' ') || 'Inconnu';
  }
}

export function getProgressColor(progress: number): string {
  if (progress < 25) return 'bg-red-500';
  if (progress < 50) return 'bg-orange-500';
  if (progress < 75) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function formatDateToFr(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatDateWithTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Vérifie si une date est dépassée
export function isDatePassed(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Comparer juste la date, pas l'heure
  return d < today;
}

// Fonction pour obtenir une description relative du temps écoulé
export function getTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  // Conversion en différentes unités de temps
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  
  // Formater le résultat en français
  if (diffSecs < 60) {
    return 'à l\'instant';
  } else if (diffMins < 60) {
    return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffWeeks < 4) {
    return `il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
  } else if (diffMonths < 12) {
    return `il y a ${diffMonths} mois`;
  } else {
    return formatDateToFr(date);
  }
}

// Alias pour compatibilité avec le code existant
export const formatDate = formatDateToFr;