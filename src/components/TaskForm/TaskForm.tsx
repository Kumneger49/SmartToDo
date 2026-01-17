import { useState, FormEvent } from 'react';
import { DateTimePicker } from '../DateTimePicker/DateTimePicker';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  onSubmit: (title: string, description?: string, scheduledDateTime?: string) => void;
}

export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle) {
      onSubmit(
        trimmedTitle, 
        description.trim() || undefined,
        scheduledDateTime || undefined
      );
      setTitle('');
      setDescription('');
      setScheduledDateTime('');
      setShowDescription(false);
      setShowDateTimePicker(false);
    }
  };

  const handleDateTimeChange = (isoString: string | undefined) => {
    setScheduledDateTime(isoString || '');
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
      
      <div className={styles.dateTimeSection}>
        {!showDateTimePicker ? (
          <button
            type="button"
            onClick={() => setShowDateTimePicker(true)}
            className={styles.addDateTimeButton}
          >
            📅 Schedule Task
          </button>
        ) : (
          <div className={styles.dateTimePicker}>
            <label className={styles.dateTimeLabel}>
              When do you want to do this task?
            </label>
            <DateTimePicker
              value={scheduledDateTime || undefined}
              onChange={handleDateTimeChange}
              min={new Date().toISOString()}
            />
            {scheduledDateTime && (
              <button
                type="button"
                onClick={() => {
                  setScheduledDateTime('');
                  setShowDateTimePicker(false);
                }}
                className={styles.clearDateTimeButton}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <button 
        type="submit" 
        className={styles.button}
        disabled={!title.trim()}
      >
        Add Task
      </button>
    </form>
  );
};
