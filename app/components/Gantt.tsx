import React, { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task } from '../types';

interface GanttProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskMove: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
}

interface TaskItemProps {
  task: Task;
  onDrag: (taskId: string, newStartDate: Date) => void;
  onClick: (task: Task) => void;
  scale: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDrag, onClick, scale, startDate, endDate }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const position = calculateTaskPosition(task.startDate, startDate, endDate, scale);
  const width = calculateTaskWidth(task.startDate, task.endDate, scale);

  return (
    <div
      ref={drag}
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

export const Gantt: React.FC<GanttProps> = ({ tasks, onTaskUpdate, onTaskMove }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [scale, setScale] = useState<'day' | 'week' | 'month'>('week');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskDrag = (taskId: string, newStartDate: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const duration = task.endDate.getTime() - task.startDate.getTime();
    const newEndDate = new Date(newStartDate.getTime() + duration);

    onTaskMove(taskId, newStartDate, newEndDate);
  };

  const handleZoom = (newScale: 'day' | 'week' | 'month') => {
    setScale(newScale);
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
            <button onClick={() => handleZoom('day')}>Jour</button>
            <button onClick={() => handleZoom('week')}>Semaine</button>
            <button onClick={() => handleZoom('month')}>Mois</button>
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
              onDrag={handleTaskDrag}
              onClick={handleTaskClick}
              scale={scale}
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
  viewEnd: Date,
  scale: 'day' | 'week' | 'month'
): number => {
  const totalDuration = viewEnd.getTime() - viewStart.getTime();
  const taskOffset = taskStart.getTime() - viewStart.getTime();
  return (taskOffset / totalDuration) * 100;
};

const calculateTaskWidth = (
  startDate: Date,
  endDate: Date,
  scale: 'day' | 'week' | 'month'
): number => {
  const duration = endDate.getTime() - startDate.getTime();
  const scaleFactor = scale === 'day' ? 1 : scale === 'week' ? 7 : 30;
  const baseWidth = (duration / (24 * 60 * 60 * 1000)) * scaleFactor;
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