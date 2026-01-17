import styles from './EmptyState.module.css';

interface EmptyStateProps {
  onAddTask: () => void;
}

export const EmptyState = ({ onAddTask }: EmptyStateProps) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emoji}>😊</div>
      <h2 className={styles.title}>No tasks yet!</h2>
      <p className={styles.message}>Ready to make today amazing? Let's get started!</p>
      <button onClick={onAddTask} className={styles.addButton}>
        Add Your First Task ✨
      </button>
    </div>
  );
};
