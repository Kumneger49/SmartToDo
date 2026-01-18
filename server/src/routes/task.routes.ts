/**
 * Task Routes
 * 
 * Handles all task-related CRUD operations
 * All routes are protected by authentication middleware
 * Tasks are scoped to the authenticated user (userId)
 * 
 * @fileoverview Express routes for task management
 */

import express from 'express';
import { Task } from '../models/Task.model.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes in this router
// This ensures only authenticated users can access task endpoints
router.use(authenticate);

/**
 * GET /api/tasks
 * Get all tasks for the authenticated user
 * 
 * Returns tasks sorted by creation date (newest first)
 * Only returns tasks belonging to the authenticated user
 */
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    // Find all tasks for this user, sorted by creation date (newest first)
    const tasks = await Task.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    return res.json(tasks);
  } catch (error: any) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 * 
 * Verifies task belongs to authenticated user before returning
 */
router.get('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    // Find task by ID and verify it belongs to the authenticated user
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId // Security: ensure user can only access their own tasks
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json(task);
  } catch (error: any) {
    console.error('Get task error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch task' });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 * 
 * Automatically associates task with authenticated user (userId)
 */
router.post('/', async (req: AuthRequest, res: express.Response) => {
  try {
    // Merge request body with userId to ensure task belongs to user
    const taskData = {
      ...req.body,
      userId: req.userId // Automatically set from authenticated request
    };

    const task = new Task(taskData);
    await task.save();

    return res.status(201).json(task);
  } catch (error: any) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create task' });
  }
});

/**
 * PUT /api/tasks/:id
 * Update an existing task
 * 
 * Only allows updating tasks that belong to authenticated user
 * Returns updated task with validation
 */
router.put('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    // Find and update task, ensuring it belongs to the user
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // Security check
      req.body, // Update data
      { new: true, runValidators: true } // Return updated doc and validate
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json(task);
  } catch (error: any) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update task' });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 * 
 * Only allows deleting tasks that belong to authenticated user
 */
router.delete('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    // Find and delete task, ensuring it belongs to the user
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId // Security: user can only delete their own tasks
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete task' });
  }
});

export default router;
