import { useState, useEffect } from 'react';
import { Task } from '../../types';
import { getDayOptimization, DayOptimization, sendDayOptimizationChatMessage, ChatMessage } from '../../api/openaiApi';
import { ChatInterface } from '../ChatInterface/ChatInterface';
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
  const [showChat, setShowChat] = useState(false);
  const [noTasksForDate, setNoTasksForDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  // Get date string for a given date
  const getDateString = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // Get today's date string
  const getTodayDateString = (): string => {
    return getDateString(new Date());
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

  // Check if cached optimization is still valid (same tasks and date)
  const isCachedOptimizationValid = (dateStr: string): boolean => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return false;
      
      const cachedData: CachedOptimization = JSON.parse(cached);
      
      // Check if cache is for the selected date
      if (cachedData.date !== dateStr) return false;
      
      // Get current tasks for the selected date
      const currentTasks = getTasksForDate(dateStr);
      
      // Check if task IDs match
      const currentTaskIds = currentTasks.map(task => task.id).sort();
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
  const saveOptimization = (opt: DayOptimization, dateStr: string) => {
    try {
      const currentTasks = getTasksForDate(dateStr);
      const taskIds = currentTasks.map(task => task.id);
      const cachedData: CachedOptimization = {
        date: dateStr,
        optimization: opt,
        taskIds: taskIds,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Failed to save optimization:', error);
    }
  };

  // Clear cache if tasks have changed
  const clearCacheIfInvalid = (dateStr: string) => {
    if (!isCachedOptimizationValid(dateStr)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        setOptimization(null);
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  };

  // Get tasks for a specific date (including recurring tasks)
  const getTasksForDate = (dateStr: string): Task[] => {
    const targetDate = new Date(dateStr);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    return tasks.filter(task => {
      if (!task.startTime) return false;
      
      const taskStartDate = new Date(task.startTime);
      const taskStartDateStr = taskStartDate.toISOString().split('T')[0];
      
      // Check if task starts on the selected date
      if (taskStartDateStr === targetDateStr) {
        return true;
      }
      
      // Check if it's a recurring task that should occur on this date
      if (task.recurrence && task.recurrence.frequency !== 'none') {
        const daysDiff = Math.floor((targetDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < 0) return false; // Date is before task start
        
        switch (task.recurrence.frequency) {
          case 'daily':
            return true; // Daily tasks occur every day
          case 'weekly':
            return daysDiff % 7 === 0; // Weekly tasks occur every 7 days
          case 'monthly':
            return taskStartDate.getDate() === targetDate.getDate(); // Same day of month
          case 'yearly':
            return taskStartDate.getMonth() === targetDate.getMonth() && 
                   taskStartDate.getDate() === targetDate.getDate(); // Same month and day
          default:
            return false;
        }
      }
      
      return false;
    });
  };

  // This will be recalculated when needed

  const handleClick = () => {
    setIsOpen(true);
    // Reset state when opening modal
    setOptimization(null);
    setError(null);
    setShowChat(false);
    setNoTasksForDate(false);
  };

  const handleGenerateOptimization = async () => {
    const tasksForDate = getTasksForDate(selectedDate);
    
    // Check if there are tasks for the selected date
    if (tasksForDate.length === 0) {
      // No tasks for selected date - show message
      setOptimization(null);
      setError(null);
      setNoTasksForDate(true);
      setLoading(false);
      return;
    }
    
    // Reset no tasks flag if we have tasks
    setNoTasksForDate(false);

    // Check if we have valid cached optimization for selected date
    if (isCachedOptimizationValid(selectedDate)) {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const cachedData: CachedOptimization = JSON.parse(cached);
          if (cachedData.date === selectedDate && cachedData.optimization) {
            setOptimization(cachedData.optimization);
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to load cached optimization:', error);
      }
    } else {
      // Tasks have changed - clear old cache
      clearCacheIfInvalid(selectedDate);
    }

    // Fetch optimization from LLM
    setLoading(true);
    setError(null);

    try {
      const tasksForLLM = tasksForDate.map(task => ({
        title: task.title,
        description: task.description,
        startTime: task.startTime!,
        endTime: task.endTime!,
      }));

      const result = await getDayOptimization(tasksForLLM);
      setOptimization(result);
      saveOptimization(result, selectedDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get day optimization');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setShowChat(false);
    // Don't clear optimization - keep it cached
  };

  const formatInitialMessage = (opt: DayOptimization): string => {
    let message = '**📋 Summary:**\n';
    message += `${opt.summary}\n\n`;
    
    message += '**☕ Break Suggestions:**\n';
    opt.breakSuggestions.forEach(suggestion => {
      message += `- ${suggestion}\n`;
    });
    
    message += '\n**⚡ Energy Management:**\n';
    opt.energyManagement.forEach(tip => {
      message += `- ${tip}\n`;
    });
    
    message += '\n**🎯 Actionable Steps:**\n';
    opt.actionableSteps.forEach(step => {
      message += `- ${step}\n`;
    });
    
    return message;
  };

  const formatDateDisplay = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const todayStr = getTodayDateString();
    
    if (dateStr === todayStr) {
      return 'Today';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === getDateString(tomorrow)) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <button onClick={handleClick} className={styles.button}>
        📅 View Day Optimization
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.content} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleClose}>
              ✕
            </button>

            <div className={styles.dateSelector}>
              <label className={styles.dateLabel}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setOptimization(null);
                  setError(null);
                  setShowChat(false);
                  setNoTasksForDate(false);
                }}
                className={styles.dateInput}
              />
              <span className={styles.dateDisplay}>{formatDateDisplay(selectedDate)}</span>
              <button
                onClick={handleGenerateOptimization}
                className={styles.generateButton}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Optimization'}
              </button>
            </div>

            {!optimization && !loading && !error && !noTasksForDate && (
              <div className={styles.initialMessage}>
                <p className={styles.initialText}>
                  Select a date and click "Generate Optimization" to get AI-powered tips for that day.
                </p>
              </div>
            )}

            {loading ? (
              <div className={styles.loading}>
                <p>Analyzing your day...</p>
              </div>
            ) : error ? (
              <div className={styles.error}>
                <p>⚠️ {error}</p>
              </div>
            ) : noTasksForDate ? (
              <div className={styles.vacationMessage}>
                <h2 className={styles.vacationTitle}>🌴 You have nothing on {formatDateDisplay(selectedDate)}!</h2>
                <p className={styles.vacationText}>I guess you are on a vacation, enjoy! 😊</p>
              </div>
            ) : optimization ? (
              getTasksForDate(selectedDate).length === 0 ? (
                <div className={styles.vacationMessage}>
                  <h2 className={styles.vacationTitle}>📅 No tasks scheduled</h2>
                  <p className={styles.vacationText}>You have no tasks scheduled for {formatDateDisplay(selectedDate)}. Enjoy your free time! 😊</p>
                </div>
              ) : (
                <>
                  {!showChat ? (
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

                      <div className={styles.chatButtonContainer}>
                        <button
                          onClick={() => setShowChat(true)}
                          className={styles.chatButton}
                        >
                          💬 Ask a question
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.chatContainer}>
                      <ChatInterface
                        conversationId={`day-${selectedDate}`}
                        initialMessage={formatInitialMessage(optimization)}
                        systemPrompt="You are an expert productivity and energy management coach."
                        contextData={getTasksForDate(selectedDate)}
                        onSendMessage={async (message: string, conversationHistory: ChatMessage[]) => {
                          const tasksForLLM = getTasksForDate(selectedDate).map(task => ({
                            title: task.title,
                            description: task.description,
                            startTime: task.startTime!,
                            endTime: task.endTime!,
                          }));
                          return await sendDayOptimizationChatMessage(tasksForLLM, message, conversationHistory);
                        }}
                        onClearConversation={() => setShowChat(false)}
                      />
                    </div>
                  )}
                </>
              )
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};
