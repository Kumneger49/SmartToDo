import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCurrentUser, addInvitedMember, getAvailableOwners } from '../../utils/userUtils';
import styles from './OwnerCell.module.css';

interface OwnerCellProps {
  value?: string;
  onChange: (owner: string | undefined) => void;
  isNew?: boolean;
}

export const OwnerCell = ({ value, onChange, isNew: _isNew }: OwnerCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const currentUser = getCurrentUser();
  const availableOwners = getAvailableOwners();

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
        setShowInviteInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Position dropdown - use setTimeout to ensure DOM is ready
    const positionDropdown = () => {
      if (buttonRef.current && dropdownRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 300;
        const dropdownWidth = 280;
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

  const handleSelect = (owner: string) => {
    onChange(owner);
    setIsOpen(false);
  };

  const handleInviteClick = () => {
    setShowInviteInput(true);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      addInvitedMember({ email: inviteEmail.trim() });
      setInviteEmail('');
      setShowInviteInput(false);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    // When clearing, default back to current user
    onChange(currentUser.name);
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.ownerCell}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={styles.ownerButton}
        >
          {value && value.trim() ? (
            <>
              <div className={styles.avatarSmall}>{value[0].toUpperCase()}</div>
              <span className={styles.ownerName}>{value}</span>
            </>
          ) : (
            <>
              <div className={styles.avatarSmall}>{currentUser.name[0].toUpperCase()}</div>
              <span className={styles.ownerName}>{currentUser.name}</span>
            </>
          )}
          <span className={styles.arrow}>▼</span>
        </button>
      </div>

      {isOpen && createPortal(
        <div className={styles.dropdown} ref={dropdownRef}>
          <div className={styles.suggestedSection}>
            <div className={styles.sectionTitle}>Suggested people</div>
            <button
              type="button"
              onClick={() => handleSelect(currentUser.name)}
              className={styles.ownerOption}
            >
              <div className={styles.avatar}>{currentUser.name[0].toUpperCase()}</div>
              <span>{currentUser.name}</span>
            </button>
          </div>

          {availableOwners.filter(o => o !== currentUser.name).length > 0 && (
            <div className={styles.membersSection}>
              {availableOwners
                .filter(o => o !== currentUser.name)
                .map((owner) => (
                  <button
                    key={owner}
                    type="button"
                    onClick={() => handleSelect(owner)}
                    className={styles.ownerOption}
                  >
                    <div className={styles.avatar}>{owner[0].toUpperCase()}</div>
                    <span>{owner}</span>
                  </button>
                ))}
            </div>
          )}

          {showInviteInput ? (
            <form onSubmit={handleInviteSubmit} className={styles.inviteForm}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className={styles.emailInput}
                autoFocus
              />
              <div className={styles.inviteActions}>
                <button type="submit" className={styles.inviteSubmitButton}>
                  Invite
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteInput(false);
                    setInviteEmail('');
                  }}
                  className={styles.inviteCancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={handleInviteClick}
              className={styles.inviteButton}
            >
              <span className={styles.inviteIcon}>👤+</span>
              Invite a new member by email
            </button>
          )}

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
            >
              Clear
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
};
