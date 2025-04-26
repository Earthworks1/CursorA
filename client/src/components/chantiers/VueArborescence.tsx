import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText, 
  Briefcase, 
  Wrench, 
  Hammer 
} from 'lucide-react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TypeLot } from '@/types/schema';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Types pour représenter l'arborescence
interface TreeChantier {
  id: number;
  nom: string;
  lots: TreeLot[];
  expanded?: boolean;
}

interface Pilote {
  id: number;
  userId: number;
  lotId: number;
  nom: string;
  prenom: string;
  role?: string;
}

interface TreeLot {
  id: number;
  nom: string;
  type: string;
  chantierId: number;
  taches: TreeTache[];
  pilotes: Pilote[];
  expanded?: boolean;
}

interface TreeTache {
  id: number;
  titre: string;
  type: string;
  statut: string;
  lotId: number;
  chantierId: number;
}

// Obtenir l'icône du type de lot
const getLotIcon = (type: string) => {
  switch (type) {
    case TypeLot.VOIRIE:
      return <Wrench className="h-4 w-4 mr-1" />;
    case TypeLot.RESEAUX_SECS:
    case TypeLot.RESEAUX_HUMIDES:
      return <Hammer className="h-4 w-4 mr-1" />;
    default:
      return <Folder className="h-4 w-4 mr-1" />;
  }
};

// Badge de statut pour les tâches
const TaskStatusBadge = ({ statut }: { statut: string }) => {
  let color = "bg-gray-200";
  
  switch (statut) {
    case 'a_faire':
      color = "bg-gray-200";
      break;
    case 'en_cours':
      color = "bg-blue-200";
      break;
    case 'termine':
      color = "bg-green-200";
      break;
    case 'en_retard':
      color = "bg-red-200";
      break;
    case 'en_validation':
      color = "bg-yellow-200";
      break;
    case 'en_revision':
      color = "bg-purple-200";
      break;
  }
  
  return (
    <Badge variant="outline" className={`text-xs ${color}`}>
      {statut.replace('_', ' ')}
    </Badge>
  );
};

// Composant pour afficher la tâche
const TacheItem = ({ tache }: { tache: TreeTache }) => {
  return (
    <Link to={`/taches/${tache.id}`}>
      <div className="flex items-center ml-12 p-1 hover:bg-gray-100 rounded cursor-pointer">
        <div className="ml-2 flex items-center">
          <FileText className="h-4 w-4 mr-1" />
          <span className="ml-1">{tache.titre}</span>
          <span className="ml-2">
            <TaskStatusBadge statut={tache.statut} />
          </span>
        </div>
      </div>
    </Link>
  );
};

// Composant pour afficher le lot avec ses tâches
const LotItem = ({ lot, onToggle }: { lot: TreeLot; onToggle: (id: number) => void }) => {
  return (
    <div>
      <div 
        className="flex items-center ml-6 p-1 hover:bg-gray-100 rounded cursor-pointer"
        onClick={() => onToggle(lot.id)}
      >
        {lot.expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <div className="ml-1 flex items-center flex-grow">
          {lot.expanded ? <FolderOpen className="h-4 w-4 mr-1" /> : getLotIcon(lot.type)}
          <span className="ml-1">{lot.nom}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {lot.type.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="ml-2 text-xs">
            {lot.taches.length} tâches
          </Badge>
          
          {/* Affichage des pilotes */}
          {lot.pilotes && lot.pilotes.length > 0 && (
            <div className="flex -space-x-2 ml-auto">
              {lot.pilotes.slice(0, 3).map(pilote => (
                <div
                  key={pilote.id} 
                  className="rounded-full bg-primary-100 text-primary-800 h-6 w-6 flex items-center justify-center text-xs font-medium border-2 border-white"
                  title={`${pilote.prenom} ${pilote.nom}`}
                >
                  {pilote.prenom[0]}{pilote.nom[0]}
                </div>
              ))}
              {lot.pilotes.length > 3 && (
                <div className="rounded-full bg-gray-100 text-gray-800 h-6 w-6 flex items-center justify-center text-xs font-medium border-2 border-white">
                  +{lot.pilotes.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {lot.expanded && lot.taches.map(tache => (
        <TacheItem key={tache.id} tache={tache} />
      ))}
    </div>
  );
};

// Composant pour afficher le chantier avec ses lots
const ChantierItem = ({ 
  chantier, 
  onToggleChantier, 
  onToggleLot 
}: { 
  chantier: TreeChantier; 
  onToggleChantier: (id: number) => void;
  onToggleLot: (id: number) => void;
}) => {
  return (
    <div className="border rounded-md p-2 mb-2">
      <div 
        className="flex items-center p-1 hover:bg-gray-100 rounded cursor-pointer"
        onClick={() => onToggleChantier(chantier.id)}
      >
        {chantier.expanded ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
        <div className="ml-1 flex items-center">
          <Briefcase className="h-5 w-5 mr-1" />
          <span className="ml-1 font-medium">{chantier.nom}</span>
          <Badge variant="outline" className="ml-2">
            {chantier.lots.length} lots
          </Badge>
        </div>
      </div>
      
      {chantier.expanded && chantier.lots.map(lot => (
        <LotItem key={lot.id} lot={lot} onToggle={onToggleLot} />
      ))}
    </div>
  );
};

const VueArborescence = () => {
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [typeLotFilter, setTypeLotFilter] = useState('');
  
  // États pour garder trace des éléments développés
  const [expandedChantiers, setExpandedChantiers] = useState<number[]>([]);
  const [expandedLots, setExpandedLots] = useState<number[]>([]);
  
  // Requête pour récupérer tous les chantiers
  const { data: chantiers = [], isLoading: isLoadingChantiers } = useQuery<any[]>({
    queryKey: ['/api/chantiers'],
  });
  
  // Requête pour récupérer tous les lots
  const { data: lots = [], isLoading: isLoadingLots } = useQuery<any[]>({
    queryKey: ['/api/lots'],
  });
  
  // Requête pour récupérer toutes les tâches
  const { data: taches = [], isLoading: isLoadingTaches } = useQuery<any[]>({
    queryKey: ['/api/taches'],
  });
  
  // Fonction pour basculer l'état développé d'un chantier
  const toggleChantier = (id: number) => {
    setExpandedChantiers(prev => 
      prev.includes(id) 
        ? prev.filter(chantierId => chantierId !== id)
        : [...prev, id]
    );
  };
  
  // Fonction pour basculer l'état développé d'un lot
  const toggleLot = (id: number) => {
    setExpandedLots(prev => 
      prev.includes(id) 
        ? prev.filter(lotId => lotId !== id)
        : [...prev, id]
    );
  };
  
  // Construction de l'arborescence
  const buildTree = () => {
    if (!chantiers || !Array.isArray(chantiers)) return [];
    if (!Array.isArray(lots)) return [];
    if (!Array.isArray(taches)) return [];
    
    const tree: TreeChantier[] = chantiers.map((chantier: any) => {
      // Filtrer les lots qui appartiennent à ce chantier
      const chantierLots = lots
        .filter((lot: any) => lot?.chantierId === chantier.id)
        .filter((lot: any) => typeLotFilter === 'all' || !typeLotFilter || lot?.type === typeLotFilter);
        
      // Créer les objets TreeLot pour ce chantier
      const treeLots: TreeLot[] = chantierLots.map((lot: any) => {
        // Filtrer les tâches qui appartiennent à ce lot
        const lotTaches = taches
          .filter((tache: any) => tache?.lotId === lot.id)
          .filter((tache: any) => {
            // Appliquer le filtre de recherche sur le titre de la tâche
            if (searchTerm && tache?.titre) {
              return tache.titre.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
          });
          
        // Créer les objets TreeTache pour ce lot
        const treeTaches: TreeTache[] = lotTaches.map((tache: any) => ({
          id: tache.id || 0,
          titre: tache.titre || "Tâche sans titre",
          type: tache.type || "vrd",
          statut: tache.statut || "a_faire",
          lotId: tache.lotId || 0,
          chantierId: tache.chantierId || 0
        }));
        
        // Récupérer les pilotes du lot
        const pilotes = lot.pilotes || [];
        
        return {
          id: lot.id || 0,
          nom: lot.nom || "Lot sans nom",
          type: lot.type || "vrd",
          chantierId: lot.chantierId || 0,
          taches: treeTaches || [],
          pilotes: pilotes,
          expanded: expandedLots.includes(lot.id || 0)
        };
      });
      
      return {
        id: chantier.id || 0,
        nom: chantier.nom || "Chantier sans nom",
        lots: treeLots || [],
        expanded: expandedChantiers.includes(chantier.id || 0)
      };
    });
    
    // Filtrer les chantiers qui n'ont pas de lots après les filtres
    return tree.filter(chantier => chantier.lots.length > 0);
  };
  
  // Squelette de chargement
  if (isLoadingChantiers || isLoadingLots || isLoadingTaches) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-md p-2 mb-2">
            <div className="flex items-center">
              <Skeleton className="h-6 w-6 mr-2" />
              <Skeleton className="h-6 w-[200px]" />
            </div>
            <div className="ml-8 mt-2">
              <Skeleton className="h-4 w-[180px] mb-1" />
              <Skeleton className="h-4 w-[150px] mb-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  const treeData = buildTree();
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-64">
          <Select 
            value={typeLotFilter} 
            onValueChange={setTypeLotFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par type de lot" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value={TypeLot.TERRASSEMENT}>Terrassement</SelectItem>
                <SelectItem value={TypeLot.RESEAUX_SECS}>Réseaux secs</SelectItem>
                <SelectItem value={TypeLot.RESEAUX_HUMIDES}>Réseaux humides</SelectItem>
                <SelectItem value={TypeLot.VOIRIE}>Voirie</SelectItem>
                <SelectItem value={TypeLot.VRD}>VRD</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {treeData.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <p className="text-gray-500">Aucun résultat trouvé</p>
          <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <div>
          {treeData.map(chantier => (
            <ChantierItem 
              key={chantier.id} 
              chantier={chantier} 
              onToggleChantier={toggleChantier}
              onToggleLot={toggleLot}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VueArborescence;