import { useState, useEffect } from 'react';
import { Task } from '../../types';
import { getDayOptimization, DayOptimization } from '../../api/openaiApi';
import styles from './TodayOverview.module.css';

interface TodayOverviewProps {
  tasks: Task[];
}

interface CachedOptimization {
  date: string; // YYYY-MM-DD
  optimization: DayOptimization;
  taskIds: string[]; // IDs of tasks used to generate this optimization
}

const STORAGE_KEY = 'smart_todo_day_optimization';

export const TodayOverview = ({ tasks }: TodayOverviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState<DayOptimization | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get today's date string
  const getTodayDateString = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // Load cached optimization for today
  const loadCachedOptimization = (): DayOptimization | null => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const cachedData: CachedOptimization = JSON.parse(cached);
        const todayStr = getTodayDateString();
        if (cachedData.date === todayStr && cachedData.optimization) {
          return cachedData.optimization;
        }
      }
    } catch (error) {
      console.error('Failed to load cached optimization:', error);
    }
    return null;
  };

  // Check if cached optimization is still valid (same tasks)
  const isCachedOptimizationValid = (): boolean => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return false;
      
      const cachedData: CachedOptimization = JSON.parse(cached);
      const todayStr = getTodayDateString();
      
      // Check if cache is for today
      if (cachedData.date !== todayStr) return false;
      
      // Get current today's tasks
      const currentTodayTasks = getTodayTasks();
      
      // Check if task IDs match
      const currentTaskIds = currentTodayTasks.map(task => task.id).sort();
      const cachedTaskIds = (cachedData.taskIds || []).sort();
      
      if (currentTaskIds.length !== cachedTaskIds.length) return false;
      
      // Compare arrays
      return currentTaskIds.every((id, index) => id === cachedTaskIds[index]);
    } catch (error) {
      console.error('Failed to validate cached optimization:', error);
      return false;
    }
  };

  // Save optimization to cache
  const saveOptimization = (opt: DayOptimization) => {
    try {
      const todayStr = getTodayDateString();
      const currentTodayTasks = getTodayTasks();
      const taskIds = currentTodayTasks.map(task => task.id);
      const cachedData: CachedOptimization = {
        date: todayStr,
        optimization: opt,
        taskIds: taskIds,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Failed to save optimization:', error);
    }
  };

  // Clear cache if tasks have changed
  const clearCacheIfInvalid = () => {
    if (!isCachedOptimizationValid()) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        setOptimization(null);
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  };

  // Check if cached optimization is valid when tasks change
  useEffect(() => {
    const currentTodayTasks = getTodayTasks();
    
    if (currentTodayTasks.length === 0) {
      // No tasks today - clear any cached optimization
      setOptimization(null);
      return;
    }

    // Check if cache is still valid (same tasks)
    if (isCachedOptimizationValid()) {
      const cached = loadCachedOptimization();
      if (cached) {
        setOptimization(cached);
      }
    } else {
      // Tasks have changed - clear cache
      clearCacheIfInvalid();
    }
  }, [tasks]); // Re-run when tasks change

  // Get today's tasks (tasks that start today)
  const getTodayTasks = (): Task[] => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    return tasks.filter(task => {
      if (!task.startTime) return false;
      const taskDate = new Date(task.startTime);
      const taskDateStr = taskDate.toISOString().split('T')[0];
      return taskDateStr === todayStr;
    });
  };

  const todayTasks = getTodayTasks();

  const handleClick = async () => {
    setIsOpen(true);
    
    if (todayTasks.length === 0) {
      // No tasks today - show vacation message
      setOptimization(null);
      setError(null);
      return;
    }

    // Check if we have valid cached optimization for today
    if (isCachedOptimizationValid()) {
      const cached = loadCachedOptimization();
      if (cached) {
        setOptimization(cached);
        setError(null);
        return;
      }
    } else {
      // Tasks have changed - clear old cache
      clearCacheIfInvalid();
    }

    // Fetch optimization from LLM
    setLoading(true);
    setError(null);

    try {
      const tasksForLLM = todayTasks.map(task => ({
        title: task.title,
        description: task.description,
        startTime: task.startTime!,
        endTime: task.endTime!,
      }));

      const result = await getDayOptimization(tasksForLLM);
      setOptimization(result);
      saveOptimization(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get day optimization');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    // Don't clear optimization - keep it cached
  };

  return (
    <>
      <button onClick={handleClick} className={styles.button}>
        📅 What does today look like?
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.content} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleClose}>
              ✕
            </button>

            {todayTasks.length === 0 ? (
              <div className={styles.vacationMessage}>
                <h2 className={styles.vacationTitle}>🌴 You have nothing today!</h2>
                <p className={styles.vacationText}>I guess you are on a vacation, enjoy! 😊</p>
              </div>
            ) : loading ? (
              <div className={styles.loading}>
                <p>Analyzing your day...</p>
              </div>
            ) : error ? (
              <div className={styles.error}>
                <p>⚠️ {error}</p>
              </div>
            ) : optimization ? (
              <div className={styles.optimization}>
                <h2 className={styles.title}>✨ Your Day Optimization</h2>
                
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>📋 Summary</h3>
                  <p className={styles.summaryText}>{optimization.summary}</p>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>☕ Break Suggestions</h3>
                  <ul className={styles.list}>
                    {optimization.breakSuggestions.map((suggestion, index) => (
                      <li key={index} className={styles.listItem}>{suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>⚡ Energy Management</h3>
                  <ul className={styles.list}>
                    {optimization.energyManagement.map((tip, index) => (
                      <li key={index} className={styles.listItem}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>🎯 Actionable Steps</h3>
                  <ul className={styles.list}>
                    {optimization.actionableSteps.map((step, index) => (
                      <li key={index} className={styles.listItem}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.footerNote}>
                  <p className={styles.footerText}>
                    💡 <strong>Tip:</strong> If you want more specific tips on how to do each task, go to each task and click "Get AI Help"
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};
