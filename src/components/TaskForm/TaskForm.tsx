import { useState, FormEvent } from 'react';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  onSubmit: (title: string) => void;
}

export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle) {
      onSubmit(trimmedTitle);
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What do you want to accomplish today? ✨"
        className={styles.input}
      />
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
