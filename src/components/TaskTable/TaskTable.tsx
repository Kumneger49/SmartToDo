/**
 * TaskTable Component
 * 
 * Main table view for displaying and managing tasks
 * Features:
 * - Search and filter functionality
 * - Separate sections for To-Do and Completed tasks
 * - Inline task creation (new row in table)
 * - Sorting by start time
 * 
 * @fileoverview Main task management table component
 */

import { useState, useMemo } from 'react';
import { Task } from '../../types';
import { TaskRow } from '../TaskRow/TaskRow';
import { SearchAndFilter, FilterType } from '../SearchAndFilter/SearchAndFilter';
import styles from './TaskTable.module.css';

interface TaskTableProps {
  tasks: Task[]; // All tasks to display
  onUpdate: (id: string, updates: Partial<Task>) => void; // Callback for task updates
  onDelete: (id: string) => void; // Callback for task deletion
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt'>) => void; // Callback for task creation
}

export const TaskTable = ({ tasks, onUpdate, onDelete, onCreateTask }: TaskTableProps) => {
  // Component state
  const [isCreatingNew, setIsCreatingNew] = useState(false); // Whether new task row is being created
  const [searchQuery, setSearchQuery] = useState(''); // Search query string
  const [filter, setFilter] = useState<FilterType>('all'); // Current filter type

  /**
   * Filter and search tasks based on current filter and search query
   * Memoized for performance - only recalculates when dependencies change
   */
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter - search in title and description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter based on selected filter type
    if (filter === 'completed') {
      // Show only completed tasks
      filtered = filtered.filter(t => t.completed);
    } else if (filter === 'pending') {
      // Show only pending (not completed) tasks
      filtered = filtered.filter(t => !t.completed && t.status === 'pending');
    } else if (filter === 'not-started') {
      // Show only not-started tasks
      filtered = filtered.filter(t => !t.completed && t.status === 'not-started');
    } else if (filter === 'today') {
      // Show only tasks scheduled for today
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter(task => {
        if (!task.startTime) return false;
        const taskDate = new Date(task.startTime);
        const taskDateStr = taskDate.toISOString().split('T')[0];
        return taskDateStr === todayStr;
      });
    }

    return filtered;
  }, [tasks, searchQuery, filter]); // Recalculate when tasks, search, or filter changes

  /**
   * Separate filtered tasks into To-Do and Completed sections
   * Sort both sections by start time (earliest first)
   * Memoized for performance
   */
  const { todoTasks, completedTasks } = useMemo(() => {
    const todo = filteredTasks.filter(t => !t.completed);
    const completed = filteredTasks.filter(t => t.completed);

    /**
     * Sort tasks by start time
     * Tasks without start time are sorted to the end
     */
    const sortByStartTime = (a: Task, b: Task) => {
      if (!a.startTime && !b.startTime) return 0; // Both have no start time
      if (!a.startTime) return 1; // a has no start time, sort to end
      if (!b.startTime) return -1; // b has no start time, sort to end
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime(); // Sort by time
    };

    return {
      todoTasks: todo.sort(sortByStartTime),
      completedTasks: completed.sort(sortByStartTime),
    };
  }, [filteredTasks]); // Recalculate when filtered tasks change

  /**
   * Handle "New Task" button click
   * Shows a new editable row at the top of the table
   */
  const handleCreateNewTask = () => {
    setIsCreatingNew(true);
  };

  /**
   * Handle saving a new task
   * Creates the task and hides the new task row
   */
  const handleNewTaskSave = (task: Omit<Task, 'id' | 'createdAt'>) => {
    onCreateTask(task);
    setIsCreatingNew(false);
  };

  const handleNewTaskCancel = () => {
    setIsCreatingNew(false);
  };

  return (
    <div className={styles.taskTable}>
      <div className={styles.tableHeader}>
        <button onClick={handleCreateNewTask} className={styles.newTaskButton}>
          + New Task
        </button>
      </div>

      <SearchAndFilter
        searchQuery={searchQuery}
        filter={filter}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilter}
      />

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxColumn}></th>
              <th className={styles.taskColumn}>Task</th>
              <th className={styles.descriptionColumn}>Description</th>
              <th className={styles.ownerColumn}>Owner</th>
              <th className={styles.statusColumn}>Status</th>
              <th className={styles.timelineColumn}>Timeline</th>
              <th className={styles.frequencyColumn}>Frequency</th>
              <th className={styles.updatesColumn}>Updates</th>
              <th className={styles.aiColumn}>AI Help</th>
              <th className={styles.actionsColumn}></th>
            </tr>
          </thead>
          <tbody>
            {isCreatingNew && (
              <TaskRow
                task={null}
                isNew={true}
                onSave={handleNewTaskSave}
                onCancel={handleNewTaskCancel}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            )}
            
            {/* To-Do Section */}
            {todoTasks.length > 0 && (
              <>
                <tr className={styles.sectionRow}>
                  <td colSpan={10} className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>To-Do</span>
                    <span className={styles.sectionCount}>({todoTasks.length})</span>
                  </td>
                </tr>
                {todoTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isNew={false}
                    onSave={() => {}}
                    onCancel={() => {}}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </>
            )}

            {/* Completed Section */}
            {completedTasks.length > 0 && (
              <>
                <tr className={styles.sectionRow}>
                  <td colSpan={10} className={styles.sectionHeader}>
                    <span className={styles.sectionTitle}>Completed</span>
                    <span className={styles.sectionCount}>({completedTasks.length})</span>
                  </td>
                </tr>
                {completedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isNew={false}
                    onSave={() => {}}
                    onCancel={() => {}}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))}
              </>
            )}

            {filteredTasks.length === 0 && !isCreatingNew && (
              <tr>
                <td colSpan={10} className={styles.emptyState}>
                  {searchQuery || filter !== 'all' 
                    ? 'No tasks match your search or filter criteria.'
                    : 'No tasks yet. Click "New Task" to get started!'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
