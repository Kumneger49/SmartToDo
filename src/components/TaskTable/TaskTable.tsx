import { useState, useMemo } from 'react';
import { Task } from '../../types';
import { TaskRow } from '../TaskRow/TaskRow';
import { getCurrentUser } from '../../utils/userUtils';
import styles from './TaskTable.module.css';

interface TaskTableProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const TaskTable = ({ tasks, onUpdate, onDelete, onCreateTask }: TaskTableProps) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const currentUser = getCurrentUser();

  // Separate tasks into To-Do and Completed
  const { todoTasks, completedTasks } = useMemo(() => {
    const todo = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

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
  }, [tasks]);

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

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxColumn}></th>
              <th className={styles.taskColumn}>Task</th>
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
                  <td colSpan={8} className={styles.sectionHeader}>
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
                  <td colSpan={8} className={styles.sectionHeader}>
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

            {tasks.length === 0 && !isCreatingNew && (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  No tasks yet. Click "New Task" to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
