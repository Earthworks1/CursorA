export const rapportsApi = {
  getStatistiques: async () => {
    const response = await fetch('/api/rapports/statistiques');
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
    return response.json();
  },
  
  getChargesTravail: async (params?: { debut?: string; fin?: string }) => {
    const url = new URL('/api/rapports/charges-travail', window.location.origin);
    if (params?.debut) url.searchParams.append('debut', params.debut);
    if (params?.fin) url.searchParams.append('fin', params.fin);
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch workload report');
    }
    return response.json();
  },
  
  getAvancement: async (chantierId?: number) => {
    const url = new URL('/api/rapports/avancement', window.location.origin);
    if (chantierId) url.searchParams.append('chantierId', chantierId.toString());
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch progress report');
    }
    return response.json();
  },
}; 