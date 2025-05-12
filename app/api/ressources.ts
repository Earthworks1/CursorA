export const ressourcesApi = {
  getRessource: async (id: number) => ({
    id,
    nom: "Ressource " + id,
    type: "Interne",
    competences: ["Développement", "Design"],
    disponibilite: 80,
    charge: 65
  }),
  getRessources: async () => [
    {
      id: 1,
      nom: "Jean Dupont",
      type: "Interne",
      competences: ["Développement", "Design"],
      disponibilite: 80,
      charge: 65
    },
    {
      id: 2,
      nom: "Marie Martin",
      type: "Interne",
      competences: ["Gestion de projet", "Marketing"],
      disponibilite: 90,
      charge: 45
    }
  ],
  createRessource: async (_data: any) => ({}),
  updateRessource: async (_id: number, _data: any) => ({}),
  deleteRessource: async (_id: number) => ({})
}; 