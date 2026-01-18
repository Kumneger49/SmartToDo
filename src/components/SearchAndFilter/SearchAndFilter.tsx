import { useState } from 'react';
import styles from './SearchAndFilter.module.css';

export type FilterType = 'all' | 'completed' | 'pending' | 'not-started' | 'today';

interface SearchAndFilterProps {
  searchQuery: string;
  filter: FilterType;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: FilterType) => void;
}

export const SearchAndFilter = ({ searchQuery, filter, onSearchChange, onFilterChange }: SearchAndFilterProps) => {
  return (
    <div className={styles.searchAndFilter}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.filterContainer}>
        <button
          onClick={() => onFilterChange('all')}
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange('pending')}
          className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
        >
          Pending
        </button>
        <button
          onClick={() => onFilterChange('not-started')}
          className={`${styles.filterButton} ${filter === 'not-started' ? styles.active : ''}`}
        >
          Not Started
        </button>
        <button
          onClick={() => onFilterChange('completed')}
          className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
        >
          Completed
        </button>
        <button
          onClick={() => onFilterChange('today')}
          className={`${styles.filterButton} ${filter === 'today' ? styles.active : ''}`}
        >
          Today
        </button>
      </div>
    </div>
  );
};
