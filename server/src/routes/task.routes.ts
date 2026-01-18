import express from 'express';
import { Task } from '../models/Task.model.js';
import { authenticate, AuthRequest } from '../middleware/auth.middleware.js';

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// Get all tasks for the authenticated user
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const tasks = await Task.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    return res.json(tasks);
  } catch (error: any) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
  }
});

// Get a single task by ID
router.get('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
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

// Create a new task
router.post('/', async (req: AuthRequest, res: express.Response) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.userId
    };

    const task = new Task(taskData);
    await task.save();

    return res.status(201).json(task);
  } catch (error: any) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create task' });
  }
});

// Update a task
router.put('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
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

// Delete a task
router.delete('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
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
