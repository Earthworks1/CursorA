import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Clock, 
  FileEdit, 
  DownloadCloud, 
  Eye 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const plans = [
  {
    id: 1,
    nom: "Plan d'exécution fondations",
    type: "Exécution",
    chantier: "Centre commercial Grand Place",
    indice: "C",
    dateCreation: "2025-03-15",
    auteur: "Sophie Martin",
    auteurAvatar: "SM",
    taille: "4.2 MB",
    statut: "Validé"
  },
  {
    id: 2,
    nom: "Plan de coffrage dalle niveau 1",
    type: "Exécution",
    chantier: "Tour résidentielle Les Cèdres",
    indice: "B",
    dateCreation: "2025-03-18",
    auteur: "Pierre Dubois",
    auteurAvatar: "PD",
    taille: "3.8 MB",
    statut: "En révision"
  },
  {
    id: 3,
    nom: "Plan architectural façade principale",
    type: "Conception",
    chantier: "Tour résidentielle Les Cèdres",
    indice: "A",
    dateCreation: "2025-03-20",
    auteur: "Emma Leroy",
    auteurAvatar: "EL",
    taille: "5.1 MB",
    statut: "En attente"
  },
  {
    id: 4,
    nom: "Schéma réseaux hydrauliques",
    type: "Réseaux",
    chantier: "Pont municipal",
    indice: "D",
    dateCreation: "2025-03-10",
    auteur: "Thomas Bernard",
    auteurAvatar: "TB",
    taille: "2.7 MB",
    statut: "Validé"
  },
  {
    id: 5,
    nom: "Plan d'implantation",
    type: "Topographie",
    chantier: "Centre commercial Grand Place",
    indice: "B",
    dateCreation: "2025-03-05",
    auteur: "Lucas Petit",
    auteurAvatar: "LP",
    taille: "3.3 MB",
    statut: "Validé"
  }
];

const getStatutColor = (statut: string) => {
  switch (statut) {
    case "Validé":
      return "bg-green-100 text-green-800";
    case "En révision":
      return "bg-amber-100 text-amber-800";
    case "En attente":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Plans() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle 
          title="Plans et documents" 
          description="Consultez et gérez les plans et documents techniques"
        />
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Importer un plan
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  type="text" 
                  placeholder="Rechercher un plan..." 
                  className="pl-9" 
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-3.5 w-3.5" />
                Filtrer
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-3.5 w-3.5" />
                Date
              </Button>
              <Button variant="outline" size="sm">
                <User className="mr-2 h-3.5 w-3.5" />
                Auteur
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-3.5 w-3.5" />
                Type
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gray-100 flex items-center justify-center border-b">
              <FileText className="h-16 w-16 text-gray-400" />
            </div>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-base">{plan.nom}</h3>
                  <p className="text-sm text-gray-500">{plan.chantier}</p>
                </div>
                <Badge className={getStatutColor(plan.statut)}>{plan.statut}</Badge>
              </div>
              
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Clock className="mr-1 h-3.5 w-3.5" />
                <span>Indice {plan.indice} • {plan.dateCreation}</span>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarFallback className="text-xs">{plan.auteurAvatar}</AvatarFallback>
                </Avatar>
                <span>{plan.auteur}</span>
                <span className="mx-2">•</span>
                <span>{plan.taille}</span>
              </div>
              
              <div className="flex mt-4 pt-2 border-t">
                <Button variant="ghost" size="sm" className="mr-2">
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  Voir
                </Button>
                <Button variant="ghost" size="sm" className="mr-2">
                  <DownloadCloud className="mr-1 h-3.5 w-3.5" />
                  Télécharger
                </Button>
                <Button variant="ghost" size="sm">
                  <FileEdit className="mr-1 h-3.5 w-3.5" />
                  Réviser
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}