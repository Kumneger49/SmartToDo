/**
 * User Management Utilities
 * 
 * Handles user data and invited members management
 * Integrates with authentication API for logged-in users
 * Falls back to localStorage for backward compatibility
 * 
 * @fileoverview Utility functions for user management
 */

// localStorage keys for user data
const USER_STORAGE_KEY = 'smart_todo_user';
const INVITED_MEMBERS_STORAGE_KEY = 'smart_todo_invited_members';

/**
 * User interface
 * Represents a user in the application
 */
export interface User {
  name: string; // User display name
  email?: string; // Optional email address
}

/**
 * Invited member interface
 * Represents a team member invited to collaborate
 */
export interface InvitedMember {
  email: string; // Member email address
  name?: string; // Optional display name
}

/**
 * Get current user from localStorage
 * 
 * First tries to get from auth API (if user is logged in)
 * Falls back to legacy storage for backward compatibility
 * Returns default user if nothing is found
 * 
 * @returns User object with name and optional email
 */
export const getCurrentUser = (): User => {
  try {
    // First try to get from auth API (if user is logged in)
    // This is set by the authentication API after login/signup
    const authUser = localStorage.getItem('current_user');
    if (authUser) {
      const user = JSON.parse(authUser);
      return { name: user.name || 'You', email: user.email };
    }
    
    // Fallback to legacy storage for backward compatibility
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load user:', error);
  }
  
  // Return default user if nothing is found
  return { name: 'You' };
};

/**
 * Set current user in localStorage
 * @param user - User object to store
 */
export const setCurrentUser = (user: User): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};

/**
 * Get all invited members from localStorage
 * @returns Array of invited members
 */
export const getInvitedMembers = (): InvitedMember[] => {
  try {
    const stored = localStorage.getItem(INVITED_MEMBERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load invited members:', error);
    return [];
  }
};

/**
 * Add a new invited member
 * Prevents duplicate emails
 * @param member - Invited member to add
 */
export const addInvitedMember = (member: InvitedMember): void => {
  try {
    const members = getInvitedMembers();
    // Check if email already exists to prevent duplicates
    if (!members.find(m => m.email === member.email)) {
      members.push(member);
      localStorage.setItem(INVITED_MEMBERS_STORAGE_KEY, JSON.stringify(members));
    }
  } catch (error) {
    console.error('Failed to save invited member:', error);
  }
};

/**
 * Get all available task owners
 * Combines current user and invited members
 * Used for task assignment dropdown
 * @returns Array of owner names/emails
 */
export const getAvailableOwners = (): string[] => {
  const user = getCurrentUser();
  const members = getInvitedMembers();
  const owners = [user.name];
  
  // Add invited members to owners list
  members.forEach(member => {
    if (member.name && !owners.includes(member.name)) {
      owners.push(member.name);
    } else if (member.email && !owners.includes(member.email)) {
      owners.push(member.email);
    }
  });
  
  return owners;
};
