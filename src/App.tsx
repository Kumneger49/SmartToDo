import { useState, useEffect } from 'react';
import { Task } from './types';
import { TodayOverview } from './components/TodayOverview/TodayOverview';
import { TaskTable } from './components/TaskTable/TaskTable';
import { Login } from './components/Login/Login';
import { Signup } from './components/Signup/Signup';
import { authApi, tasksApi } from './api/api';
import styles from './App.module.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSignup, setShowSignup] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Load tasks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      if (authApi.isAuthenticated()) {
        // Verify token is still valid
        await authApi.verify();
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Token invalid or expired
      authApi.logout();
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const loadedTasks = await tasksApi.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // If auth error, logout
      if (error instanceof Error && error.message.includes('token')) {
        authApi.logout();
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await tasksApi.createTask(taskData);
      // Reload tasks to get proper sorting
      await loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await tasksApi.updateTask(id, updates);
      // Reload tasks to ensure consistency
      await loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await tasksApi.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowSignup(false);
  };

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    setTasks([]);
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return showSignup ? (
      <Signup
        onSignupSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setShowSignup(false)}
      />
    ) : (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  }

  // Show main app if authenticated
  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>BarakaFlow</h1>
            <div className={styles.headerActions}>
              <TodayOverview tasks={tasks} />
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
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
