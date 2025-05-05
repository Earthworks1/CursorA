import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart2, PieChart, TrendingUp } from "lucide-react";

export default function Rapports() {
  return (
    <div className="space-y-6">
      <PageTitle 
        title="Rapports" 
        description="Consultez et générez des rapports sur les projets et les tâches"
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Avancement des chantiers
            </CardTitle>
            <CardDescription>
              Rapport détaillé sur l'avancement actuel des chantiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Inclut les statistiques d'avancement, les jalons atteints et à venir, ainsi que les retards éventuels.
            </p>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Générer le rapport
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <BarChart2 className="mr-2 h-5 w-5 text-primary" />
              Tâches en retard
            </CardTitle>
            <CardDescription>
              Analyse des causes de retard et propositions d'actions correctives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Analyse des causes de retard et propositions d'actions correctives.
            </p>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Générer le rapport
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <PieChart className="mr-2 h-5 w-5 text-primary" />
              Répartition des tâches
            </CardTitle>
            <CardDescription>
              Analyse de la répartition des tâches par statut et par type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Vue d'ensemble de la distribution des tâches selon leur nature et leur état d'avancement.
            </p>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Générer le rapport
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Productivité mensuelle
            </CardTitle>
            <CardDescription>
              Évolution de la productivité sur les 12 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Analyse des tendances de productivité, identification des périodes de pic et de creux.
            </p>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Générer le rapport
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Rapports personnalisés</CardTitle>
          <CardDescription>
            Créez des rapports sur mesure en fonction de vos besoins spécifiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Sélectionnez les métriques, les périodes et les chantiers à inclure dans votre rapport personnalisé.
          </p>
          <Button variant="outline" className="mr-2">
            Configurer un rapport
          </Button>
          <Button>
            Créer un nouveau modèle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}