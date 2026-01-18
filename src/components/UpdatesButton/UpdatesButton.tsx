import { useState } from 'react';
import { Task } from '../../types';
import { UpdatesModal } from '../UpdatesModal/UpdatesModal';
import styles from './UpdatesButton.module.css';

interface UpdatesButtonProps {
  task: Task;
  onUpdate: (updates: Task['updates']) => void;
  disabled?: boolean;
}

export const UpdatesButton = ({ task, onUpdate, disabled = false }: UpdatesButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updateCount = task.updates?.length || 0;

  return (
    <>
      <button
        onClick={() => !disabled && setIsModalOpen(true)}
        className={`${styles.updatesButton} ${disabled ? styles.disabled : ''}`}
        disabled={disabled}
        title={disabled ? 'Save the task first to add updates' : 'Write new update'}
      >
        Write new update
        {updateCount > 0 && (
          <span className={styles.badge}>{updateCount}</span>
        )}
      </button>

      {isModalOpen && (
        <UpdatesModal
          task={task}
          onClose={() => setIsModalOpen(false)}
          onUpdate={(updates) => {
            onUpdate(updates);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};
