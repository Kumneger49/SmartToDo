import { useState, useRef, useEffect } from 'react';
import { Task, TaskUpdate } from '../../types';
import { getCurrentUser, getAvailableOwners } from '../../utils/userUtils';
import styles from './UpdatesModal.module.css';

interface UpdatesModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updates: Task['updates']) => void;
}

const generateUpdateId = (): string => {
  return `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const UpdatesModal = ({ task, onClose, onUpdate }: UpdatesModalProps) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const currentUser = getCurrentUser();
  const availableOwners = getAvailableOwners();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updates = task.updates || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    const mentions: string[] = [];
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(newUpdate)) !== null) {
      const mentioned = match[1];
      if (availableOwners.includes(mentioned)) {
        mentions.push(mentioned);
      }
    }

    const update: TaskUpdate = {
      id: generateUpdateId(),
      author: currentUser.name,
      content: newUpdate.trim(),
      timestamp: new Date().toISOString(),
      mentions: mentions.length > 0 ? mentions : undefined,
      replies: [],
      likes: 0,
      likedBy: [],
    };

    onUpdate([...updates, update]);
    setNewUpdate('');
  };

  const handleReply = (updateId: string, replyContent: string) => {
    if (!replyContent.trim()) return;

    const reply: TaskUpdate = {
      id: generateUpdateId(),
      author: currentUser.name,
      content: replyContent.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };

    const updatedUpdates = updates.map(update => {
      if (update.id === updateId) {
        return {
          ...update,
          replies: [...(update.replies || []), reply],
        };
      }
      return update;
    });

    onUpdate(updatedUpdates);
  };

  const handleLike = (updateId: string, isReply: boolean, replyId?: string) => {
    const updatedUpdates = updates.map(update => {
      if (isReply && update.id === updateId) {
        const updatedReplies = (update.replies || []).map(reply => {
          if (reply.id === replyId) {
            const isLiked = reply.likedBy?.includes(currentUser.name);
            return {
              ...reply,
              likes: isLiked ? reply.likes - 1 : reply.likes + 1,
              likedBy: isLiked
                ? reply.likedBy?.filter(name => name !== currentUser.name) || []
                : [...(reply.likedBy || []), currentUser.name],
            };
          }
          return reply;
        });
        return { ...update, replies: updatedReplies };
      } else if (!isReply && update.id === updateId) {
        const isLiked = update.likedBy?.includes(currentUser.name);
        return {
          ...update,
          likes: isLiked ? update.likes - 1 : update.likes + 1,
          likedBy: isLiked
            ? update.likedBy?.filter(name => name !== currentUser.name) || []
            : [...(update.likedBy || []), currentUser.name],
        };
      }
      return update;
    });

    onUpdate(updatedUpdates);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewUpdate(value);

    // Check for @ mentions
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (owner: string) => {
    if (mentionStartIndex === -1) return;
    const before = newUpdate.substring(0, mentionStartIndex);
    const after = newUpdate.substring(mentionStartIndex + 1 + mentionQuery.length);
    setNewUpdate(`${before}@${owner} ${after}`);
    setShowMentions(false);
    setMentionQuery('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const filteredOwners = availableOwners.filter(owner =>
    owner.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{task.title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.updatesList}>
            {updates.length === 0 ? (
              <div className={styles.emptyState}>No updates yet. Be the first to post!</div>
            ) : (
              updates.map((update) => (
                <UpdateItem
                  key={update.id}
                  update={update}
                  currentUser={currentUser.name}
                  onReply={(content) => handleReply(update.id, content)}
                  onLike={() => handleLike(update.id, false)}
                  isLiked={update.likedBy?.includes(currentUser.name) || false}
                />
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.updateForm}>
            <div className={styles.inputWrapper}>
              <textarea
                ref={textareaRef}
                value={newUpdate}
                onChange={handleTextChange}
                placeholder="Write an update and mention others with @"
                className={styles.textarea}
                rows={3}
              />
              {showMentions && filteredOwners.length > 0 && (
                <div className={styles.mentionsDropdown}>
                  {filteredOwners.map((owner) => (
                    <button
                      key={owner}
                      type="button"
                      onClick={() => insertMention(owner)}
                      className={styles.mentionOption}
                    >
                      @{owner}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className={styles.submitButton} disabled={!newUpdate.trim()}>
              Post Update
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

interface UpdateItemProps {
  update: TaskUpdate;
  currentUser: string;
  onReply: (content: string) => void;
  onLike: () => void;
  isLiked: boolean;
}

const UpdateItem = ({ update, currentUser, onReply, onLike, isLiked }: UpdateItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(replyContent);
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className={styles.updateItem}>
      <div className={styles.updateHeader}>
        <div className={styles.updateAuthor}>
          <div className={styles.avatar}>{update.author[0].toUpperCase()}</div>
          <div>
            <div className={styles.authorName}>{update.author}</div>
            <div className={styles.timestamp}>{formatTimeAgo(update.timestamp)}</div>
          </div>
        </div>
      </div>
      <div className={styles.updateContent}>{update.content}</div>
      {update.mentions && update.mentions.length > 0 && (
        <div className={styles.mentions}>
          Mentioned: {update.mentions.map(m => `@${m}`).join(', ')}
        </div>
      )}
      <div className={styles.updateActions}>
        <button
          onClick={onLike}
          className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
        >
          👍 Like {update.likes > 0 && `(${update.likes})`}
        </button>
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className={styles.replyButton}
        >
          💬 Reply
        </button>
      </div>

      {showReplyInput && (
        <div className={styles.replyInput}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className={styles.replyTextarea}
            rows={2}
          />
          <div className={styles.replyActions}>
            <button onClick={handleReplySubmit} className={styles.replySubmitButton}>
              Reply
            </button>
            <button
              onClick={() => {
                setShowReplyInput(false);
                setReplyContent('');
              }}
              className={styles.replyCancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {update.replies && update.replies.length > 0 && (
        <div className={styles.replies}>
          {update.replies.map((reply) => (
            <div key={reply.id} className={styles.replyItem}>
              <div className={styles.replyHeader}>
                <div className={styles.replyAuthor}>
                  <div className={styles.avatarSmall}>{reply.author[0].toUpperCase()}</div>
                  <div>
                    <div className={styles.authorName}>{reply.author}</div>
                    <div className={styles.timestamp}>{formatTimeAgo(reply.timestamp)}</div>
                  </div>
                </div>
              </div>
              <div className={styles.replyContent}>{reply.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
