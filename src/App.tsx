import { useState, useEffect } from 'react';
import { Task } from './types';
import { Filter, FilterStatus } from './components/Filter/Filter';
import { TaskForm } from './components/TaskForm/TaskForm';
import { TaskList } from './components/TaskList/TaskList';
import { EmptyState } from './components/EmptyState/EmptyState';
import { getTasks, createTask, updateTask, deleteTask } from './api/mockApi';
import styles from './App.module.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
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

  const handleCreateTask = async (title: string) => {
    try {
      const newTask = await createTask(title);
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        const updatedTask = await updateTask(id, { completed: !task.completed });
        setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleUpdateTask = async (id: string, title: string) => {
    try {
      const updatedTask = await updateTask(id, { title });
      setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
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

  const handleEmptyStateAdd = () => {
    // Focus on the input field when user clicks "Add Your First Task"
    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const allTasksEmpty = tasks.length === 0;

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>🌟 SmartToDo</h1>
          <p className={styles.subtitle}>Your journey to productivity starts here!</p>
        </header>

        <TaskForm onSubmit={handleCreateTask} />

        {!loading && !allTasksEmpty && (
          <Filter filter={filter} onChange={setFilter} tasks={tasks} />
        )}

        {loading ? (
          <div className={styles.loading}>Loading your tasks...</div>
        ) : allTasksEmpty ? (
          <EmptyState onAddTask={handleEmptyStateAdd} />
        ) : filteredTasks.length === 0 ? (
          <div className={styles.noResults}>
            <p>No {filter === 'active' ? 'active' : 'completed'} tasks found! 🎉</p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggle={handleToggleTask}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
          />
        )}
      </div>
    </div>
  );
}

export default App;
