import { workloadApi } from '../workload';
import { Task } from '@/types/schema';

// Mock de fetch
global.fetch = jest.fn();

describe('Workload API', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    startTime: new Date(),
    endTime: new Date(),
    resourceId: '1',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getAll', () => {
    it('should fetch all tasks', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockTask]),
      });

      const tasks = await workloadApi.getAll();
      expect(tasks).toEqual([mockTask]);
      expect(global.fetch).toHaveBeenCalledWith('/api/workload');
    });

    it('should throw error on failed fetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(workloadApi.getAll()).rejects.toThrow('Failed to fetch tasks');
    });
  });

  describe('getById', () => {
    it('should fetch a task by id', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const task = await workloadApi.getById('1');
      expect(task).toEqual(mockTask);
      expect(global.fetch).toHaveBeenCalledWith('/api/workload/1');
    });

    it('should throw error if task not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(workloadApi.getById('1')).rejects.toThrow('Failed to fetch task');
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const newTask = await workloadApi.create(mockTask);
      expect(newTask).toEqual(mockTask);
      expect(global.fetch).toHaveBeenCalledWith('/api/workload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockTask),
      });
    });

    it('should throw error on failed creation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(workloadApi.create(mockTask)).rejects.toThrow('Failed to create task');
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const updatedTask = await workloadApi.update('1', { title: 'Updated Title' });
      expect(updatedTask).toEqual(mockTask);
      expect(global.fetch).toHaveBeenCalledWith('/api/workload/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Updated Title' }),
      });
    });

    it('should throw error on failed update', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(workloadApi.update('1', { title: 'Updated Title' }))
        .rejects.toThrow('Failed to update task');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await workloadApi.delete('1');
      expect(global.fetch).toHaveBeenCalledWith('/api/workload/1', {
        method: 'DELETE',
      });
    });

    it('should throw error on failed deletion', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(workloadApi.delete('1')).rejects.toThrow('Failed to delete task');
    });
  });
}); 