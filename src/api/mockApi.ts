import { Task } from '../types';

const STORAGE_KEY = 'smart_todo_tasks';

// Helper function to generate unique IDs
const generateId = (): string => {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Load tasks from localStorage
const loadTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
};

// Save tasks to localStorage
const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
};

// Get all tasks
export const getTasks = (): Promise<Task[]> => {
  const tasks = loadTasks();
  return Promise.resolve([...tasks]);
};

// Create a new task
export const createTask = (title: string): Promise<Task> => {
  const tasks = loadTasks();
  const newTask: Task = {
    id: generateId(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return Promise.resolve(newTask);
};

// Update a task
export const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> => {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return Promise.reject(new Error('Task not found'));
  }
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  saveTasks(tasks);
  return Promise.resolve(tasks[taskIndex]);
};

// Delete a task
export const deleteTask = (id: string): Promise<void> => {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return Promise.reject(new Error('Task not found'));
  }
  tasks.splice(taskIndex, 1);
  saveTasks(tasks);
  return Promise.resolve();
};
