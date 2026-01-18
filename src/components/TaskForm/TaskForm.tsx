import { useState, FormEvent } from 'react';
// StartEndTimePicker was removed - this component is deprecated
import styles from './TaskForm.module.css';

interface TaskFormProps {
  onSubmit: (title: string, description?: string, startTime?: string, endTime?: string) => void;
}

export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [date, setDate] = useState<string | undefined>();
  const [startTime, setStartTime] = useState<string | undefined>();
  const [endTime, setEndTime] = useState<string | undefined>();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    
    // Require title, date, start time, and end time
    if (trimmedTitle && date && startTime && endTime) {
      onSubmit(
        trimmedTitle, 
        description.trim() || undefined,
        startTime,
        endTime
      );
      setTitle('');
      setDescription('');
      setDate(undefined);
      setStartTime(undefined);
      setEndTime(undefined);
      setShowDescription(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to accomplish today? ✨"
            className={styles.input}
          />
          {!showDescription && (
            <button
              type="button"
              onClick={() => setShowDescription(true)}
              className={styles.addDescriptionButton}
              title="Add description"
            >
              + Description
            </button>
          )}
        </div>
        {!showDescription && (
          <span className={styles.hintText}>
            💡 Adding a description helps AI provide more accurate suggestions
          </span>
        )}
      </div>
      {showDescription && (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description to help AI provide better suggestions (optional)..."
          className={styles.textarea}
          rows={3}
          onBlur={() => {
            if (!description.trim()) {
              setShowDescription(false);
            }
          }}
        />
      )}
      
      {/* Date/time picker removed - use TaskTable for new tasks */}
      <div className={styles.dateTimeSection}>
        <p className={styles.note}>Note: This form is deprecated. Use the table view to create tasks.</p>
      </div>

      <button 
        type="submit" 
        className={styles.button}
        disabled={!title.trim() || !date || !startTime || !endTime}
      >
        Add Task
      </button>
    </form>
  );
};
