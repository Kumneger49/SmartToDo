import { Task } from '../../types';
import { TaskItem } from '../TaskItem/TaskItem';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, title: string, description?: string, scheduledDateTime?: string) => void;
  onDelete: (id: string) => void;
}

export const TaskList = ({ tasks, onToggle, onUpdate, onDelete }: TaskListProps) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className={styles.taskList}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
