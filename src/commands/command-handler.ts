
import type { TaskService } from '../services/task-service.js';

export async function handleCommand(
  args: string[],
  service: TaskService
): Promise<string> {
  const [command, ...parameters] = args;

  switch (command) {
    case 'add': {
      const title = parameters.join(' ');

      const task = await service.createTask({ title });

      return `Task created: ${task.title} (ID: ${task.id})`;
    }

    case 'list': {
      const tasks = await service.listTasks();

      if (tasks.length === 0) {
        return 'No tasks found.';
      }

      return tasks
        .map((task) => {
          const status = task.completed ? '[x]' : '[ ]';

          return `${status} ${task.title} (ID: ${task.id})`;
        })
        .join('\n');
    }

    case 'complete': {
      const id = parameters[0];

      if (!id) {
        throw new Error('Please provide a task ID.');
      }

      const task = await service.completeTask(id);

      if (!task) {
        throw new Error('Task not found.');
      }

      return `Task completed: ${task.title}`;
    }

    case 'delete': {
      const id = parameters[0];

      if (!id) {
        throw new Error('Please provide a task ID.');
      }

      const deleted = await service.deleteTask(id);

      if (!deleted) {
        throw new Error('Task not found.');
      }

      return 'Task deleted successfully.';
    }

    default:
      throw new Error(
        'Unknown command. Available commands: add, list, complete, delete.'
      );
  }
}
