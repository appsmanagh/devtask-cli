
import { randomUUID } from 'node:crypto';
import type { Task, CreateTaskInput } from '../types/task.js';
import type { TaskStorage } from '../storage/task-storage.js';

export class TaskService {
  constructor(private readonly storage: TaskStorage) {}

  async createTask(input: CreateTaskInput): Promise<Task> {
    const title = input.title.trim();

    if (!title) {
      throw new Error('Task title cannot be empty');
    }

    const tasks = await this.storage.getAll();

    const task: Task = {
      id: randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.push(task);

    await this.storage.saveAll(tasks);

    return task;
  }

  async listTasks(): Promise<Task[]> {
    return this.storage.getAll();
  }

  async completeTask(id: string): Promise<Task | null> {
    const tasks = await this.storage.getAll();

    const task = tasks.find((item) => item.id === id);

    if (!task) {
      return null;
    }

    task.completed = true;

    await this.storage.saveAll(tasks);

    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.storage.getAll();

    const filteredTasks = tasks.filter((task) => task.id !== id);

    if (filteredTasks.length === tasks.length) {
      return false;
    }

    await this.storage.saveAll(filteredTasks);

    return true;
  }
}
