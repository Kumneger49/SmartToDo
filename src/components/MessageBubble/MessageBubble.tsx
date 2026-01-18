import { ChatMessage } from '../ChatInterface/ChatInterface';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: ChatMessage;
}

// Simple markdown-like rendering for bold, italic, lists, and code
const renderMarkdown = (text: string): JSX.Element => {
  // Split by newlines to handle lists
  const lines = text.split('\n');
  
  return (
    <div className={styles.messageContent}>
      {lines.map((line, lineIndex) => {
        if (line.trim() === '') {
          return <br key={lineIndex} />;
        }
        
        // Check if it's a bullet point
        const bulletMatch = line.match(/^[-•]\s+(.+)$/);
        if (bulletMatch) {
          return (
            <div key={lineIndex} className={styles.bulletPoint}>
              • {renderInlineMarkdown(bulletMatch[1])}
            </div>
          );
        }
        
        // Regular line with inline markdown
        return (
          <div key={lineIndex} className={styles.messageLine}>
            {renderInlineMarkdown(line)}
          </div>
        );
      })}
    </div>
  );
};

const renderInlineMarkdown = (text: string): (string | JSX.Element)[] => {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let match;
  let key = 0;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add formatted element
    if (match[1].startsWith('**')) {
      // Bold
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[1].startsWith('*') && !match[1].startsWith('**')) {
      // Italic
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[1].startsWith('`')) {
      // Code
      parts.push(<code key={key++} className={styles.code}>{match[4]}</code>);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`${styles.messageBubble} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
      {renderMarkdown(message.content)}
    </div>
  );
};
