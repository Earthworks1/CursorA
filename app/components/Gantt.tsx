import React, { useState, useRef } from 'react';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task } from '../types';

interface GanttProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newStartTime: Date, newEndTime: Date) => void;
  onTaskUpdate?: (task: Task) => void;
}

interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
  startTime: Date;
  endTime: Date;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onClick, startTime, endTime }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const safeStart = task.startTime ? new Date(task.startTime) : startTime;
  const safeEnd = task.endTime ? new Date(task.endTime) : safeStart;
  const position = calculateTaskPosition(safeStart, startTime, endTime);
  const width = calculateTaskWidth(safeStart, safeEnd);

  return (
    <div
      ref={drag as unknown as React.RefObject<HTMLDivElement>}
      className={`gantt-task ${isDragging ? 'opacity-50' : ''}`}
      style={{
        left: `${position}%`,
        width: `${width}%`,
        backgroundColor: getTaskColor(task.status, (task as any).priority ?? 'medium'),
      }}
      onClick={() => onClick(task)}
    >
      <div className="task-content">
        <span className="task-title">{(task as any).title ?? task.description ?? 'Tâche'}</span>
        {(task as any).progress !== undefined && (
          <div className="task-progress">
            <div
              className="task-progress-bar"
              style={{ width: `${(task as any).progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const Gantt: React.FC<GanttProps> = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [endTime] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleZoom = () => {
    // TODO: Implémenter le zoom
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = direction === 'left' ? -100 : 100;
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="gantt-container" ref={containerRef}>
        <div className="gantt-header">
          <div className="scale-controls">
            <button onClick={() => handleZoom()}>Jour</button>
            <button onClick={() => handleZoom()}>Semaine</button>
            <button onClick={() => handleZoom()}>Mois</button>
          </div>
          <div className="scroll-controls">
            <button onClick={() => handleScroll('left')}>←</button>
            <button onClick={() => handleScroll('right')}>→</button>
          </div>
        </div>
        <div className="gantt-timeline">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onClick={handleTaskClick}
              startTime={startTime}
              endTime={endTime}
            />
          ))}
        </div>
        {selectedTask && (
          <div className="task-details">
            <h3>{(selectedTask as any).title ?? selectedTask.description ?? 'Tâche'}</h3>
            <p>{selectedTask.description}</p>
            <div className="task-meta">
              <span>Statut: {selectedTask.status}</span>
              <span>Priorité: {(selectedTask as any).priority ?? 'medium'}</span>
              {(selectedTask as any).progress !== undefined && (
                <span>Progression: {(selectedTask as any).progress}%</span>
              )}
              {selectedTask.chantier && (
                <span>Chantier: {selectedTask.chantier.nom}</span>
              )}
              {selectedTask.pilote && (
                <span>Pilote: {selectedTask.pilote.prenom} {selectedTask.pilote.nom}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

const calculateTaskPosition = (
  taskStart: Date,
  viewStart: Date,
  viewEnd: Date
): number => {
  const totalDuration = viewEnd.getTime() - viewStart.getTime();
  const taskOffset = taskStart.getTime() - viewStart.getTime();
  return (taskOffset / totalDuration) * 100;
};

const calculateTaskWidth = (
  startTime: Date,
  endTime: Date
): number => {
  const duration = endTime.getTime() - startTime.getTime();
  const baseWidth = (duration / (24 * 60 * 60 * 1000));
  return Math.max(baseWidth, 5); // Minimum width of 5%
};

const getTaskColor = (status: Task['status'], priority: string): string => {
  const statusColors = {
    todo: '#94a3b8',
    in_progress: '#3b82f6',
    done: '#22c55e',
  };

  const priorityColors = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#ef4444',
  };

  // Mapping des statuts français vers anglais
  const statusMap: Record<string, 'todo' | 'in_progress' | 'done'> = {
    'a_faire': 'todo',
    'en_cours': 'in_progress',
    'en_validation': 'in_progress',
    'en_retard': 'in_progress',
    'en_revision': 'in_progress',
    'termine': 'done',
    'pending': 'todo',
    'in-progress': 'in_progress',
    'completed': 'done',
  };

  const mappedStatus = statusMap[status as string] || 'todo';
  if (mappedStatus === 'done') return statusColors.done;
  if (mappedStatus === 'in_progress') return statusColors.in_progress;
  return statusColors.todo;
};

export default Gantt; 