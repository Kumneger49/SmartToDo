import { useState } from 'react';
import { Task } from '../../types';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal/DeleteConfirmationModal';
import { AISuggestions } from '../AISuggestions/AISuggestions';
import { DateTimePicker } from '../DateTimePicker/DateTimePicker';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, title: string, description?: string, scheduledDateTime?: string) => void;
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

const formatScheduledDateTime = (isoString: string): { date: string; time: string } => {
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
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editScheduledDateTime, setEditScheduledDateTime] = useState(task.scheduledDateTime || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { date, time } = formatDate(task.createdAt);
  const scheduledDateTime = task.scheduledDateTime ? formatScheduledDateTime(task.scheduledDateTime) : null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditScheduledDateTime(task.scheduledDateTime || '');
  };

  const handleSave = () => {
    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();
    if (trimmedTitle && (
      trimmedTitle !== task.title || 
      trimmedDescription !== (task.description || '') ||
      editScheduledDateTime !== (task.scheduledDateTime || '')
    )) {
      onUpdate(task.id, trimmedTitle, trimmedDescription || undefined, editScheduledDateTime || undefined);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditScheduledDateTime(task.scheduledDateTime || '');
    setIsEditing(false);
  };

  const handleScheduledDateTimeChange = (isoString: string | undefined) => {
    setEditScheduledDateTime(isoString || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
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
          <div className={styles.editForm}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.editInput}
              placeholder="Task title"
              autoFocus
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.editTextarea}
              placeholder="Task description (optional)"
              rows={3}
            />
            <div className={styles.editDateTimeSection}>
              <label className={styles.editDateTimeLabel}>Schedule for:</label>
              <DateTimePicker
                value={editScheduledDateTime || undefined}
                onChange={handleScheduledDateTimeChange}
                min={new Date().toISOString()}
              />
            </div>
            <div className={styles.editActions}>
              <button onClick={handleSave} className={styles.saveButton}>
                Save
              </button>
              <button onClick={handleCancel} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className={styles.title}>{task.title}</h3>
            {task.description && (
              <p className={styles.description}>{task.description}</p>
            )}
          </>
        )}
      </div>

      <div className={styles.taskFooter}>
        <div className={styles.dateInfo}>
          <span className={styles.dateIcon}>📅</span>
          <span className={styles.dateText}>Created: {date}</span>
          <span className={styles.timeText}>{time}</span>
        </div>
        {scheduledDateTime && (
          <div className={styles.scheduledInfo}>
            <span className={styles.scheduledIcon}>⏰</span>
            <span className={styles.scheduledText}>
              Scheduled: {scheduledDateTime.date} at {scheduledDateTime.time}
            </span>
          </div>
        )}
      </div>

      {!isEditing && (
        <AISuggestions taskTitle={task.title} taskDescription={task.description} />
      )}
    </div>
    </>
  );
};
