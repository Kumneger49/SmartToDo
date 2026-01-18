/**
 * Task Model
 * 
 * Mongoose schema and model for tasks
 * Includes task updates, recurrence patterns, and status tracking
 * 
 * @fileoverview Task database schema definition
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Task status enumeration
 * Defines possible states a task can be in
 */
export type TaskStatus = 'not-started' | 'pending' | 'completed';

/**
 * Task recurrence frequency enumeration
 * Defines how often a task repeats
 */
export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Task update interface
 * Represents a comment/update on a task with replies and likes
 */
export interface ITaskUpdate {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  mentions?: string[];
  replies?: ITaskUpdate[];
  likes: number;
  likedBy: string[];
}

/**
 * Task recurrence interface
 * Defines how a task repeats over time
 */
export interface ITaskRecurrence {
  frequency: RecurrenceFrequency;
  interval?: number; // Optional interval (e.g., every 2 weeks)
  endDate?: string; // Optional end date for recurrence
}

/**
 * Task document interface
 * Main task data structure stored in MongoDB
 */
export interface ITask extends Document {
  userId: mongoose.Types.ObjectId; // Reference to user who owns the task
  title: string; // Task title (required)
  description?: string; // Optional task description
  completed: boolean; // Completion status
  startTime?: string; // ISO string for task start date/time
  endTime?: string; // ISO string for task end date/time
  owner?: string; // Task owner name
  status: TaskStatus; // Current task status
  updates?: ITaskUpdate[]; // Array of task updates/comments
  recurrence?: ITaskRecurrence; // Recurrence pattern
  createdAt: Date; // Auto-generated creation timestamp
  updatedAt: Date; // Auto-generated update timestamp
}

/**
 * Task update sub-schema
 * Embedded document for task comments/updates
 */
const TaskUpdateSchema = new Schema<ITaskUpdate>({
  id: { type: String, required: true }, // Unique ID for the update
  author: { type: String, required: true }, // Author name
  content: { type: String, required: true }, // Update content
  timestamp: { type: String, required: true }, // ISO timestamp
  mentions: [String], // Array of @mentioned users
  replies: [Schema.Types.Mixed], // Nested replies (recursive structure)
  likes: { type: Number, default: 0 }, // Like count
  likedBy: [String] // Array of user names who liked this update
}, { _id: false }); // Don't create MongoDB _id for embedded documents

/**
 * Task recurrence sub-schema
 * Embedded document for task recurrence patterns
 */
const TaskRecurrenceSchema = new Schema<ITaskRecurrence>({
  frequency: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'], // Only allow valid frequencies
    default: 'none'
  },
  interval: Number, // Optional interval (e.g., every 2 weeks)
  endDate: String // Optional end date for recurrence
}, { _id: false }); // Don't create MongoDB _id for embedded documents

/**
 * Main task schema definition
 * Defines validation rules and data types for task documents
 */
const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: true,
      index: true // Index for faster queries by userId
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true // Remove whitespace
    },
    description: {
      type: String,
      trim: true // Optional task description
    },
    completed: {
      type: Boolean,
      default: false // Tasks start as incomplete
    },
    startTime: String, // ISO string for start date/time
    endTime: String, // ISO string for end date/time
    owner: String, // Task owner name
    status: {
      type: String,
      enum: ['not-started', 'pending', 'completed'], // Only allow valid statuses
      default: 'not-started' // Default status
    },
    updates: [TaskUpdateSchema], // Array of task updates/comments
    recurrence: TaskRecurrenceSchema // Recurrence pattern
  },
  {
    timestamps: true // Automatically add createdAt and updatedAt fields
  }
);

// Database indexes for query optimization
// Compound index for faster queries: find tasks by user, sorted by creation date
TaskSchema.index({ userId: 1, createdAt: -1 });
// Compound index for faster queries: find tasks by user, sorted by start time
TaskSchema.index({ userId: 1, startTime: 1 });

// Export Task model for use in routes and other modules
export const Task = mongoose.model<ITask>('Task', TaskSchema);
