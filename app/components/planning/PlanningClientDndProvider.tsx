'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface PlanningClientDndProviderProps {
  children: React.ReactNode;
}

const PlanningClientDndProvider: React.FC<PlanningClientDndProviderProps> = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
};

export default PlanningClientDndProvider;
