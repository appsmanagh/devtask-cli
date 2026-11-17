import type { Task } from '../types/task.js';

export interface TaskStorage {
  getAll(): Promise<Task[]>;
  saveAll(tasks: Task[]): Promise<void>;
}