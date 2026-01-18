import { Task } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    // Handle network errors (server not running, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running on port 3000.`);
    }
    throw error;
  }

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || `HTTP error! status: ${response.status}`;
      
      // Provide helpful messages for common errors
      if (errorMessage.includes('buffering timed out') || errorMessage.includes('MongoServerError')) {
        errorMessage = 'Database connection failed. Please make sure MongoDB is running.';
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Authentication API
export const authApi = {
  register: async (email: string, password: string, name: string) => {
    const response = await apiRequest<{
      token: string;
      user: { id: string; email: string; name: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    // Store token
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      token: string;
      user: { id: string; email: string; name: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  verify: async () => {
    return apiRequest<{
      user: { id: string; email: string; name: string };
    }>('/auth/verify');
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },
};

// Tasks API
export const tasksApi = {
  getTasks: async (): Promise<Task[]> => {
    const tasks = await apiRequest<any[]>('/tasks');
    
    // Transform backend task format to frontend format
    return tasks.map(task => ({
      id: task._id || task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt || new Date().toISOString(),
      startTime: task.startTime,
      endTime: task.endTime,
      owner: task.owner,
      status: task.status || (task.completed ? 'completed' : 'not-started'),
      updates: task.updates || [],
      recurrence: task.recurrence,
    }));
  },

  createTask: async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    const task = await apiRequest<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });

    return {
      id: task._id || task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt || new Date().toISOString(),
      startTime: task.startTime,
      endTime: task.endTime,
      owner: task.owner,
      status: task.status || (task.completed ? 'completed' : 'not-started'),
      updates: task.updates || [],
      recurrence: task.recurrence,
    };
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const task = await apiRequest<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    return {
      id: task._id || task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      createdAt: task.createdAt || new Date().toISOString(),
      startTime: task.startTime,
      endTime: task.endTime,
      owner: task.owner,
      status: task.status || (task.completed ? 'completed' : 'not-started'),
      updates: task.updates || [],
      recurrence: task.recurrence,
    };
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
