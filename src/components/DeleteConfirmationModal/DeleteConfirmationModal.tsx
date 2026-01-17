import styles from './DeleteConfirmationModal.module.css';

interface DeleteConfirmationModalProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal = ({ taskTitle, onConfirm, onCancel }: DeleteConfirmationModalProps) => {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Delete Task?</h2>
        </div>
        <div className={styles.content}>
          <p className={styles.message}>
            Are you sure you want to delete <strong>"{taskTitle}"</strong>?
          </p>
          <p className={styles.warning}>This action cannot be undone.</p>
        </div>
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
