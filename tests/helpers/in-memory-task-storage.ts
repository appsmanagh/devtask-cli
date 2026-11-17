
import type { Task } from '../../src/types/task.js';
import type { TaskStorage } from '../../src/storage/task-storage.js';

export class InMemoryTaskStorage implements TaskStorage {
  private tasks: Task[] = [];

  async getAll(): Promise<Task[]> {
    return structuredClone(this.tasks);
  }

  async saveAll(tasks: Task[]): Promise<void> {
    this.tasks = structuredClone(tasks);
  }
}
