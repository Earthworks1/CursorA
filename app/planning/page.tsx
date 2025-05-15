import React from 'react';

const PlanningPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Planification</h1>
        <a href="/planning/hebdo" className="btn btn-outline-primary px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 transition">Vue hebdo</a>
      </div>
    </div>
  );
};

export default PlanningPage; 