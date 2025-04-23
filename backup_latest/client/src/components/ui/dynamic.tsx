import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface DynamicProps {
  children: () => Promise<React.ReactNode>;
}

export default function Dynamic({ children }: DynamicProps) {
  const [Component, setComponent] = React.useState<React.ReactNode | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    
    children().then((component) => {
      if (isMounted) {
        setComponent(component);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [children]);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement...</span>
      </div>
    }>
      {Component}
    </Suspense>
  );
}