
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { Task } from '../types/task.js';
import type { TaskStorage } from './task-storage.js';

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

    return JSON.parse(content) as Task[];
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
