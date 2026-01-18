/**
 * User Model
 * 
 * Mongoose schema and model for user accounts
 * Handles user authentication data (email, password, name)
 * 
 * @fileoverview User database schema definition
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * User document interface
 * Extends Mongoose Document with user fields
 */
export interface IUser extends Document {
  email: string;
  password: string; // Stored as bcrypt hash, never plain text
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema definition
 * Defines validation rules and data types for user documents
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Ensures no duplicate emails (creates index automatically)
      lowercase: true, // Store emails in lowercase for consistency
      trim: true, // Remove whitespace
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'] // Email format validation
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'] // Minimum password length
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true // Remove leading/trailing whitespace
    }
  },
  {
    timestamps: true // Automatically add createdAt and updatedAt fields
  }
);

// Note: email index is automatically created by unique: true above
// No need for manual index definition

// Export User model for use in routes and other modules
export const User = mongoose.model<IUser>('User', UserSchema);
