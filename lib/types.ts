export interface Task {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
} 