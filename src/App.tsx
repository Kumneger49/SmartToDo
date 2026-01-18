import { useState, useEffect } from 'react';
import { Task } from './types';
import { TodayOverview } from './components/TodayOverview/TodayOverview';
import { TaskTable } from './components/TaskTable/TaskTable';
import { getTasks, createTask, updateTask, deleteTask } from './api/mockApi';
import styles from './App.module.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask = await createTask(
        taskData.title,
        taskData.description,
        taskData.startTime,
        taskData.endTime,
        taskData.owner,
        taskData.status,
        taskData.recurrence
      );
      // Reload tasks to get proper sorting
      await loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates);
      // Reload tasks to ensure consistency
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>BarakaFlow</h1>
            <TodayOverview tasks={tasks} />
          </div>
        </header>

        {loading ? (
          <div className={styles.loading}>Loading your tasks...</div>
        ) : (
          <TaskTable
            tasks={tasks}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onCreateTask={handleCreateTask}
          />
        )}
      </div>
    </div>
  );
}

export default App;
