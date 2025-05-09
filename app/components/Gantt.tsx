import React, { useState, useRef } from 'react';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task } from '../types';

interface GanttProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
}

interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
  startDate: Date;
  endDate: Date;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onClick, startDate, endDate }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const position = calculateTaskPosition(task.startDate, startDate, endDate);
  const width = calculateTaskWidth(task.startDate, task.endDate);

  return (
    <div
      ref={drag as unknown as React.RefObject<HTMLDivElement>}
      className={`gantt-task ${isDragging ? 'opacity-50' : ''}`}
      style={{
        left: `${position}%`,
        width: `${width}%`,
        backgroundColor: getTaskColor(task.status, task.priority),
      }}
      onClick={() => onClick(task)}
    >
      <div className="task-content">
        <span className="task-title">{task.title}</span>
        {task.progress !== undefined && (
          <div className="task-progress">
            <div
              className="task-progress-bar"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const Gantt: React.FC<GanttProps> = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [startDate] = useState<Date>(new Date());
  const [endDate] = useState<Date>(() => {
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
              startDate={startDate}
              endDate={endDate}
            />
          ))}
        </div>
        {selectedTask && (
          <div className="task-details">
            <h3>{selectedTask.title}</h3>
            <p>{selectedTask.description}</p>
            <div className="task-meta">
              <span>Statut: {selectedTask.status}</span>
              <span>Priorité: {selectedTask.priority}</span>
              {selectedTask.progress !== undefined && (
                <span>Progression: {selectedTask.progress}%</span>
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
  startDate: Date,
  endDate: Date
): number => {
  const duration = endDate.getTime() - startDate.getTime();
  const baseWidth = (duration / (24 * 60 * 60 * 1000));
  return Math.max(baseWidth, 5); // Minimum width of 5%
};

const getTaskColor = (status: Task['status'], priority: Task['priority']): string => {
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

  return status === 'done' ? statusColors.done : priorityColors[priority];
};

export default Gantt; 