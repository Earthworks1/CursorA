import { formatISO } from 'date-fns';

/**
 * Formate une date JS en string pour un input type datetime-local (YYYY-MM-DDTHH:mm)
 */
export function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return '';
  return formatISO(date).slice(0, 16);
} 