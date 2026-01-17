import { useState, useEffect, useRef } from 'react';
import styles from './DateTimePicker.module.css';

interface DateTimePickerProps {
  value?: string; // ISO string
  onChange: (isoString: string | undefined) => void;
  min?: string; // ISO string for minimum date
}

export const DateTimePicker = ({ value, onChange, min }: DateTimePickerProps) => {
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('1');
  const [minute, setMinute] = useState('1');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const isInternalUpdateRef = useRef(false);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);

      let hours24 = dateObj.getHours();
      const isPM = hours24 >= 12;
      setAmpm(isPM ? 'PM' : 'AM');
      
      if (hours24 === 0) {
        setHour('12');
      } else if (hours24 > 12) {
        setHour(String(hours24 - 12));
      } else {
        setHour(String(hours24));
      }

      setMinute(String(dateObj.getMinutes() + 1));
    } else {
      setDate('');
      setHour('1');
      setMinute('1');
      setAmpm('AM');
    }
  }, [value]);

  // Update parent when values change - skip during internal updates
  useEffect(() => {
    if (isInternalUpdateRef.current) return;
    
    if (!date) {
      onChange(undefined);
      return;
    }
    
    const hour24 = ampm === 'PM' 
      ? (hour === '12' ? 12 : parseInt(hour) + 12)
      : (hour === '12' ? 0 : parseInt(hour));
    const minuteValue = parseInt(minute) - 1;
    
    const dateTime = new Date(`${date}T${String(hour24).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')}:00`);
    onChange(dateTime.toISOString());
  }, [date, hour, minute, ampm, onChange]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i + 1);

  const getMinDate = () => {
    if (min) {
      const minDate = new Date(min);
      return minDate.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const isToday = () => {
    if (!date) return false;
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const currentHour24 = now.getHours();
    const currentMinute = now.getMinutes();
    const isPM = currentHour24 >= 12;
    const currentHour12 = currentHour24 === 0 ? 12 : (currentHour24 > 12 ? currentHour24 - 12 : currentHour24);
    
    return {
      hour: currentHour12,
      minute: currentMinute + 1,
      ampm: isPM ? 'PM' : 'AM',
      hour24: currentHour24,
      minute24: currentMinute
    };
  };

  // Calculate available options - memoized per render
  const currentTime = isToday() ? getCurrentTime() : null;
  
  const getAvailableHours = () => {
    if (!currentTime) return hours;
    
    if (ampm === currentTime.ampm) {
      // Same period - show current hour and all future hours
      // For same AM/PM period, we can simply filter by the 12-hour value
      const filtered = hours.filter(h => {
        // If the hour number is greater than or equal to current hour, it's valid
        return h >= currentTime.hour;
      });
      
      // Always ensure at least the current hour is available
      if (filtered.length === 0) {
        return [currentTime.hour];
      }
      
      return filtered;
    } else if (currentTime.ampm === 'AM' && ampm === 'PM') {
      // Current is AM, selected is PM - all PM hours valid
      return hours;
    } else {
      // Current is PM, selected is AM - none valid, but return at least current hour to prevent empty
      // This shouldn't happen because AM option should be disabled, but just in case
      return [currentTime.hour];
    }
  };

  const getAvailableMinutes = () => {
    if (!currentTime) return minutes;
    
    const selectedHour24 = ampm === 'PM' 
      ? (hour === '12' ? 12 : parseInt(hour) + 12)
      : (hour === '12' ? 0 : parseInt(hour));
    
    if (selectedHour24 === currentTime.hour24) {
      return minutes.filter(m => m > currentTime.minute);
    }
    return minutes;
  };

  let availableHours = getAvailableHours();
  let availableMinutes = getAvailableMinutes();
  
  // Ensure we always have at least one hour option
  if (availableHours.length === 0) {
    availableHours = hours;
  }
  
  // Ensure we always have at least one minute option
  if (availableMinutes.length === 0) {
    availableMinutes = minutes;
  }

  // Validate and adjust time when date changes to today
  useEffect(() => {
    if (!date || !isToday()) return;
    
    isInternalUpdateRef.current = true;
    const current = getCurrentTime();
    const selectedHour24 = ampm === 'PM' 
      ? (hour === '12' ? 12 : parseInt(hour) + 12)
      : (hour === '12' ? 0 : parseInt(hour));
    const selectedMinute24 = parseInt(minute) - 1;
    
    // If time is in the past or trying to select AM when it's PM
    if (selectedHour24 < current.hour24 || 
        (selectedHour24 === current.hour24 && selectedMinute24 <= current.minute24) ||
        (ampm === 'AM' && current.ampm === 'PM')) {
      
      let newMinute = current.minute + 1;
      let newHour = current.hour;
      let newAmpm = current.ampm;
      
      if (newMinute > 60) {
        newMinute = 1;
        newHour = current.hour === 12 ? 1 : current.hour + 1;
        if (newHour === 12 && current.ampm === 'AM') {
          newAmpm = 'PM';
        }
      }
      
      setHour(String(newHour));
      setMinute(String(newMinute));
      setAmpm(newAmpm as 'AM' | 'PM');
    }
    
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  }, [date]); // Only when date changes


  const handleAmpmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAmpm = e.target.value as 'AM' | 'PM';
    
    if (!isToday()) {
      isInternalUpdateRef.current = true;
      setAmpm(newAmpm);
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 0);
      return;
    }
    
    const current = getCurrentTime();
    
    // Can't switch to AM if it's already PM today
    if (newAmpm === 'AM' && current.ampm === 'PM') {
      return;
    }
    
    isInternalUpdateRef.current = true;
    setAmpm(newAmpm);
    
    // Calculate available hours with new AM/PM
    let newAvailableHours = hours;
    if (newAmpm === current.ampm) {
      const filtered = hours.filter(h => {
        const h24 = newAmpm === 'PM' ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
        return h24 > current.hour24 || (h24 === current.hour24 && h >= current.hour);
      });
      newAvailableHours = filtered.length > 0 ? filtered : [current.hour];
    } else if (current.ampm === 'AM' && newAmpm === 'PM') {
      newAvailableHours = hours;
    }
    
    // If hour becomes invalid after AM/PM change, fix it
    if (newAvailableHours.length > 0 && !newAvailableHours.includes(parseInt(hour))) {
      setHour(String(newAvailableHours[0]));
    }
    
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  };

  return (
    <div className={styles.dateTimePicker}>
      <div className={styles.dateSection}>
        <label className={styles.label}>Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={getMinDate()}
          className={styles.dateInput}
        />
      </div>
      
      <div className={styles.timeSection}>
        <label className={styles.label}>Time:</label>
        <div className={styles.timeInputs}>
          <select
            value={availableHours.length > 0 && availableHours.includes(parseInt(hour)) ? hour : String(availableHours[0] || '1')}
            onChange={(e) => {
              const newHour = e.target.value;
              isInternalUpdateRef.current = true;
              setHour(newHour);
              
              // Update minute if needed
              if (isToday() && currentTime) {
                const newHour24 = ampm === 'PM' 
                  ? (newHour === '12' ? 12 : parseInt(newHour) + 12)
                  : (newHour === '12' ? 0 : parseInt(newHour));
                if (newHour24 === currentTime.hour24 && parseInt(minute) <= currentTime.minute) {
                  setMinute(String(Math.min(currentTime.minute + 1, 60)));
                }
              }
              
              setTimeout(() => {
                isInternalUpdateRef.current = false;
              }, 0);
            }}
            className={styles.select}
            disabled={availableHours.length === 0}
          >
            {availableHours.length > 0 ? availableHours.map((h) => (
              <option key={h} value={String(h)}>
                {h}
              </option>
            )) : (
              <option value="1">1</option>
            )}
          </select>
          <span className={styles.separator}>:</span>
          <select
            value={availableMinutes.includes(parseInt(minute)) ? minute : String(availableMinutes[0] || '1')}
            onChange={(e) => {
              isInternalUpdateRef.current = true;
              setMinute(e.target.value);
              setTimeout(() => {
                isInternalUpdateRef.current = false;
              }, 0);
            }}
            className={styles.select}
            disabled={availableMinutes.length === 0}
          >
            {availableMinutes.map((m) => (
              <option key={m} value={String(m)}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
          <select
            value={ampm}
            onChange={handleAmpmChange}
            className={styles.ampmSelect}
          >
            {(!currentTime || currentTime.ampm === 'AM') && (
              <option value="AM">AM</option>
            )}
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
    </div>
  );
};
