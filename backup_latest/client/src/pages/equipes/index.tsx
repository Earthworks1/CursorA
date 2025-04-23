import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Phone, Mail, Building2, ChevronRight } from "lucide-react";

const equipes = [
  {
    id: 1,
    nom: "Équipe conception",
    membres: [
      { id: 1, nom: "Martin", prenom: "Sophie", role: "Architecte", avatar: "SM", projet: "Pont municipal", email: "s.martin@example.fr", tel: "06 12 34 56 78" },
      { id: 2, nom: "Dubois", prenom: "Pierre", role: "Ingénieur structure", avatar: "PD", projet: "Tour résidentielle", email: "p.dubois@example.fr", tel: "06 23 45 67 89" },
      { id: 3, nom: "Leroy", prenom: "Emma", role: "Dessinatrice", avatar: "EL", projet: "Centre commercial", email: "e.leroy@example.fr", tel: "06 34 56 78 90" },
    ]
  },
  {
    id: 2,
    nom: "Équipe exécution",
    membres: [
      { id: 4, nom: "Bernard", prenom: "Thomas", role: "Chef de chantier", avatar: "TB", projet: "Centre commercial", email: "t.bernard@example.fr", tel: "06 45 67 89 01" },
      { id: 5, nom: "Moreau", prenom: "Julie", role: "Conductrice de travaux", avatar: "JM", projet: "Tour résidentielle", email: "j.moreau@example.fr", tel: "06 56 78 90 12" },
      { id: 6, nom: "Petit", prenom: "Lucas", role: "Géomètre", avatar: "LP", projet: "Pont municipal", email: "l.petit@example.fr", tel: "06 67 89 01 23" },
    ]
  },
  {
    id: 3,
    nom: "Équipe validation",
    membres: [
      { id: 7, nom: "Durand", prenom: "Marie", role: "Responsable qualité", avatar: "MD", projet: "Tour résidentielle", email: "m.durand@example.fr", tel: "06 78 90 12 34" },
      { id: 8, nom: "Robert", prenom: "Louis", role: "Inspecteur", avatar: "LR", projet: "Pont municipal", email: "l.robert@example.fr", tel: "06 89 01 23 45" },
    ]
  }
];

export default function Equipes() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle 
          title="Équipes" 
          description="Gérez les équipes et leurs membres"
        />
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un membre
        </Button>
      </div>
      
      <div className="space-y-6">
        {equipes.map((equipe) => (
          <Card key={equipe.id}>
            <CardHeader>
              <CardTitle>{equipe.nom}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {equipe.membres.map((membre) => (
                  <div key={membre.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                    <Avatar className="h-12 w-12 border">
                      <AvatarFallback>{membre.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{membre.prenom} {membre.nom}</h3>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">{membre.role}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Building2 className="h-3.5 w-3.5 mr-1" />
                        <span>{membre.projet}</span>
                      </div>
                      <div className="flex flex-col space-y-1 mt-2">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          <span>{membre.tel}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          <span>{membre.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}