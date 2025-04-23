import React from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/layout/main-layout';
import VueArborescence from '@/components/chantiers/VueArborescence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PageArborescence = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>Arborescence des chantiers | Spiess TP</title>
      </Helmet>
      
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Arborescence Chantiers / Lots / Tâches</h1>
        
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