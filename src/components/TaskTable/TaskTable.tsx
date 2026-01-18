import { useState, useMemo } from 'react';
import { Task } from '../../types';
import { TaskRow } from '../TaskRow/TaskRow';
import { getCurrentUser } from '../../utils/userUtils';
import { SearchAndFilter, FilterType } from '../SearchAndFilter/SearchAndFilter';
import styles from './TaskTable.module.css';

interface TaskTableProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const TaskTable = ({ tasks, onUpdate, onDelete, onCreateTask }: TaskTableProps) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const currentUser = getCurrentUser();

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    } else if (filter === 'pending') {
      filtered = filtered.filter(t => !t.completed && t.status === 'pending');
    } else if (filter === 'not-started') {
      filtered = filtered.filter(t => !t.completed && t.status === 'not-started');
    } else if (filter === 'today') {
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
  }, [tasks, searchQuery, filter]);

  // Separate filtered tasks into To-Do and Completed
  const { todoTasks, completedTasks } = useMemo(() => {
    const todo = filteredTasks.filter(t => !t.completed);
    const completed = filteredTasks.filter(t => t.completed);

    // Sort by startTime
    const sortByStartTime = (a: Task, b: Task) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    };

    return {
      todoTasks: todo.sort(sortByStartTime),
      completedTasks: completed.sort(sortByStartTime),
    };
  }, [filteredTasks]);

  const handleCreateNewTask = () => {
    setIsCreatingNew(true);
  };

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
                  <td colSpan={9} className={styles.sectionHeader}>
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
                  <td colSpan={9} className={styles.sectionHeader}>
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
                <td colSpan={9} className={styles.emptyState}>
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
