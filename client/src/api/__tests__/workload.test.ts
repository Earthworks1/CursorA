import { workloadApi } from '../workload';
import { Task } from '@/types/schema';
import { vi } from 'vitest';

// Mock de fetch
// @ts-ignore
global.fetch = vi.fn();

describe('Workload API', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    startTime: '2024-05-01T10:00:00.000Z',
    endTime: '2024-05-01T12:00:00.000Z',
    resourceId: '1',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-05-01T09:00:00.000Z',
    updatedAt: '2024-05-01T09:30:00.000Z',
  };

  beforeEach(() => {
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  describe('getAll', () => {
    it('should fetch all tasks', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockTask]),
      });

      const tasks = await workloadApi.getAll();
      expect(tasks[0]).toMatchObject({
        ...mockTask,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/workload/tasks');
    });

    it('should throw error on failed fetch', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Failed to fetch tasks' }),
      });

      await expect(workloadApi.getAll()).rejects.toThrow('Failed to fetch tasks');
    });
  });

  describe('getTask', () => {
    it('should fetch a task by id', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const task = await workloadApi.getTask('1');
      expect(task).toMatchObject({
        ...mockTask,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/workload/tasks/1');
    });

    it('should throw error if task not found', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Failed to fetch task' }),
      });

      await expect(workloadApi.getTask('1')).rejects.toThrow('Failed to fetch task');
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const newTask = await workloadApi.createTask(mockTask as any);
      expect(newTask).toMatchObject({
        ...mockTask,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/workload/tasks', expect.any(Object));
    });

    it('should throw error on failed creation', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Failed to create task' }),
      });

      await expect(workloadApi.createTask(mockTask as any)).rejects.toThrow('Failed to create task');
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const updatedTask = await workloadApi.update('1', { title: 'Updated Title' });
      expect(updatedTask).toMatchObject({
        ...mockTask,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/workload/tasks/1', expect.any(Object));
    });

    it('should throw error on failed update', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Failed to update task' }),
      });

      await expect(workloadApi.update('1', { title: 'Updated Title' }))
        .rejects.toThrow('Failed to update task');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await workloadApi.delete('1');
      expect(global.fetch).toHaveBeenCalledWith('/api/workload/tasks/1', expect.any(Object));
    });

    it('should throw error on failed deletion', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Failed to delete task' }),
      });

      await expect(workloadApi.delete('1')).rejects.toThrow('Failed to delete task');
    });
  });
}); 