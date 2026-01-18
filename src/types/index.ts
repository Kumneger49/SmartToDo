export interface TaskUpdate {
  id: string;
  author: string; // owner name
  content: string;
  timestamp: string; // ISO string
  mentions?: string[]; // array of mentioned owner names
  replies?: TaskUpdate[]; // nested replies
  likes: number;
  likedBy: string[]; // array of owner names who liked
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  startTime?: string; // ISO string for start date and time
  endTime?: string; // ISO string for end date and time
  owner?: string; // owner name
  status: 'not-started' | 'pending' | 'completed';
  updates?: TaskUpdate[]; // array of updates
}

export interface InvitedMember {
  email: string;
  name?: string;
}
