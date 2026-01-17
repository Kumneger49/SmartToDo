import { useState, useEffect } from 'react';
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

      setMinute(String(dateObj.getMinutes() + 1)); // 0-59 becomes 1-60
    } else {
      // Don't set date initially - let user select it
      setDate('');
      setHour('1');
      setMinute('1');
      setAmpm('AM');
    }
  }, [value]);

  // Update parent when values change
  useEffect(() => {
    if (date) {
      const hour24 = ampm === 'PM' 
        ? (hour === '12' ? 12 : parseInt(hour) + 12)
        : (hour === '12' ? 0 : parseInt(hour));
      const minuteValue = parseInt(minute) - 1; // Convert 1-60 back to 0-59
      
      const dateTime = new Date(`${date}T${String(hour24).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')}:00`);
      onChange(dateTime.toISOString());
    } else {
      onChange(undefined);
    }
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
            value={hour}
            onChange={(e) => setHour(e.target.value)}
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
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className={styles.select}
          >
            {minutes.map((m) => (
              <option key={m} value={String(m)}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
          <select
            value={ampm}
            onChange={(e) => setAmpm(e.target.value as 'AM' | 'PM')}
            className={styles.ampmSelect}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
    </div>
  );
};
