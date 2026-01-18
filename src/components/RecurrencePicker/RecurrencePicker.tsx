import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RecurrenceFrequency } from '../../types';
import styles from './RecurrencePicker.module.css';

interface RecurrencePickerProps {
  frequency: RecurrenceFrequency;
  onChange: (frequency: RecurrenceFrequency) => void;
  isNew?: boolean;
}

export const RecurrencePicker = ({ frequency, onChange, isNew }: RecurrencePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    
    const positionDropdown = () => {
      if (buttonRef.current && dropdownRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 200;
        const dropdownWidth = 200;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        let top = rect.bottom + 4;
        let left = rect.left;
        
        if (top + dropdownHeight > viewportHeight) {
          top = rect.top - dropdownHeight - 4;
        }
        
        if (left + dropdownWidth > viewportWidth) {
          left = viewportWidth - dropdownWidth - 10;
        }
        
        if (left < 10) {
          left = 10;
        }
        
        dropdownRef.current.style.top = `${Math.max(10, top)}px`;
        dropdownRef.current.style.left = `${left}px`;
      }
    };

    requestAnimationFrame(() => {
      setTimeout(positionDropdown, 0);
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (freq: RecurrenceFrequency) => {
    onChange(freq);
    setIsOpen(false);
  };

  const getFrequencyLabel = (freq: RecurrenceFrequency): string => {
    switch (freq) {
      case 'none':
        return 'Once';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      default:
        return 'Once';
    }
  };

  const options: RecurrenceFrequency[] = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.recurrenceButton}
      >
        <span className={styles.frequencyLabel}>{getFrequencyLabel(frequency)}</span>
        <span className={styles.arrow}>▼</span>
      </button>

      {isOpen && createPortal(
        <div className={styles.dropdown} ref={dropdownRef}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`${styles.option} ${frequency === option ? styles.selected : ''}`}
            >
              {getFrequencyLabel(option)}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};
