import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface DynamicProps {
  children: () => Promise<React.ReactNode>;
}

export default function Dynamic({ children }: DynamicProps) {
  const [Component, setComponent] = React.useState<React.ReactNode | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);
    
    const loadComponent = async () => {
      try {
        const component = await children();
        // Vérifier si le composant est toujours monté avant de mettre à jour l'état
        if (isMountedRef.current) {
          setComponent(component);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du composant dynamique:", error);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMountedRef.current = false;
      // Important: remettre Component à null avant le démontage
      // pour éviter les erreurs de nœuds DOM
      setComponent(null);
    };
  }, [children]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  return Component;
}