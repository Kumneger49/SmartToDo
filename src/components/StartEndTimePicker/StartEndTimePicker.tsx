import { useState, useEffect, useRef } from 'react';
import styles from './StartEndTimePicker.module.css';

interface StartEndTimePickerProps {
  date?: string; // ISO date string (YYYY-MM-DD)
  startTime?: string; // ISO datetime string
  endTime?: string; // ISO datetime string
  onDateChange: (date: string | undefined) => void;
  onStartTimeChange: (isoString: string | undefined) => void;
  onEndTimeChange: (isoString: string | undefined) => void;
}

export const StartEndTimePicker = ({
  date,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
}: StartEndTimePickerProps) => {
  const [startHour, setStartHour] = useState('1');
  const [startMinute, setStartMinute] = useState('1');
  const [startAmpm, setStartAmpm] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState('2');
  const [endMinute, setEndMinute] = useState('1');
  const [endAmpm, setEndAmpm] = useState<'AM' | 'PM'>('AM');
  const isInternalUpdateRef = useRef(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i + 1);

  // Parse initial start time
  useEffect(() => {
    if (startTime && date) {
      const dateObj = new Date(startTime);
      let hours24 = dateObj.getHours();
      const isPM = hours24 >= 12;
      setStartAmpm(isPM ? 'PM' : 'AM');
      
      if (hours24 === 0) {
        setStartHour('12');
      } else if (hours24 > 12) {
        setStartHour(String(hours24 - 12));
      } else {
        setStartHour(String(hours24));
      }
      setStartMinute(String(dateObj.getMinutes() + 1));
    } else {
      setStartHour('1');
      setStartMinute('1');
      setStartAmpm('AM');
    }
  }, [startTime, date]);

  // Parse initial end time
  useEffect(() => {
    if (endTime && date) {
      const dateObj = new Date(endTime);
      let hours24 = dateObj.getHours();
      const isPM = hours24 >= 12;
      setEndAmpm(isPM ? 'PM' : 'AM');
      
      if (hours24 === 0) {
        setEndHour('12');
      } else if (hours24 > 12) {
        setEndHour(String(hours24 - 12));
      } else {
        setEndHour(String(hours24));
      }
      setEndMinute(String(dateObj.getMinutes() + 1));
    } else {
      setEndHour('2');
      setEndMinute('1');
      setEndAmpm('AM');
    }
  }, [endTime, date]);

  // Update start time when values change
  useEffect(() => {
    if (isInternalUpdateRef.current || !date) {
      if (!date) {
        onStartTimeChange(undefined);
      }
      return;
    }
    
    const hour24 = startAmpm === 'PM' 
      ? (startHour === '12' ? 12 : parseInt(startHour) + 12)
      : (startHour === '12' ? 0 : parseInt(startHour));
    const minuteValue = parseInt(startMinute) - 1;
    
    const dateTime = new Date(`${date}T${String(hour24).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')}:00`);
    onStartTimeChange(dateTime.toISOString());
  }, [date, startHour, startMinute, startAmpm, onStartTimeChange]);

  // Update end time when values change
  useEffect(() => {
    if (isInternalUpdateRef.current || !date) {
      if (!date) {
        onEndTimeChange(undefined);
      }
      return;
    }
    
    const hour24 = endAmpm === 'PM' 
      ? (endHour === '12' ? 12 : parseInt(endHour) + 12)
      : (endHour === '12' ? 0 : parseInt(endHour));
    const minuteValue = parseInt(endMinute) - 1;
    
    const dateTime = new Date(`${date}T${String(hour24).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')}:00`);
    onEndTimeChange(dateTime.toISOString());
  }, [date, endHour, endMinute, endAmpm, onEndTimeChange]);

  // Validate end time is after start time
  const getAvailableEndHours = () => {
    if (!date || !startTime) return hours;
    
    const startHour24 = startAmpm === 'PM' 
      ? (startHour === '12' ? 12 : parseInt(startHour) + 12)
      : (startHour === '12' ? 0 : parseInt(startHour));
    const endHour24 = endAmpm === 'PM' 
      ? (endHour === '12' ? 12 : parseInt(endHour) + 12)
      : (endHour === '12' ? 0 : parseInt(endHour));
    
    // If same AM/PM period
    if (endAmpm === startAmpm) {
      if (endHour24 > startHour24) {
        // End hour is after start hour - all hours >= end hour are valid
        return hours.filter(h => h >= parseInt(endHour));
      } else if (endHour24 === startHour24) {
        // Same hour - only hours >= end hour are valid
        return hours.filter(h => h >= parseInt(endHour));
      } else {
        // End hour is before start hour - invalid, show all hours >= start hour
        return hours.filter(h => h >= parseInt(startHour));
      }
    } else if (startAmpm === 'AM' && endAmpm === 'PM') {
      // Start is AM, end is PM - all PM hours valid
      return hours;
    } else {
      // Start is PM, end is AM - invalid, return empty (shouldn't happen)
      return [];
    }
  };

  const getAvailableEndMinutes = () => {
    if (!date || !startTime) return minutes;
    
    const startHour24 = startAmpm === 'PM' 
      ? (startHour === '12' ? 12 : parseInt(startHour) + 12)
      : (startHour === '12' ? 0 : parseInt(startHour));
    const endHour24 = endAmpm === 'PM' 
      ? (endHour === '12' ? 12 : parseInt(endHour) + 12)
      : (endHour === '12' ? 0 : parseInt(endHour));
    
    // If same hour, only minutes after start minute are valid
    if (endHour24 === startHour24 && endAmpm === startAmpm) {
      return minutes.filter(m => m > parseInt(startMinute));
    }
    
    return minutes;
  };

  const availableEndHours = getAvailableEndHours();
  const availableEndMinutes = getAvailableEndMinutes();

  // Ensure end time is after start time
  useEffect(() => {
    if (!date || !startTime) return;
    
    const startHour24 = startAmpm === 'PM' 
      ? (startHour === '12' ? 12 : parseInt(startHour) + 12)
      : (startHour === '12' ? 0 : parseInt(startHour));
    const startMinute24 = parseInt(startMinute) - 1;
    const endHour24 = endAmpm === 'PM' 
      ? (endHour === '12' ? 12 : parseInt(endHour) + 12)
      : (endHour === '12' ? 0 : parseInt(endHour));
    const endMinute24 = parseInt(endMinute) - 1;
    
    const startDateTime = new Date(`${date}T${String(startHour24).padStart(2, '0')}:${String(startMinute24).padStart(2, '0')}:00`);
    const endDateTime = new Date(`${date}T${String(endHour24).padStart(2, '0')}:${String(endMinute24).padStart(2, '0')}:00`);
    
    if (endDateTime <= startDateTime) {
      // End time is not after start time - adjust it
      isInternalUpdateRef.current = true;
      
      // Try to add 1 hour to start time
      let newEndHour = parseInt(startHour) + 1;
      let newEndAmpm = startAmpm;
      
      if (newEndHour > 12) {
        newEndHour = 1;
        newEndAmpm = startAmpm === 'AM' ? 'PM' : 'AM';
      } else if (newEndHour === 12 && startAmpm === 'AM') {
        newEndAmpm = 'PM';
      }
      
      setEndHour(String(newEndHour));
      setEndMinute(startMinute);
      setEndAmpm(newEndAmpm);
      
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 0);
    }
  }, [date, startHour, startMinute, startAmpm, endHour, endMinute, endAmpm]);

  const handleEndAmpmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAmpm = e.target.value as 'AM' | 'PM';
    
    // Can't select AM if start is PM
    if (startAmpm === 'PM' && newAmpm === 'AM') {
      return;
    }
    
    setEndAmpm(newAmpm);
  };

  return (
    <div className={styles.startEndTimePicker}>
      <div className={styles.dateSection}>
        <label className={styles.label}>Date:</label>
        <input
          type="date"
          value={date || ''}
          onChange={(e) => onDateChange(e.target.value || undefined)}
          className={styles.dateInput}
        />
      </div>
      
      {date && (
        <>
          <div className={styles.timeSection}>
            <label className={styles.label}>Start Time:</label>
            <div className={styles.timeInputs}>
              <select
                value={startHour}
                onChange={(e) => {
                  isInternalUpdateRef.current = true;
                  setStartHour(e.target.value);
                  setTimeout(() => {
                    isInternalUpdateRef.current = false;
                  }, 0);
                }}
                className={styles.select}
              >
                {hours.map((h) => (
                  <option key={h} value={String(h)}>
                    {h}
                  </option>
                ))}
              </select>
              <span className={styles.separator}>:</span>
              <select
                value={startMinute}
                onChange={(e) => {
                  isInternalUpdateRef.current = true;
                  setStartMinute(e.target.value);
                  setTimeout(() => {
                    isInternalUpdateRef.current = false;
                  }, 0);
                }}
                className={styles.select}
              >
                {minutes.map((m) => (
                  <option key={m} value={String(m)}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select
                value={startAmpm}
                onChange={(e) => {
                  isInternalUpdateRef.current = true;
                  setStartAmpm(e.target.value as 'AM' | 'PM');
                  setTimeout(() => {
                    isInternalUpdateRef.current = false;
                  }, 0);
                }}
                className={styles.ampmSelect}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          
          <div className={styles.timeSection}>
            <label className={styles.label}>End Time:</label>
            <div className={styles.timeInputs}>
              <select
                value={availableEndHours.includes(parseInt(endHour)) ? endHour : String(availableEndHours[0] || '1')}
                onChange={(e) => {
                  isInternalUpdateRef.current = true;
                  setEndHour(e.target.value);
                  setTimeout(() => {
                    isInternalUpdateRef.current = false;
                  }, 0);
                }}
                className={styles.select}
                disabled={availableEndHours.length === 0}
              >
                {availableEndHours.length > 0 ? availableEndHours.map((h) => (
                  <option key={h} value={String(h)}>
                    {h}
                  </option>
                )) : (
                  <option value="1">1</option>
                )}
              </select>
              <span className={styles.separator}>:</span>
              <select
                value={availableEndMinutes.includes(parseInt(endMinute)) ? endMinute : String(availableEndMinutes[0] || '1')}
                onChange={(e) => {
                  isInternalUpdateRef.current = true;
                  setEndMinute(e.target.value);
                  setTimeout(() => {
                    isInternalUpdateRef.current = false;
                  }, 0);
                }}
                className={styles.select}
                disabled={availableEndMinutes.length === 0}
              >
                {availableEndMinutes.length > 0 ? availableEndMinutes.map((m) => (
                  <option key={m} value={String(m)}>
                    {String(m).padStart(2, '0')}
                  </option>
                )) : (
                  <option value="1">1</option>
                )}
              </select>
              <select
                value={endAmpm}
                onChange={handleEndAmpmChange}
                className={styles.ampmSelect}
                disabled={startAmpm === 'PM'}
              >
                {startAmpm === 'AM' && <option value="AM">AM</option>}
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
