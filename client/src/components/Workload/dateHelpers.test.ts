import { formatDateForInput } from './dateHelpers';

describe('formatDateForInput', () => {
  it('formate une date JS en string YYYY-MM-DDTHH:mm', () => {
    const date = new Date('2024-05-01T14:30:00Z');
    // Le résultat dépend du fuseau horaire local, donc on vérifie juste le format
    const result = formatDateForInput(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('retourne une chaîne vide si la date est null', () => {
    expect(formatDateForInput(null)).toBe('');
  });

  it('retourne une chaîne vide si la date est undefined', () => {
    expect(formatDateForInput(undefined)).toBe('');
  });
}); 