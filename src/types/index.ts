/**
 * TypeScript Type Definitions
 * 
 * Centralized type definitions for the entire application
 * Ensures type safety across frontend components
 * 
 * @fileoverview Type definitions for BarakaFlow
 */

/**
 * Task update/comment interface
 * Represents a comment or update on a task with support for replies and likes
 */
export interface TaskUpdate {
  id: string; // Unique identifier for the update
  author: string; // Owner/author name who created the update
  content: string; // Update content/text
  timestamp: string; // ISO string timestamp
  mentions?: string[]; // Array of @mentioned owner names
  replies?: TaskUpdate[]; // Nested replies (recursive structure)
  likes: number; // Number of likes
  likedBy: string[]; // Array of owner names who liked this update
}

/**
 * Task recurrence frequency type
 * Defines how often a task repeats
 */
export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Main Task interface
 * Represents a task in the application
 */
export interface Task {
  id: string; // Unique task identifier
  title: string; // Task title (required)
  description?: string; // Optional task description
  completed: boolean; // Completion status
  createdAt: string; // ISO string for creation timestamp
  startTime?: string; // ISO string for start date and time
  endTime?: string; // ISO string for end date and time
  owner?: string; // Owner/assignee name
  status: 'not-started' | 'pending' | 'completed'; // Current task status
  updates?: TaskUpdate[]; // Array of task updates/comments
  recurrence?: {
    frequency: RecurrenceFrequency; // How often task repeats
    interval?: number; // Optional interval (e.g., every 2 weeks)
    endDate?: string; // ISO string for when recurrence ends
  };
}

/**
 * Invited member interface
 * Represents a team member invited to collaborate
 */
export interface InvitedMember {
  email: string; // Member email address
  name?: string; // Optional display name
}
