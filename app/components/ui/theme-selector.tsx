import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Monitor,
  Moon,
  Sun,
  PaintBucket,
  LayoutGrid,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export function ThemeSelector() {
  const { preferences, updatePreferences } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {preferences.mode === 'light' ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : preferences.mode === 'dark' ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Monitor className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Apparence</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => updatePreferences({ mode: 'light' })}
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Clair</span>
            {preferences.mode === 'light' && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => updatePreferences({ mode: 'dark' })}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Sombre</span>
            {preferences.mode === 'dark' && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => updatePreferences({ mode: 'system' })}
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>Système</span>
            {preferences.mode === 'system' && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Couleur d'accent</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => updatePreferences({ accentColor: 'bleu' })}
          >
            <div className="mr-2 h-4 w-4 rounded-full bg-blue-500" />
            <span>Bleu</span>
            {preferences.accentColor === 'bleu' && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => updatePreferences({ accentColor: 'vert' })}
          >
            <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
            <span>Vert</span>
            {preferences.accentColor === 'vert' && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => updatePreferences({ accentColor: 'orange' })}
          >
            <div className="mr-2 h-4 w-4 rounded-full bg-orange-500" />
            <span>Orange</span>
            {preferences.accentColor === 'orange' && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => updatePreferences({ accentColor: 'violet' })}
          >
            <div className="mr-2 h-4 w-4 rounded-full bg-purple-500" />
            <span>Violet</span>
            {preferences.accentColor === 'violet' && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/configuration/interface">
            <PaintBucket className="mr-2 h-4 w-4" />
            <span>Plus d'options...</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DensitySelector() {
  const { preferences, updatePreferences } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <LayoutGrid className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Changer la densité</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Densité de l'interface</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => updatePreferences({ density: 'compact' })}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Compacte</span>
            {preferences.density === 'compact' && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => updatePreferences({ density: 'standard' })}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Standard</span>
            {preferences.density === 'standard' && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => updatePreferences({ density: 'confortable' })}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Confortable</span>
            {preferences.density === 'confortable' && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => updatePreferences({ animations: !preferences.animations })}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          <span>Animations</span>
          {preferences.animations ? (
            <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
          ) : (
            <span className="ml-auto text-xs text-muted-foreground">Désactivées</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}