import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Task } from '../../types';
import styles from './StatusCell.module.css';

interface StatusCellProps {
  value: Task['status'];
  onChange: (status: Task['status']) => void;
  isNew?: boolean;
}

const statusOptions: Array<{ value: Task['status']; label: string; color: string }> = [
  { value: 'not-started', label: 'Not started yet', color: '#9ca3af' },
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'completed', label: 'Completed', color: '#10b981' },
];

export const StatusCell = ({ value, onChange, isNew: _isNew }: StatusCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Position dropdown - use setTimeout to ensure DOM is ready
    const positionDropdown = () => {
      if (buttonRef.current && dropdownRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 150;
        const dropdownWidth = 180;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        let top = rect.bottom + 4;
        let left = rect.left;
        
        // If dropdown would go off bottom, show above instead
        if (top + dropdownHeight > viewportHeight) {
          top = rect.top - dropdownHeight - 4;
        }
        
        // If dropdown would go off right, adjust left
        if (left + dropdownWidth > viewportWidth) {
          left = viewportWidth - dropdownWidth - 10;
        }
        
        // Ensure it doesn't go off left
        if (left < 10) {
          left = 10;
        }
        
        dropdownRef.current.style.top = `${Math.max(10, top)}px`;
        dropdownRef.current.style.left = `${left}px`;
      }
    };

    // Use both requestAnimationFrame and setTimeout to ensure positioning
    requestAnimationFrame(() => {
      setTimeout(positionDropdown, 0);
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentStatus = statusOptions.find(opt => opt.value === value) || statusOptions[0];

  return (
    <>
      <div className={styles.statusCell}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={styles.statusButton}
          style={{ backgroundColor: currentStatus.color + '20', color: currentStatus.color, borderColor: currentStatus.color + '40' }}
        >
          {currentStatus.label}
          <span className={styles.arrow}>▼</span>
        </button>
      </div>

      {isOpen && createPortal(
        <div className={styles.dropdown} ref={dropdownRef}>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={styles.statusOption}
              style={{
                backgroundColor: option.value === value ? option.color + '20' : 'transparent',
              }}
            >
              <span
                className={styles.statusDot}
                style={{ backgroundColor: option.color }}
              />
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};
