import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  UserCog, 
  Lock, 
  Bell, 
  LogOut, 
  Smartphone, 
  Mail, 
  Upload,
  CheckCircle,
  XCircle 
} from "lucide-react";

export default function MonCompte() {
  return (
    <div className="space-y-6">
      <PageTitle 
        title="Mon compte" 
        description="Gérez vos informations personnelles et préférences"
      />
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <UserCog className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6 mb-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Thomas Durand" />
                      <AvatarFallback>TD</AvatarFallback>
                    </Avatar>
                    <div className="mt-4 sm:mt-0 text-center sm:text-left">
                      <h3 className="text-lg font-medium">Photo de profil</h3>
                      <p className="text-sm text-gray-500 mt-1 mb-4">
                        Cette photo sera utilisée sur votre profil et sur les chantiers.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Changer
                        </Button>
                        <Button variant="outline" size="sm">
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prenom">Prénom</Label>
                        <Input id="prenom" value="Thomas" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nom">Nom</Label>
                        <Input id="nom" value="Durand" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value="thomas.durand@example.fr" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input id="telephone" value="06 12 34 56 78" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Rôle</Label>
                      <Input id="role" value="Chef de projet" disabled />
                    </div>
                  </div>
                  
                  <Button className="w-full sm:w-auto">Enregistrer les modifications</Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de contact</CardTitle>
                  <CardDescription>
                    Comment les autres peuvent vous contacter
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm text-gray-500">thomas.durand@example.fr</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Validé</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 mr-3 text-gray-500" />
                      <div>
                        <div className="font-medium">Téléphone</div>
                        <div className="text-sm text-gray-500">06 12 34 56 78</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Validé</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Session actuelle</CardTitle>
                  <CardDescription>
                    Informations sur votre connexion actuelle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Dernière connexion</p>
                      <p className="text-sm text-gray-500">12 avril 2025, 14:32</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium">Appareil</p>
                    <p className="text-sm text-gray-500">Chrome sur Windows</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium">Adresse IP</p>
                    <p className="text-sm text-gray-500">192.168.1.1</p>
                  </div>
                  
                  <Button variant="destructive" className="mt-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mot de passe</CardTitle>
                <CardDescription>
                  Changez votre mot de passe pour sécuriser votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  
                  <Button className="w-full sm:w-auto">Mettre à jour le mot de passe</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Authentification à deux facteurs</CardTitle>
                <CardDescription>
                  Renforcez la sécurité de votre compte avec l'authentification à deux facteurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">SMS</h4>
                      <p className="text-sm text-gray-500">
                        Recevez un code de vérification par SMS
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Activé</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Authenticator</h4>
                      <p className="text-sm text-gray-500">
                        Utilisez une application d'authentification
                      </p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Désactivé</Badge>
                  </div>
                  
                  <Button variant="outline" className="w-full sm:w-auto">
                    Gérer les options
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>
                Choisissez quand et comment vous souhaitez être notifié
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Notifications par email</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Nouvelles tâches</h4>
                      <p className="text-sm text-gray-500">
                        Lorsqu'une nouvelle tâche vous est assignée
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Tâches en retard</h4>
                      <p className="text-sm text-gray-500">
                        Lorsqu'une de vos tâches approche de sa date limite
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Nouvelles révisions</h4>
                      <p className="text-sm text-gray-500">
                        Lorsqu'une révision est demandée sur vos documents
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Notifications dans l'application</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Activité sur les chantiers</h4>
                      <p className="text-sm text-gray-500">
                        Mises à jour et événements sur vos chantiers
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-medium">Commentaires</h4>
                      <p className="text-sm text-gray-500">
                        Lorsque quelqu'un commente sur vos tâches ou documents
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-gray-300" />
                    </div>
                  </div>
                </div>
                
                <Button className="mt-4">Enregistrer les préférences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}