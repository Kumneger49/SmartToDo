import mongoose, { Schema, Document } from 'mongoose';

export type TaskStatus = 'not-started' | 'pending' | 'completed';
export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

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

export interface ITaskRecurrence {
  frequency: RecurrenceFrequency;
  interval?: number;
  endDate?: string;
}

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  startTime?: string;
  endTime?: string;
  owner?: string;
  status: TaskStatus;
  updates?: ITaskUpdate[];
  recurrence?: ITaskRecurrence;
  createdAt: Date;
  updatedAt: Date;
}

const TaskUpdateSchema = new Schema<ITaskUpdate>({
  id: { type: String, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, required: true },
  mentions: [String],
  replies: [Schema.Types.Mixed], // Nested structure
  likes: { type: Number, default: 0 },
  likedBy: [String]
}, { _id: false });

const TaskRecurrenceSchema = new Schema<ITaskRecurrence>({
  frequency: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  interval: Number,
  endDate: String
}, { _id: false });

const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    startTime: String,
    endTime: String,
    owner: String,
    status: {
      type: String,
      enum: ['not-started', 'pending', 'completed'],
      default: 'not-started'
    },
    updates: [TaskUpdateSchema],
    recurrence: TaskRecurrenceSchema
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, startTime: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
