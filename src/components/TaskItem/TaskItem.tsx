import { useState } from 'react';
import { Task } from '../../types';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal/DeleteConfirmationModal';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

const formatDate = (isoString: string): { date: string; time: string } => {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  return { date: dateStr, time: timeStr };
};

export const TaskItem = ({ task, onToggle, onUpdate, onDelete }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { date, time } = formatDate(task.createdAt);

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
  };

  const handleSave = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== task.title) {
      onUpdate(task.id, trimmedTitle);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(task.id);
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmationModal
          taskTitle={task.title}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      <div className={`${styles.taskBlock} ${task.completed ? styles.completed : styles.pending}`}>
      <div className={styles.taskHeader}>
        <div className={styles.statusSection}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className={styles.checkbox}
          />
          <span className={styles.statusBadge}>
            {task.completed ? '✓ Completed' : '○ Pending'}
          </span>
        </div>
        <div className={styles.actions}>
          {!isEditing && (
            <>
              <button onClick={handleEdit} className={styles.editButton} title="Edit task">
                ✏️
              </button>
              <button onClick={handleDeleteClick} className={styles.deleteButton} title="Delete task">
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className={styles.taskContent}>
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={styles.editInput}
            autoFocus
          />
        ) : (
          <h3 className={styles.title}>{task.title}</h3>
        )}
      </div>

      <div className={styles.taskFooter}>
        <div className={styles.dateInfo}>
          <span className={styles.dateIcon}>📅</span>
          <span className={styles.dateText}>{date}</span>
          <span className={styles.timeText}>{time}</span>
        </div>
      </div>
    </div>
    </>
  );
};
