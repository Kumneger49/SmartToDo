import { useState } from 'react';
import { Task } from '../../types';
import { UpdatesModal } from '../UpdatesModal/UpdatesModal';
import styles from './UpdatesButton.module.css';

interface UpdatesButtonProps {
  task: Task;
  onUpdate: (updates: Task['updates']) => void;
}

export const UpdatesButton = ({ task, onUpdate }: UpdatesButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updateCount = task.updates?.length || 0;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={styles.updatesButton}
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
