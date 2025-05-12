export const rapportsApi = {
  getStatistiques: async () => ({
    totalTaches: 150,
    tachesTerminees: 75,
    tachesEnCours: 45,
    tachesEnRetard: 30,
    projets: 25,
    utilisateurs: 12,
    progression: {
      semaine: [65, 45, 78, 62, 70, 40, 20],
      mois: [250, 300, 280, 320, 290, 310],
      annee: [800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350]
    }
  }),
  getChargesTravail: async () => ({
    equipes: [
      { id: 1, nom: "Équipe A", charge: 85 },
      { id: 2, nom: "Équipe B", charge: 65 },
      { id: 3, nom: "Équipe C", charge: 45 }
    ],
    ressources: [
      { id: 1, nom: "Jean", charge: 90 },
      { id: 2, nom: "Marie", charge: 75 },
      { id: 3, nom: "Pierre", charge: 60 }
    ]
  }),
  getActivites: async () => [],
  getRapport: async (_id: number) => ({}),
  genererRapport: async (_params: any) => ({})
}; 