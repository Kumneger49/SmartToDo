import { useState, useEffect, useRef } from 'react';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import { ChatInput } from '../ChatInput/ChatInput';
import styles from './ChatInterface.module.css';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  conversationId: string;
  initialMessage?: string; // The initial AI response
  systemPrompt: string;
  contextData: any; // Task context or day optimization context
  onSendMessage: (message: string, conversationHistory: ChatMessage[]) => Promise<string>;
  onClearConversation?: () => void;
}

export const ChatInterface = ({
  conversationId,
  initialMessage,
  systemPrompt: _systemPrompt,
  contextData: _contextData,
  onSendMessage,
  onClearConversation,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = `chat_conversation_${conversationId}`;

  // Load conversation from localStorage
  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const conversation = JSON.parse(stored);
        setMessages(conversation.messages || []);
      } else if (initialMessage) {
        // If no conversation exists but we have an initial message, add it
        setMessages([
          {
            role: 'assistant',
            content: initialMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      if (initialMessage) {
        setMessages([
          {
            role: 'assistant',
            content: initialMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    }
  };

  const saveConversation = (newMessages: ChatMessage[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages: newMessages,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveConversation(updatedMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await onSendMessage(message, updatedMessages);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveConversation(finalMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove user message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      setMessages(initialMessage ? [{
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date().toISOString(),
      }] : []);
      localStorage.removeItem(STORAGE_KEY);
      if (onClearConversation) {
        onClearConversation();
      }
    }
  };

  return (
    <div className={styles.chatInterface}>
      <div className={styles.chatHeader}>
        <h4 className={styles.chatTitle}>💬 Ask a question</h4>
        {onClearConversation && (
          <button
            onClick={handleClearConversation}
            className={styles.clearButton}
            title="Clear conversation"
          >
            Clear
          </button>
        )}
      </div>

      <div ref={chatContainerRef} className={styles.messagesContainer}>
        {messages.length === 0 && initialMessage && (
          <div className={styles.initialMessage}>
            <MessageBubble
              message={{
                role: 'assistant',
                content: initialMessage,
                timestamp: new Date().toISOString(),
              }}
            />
          </div>
        )}
        
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}

        {isLoading && (
          <div className={styles.loadingBubble}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <p>⚠️ {error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};
