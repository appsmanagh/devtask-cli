
import { TaskService } from '../../src/services/task-service.js';
import { InMemoryTaskStorage } from '../helpers/in-memory-task-storage.js';

describe('TaskService', () => {
  let storage: InMemoryTaskStorage;
  let service: TaskService;

  beforeEach(() => {
    storage = new InMemoryTaskStorage();
    service = new TaskService(storage);
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const task = await service.createTask({
        title: 'Learn TypeScript'
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Learn TypeScript');
      expect(task.completed).toBe(false);
      expect(task.createdAt).toBeDefined();
    });

    it('should reject an empty title', async () => {
      await expect(
        service.createTask({ title: '   ' })
      ).rejects.toThrow('Task title cannot be empty');
    });

    it('should trim the task title', async () => {
      const task = await service.createTask({
        title: '  Learn Node.js  '
      });

      expect(task.title).toBe('Learn Node.js');
    });
  });

  describe('listTasks', () => {
    it('should return all tasks', async () => {
      await service.createTask({ title: 'Task 1' });
      await service.createTask({ title: 'Task 2' });

      const tasks = await service.listTasks();

      expect(tasks).toHaveLength(2);
    });

    it('should return an empty array when there are no tasks', async () => {
      const tasks = await service.listTasks();

      expect(tasks).toEqual([]);
    });
  });

  describe('completeTask', () => {
    it('should mark a task as completed', async () => {
      const task = await service.createTask({
        title: 'Finish project'
      });

      const completedTask = await service.completeTask(task.id);

      expect(completedTask?.completed).toBe(true);
    });

    it('should return null when the task does not exist', async () => {
      const result = await service.completeTask('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      const task = await service.createTask({
        title: 'Delete me'
      });

      const result = await service.deleteTask(task.id);

      expect(result).toBe(true);
      expect(await service.listTasks()).toHaveLength(0);
    });

    it('should return false when the task does not exist', async () => {
      const result = await service.deleteTask('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
