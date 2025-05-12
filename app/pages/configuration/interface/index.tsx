import { useTheme } from "@/contexts/ThemeContext";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  RotateCcw,
  Moon,
  Sun,
  Monitor,
  PaintBucket,
  Save
} from "lucide-react";

export default function InterfaceSettings() {
  const { preferences, updatePreferences, resetToDefaults } = useTheme();
  const [_, setLocation] = useLocation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle
          title="Personnalisation de l'interface"
          description="Personnalisez l'apparence et le comportement de l'application"
        />
        <Button variant="outline" onClick={() => setLocation('/configuration')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour aux paramètres
        </Button>
      </div>

      <Tabs defaultValue="appearance">
        <TabsList className="mb-6">
          <TabsTrigger value="appearance" className="flex items-center">
            <PaintBucket className="h-4 w-4 mr-2" />
            Apparence
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center">
            <PaintBucket className="h-4 w-4 mr-2" />
            Disposition
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center">
            <PaintBucket className="h-4 w-4 mr-2" />
            Comportement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Thème</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Mode</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer hover:border-primary ${preferences.mode === 'light' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => updatePreferences({ mode: 'light' })}
                    >
                      <Sun className="h-6 w-6" />
                      <span className="text-sm">Clair</span>
                    </div>
                    
                    <div 
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer hover:border-primary ${preferences.mode === 'dark' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => updatePreferences({ mode: 'dark' })}
                    >
                      <Moon className="h-6 w-6" />
                      <span className="text-sm">Sombre</span>
                    </div>
                    
                    <div 
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer hover:border-primary ${preferences.mode === 'system' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => updatePreferences({ mode: 'system' })}
                    >
                      <Monitor className="h-6 w-6" />
                      <span className="text-sm">Système</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Couleur d'accent</h3>
                  <RadioGroup 
                    value={preferences.accentColor}
                    onValueChange={(value) => updatePreferences({ accentColor: value as any })}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bleu" id="bleu" />
                        <Label htmlFor="bleu" className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-blue-500" />
                          Bleu
                        </Label>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="vert" id="vert" />
                        <Label htmlFor="vert" className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-green-500" />
                          Vert
                        </Label>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="orange" id="orange" />
                        <Label htmlFor="orange" className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-orange-500" />
                          Orange
                        </Label>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="violet" id="violet" />
                        <Label htmlFor="violet" className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full bg-purple-500" />
                          Violet
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Densité et animations</CardTitle>
                <CardDescription>
                  Ajustez l'espacement et les animations de l'interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Densité de l'interface</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant={preferences.density === 'compact' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => updatePreferences({ density: 'compact' })}
                      >
                        Compact
                      </Button>
                      <Button 
                        variant={preferences.density === 'standard' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => updatePreferences({ density: 'standard' })}
                      >
                        Standard
                      </Button>
                      <Button 
                        variant={preferences.density === 'confortable' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => updatePreferences({ density: 'confortable' })}
                      >
                        Confortable
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm mb-2">Aperçu de la densité</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Button size="sm">Petit</Button>
                      <Button>Normal</Button>
                      <Button size="lg">Grand</Button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs">Texte XS</span>
                      <span className="text-sm">Texte SM</span>
                      <span className="text-base">Texte Base</span>
                      <span className="text-lg">Texte LG</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animations">Animations</Label>
                    <Switch 
                      id="animations" 
                      checked={preferences.animations}
                      onCheckedChange={(checked) => updatePreferences({ animations: checked })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Activer ou désactiver les animations de l'interface
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sidebar-collapsed">Barre latérale réduite</Label>
                    <Switch 
                      id="sidebar-collapsed" 
                      checked={preferences.sidebarCollapsed}
                      onCheckedChange={(checked) => updatePreferences({ sidebarCollapsed: checked })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Afficher uniquement les icônes dans la barre latérale
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>Disposition de l'interface</CardTitle>
              <CardDescription>
                Configurez la mise en page et l'affichage des éléments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  La personnalisation de la disposition sera disponible dans une prochaine mise à jour.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle>Comportement de l'interface</CardTitle>
              <CardDescription>
                Configurez le comportement et les interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  La personnalisation du comportement sera disponible dans une prochaine mise à jour.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser aux valeurs par défaut
        </Button>
        
        <Button className="gap-2" onClick={() => setLocation('/configuration')}>
          <Save className="h-4 w-4" />
          Enregistrer et fermer
        </Button>
      </div>
    </div>
  );
}