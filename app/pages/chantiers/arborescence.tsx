import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import VueArborescence from '@/components/chantiers/VueArborescence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PageArborescence = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Arborescence des chantiers / Lots / Tâches</h1>
        
        <div className="mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Structure hiérarchique</CardTitle>
              <CardDescription>
                Visualisez et naviguez dans la structure complète des chantiers, lots et tâches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VueArborescence />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PageArborescence;