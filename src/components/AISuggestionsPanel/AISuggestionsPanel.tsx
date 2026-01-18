import { useState, useEffect } from 'react';
import { Task } from '../../types';
import { getAISuggestions, AISuggestions, TaskContext } from '../../api/openaiApi';
import styles from './AISuggestionsPanel.module.css';

interface AISuggestionsPanelProps {
  task: Task;
  onClose: () => void;
}

const STORAGE_KEY_PREFIX = 'smart_todo_ai_suggestions_';

const getCacheKey = (taskId: string): string => {
  return `${STORAGE_KEY_PREFIX}${taskId}`;
};

interface CachedSuggestions {
  taskId: string;
  taskContext: TaskContext;
  suggestions: AISuggestions;
  timestamp: string;
}

const getTaskContextHash = (context: TaskContext): string => {
  return JSON.stringify({
    title: context.title,
    description: context.description,
    owner: context.owner,
    status: context.status,
    startTime: context.startTime,
    endTime: context.endTime,
    updatesCount: context.updates?.length || 0,
    lastUpdateTime: context.updates && context.updates.length > 0 
      ? context.updates[context.updates.length - 1].timestamp 
      : undefined,
  });
};

export const AISuggestionsPanel = ({ task, onClose }: AISuggestionsPanelProps) => {
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [
    task.id, 
    task.title, 
    task.description, 
    task.owner, 
    task.status, 
    task.startTime, 
    task.endTime,
    task.updates?.length,
  ]);

  const loadSuggestions = async () => {
    // Build task context
    const taskContext: TaskContext = {
      title: task.title,
      description: task.description,
      owner: task.owner,
      status: task.status,
      startTime: task.startTime,
      endTime: task.endTime,
      updates: task.updates?.map(update => ({
        author: update.author,
        content: update.content,
        timestamp: update.timestamp,
        likes: update.likes,
      })),
    };

    const contextHash = getTaskContextHash(taskContext);

    // Check cache first
    const cacheKey = getCacheKey(task.id);
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const cachedData: CachedSuggestions = JSON.parse(cached);
        // Check if task context changed
        const cachedHash = getTaskContextHash(cachedData.taskContext);
        if (cachedHash === contextHash) {
          setSuggestions(cachedData.suggestions);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load cached suggestions:', error);
    }

    // Fetch from API
    setLoading(true);
    setError(null);

    try {
      const result = await getAISuggestions(taskContext);
      setSuggestions(result);

      // Cache the result
      const cacheData: CachedSuggestions = {
        taskId: task.id,
        taskContext: taskContext,
        suggestions: result,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3 className={styles.title}>AI Suggestions</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.taskInfo}>
            <h4 className={styles.taskTitle}>{task.title}</h4>
            {task.description && (
              <p className={styles.taskDescription}>{task.description}</p>
            )}
          </div>

          {loading && (
            <div className={styles.loading}>
              <p>Getting AI suggestions...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>⚠️ {error}</p>
            </div>
          )}

          {suggestions && (
            <div className={styles.suggestions}>
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>💡 Tips</h4>
                <ul className={styles.list}>
                  {suggestions.tips.map((tip, index) => (
                    <li key={index} className={styles.listItem}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>✨ Suggestions</h4>
                <ul className={styles.list}>
                  {suggestions.suggestions.map((suggestion, index) => (
                    <li key={index} className={styles.listItem}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>🎯 Approach</h4>
                <p className={styles.approach}>{suggestions.approach}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
