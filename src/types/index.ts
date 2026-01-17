export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  startTime?: string; // ISO string for start date and time
  endTime?: string; // ISO string for end date and time
}
