
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { Task } from '../types/task.js';
import type { TaskStorage } from './task-storage.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseTasks(content: string): Task[] {
  const parsed: unknown = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error('Invalid task data: expected an array');
  }

  const fields: Array<keyof Task> = ['id', 'title', 'completed', 'createdAt'];

  parsed.forEach((item: unknown, index: number) => {
    if (!isRecord(item)) {
      throw new Error(
        `Invalid task data at index ${index}: expected an object`
      );
    }

    for (const field of fields) {
      const validType = field === 'completed' ? 'boolean' : 'string';
      if (typeof item[field] !== validType) {
        throw new Error(
          `Invalid task data at index ${index}: expected ${field} to be a ${validType}`
        );
      }
    }
  });

  return parsed as Task[];
}

export class JsonTaskStorage implements TaskStorage {
  constructor(
    private readonly filePath: string = join(
      process.cwd(),
      '.devtask',
      'tasks.json'
    )
  ) {}

  async getAll(): Promise<Task[]> {
    try {
      const content = await readFile(this.filePath, 'utf-8');

      return parseTasks(content);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return [];
      }

      throw error;
    }
  }

  async saveAll(tasks: Task[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });

    const content = JSON.stringify(tasks, null, 2);

    await writeFile(this.filePath, content, 'utf-8');
  }
}
