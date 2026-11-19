
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { JsonTaskStorage } from '../../src/storage/json-task-storage.js';
import type { Task } from '../../src/types/task.js';

describe('JsonTaskStorage', () => {
  let testDirectory: string;
  let filePath: string;
  let storage: JsonTaskStorage;

  beforeEach(async () => {
    testDirectory = await mkdtemp(
      join(tmpdir(), 'devtask-test-')
    );

    filePath = join(testDirectory, 'tasks.json');
    storage = new JsonTaskStorage(filePath);
  });

  afterEach(async () => {
    await rm(testDirectory, {
      recursive: true,
      force: true
    });
  });

  const createTask = (): Task => ({
    id: 'task-123',
    title: 'Learn Node.js',
    completed: false,
    createdAt: '2026-11-17T10:00:00.000Z'
  });

  it('should return an empty array when the file does not exist', async () => {
    const tasks = await storage.getAll();

    expect(tasks).toEqual([]);
  });

  it('should save tasks to a JSON file', async () => {
    const task = createTask();

    await storage.saveAll([task]);

    const tasks = await storage.getAll();

    expect(tasks).toEqual([task]);
  });

  it('should persist tasks between storage instances', async () => {
    const task = createTask();

    await storage.saveAll([task]);

    const newStorage = new JsonTaskStorage(filePath);

    const tasks = await newStorage.getAll();

    expect(tasks).toEqual([task]);
  });

  it('should overwrite existing tasks when saving again', async () => {
    const firstTask = createTask();

    await storage.saveAll([firstTask]);

    const secondTask: Task = {
      ...createTask(),
      id: 'task-456',
      title: 'Learn TypeScript'
    };

    await storage.saveAll([secondTask]);

    const tasks = await storage.getAll();

    expect(tasks).toEqual([secondTask]);
  });

  it('should create the parent directory if it does not exist', async () => {
    const nestedPath = join(
      testDirectory,
      'nested',
      'data',
      'tasks.json'
    );

    const nestedStorage = new JsonTaskStorage(nestedPath);

    const task = createTask();

    await nestedStorage.saveAll([task]);

    const tasks = await nestedStorage.getAll();

    expect(tasks).toEqual([task]);
  });

  it('should reject when the JSON file is corrupted', async () => {
    const corruptedContent = '{ "tasks": [ invalid JSON';

    await writeFile(filePath, corruptedContent, 'utf-8');

    await expect(storage.getAll()).rejects.toThrow(SyntaxError);
  });

  it.each([
    ['an object', '{"tasks": []}'],
    ['null', 'null'],
    ['a string', '"tasks"']
  ])('should reject a JSON root that is %s', async (_description, content) => {
    await writeFile(filePath, content, 'utf-8');

    await expect(storage.getAll()).rejects.toThrow(
      'Invalid task data: expected an array'
    );
  });

  it.each([
    ['null', 'null'],
    ['an array', '[]'],
    ['a string', '"task"']
  ])('should reject a task entry that is %s', async (_description, item) => {
    await writeFile(filePath, `[${item}]`, 'utf-8');

    await expect(storage.getAll()).rejects.toThrow(
      'Invalid task data at index 0: expected an object'
    );
  });

  it.each([
    ['id', '{"title":"Task","completed":false,"createdAt":"now"}'],
    ['title', '{"id":"1","completed":false,"createdAt":"now"}'],
    ['completed', '{"id":"1","title":"Task","createdAt":"now"}'],
    ['createdAt', '{"id":"1","title":"Task","completed":false}']
  ])('should reject a task with a missing %s field', async (_field, task) => {
    await writeFile(filePath, `[${task}]`, 'utf-8');

    await expect(storage.getAll()).rejects.toThrow(
      'Invalid task data at index 0'
    );
  });

  it.each([
    ['id', '{"id":1,"title":"Task","completed":false,"createdAt":"now"}'],
    ['title', '{"id":"1","title":2,"completed":false,"createdAt":"now"}'],
    ['completed', '{"id":"1","title":"Task","completed":"false","createdAt":"now"}'],
    ['createdAt', '{"id":"1","title":"Task","completed":false,"createdAt":0}']
  ])('should reject a task with a non-string or non-boolean %s field', async (_field, task) => {
    await writeFile(filePath, `[${task}]`, 'utf-8');

    await expect(storage.getAll()).rejects.toThrow(
      'Invalid task data at index 0'
    );
  });
});
