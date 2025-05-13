'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';

// Type de période pour le graphique des progressions
type ChartPeriod = 'week' | 'month' | 'year';

interface ProgressionData {
  name: string;
  progression: number;
}

interface TaskDistribution {
  name: string;
  value: number;
  color: string;
}

export const ChartSection = () => {
  const [period, setPeriod] = useState<ChartPeriod>('week');
  
  // Récupération des données de progression
  const { data: progressionData = { week: [], month: [], year: [] } } = useQuery<Record<ChartPeriod, ProgressionData[]>>({
    queryKey: ['/api/statistiques/progression', period],
  });

  // Récupération des données de répartition des tâches
  const { data: taskDistributionData = [] } = useQuery<TaskDistribution[]>({
    queryKey: ['/api/statistiques/repartition-taches'],
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Progression des chantiers */}
      <Card className="lg:col-span-2 border border-gray-100">
        <CardHeader className="px-5 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-semibold text-gray-800">Progression des chantiers</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant={period === 'week' ? 'secondary' : 'ghost'}
              className={`px-3 py-1 h-auto text-xs font-medium rounded ${period === 'week' ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setPeriod('week')}
            >
              Semaine
            </Button>
            <Button 
              variant={period === 'month' ? 'secondary' : 'ghost'}
              className={`px-3 py-1 h-auto text-xs font-medium rounded ${period === 'month' ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setPeriod('month')}
            >
              Mois
            </Button>
            <Button 
              variant={period === 'year' ? 'secondary' : 'ghost'}
              className={`px-3 py-1 h-auto text-xs font-medium rounded ${period === 'year' ? 'bg-primary-100 text-primary-800' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setPeriod('year')}
            >
              Année
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 px-5 pb-5">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={progressionData[period]}
                margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="progression" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Répartition des tâches */}
      <Card className="border border-gray-100">
        <CardHeader className="px-5 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-semibold text-gray-800">Répartition des tâches</CardTitle>
          <Button variant="ghost" className="p-0 h-auto text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={taskDistributionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip labelFormatter={(value) => `${value} tâches`} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4 px-5 pb-5">
            {taskDistributionData.map((item, index) => (
              <div key={index} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartSection;
