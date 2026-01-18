/**
 * API Client for BarakaFlow Backend
 * 
 * This module handles all communication with the backend API:
 * - Authentication (register, login, verify, logout)
 * - Task CRUD operations
 * - Automatic JWT token management
 * - Error handling and user-friendly error messages
 * 
 * All requests automatically include JWT token in Authorization header if available.
 */

import { Task } from '../types';

// Get API base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Retrieve JWT authentication token from localStorage
 * @returns JWT token string or null if not found
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Generic API request helper function
 * Handles authentication headers, error parsing, and response transformation
 * 
 * @param endpoint - API endpoint (e.g., '/tasks', '/auth/login')
 * @param options - Fetch API options (method, body, headers, etc.)
 * @returns Promise resolving to the response data
 * @throws Error with user-friendly message if request fails
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Get authentication token if available
  const token = getAuthToken();
  
  // Build request headers with authentication
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add JWT token to Authorization header if user is authenticated
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
      const isLocalhost = API_BASE_URL.includes('localhost');
      if (!isLocalhost && window.location.hostname !== 'localhost') {
        // Production environment but can't connect
        throw new Error(`Cannot connect to backend at ${API_BASE_URL}. The backend may be spinning up (takes ~30 seconds on Render free tier). If this persists, check that VITE_API_URL is set correctly in Vercel.`);
      }
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Make sure the backend is running.`);
    }
    throw error;
  }

  // Handle HTTP error responses
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      errorMessage = error.error || error.message || `HTTP error! status: ${response.status}`;
      
      // Provide user-friendly messages for common database errors
      if (errorMessage.includes('buffering timed out') || errorMessage.includes('MongoServerError')) {
        errorMessage = 'Database connection failed. Please make sure MongoDB is running.';
      }
    } catch {
      // If response is not JSON, use HTTP status text
      errorMessage = response.statusText || `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Authentication API methods
 * Handles user registration, login, token verification, and logout
 */
export const authApi = {
  /**
   * Register a new user account
   * @param email - User email address
   * @param password - User password (will be hashed on backend)
   * @param name - User display name
   * @returns User data and JWT token
   */
  register: async (email: string, password: string, name: string) => {
    const response = await apiRequest<{
      token: string;
      user: { id: string; email: string; name: string };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    // Store authentication token and user data in localStorage
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
    }
    
    return response;
  },

  /**
   * Login with existing user credentials
   * @param email - User email address
   * @param password - User password
   * @returns User data and JWT token
   */
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

  /**
   * Verify if current JWT token is valid
   * @returns Current user data if token is valid
   */
  verify: async () => {
    return apiRequest<{
      user: { id: string; email: string; name: string };
    }>('/auth/verify');
  },

  /**
   * Logout user by clearing stored authentication data
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  },

  /**
   * Get current user data from localStorage
   * @returns User object or null if not logged in
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is currently authenticated
   * @returns true if JWT token exists in localStorage
   */
  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },
};

/**
 * Tasks API methods
 * Handles all task-related operations (CRUD)
 * All methods require authentication
 */
export const tasksApi = {
  /**
   * Fetch all tasks for the authenticated user
   * @returns Array of tasks transformed from backend format to frontend format
   */
  getTasks: async (): Promise<Task[]> => {
    const tasks = await apiRequest<any[]>('/tasks');
    
    // Transform MongoDB document format (_id) to frontend format (id)
    // Also ensure all optional fields have default values
    return tasks.map(task => ({
      id: task._id || task.id, // MongoDB uses _id, frontend uses id
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

  /**
   * Create a new task
   * @param taskData - Task data without id and createdAt (generated by backend)
   * @returns Created task with generated id and timestamps
   */
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

  /**
   * Update an existing task
   * @param id - Task ID to update
   * @param updates - Partial task data with fields to update
   * @returns Updated task
   */
  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const task = await apiRequest<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    // Transform backend format to frontend format
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

  /**
   * Delete a task
   * @param id - Task ID to delete
   */
  deleteTask: async (id: string): Promise<void> => {
    await apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
