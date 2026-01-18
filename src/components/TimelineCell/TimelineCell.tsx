import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './TimelineCell.module.css';

interface TimelineCellProps {
  startTime?: string;
  endTime?: string;
  onChange: (startTime: string | undefined, endTime: string | undefined) => void;
  isNew?: boolean;
}

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  // Format time manually to show the correct minute (Date minutes are 0-59, display as 1-60)
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const displayMinute = minutes + 1; // Convert 0-59 to 1-60 for display
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
  const timeStr = `${displayHour}:${String(displayMinute).padStart(2, '0')} ${ampm}`;
  return `${dateStr} ${timeStr}`;
};

export const TimelineCell = ({ startTime, endTime, onChange, isNew: _isNew }: TimelineCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<string>('');
  const [startHour, setStartHour] = useState('1');
  const [startMinute, setStartMinute] = useState('1');
  const [startAmpm, setStartAmpm] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState('2');
  const [endMinute, setEndMinute] = useState('1');
  const [endAmpm, setEndAmpm] = useState<'AM' | 'PM'>('AM');
  
  const cellRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize from props
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      setDate(start.toISOString().split('T')[0]);
      
      let sh = start.getHours();
      setStartAmpm(sh >= 12 ? 'PM' : 'AM');
      if (sh === 0) sh = 12;
      else if (sh > 12) sh -= 12;
      setStartHour(String(sh));
      // JavaScript Date minutes are 0-59, display is 1-60, so add 1
      setStartMinute(String(start.getMinutes() + 1));
      
      let eh = end.getHours();
      setEndAmpm(eh >= 12 ? 'PM' : 'AM');
      if (eh === 0) eh = 12;
      else if (eh > 12) eh -= 12;
      setEndHour(String(eh));
      // JavaScript Date minutes are 0-59, display is 1-60, so add 1
      setEndMinute(String(end.getMinutes() + 1));
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        editorRef.current?.contains(e.target as Node) ||
        cellRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 300);

    const positionEditor = () => {
      if (cellRef.current && editorRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        editorRef.current.style.top = `${rect.bottom + 8}px`;
        editorRef.current.style.left = `${rect.left}px`;
      }
    };

    setTimeout(positionEditor, 0);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const createISOString = (hour: string, minute: string, ampm: 'AM' | 'PM', dateStr: string): string => {
    const h24 = ampm === 'PM' ? (hour === '12' ? 12 : parseInt(hour) + 12) : (hour === '12' ? 0 : parseInt(hour));
    const m = parseInt(minute); // Use minute directly (1-60 maps to 1-60 in display, but we'll adjust)
    // JavaScript Date uses 0-59, so if user selects 60, use 59, otherwise use minute-1
    const minuteValue = m === 60 ? 59 : m - 1;
    return new Date(`${dateStr}T${String(h24).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')}:00`).toISOString();
  };

  const handleSave = () => {
    if (!date) return;
    
    const startISO = createISOString(startHour, startMinute, startAmpm, date);
    const endISO = createISOString(endHour, endMinute, endAmpm, date);
    
    const start = new Date(startISO);
    const end = new Date(endISO);
    
    if (end <= start) {
      const newEnd = new Date(start.getTime() + 60 * 60 * 1000);
      onChange(startISO, newEnd.toISOString());
    } else {
      onChange(startISO, endISO);
    }
    
    setIsOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i + 1);
  
  const canSave = !!date && !!startHour && !!startMinute && !!endHour && !!endMinute;

  return (
    <>
      <div 
        ref={cellRef}
        className={styles.timelineCell}
        onClick={() => setIsOpen(true)}
        style={{ cursor: 'pointer' }}
      >
        {startTime && endTime ? (
          <span className={styles.timelineText}>
            {formatDateTime(startTime)} - {formatDateTime(endTime)}
          </span>
        ) : (
          <span className={styles.placeholder}>Set timeline</span>
        )}
      </div>
      
      {isOpen && createPortal(
        <div 
          ref={editorRef}
          className={styles.timelineEditor}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#111827' }}>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {date && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#111827' }}>Start Time:</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    style={{ padding: '8px', border: '2px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  >
                    {hours.map(h => <option key={h} value={String(h)}>{h}</option>)}
                  </select>
                  <span>:</span>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                    style={{ padding: '8px', border: '2px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  >
                    {minutes.map(m => <option key={m} value={String(m)}>{String(m).padStart(2, '0')}</option>)}
                  </select>
                  <select
                    value={startAmpm}
                    onChange={(e) => setStartAmpm(e.target.value as 'AM' | 'PM')}
                    style={{ padding: '8px', border: '2px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#111827' }}>End Time:</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    style={{ padding: '8px', border: '2px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  >
                    {hours.map(h => <option key={h} value={String(h)}>{h}</option>)}
                  </select>
                  <span>:</span>
                  <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    style={{ padding: '8px', border: '2px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  >
                    {minutes.map(m => <option key={m} value={String(m)}>{String(m).padStart(2, '0')}</option>)}
                  </select>
                  <select
                    value={endAmpm}
                    onChange={(e) => setEndAmpm(e.target.value as 'AM' | 'PM')}
                    disabled={startAmpm === 'PM'}
                    style={{ padding: '8px', border: '2px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}
                  >
                    {startAmpm === 'AM' && <option value="AM">AM</option>}
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#374151',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              }}
              disabled={!canSave}
              style={{
                padding: '8px 16px',
                background: canSave ? '#10b981' : '#d1d5db',
                border: 'none',
                borderRadius: '6px',
                cursor: canSave ? 'pointer' : 'not-allowed',
                color: '#ffffff',
                fontWeight: 600
              }}
            >
              Save
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
