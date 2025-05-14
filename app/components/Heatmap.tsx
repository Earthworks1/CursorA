import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';

interface HeatmapProps {
  tasks: Task[];
  startDate: Date;
  endDate: Date;
  onCellClick: (date: Date, tasks: Task[]) => void;
}

export const Heatmap: React.FC<HeatmapProps> = ({
  tasks,
  startDate,
  endDate,
  onCellClick,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [heatmapData, setHeatmapData] = useState<Map<string, number>>(new Map());

  const calculateHeatmapData = useCallback(() => {
    const data = new Map<string, number>();
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const tasksOnDate = tasks.filter(task => {
        const taskStart = new Date((task as any).startTime);
        const taskEnd = new Date((task as any).endTime ?? (task as any).startTime);
        return currentDate >= taskStart && currentDate <= taskEnd;
      });

      data.set(dateKey, tasksOnDate.length);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setHeatmapData(data);
  }, [tasks, startDate, endDate]);

  useEffect(() => {
    calculateHeatmapData();
  }, [calculateHeatmapData]);

  const getHeatmapColor = (value: number): string => {
    if (value === 0) return 'bg-gray-100';
    if (value <= 2) return 'bg-green-200';
    if (value <= 4) return 'bg-yellow-200';
    if (value <= 6) return 'bg-orange-200';
    return 'bg-red-200';
  };

  const handleCellClick = (date: Date) => {
    const tasksOnDate = tasks.filter(task => {
      const taskStart = new Date((task as any).startTime);
      const taskEnd = new Date((task as any).endTime ?? (task as any).startTime);
      return date >= taskStart && date <= taskEnd;
    });

    setSelectedDate(date);
    onCellClick(date, tasksOnDate);
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid">
        {Array.from(heatmapData.entries()).map(([date, value]) => (
          <div
            key={date}
            className={`heatmap-cell ${getHeatmapColor(value)}`}
            onClick={() => handleCellClick(new Date(date))}
            title={`${date}: ${value} tâches`}
          >
            {value}
          </div>
        ))}
      </div>
      {selectedDate && (
        <div className="heatmap-details">
          <h3>Tâches du {selectedDate.toLocaleDateString()}</h3>
          <ul>
            {tasks
              .filter(task => {
                const taskStart = new Date((task as any).startTime);
                const taskEnd = new Date((task as any).endTime ?? (task as any).startTime);
                return selectedDate >= taskStart && selectedDate <= taskEnd;
              })
              .map(task => (
                <li key={task.id}>
                  {task.description}
                  {(task as any)?.chantier && (
                    <span> | Chantier: {(task as any).chantier.nom}</span>
                  )}
                  {(task as any)?.pilote && (
                    <span> | Pilote: {(task as any).pilote.prenom} {(task as any).pilote.nom}</span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Heatmap; 