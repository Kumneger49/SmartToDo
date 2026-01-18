import { useState, useEffect } from 'react';
import { getAISuggestions, type AISuggestions as AISuggestionsData } from '../../api/openaiApi';
import styles from './AISuggestions.module.css';

interface AISuggestionsProps {
  taskTitle: string;
  taskDescription?: string;
}

export const AISuggestions = ({ taskTitle, taskDescription }: AISuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<AISuggestionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Reset state when task title or description changes
    setSuggestions(null);
    setError(null);
    setIsExpanded(false);
  }, [taskTitle, taskDescription]);

  const fetchSuggestions = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);
    setIsExpanded(true);

    try {
      const data = await getAISuggestions({
        title: taskTitle,
        description: taskDescription,
        status: 'not-started',
      });
      setSuggestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isExpanded && !loading) {
      if (!suggestions) {
        fetchSuggestions();
      } else {
        setIsExpanded(true);
      }
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={styles.aiSuggestions}>
      <button onClick={handleToggle} className={styles.toggleButton}>
        <span className={styles.icon}>🤖</span>
        <span className={styles.label}>Get AI Help</span>
        <span className={styles.arrow}>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>AI is thinking... ✨</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>⚠️ {error}</p>
              <button onClick={fetchSuggestions} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          )}

          {suggestions && !loading && (
            <div className={styles.suggestionsContent}>
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>💡 Helpful Tips</h4>
                <ul className={styles.list}>
                  {suggestions.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>✨ Suggestions</h4>
                <ul className={styles.list}>
                  {suggestions.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>🎯 How to Approach</h4>
                <p className={styles.approach}>{suggestions.approach}</p>
              </div>

              <div className={styles.footerNote}>
                <p>💡 <strong>Tip:</strong> If these suggestions don't match what you're looking for, try adding a more descriptive description or editing the task title for better AI assistance!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
