import { useState } from 'react';
import { Task } from '../../types';
import { AISuggestionsPanel } from '../AISuggestionsPanel/AISuggestionsPanel';
import styles from './AISuggestionsButton.module.css';

interface AISuggestionsButtonProps {
  task: Task;
  disabled?: boolean;
}

export const AISuggestionsButton = ({ task, disabled = false }: AISuggestionsButtonProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => !disabled && setIsPanelOpen(true)}
        className={`${styles.aiButton} ${disabled ? styles.disabled : ''}`}
        disabled={disabled}
        title={disabled ? 'Save the task first to get AI help' : 'Get AI Help'}
      >
        Get AI Help
      </button>

      {isPanelOpen && (
        <AISuggestionsPanel
          task={task}
          onClose={() => setIsPanelOpen(false)}
        />
      )}
    </>
  );
};
