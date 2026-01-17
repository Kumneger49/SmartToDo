import { Task } from '../types';

// Simulate in-memory storage
let tasks: Task[] = [];

// Helper function to generate unique IDs
const generateId = (): string => {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all tasks
export const getTasks = (): Promise<Task[]> => {
  return Promise.resolve([...tasks]);
};

// Create a new task
export const createTask = (title: string): Promise<Task> => {
  const newTask: Task = {
    id: generateId(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  return Promise.resolve(newTask);
};

// Update a task
export const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> => {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return Promise.reject(new Error('Task not found'));
  }
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  return Promise.resolve(tasks[taskIndex]);
};

// Delete a task
export const deleteTask = (id: string): Promise<void> => {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return Promise.reject(new Error('Task not found'));
  }
  tasks.splice(taskIndex, 1);
  return Promise.resolve();
};
