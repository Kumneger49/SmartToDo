import { useState } from 'react';
import { Task } from '../../types';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal/DeleteConfirmationModal';
import { AISuggestions } from '../AISuggestions/AISuggestions';
// StartEndTimePicker was removed - this component is deprecated
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, title: string, description?: string, startTime?: string, endTime?: string) => void;
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

const formatDateTime = (isoString: string): { date: string; time: string } => {
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

const getDateFromISO = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TaskItem = ({ task, onToggle, onUpdate, onDelete }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [_editDate, setEditDate] = useState<string | undefined>(
    task.startTime ? getDateFromISO(task.startTime) : undefined
  );
  const [editStartTime, setEditStartTime] = useState(task.startTime || '');
  const [editEndTime, setEditEndTime] = useState(task.endTime || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { date, time } = formatDate(task.createdAt);
  const startDateTime = task.startTime ? formatDateTime(task.startTime) : null;
  const endDateTime = task.endTime ? formatDateTime(task.endTime) : null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDate(task.startTime ? getDateFromISO(task.startTime) : undefined);
    setEditStartTime(task.startTime || '');
    setEditEndTime(task.endTime || '');
  };

  const handleSave = () => {
    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();
    if (trimmedTitle && (
      trimmedTitle !== task.title || 
      trimmedDescription !== (task.description || '') ||
      editStartTime !== (task.startTime || '') ||
      editEndTime !== (task.endTime || '')
    )) {
      onUpdate(task.id, trimmedTitle, trimmedDescription || undefined, editStartTime || undefined, editEndTime || undefined);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDate(task.startTime ? getDateFromISO(task.startTime) : undefined);
    setEditStartTime(task.startTime || '');
    setEditEndTime(task.endTime || '');
    setIsEditing(false);
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
              <p className={styles.note}>Note: Use the table view to edit task timelines.</p>
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
        {startDateTime && endDateTime && (
          <div className={styles.scheduledInfo}>
            <span className={styles.scheduledIcon}>⏰</span>
            <span className={styles.scheduledText}>
              {startDateTime.date === endDateTime.date ? (
                <>
                  {startDateTime.date}: {startDateTime.time} - {endDateTime.time}
                </>
              ) : (
                <>
                  {startDateTime.date} {startDateTime.time} - {endDateTime.date} {endDateTime.time}
                </>
              )}
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
