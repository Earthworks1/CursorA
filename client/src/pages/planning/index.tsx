import React from 'react';
import { PageTitle } from '@/components/ui/page-title';
import PlanCharge from '@/components/planning/PlanCharge';

const PlanningPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageTitle title="Planning des ressources" />
      <PlanCharge />
    </div>
  );
};

export default PlanningPage; 