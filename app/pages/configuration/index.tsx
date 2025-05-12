import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Users, 
  Database, 
  Mail, 
  Cloud, 
  HardDrive, 
  FileArchive,
  AlertTriangle,
  DownloadCloud,
  Trash2,
  Loader2,
  Save
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Configuration() {
  return (
    <div className="space-y-6">
      <PageTitle 
        title="Configuration" 
        description="Paramètres généraux du système"
      />
      
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Base de données
          </TabsTrigger>
          <TabsTrigger value="mail" className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center">
            <Cloud className="h-4 w-4 mr-2" />
            Sauvegardes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Options générales</CardTitle>
                <CardDescription>
                  Paramètres généraux de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="app-name">Nom de l'application</Label>
                  <Input id="app-name" value="TP Suivi" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nom de l'entreprise</Label>
                  <Input id="company-name" value="BTP Solutions" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-lang">Langue par défaut</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger id="default-lang">
                      <SelectValue placeholder="Français" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="es">Espagnol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-timezone">Fuseau horaire</Label>
                  <Select defaultValue="europe-paris">
                    <SelectTrigger id="default-timezone">
                      <SelectValue placeholder="Europe/Paris" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="europe-paris">Europe/Paris</SelectItem>
                      <SelectItem value="europe-london">Europe/London</SelectItem>
                      <SelectItem value="america-new_york">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mode maintenance</Label>
                    <p className="text-sm text-gray-500">
                      Désactiver temporairement l'accès à l'application
                    </p>
                  </div>
                  <Switch id="maintenance-mode" />
                </div>
                
                <Button className="mt-4">Enregistrer</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Stockage des fichiers</CardTitle>
                <CardDescription>
                  Configuration du stockage des documents et plans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Type de stockage</Label>
                    <p className="text-sm text-gray-500">
                      Méthode utilisée pour stocker les fichiers
                    </p>
                  </div>
                  <Select defaultValue="local">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Local" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Stockage local</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="upload-path">Chemin d'upload par défaut</Label>
                  <Input id="upload-path" value="/var/www/uploads" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-file-size">Taille maximale des fichiers (MB)</Label>
                  <Input id="max-file-size" type="number" value="20" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compression automatique</Label>
                    <p className="text-sm text-gray-500">
                      Compresser automatiquement les fichiers volumineux
                    </p>
                  </div>
                  <Switch id="auto-compression" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Génération automatique de miniatures</Label>
                    <p className="text-sm text-gray-500">
                      Créer des aperçus pour les documents et images
                    </p>
                  </div>
                  <Switch id="auto-thumbnails" defaultChecked />
                </div>
                
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    Espace disque disponible : 18.2 GB / 50 GB (36%)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Paramètres liés aux utilisateurs et à l'authentification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-4">Authentification</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Longueur minimale du mot de passe</h4>
                        <p className="text-sm text-gray-500">
                          Nombre minimum de caractères requis
                        </p>
                      </div>
                      <Input 
                        type="number" 
                        className="w-16 text-center" 
                        value="8"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Authentification à deux facteurs</h4>
                        <p className="text-sm text-gray-500">
                          Obligatoire pour tous les utilisateurs
                        </p>
                      </div>
                      <Switch id="require-2fa" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Verrouillage de compte</h4>
                        <p className="text-sm text-gray-500">
                          Après plusieurs tentatives échouées
                        </p>
                      </div>
                      <Switch id="account-lockout" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Expiration des sessions</h4>
                        <p className="text-sm text-gray-500">
                          Délai avant déconnexion automatique
                        </p>
                      </div>
                      <Select defaultValue="24h">
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="24 heures" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 heure</SelectItem>
                          <SelectItem value="8h">8 heures</SelectItem>
                          <SelectItem value="24h">24 heures</SelectItem>
                          <SelectItem value="7d">7 jours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Autorisations</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Auto-inscription</h4>
                        <p className="text-sm text-gray-500">
                          Permettre aux utilisateurs de créer un compte
                        </p>
                      </div>
                      <Switch id="self-registration" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Validation email obligatoire</h4>
                        <p className="text-sm text-gray-500">
                          Pour les nouveaux comptes
                        </p>
                      </div>
                      <Switch id="email-verification" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Approbation administrateur</h4>
                        <p className="text-sm text-gray-500">
                          Requise pour les nouveaux comptes
                        </p>
                      </div>
                      <Switch id="admin-approval" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Journal d'activité utilisateur</h4>
                        <p className="text-sm text-gray-500">
                          Enregistrer toutes les activités
                        </p>
                      </div>
                      <Switch id="user-activity-log" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="mt-4">Enregistrer les paramètres</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de base de données</CardTitle>
              <CardDescription>
                Configuration et maintenance de la base de données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-4">Configuration</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="db-host">Hôte</Label>
                      <Input id="db-host" value="localhost" disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="db-name">Nom de la base</Label>
                      <Input id="db-name" value="tp_suivi_db" disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="db-user">Utilisateur</Label>
                      <Input id="db-user" value="app_user" disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="db-port">Port</Label>
                      <Input id="db-port" value="5432" disabled />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Maintenance</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 border rounded-md">
                      <div className="flex items-center mb-2">
                        <HardDrive className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="font-medium">Taille de la base de données</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Espace total utilisé: 156.8 MB</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '22%' }}></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-medium">Sauvegardes automatiques</h4>
                        <p className="text-sm text-gray-500">
                          Planifiées quotidiennement
                        </p>
                      </div>
                      <Switch id="auto-backup" defaultChecked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="backup-retention">Conservation des sauvegardes</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="backup-retention">
                          <SelectValue placeholder="30 jours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 jours</SelectItem>
                          <SelectItem value="14">14 jours</SelectItem>
                          <SelectItem value="30">30 jours</SelectItem>
                          <SelectItem value="90">90 jours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" className="flex items-center">
                        <FileArchive className="mr-2 h-4 w-4" />
                        Exporter les données
                      </Button>
                      <Button variant="outline" className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4" />
                        Optimiser la base
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mail">
          <Card>
            <CardHeader>
              <CardTitle>Configuration email</CardTitle>
              <CardDescription>
                Paramètres du serveur de messagerie pour les notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mail-driver">Pilote</Label>
                    <Select defaultValue="smtp">
                      <SelectTrigger id="mail-driver">
                        <SelectValue placeholder="SMTP" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP</SelectItem>
                        <SelectItem value="sendmail">Sendmail</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mail-from-name">Nom d'expéditeur</Label>
                    <Input id="mail-from-name" value="TP Suivi" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mail-from-address">Adresse d'expéditeur</Label>
                    <Input id="mail-from-address" value="notifications@tpsuivi.fr" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mail-reply-to">Adresse de réponse</Label>
                    <Input id="mail-reply-to" value="support@tpsuivi.fr" />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Configuration SMTP</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">Hôte SMTP</Label>
                      <Input id="smtp-host" value="smtp.example.fr" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">Port SMTP</Label>
                      <Input id="smtp-port" type="number" value="587" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp-username">Nom d'utilisateur</Label>
                      <Input id="smtp-username" value="smtp_user" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">Mot de passe</Label>
                      <Input id="smtp-password" type="password" value="********" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtp-encryption">Chiffrement</Label>
                      <Select defaultValue="tls">
                        <SelectTrigger id="smtp-encryption">
                          <SelectValue placeholder="TLS" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="none">Aucun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <Button className="flex items-center">
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer la configuration
                    </Button>
                    <Button variant="outline" className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Tester la connexion
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des sauvegardes</CardTitle>
              <CardDescription>
                Gestion des sauvegardes et restaurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-4">Sauvegardes automatiques</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Activer</h4>
                          <p className="text-sm text-gray-500">
                            Sauvegardes planifiées automatiques
                          </p>
                        </div>
                        <Switch id="enable-backups" defaultChecked />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backup-frequency">Fréquence</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger id="backup-frequency">
                            <SelectValue placeholder="Quotidienne" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Toutes les heures</SelectItem>
                            <SelectItem value="daily">Quotidienne</SelectItem>
                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                            <SelectItem value="monthly">Mensuelle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backup-time">Heure de sauvegarde</Label>
                        <Input id="backup-time" type="time" value="02:00" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backup-keep">Sauvegardes à conserver</Label>
                        <Input id="backup-keep" type="number" value="30" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Destination des sauvegardes</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="backup-storage">Type de stockage</Label>
                        <Select defaultValue="local">
                          <SelectTrigger id="backup-storage">
                            <SelectValue placeholder="Stockage local" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Stockage local</SelectItem>
                            <SelectItem value="s3">Amazon S3</SelectItem>
                            <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                            <SelectItem value="ftp">FTP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backup-path">Chemin de sauvegarde</Label>
                        <Input id="backup-path" value="/var/backups/tpsuivi" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Compression</h4>
                          <p className="text-sm text-gray-500">
                            Compresser les fichiers de sauvegarde
                          </p>
                        </div>
                        <Switch id="backup-compression" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Chiffrement</h4>
                          <p className="text-sm text-gray-500">
                            Chiffrer les fichiers de sauvegarde
                          </p>
                        </div>
                        <Switch id="backup-encryption" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t mt-6">
                  <h3 className="font-medium mb-4">Sauvegardes récentes</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center p-4 bg-gray-50 border rounded-md">
                      <div className="flex items-center">
                        <FileArchive className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <h4 className="font-medium">Sauvegarde complète</h4>
                          <p className="text-sm text-gray-500">12 avril 2025, 02:00 • 187 MB</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <DownloadCloud className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                        <Button variant="outline" size="sm">
                          Restaurer
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-gray-50 border rounded-md">
                      <div className="flex items-center">
                        <FileArchive className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <h4 className="font-medium">Sauvegarde complète</h4>
                          <p className="text-sm text-gray-500">11 avril 2025, 02:00 • 185 MB</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <DownloadCloud className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                        <Button variant="outline" size="sm">
                          Restaurer
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <Button>
                      Sauvegarder maintenant
                    </Button>
                    <Button variant="outline" className="flex items-center">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Nettoyer les anciennes sauvegardes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}