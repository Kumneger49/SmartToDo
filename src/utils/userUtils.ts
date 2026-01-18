// User management utilities
const USER_STORAGE_KEY = 'smart_todo_user';
const INVITED_MEMBERS_STORAGE_KEY = 'smart_todo_invited_members';

export interface User {
  name: string;
  email?: string;
}

export interface InvitedMember {
  email: string;
  name?: string;
}

// Get current user
export const getCurrentUser = (): User => {
  try {
    // First try to get from auth API (if logged in)
    const authUser = localStorage.getItem('current_user');
    if (authUser) {
      const user = JSON.parse(authUser);
      return { name: user.name || 'You', email: user.email };
    }
    
    // Fallback to old storage
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load user:', error);
  }
  
  // Default user
  return { name: 'You' };
};

// Set current user
export const setCurrentUser = (user: User): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};

// Get invited members
export const getInvitedMembers = (): InvitedMember[] => {
  try {
    const stored = localStorage.getItem(INVITED_MEMBERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load invited members:', error);
    return [];
  }
};

// Add invited member
export const addInvitedMember = (member: InvitedMember): void => {
  try {
    const members = getInvitedMembers();
    // Check if email already exists
    if (!members.find(m => m.email === member.email)) {
      members.push(member);
      localStorage.setItem(INVITED_MEMBERS_STORAGE_KEY, JSON.stringify(members));
    }
  } catch (error) {
    console.error('Failed to save invited member:', error);
  }
};

// Get all available owners (current user + invited members)
export const getAvailableOwners = (): string[] => {
  const user = getCurrentUser();
  const members = getInvitedMembers();
  const owners = [user.name];
  members.forEach(member => {
    if (member.name && !owners.includes(member.name)) {
      owners.push(member.name);
    } else if (member.email && !owners.includes(member.email)) {
      owners.push(member.email);
    }
  });
  return owners;
};
