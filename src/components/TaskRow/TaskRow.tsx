import { useState, useRef, useEffect } from 'react';
import { Task } from '../../types';
import { OwnerCell } from '../OwnerCell/OwnerCell';
import { StatusCell } from '../StatusCell/StatusCell';
import { TimelineCell } from '../TimelineCell/TimelineCell';
import { UpdatesButton } from '../UpdatesButton/UpdatesButton';
import { AISuggestionsButton } from '../AISuggestionsButton/AISuggestionsButton';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal/DeleteConfirmationModal';
import styles from './TaskRow.module.css';

interface TaskRowProps {
  task: Task | null;
  isNew: boolean;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export const TaskRow = ({ task, isNew, onSave, onCancel, onUpdate, onDelete }: TaskRowProps) => {
  const [editingTitle, setEditingTitle] = useState(isNew);
  const [editingDescription, setEditingDescription] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.title || '');
  const [descriptionValue, setDescriptionValue] = useState(task?.description || '');
  const [ownerValue, setOwnerValue] = useState(task?.owner);
  const [statusValue, setStatusValue] = useState<Task['status']>(task?.status || 'not-started');
  const [startTimeValue, setStartTimeValue] = useState(task?.startTime);
  const [endTimeValue, setEndTimeValue] = useState(task?.endTime);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isNew && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isNew]);

  // Sync state with task prop when it changes (for existing tasks)
  useEffect(() => {
    if (task && !isNew) {
      setTitleValue(task.title);
      setDescriptionValue(task.description || '');
      setOwnerValue(task.owner);
      setStatusValue(task.status || 'not-started');
      setStartTimeValue(task.startTime);
      setEndTimeValue(task.endTime);
      setEditingTitle(false);
      setEditingDescription(false);
    }
  }, [task?.id, task?.title, task?.description, task?.owner, task?.status, task?.startTime, task?.endTime, isNew]);

  const handleTitleClick = () => {
    if (!isNew) {
      setEditingTitle(true);
    }
  };

  const handleTitleBlur = () => {
    if (isNew) {
      return; // Don't blur for new tasks
    }
    setEditingTitle(false);
    if (task && titleValue.trim() && titleValue.trim() !== task.title) {
      onUpdate(task.id, { title: titleValue.trim() });
    } else if (task) {
      // Reset to original if empty or unchanged
      setTitleValue(task.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      if (task) {
        setTitleValue(task.title);
      }
      setEditingTitle(false);
    }
  };

  const handleDescriptionClick = () => {
    if (!isNew) {
      setEditingDescription(true);
      setTimeout(() => descriptionInputRef.current?.focus(), 0);
    }
  };

  const handleDescriptionBlur = () => {
    if (isNew) {
      return; // Don't blur for new tasks
    }
    setEditingDescription(false);
    if (task && descriptionValue.trim() !== (task.description || '')) {
      onUpdate(task.id, { description: descriptionValue.trim() || undefined });
    } else if (task) {
      setDescriptionValue(task.description || '');
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      if (task) {
        setDescriptionValue(task.description || '');
      }
      setEditingDescription(false);
    }
  };

  const handleCheckboxChange = () => {
    if (task) {
      const newStatus = task.completed ? 'not-started' : 'completed';
      onUpdate(task.id, { 
        completed: !task.completed,
        status: newStatus 
      });
    }
  };

  const handleOwnerChange = (owner: string | undefined) => {
    if (task) {
      onUpdate(task.id, { owner });
    } else if (isNew) {
      setOwnerValue(owner);
    }
  };

  const handleStatusChange = (status: Task['status']) => {
    if (task) {
      onUpdate(task.id, { 
        status,
        completed: status === 'completed'
      });
    } else if (isNew) {
      setStatusValue(status);
    }
  };

  const handleTimelineChange = (startTime: string | undefined, endTime: string | undefined) => {
    if (task) {
      onUpdate(task.id, { startTime, endTime });
    } else if (isNew) {
      setStartTimeValue(startTime);
      setEndTimeValue(endTime);
    }
  };

  const handleSaveNewTask = () => {
    if (!titleValue.trim() || !startTimeValue || !endTimeValue) return;
    
    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      title: titleValue.trim(),
      description: descriptionValue.trim() || undefined,
      completed: statusValue === 'completed',
      status: statusValue,
      startTime: startTimeValue,
      endTime: endTimeValue,
      owner: ownerValue,
      updates: tempUpdates, // Include any updates made before saving
    };
    onSave(newTask);
    setTempUpdates([]); // Reset temp updates
  };

  const handleCancelNewTask = () => {
    setTitleValue('');
    setDescriptionValue('');
    setOwnerValue(undefined);
    setStatusValue('not-started');
    setStartTimeValue(undefined);
    setEndTimeValue(undefined);
    onCancel();
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (task) {
      onDelete(task.id);
    }
    setShowDeleteModal(false);
  };

  // For new tasks, create a temporary task object with current form values
  const displayTask = task || (isNew ? {
    id: 'temp-new',
    title: titleValue,
    description: descriptionValue || undefined,
    completed: statusValue === 'completed',
    status: statusValue,
    createdAt: new Date().toISOString(),
    startTime: startTimeValue,
    endTime: endTimeValue,
    owner: ownerValue,
    updates: [],
  } : null);

  if (!displayTask) return null;

  // Handle updates for new tasks (store temporarily, will be saved when task is saved)
  const [tempUpdates, setTempUpdates] = useState<Task['updates']>([]);
  
  const handleUpdatesChange = (updates: Task['updates']) => {
    if (isNew) {
      setTempUpdates(updates || []);
    } else if (task) {
      onUpdate(task.id, { updates });
    }
  };

  return (
    <>
      {showDeleteModal && task && (
        <DeleteConfirmationModal
          taskTitle={task.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      <tr className={`${styles.taskRow} ${isNew ? styles.newRow : ''} ${displayTask.completed ? styles.completed : ''}`}>
        <td className={styles.checkboxCell}>
          {!isNew && (
            <input
              type="checkbox"
              checked={displayTask.completed}
              onChange={handleCheckboxChange}
              className={styles.checkbox}
            />
          )}
        </td>
        <td className={styles.taskCell} onClick={handleTitleClick}>
          {editingTitle || isNew ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className={styles.titleInput}
              placeholder="Enter task title..."
              autoFocus={isNew}
            />
          ) : (
            <span className={styles.taskTitle}>{displayTask.title || 'Untitled'}</span>
          )}
        </td>
        <td className={styles.descriptionCell} onClick={handleDescriptionClick}>
          {editingDescription || isNew ? (
            <textarea
              ref={descriptionInputRef}
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleDescriptionKeyDown}
              className={styles.descriptionInput}
              placeholder="Add description (helps AI provide better suggestions)..."
              rows={2}
            />
          ) : (
            <span className={styles.descriptionText}>
              {displayTask.description || <span className={styles.placeholderText}>Click to add description</span>}
            </span>
          )}
        </td>
        <td className={styles.ownerCell}>
          <OwnerCell
            key={`owner-${isNew ? ownerValue || 'new' : displayTask.id}`}
            value={isNew ? ownerValue : displayTask.owner}
            onChange={handleOwnerChange}
            isNew={isNew}
          />
        </td>
        <td className={styles.statusCell}>
          <StatusCell
            key={`status-${isNew ? statusValue : displayTask.id}`}
            value={isNew ? statusValue : (displayTask.status || 'not-started')}
            onChange={handleStatusChange}
            isNew={isNew}
          />
        </td>
        <td className={styles.timelineCell}>
          <TimelineCell
            key={`timeline-${isNew ? (startTimeValue || 'new') : displayTask.id}`}
            startTime={isNew ? startTimeValue : displayTask.startTime}
            endTime={isNew ? endTimeValue : displayTask.endTime}
            onChange={handleTimelineChange}
            isNew={isNew}
          />
        </td>
        <td className={styles.updatesCell}>
          <UpdatesButton 
            task={{ ...displayTask, updates: isNew ? tempUpdates : displayTask.updates }} 
            onUpdate={handleUpdatesChange} 
          />
        </td>
        <td className={styles.aiCell}>
          <AISuggestionsButton task={displayTask} />
        </td>
        <td className={styles.actionsCell}>
          {isNew ? (
            <div className={styles.newTaskActions}>
              <button 
                onClick={handleSaveNewTask} 
                className={styles.saveButton} 
                disabled={!titleValue.trim() || !startTimeValue || !endTimeValue}
                title={!titleValue.trim() || !startTimeValue || !endTimeValue ? 'Fill all required fields' : 'Save task'}
              >
                Save
              </button>
              <button onClick={handleCancelNewTask} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={handleDeleteClick} className={styles.deleteButton} title="Delete task">
              🗑️
            </button>
          )}
        </td>
      </tr>
    </>
  );
};
