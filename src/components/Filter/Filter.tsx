import { Task } from '../../types';
import styles from './Filter.module.css';

export type FilterStatus = 'all' | 'active' | 'completed';

interface FilterProps {
  filter: FilterStatus;
  onChange: (filter: FilterStatus) => void;
  tasks: Task[];
}

export const Filter = ({ filter, onChange, tasks }: FilterProps) => {
  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className={styles.filter}>
      <label htmlFor="filter-select" className={styles.label}>
        Filter tasks:
      </label>
      <select
        id="filter-select"
        value={filter}
        onChange={(e) => onChange(e.target.value as FilterStatus)}
        className={styles.select}
      >
        <option value="all">All ({tasks.length})</option>
        <option value="active">Active ({activeCount})</option>
        <option value="completed">Completed ({completedCount})</option>
      </select>
    </div>
  );
};
