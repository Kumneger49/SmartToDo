import { useState } from 'react';
import { Task } from '../../types';
import { AISuggestionsPanel } from '../AISuggestionsPanel/AISuggestionsPanel';
import styles from './AISuggestionsButton.module.css';

interface AISuggestionsButtonProps {
  task: Task;
}

export const AISuggestionsButton = ({ task }: AISuggestionsButtonProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsPanelOpen(true)}
        className={styles.aiButton}
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
