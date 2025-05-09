export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  tags?: string[];
  dependencies?: string[];
  progress?: number;
  estimatedHours?: number;
  actualHours?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  team?: string;
  skills?: string[];
  availability?: {
    startDate: Date;
    endDate: Date;
    hoursPerDay: number;
  };
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  leader?: string;
  description?: string;
  skills?: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  tasks: string[];
  team?: string;
  budget?: number;
  client?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'human' | 'material' | 'equipment';
  availability: {
    startDate: Date;
    endDate: Date;
    quantity: number;
  };
  cost?: number;
  skills?: string[];
  assignedTo?: string[];
} 