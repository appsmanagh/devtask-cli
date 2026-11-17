#!/usr/bin/env node

import { handleCommand } from './commands/command-handler.js';
import { TaskService } from './services/task-service.js';
import { JsonTaskStorage } from './storage/json-task-storage.js';

async function main(): Promise<void> {
  const storage = new JsonTaskStorage();
  const service = new TaskService(storage);

  const args = process.argv.slice(2);

  try {
    const result = await handleCommand(args, service);
    console.log(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';

    console.error(`Error: ${message}`);
    process.exitCode = 1;
  }
}

main();
