
import { handleCommand } from '../../src/commands/command-handler.js';
import { TaskService } from '../../src/services/task-service.js';
import { InMemoryTaskStorage } from '../helpers/in-memory-task-storage.js';

describe('CommandHandler', () => {
  let service: TaskService;

  beforeEach(() => {
    const storage = new InMemoryTaskStorage();
    service = new TaskService(storage);
  });

  describe('add', () => {
    it('should create a task', async () => {
      const result = await handleCommand(
        ['add', 'Learn TypeScript'],
        service
      );

      expect(result).toContain('Task created: Learn TypeScript');
    });
  });

  describe('list', () => {
    it('should display an empty message when there are no tasks', async () => {
      const result = await handleCommand(['list'], service);

      expect(result).toBe('No tasks found.');
    });

    it('should display existing tasks', async () => {
      await handleCommand(['add', 'Learn Node.js'], service);

      const result = await handleCommand(['list'], service);

      expect(result).toContain('Learn Node.js');
      expect(result).toContain('[ ]');
    });
  });

  describe('complete', () => {
    it('should complete an existing task', async () => {
      await handleCommand(['add', 'Finish project'], service);

      const tasks = await service.listTasks();
      const taskId = tasks[0].id;

      const result = await handleCommand(
        ['complete', taskId],
        service
      );

      expect(result).toBe('Task completed: Finish project');
    });

    it('should reject when the task ID is missing', async () => {
      await expect(
        handleCommand(['complete'], service)
      ).rejects.toThrow('Please provide a task ID.');
    });

    it('should reject when the task does not exist', async () => {
      await expect(
        handleCommand(['complete', 'invalid-id'], service)
      ).rejects.toThrow('Task not found.');
    });
  });

  describe('delete', () => {
    it('should delete an existing task', async () => {
      await handleCommand(['add', 'Delete me'], service);

      const tasks = await service.listTasks();
      const taskId = tasks[0].id;

      const result = await handleCommand(
        ['delete', taskId],
        service
      );

      expect(result).toBe('Task deleted successfully.');
      expect(await service.listTasks()).toHaveLength(0);
    });

    it('should reject when the task ID is missing', async () => {
      await expect(
        handleCommand(['delete'], service)
      ).rejects.toThrow('Please provide a task ID.');
    });

    it('should reject when the task does not exist', async () => {
      await expect(
        handleCommand(['delete', 'invalid-id'], service)
      ).rejects.toThrow('Task not found.');
    });
  });

  describe('unknown command', () => {
    it('should reject unknown commands', async () => {
      await expect(
        handleCommand(['unknown'], service)
      ).rejects.toThrow('Unknown command.');
    });
  });
});
