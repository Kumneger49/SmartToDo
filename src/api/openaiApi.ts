/**
 * OpenAI API Integration
 * 
 * Handles all interactions with OpenAI GPT-4o-mini model
 * Provides AI-powered task suggestions and day optimization
 * Includes conversation history management with token truncation
 * 
 * @fileoverview OpenAI API client for AI features
 */

/**
 * AI suggestions interface
 * Structure of AI-generated task suggestions
 */
export interface AISuggestions {
  tips: string[]; // Helpful tips for the task
  suggestions: string[]; // Actionable suggestions
  approach: string; // Step-by-step approach
}

/**
 * Day optimization interface
 * Structure of AI-generated daily schedule optimization
 */
export interface DayOptimization {
  summary: string; // Overall summary of the day
  breakSuggestions: string[]; // Recommended break times
  energyManagement: string[]; // Energy management tips
  actionableSteps: string[]; // Actionable optimization steps
}

/**
 * Chat message interface
 * Represents a message in the conversation history
 */
export interface ChatMessage {
  role: 'user' | 'assistant'; // Message sender role
  content: string; // Message content
  timestamp: string; // ISO timestamp
}

/**
 * Estimate token count for text
 * Rough approximation: 1 token ≈ 4 characters
 * Used for managing conversation history size
 * 
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Truncate conversation history to stay within token limits
 * 
 * Keeps system prompt + context + recent messages (within limit)
 * Removes oldest messages first to fit within maxTokens
 * 
 * @param systemPrompt - System prompt text
 * @param contextData - Context data text
 * @param messages - Array of chat messages
 * @param maxTokens - Maximum tokens allowed (default: 8000)
 * @returns Truncated array of messages that fit within token limit
 */
const truncateConversation = (
  systemPrompt: string,
  contextData: string,
  messages: ChatMessage[],
  maxTokens: number = 8000 // Conservative limit for gpt-4o-mini (128k context, but we want to be safe)
): ChatMessage[] => {
  // Calculate tokens needed for system prompt and context
  const systemTokens = estimateTokens(systemPrompt);
  const contextTokens = estimateTokens(contextData);
  const reservedTokens = systemTokens + contextTokens + 500; // Reserve tokens for AI response
  const availableTokens = maxTokens - reservedTokens;

  // Start from the most recent messages and work backwards
  // This ensures we keep the most relevant recent conversation
  const truncated: ChatMessage[] = [];
  let currentTokens = 0;

  // Add messages in reverse order (most recent first)
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateTokens(message.content);

    // Add message if it fits within available token budget
    if (currentTokens + messageTokens <= availableTokens) {
      truncated.unshift(message); // Add to beginning to maintain chronological order
      currentTokens += messageTokens;
    } else {
      // If we can't fit this message, stop truncating
      break;
    }
  }

  return truncated;
};

// Get OpenAI API key from environment variables
// Vite only exposes environment variables prefixed with VITE_ to the client
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// OpenAI API endpoint for chat completions
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Task context interface
 * Contains all task information needed for AI suggestions
 */
export interface TaskContext {
  title: string; // Task title
  description?: string; // Optional task description
  owner?: string; // Task owner name
  status: 'not-started' | 'pending' | 'completed'; // Current task status
  startTime?: string; // ISO string for start date/time
  endTime?: string; // ISO string for end date/time
  updates?: Array<{
    author: string;
    content: string;
    timestamp: string;
    likes: number;
  }>; // Recent task updates for context
}

/**
 * Get AI-powered suggestions for a task
 * 
 * Analyzes task context (title, description, status, timeline, updates)
 * and generates personalized tips, suggestions, and approach
 * 
 * @param taskContext - Complete task context for AI analysis
 * @returns AI-generated suggestions
 * @throws Error if API key is missing or API call fails
 */
export const getAISuggestions = async (taskContext: TaskContext): Promise<AISuggestions> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY=your_key to your .env file. Note: In Vite, environment variables must be prefixed with VITE_ to be accessible in the client.');
  }

  // Format timeline information for the prompt
  let timelineInfo = '';
  if (taskContext.startTime && taskContext.endTime) {
    const startDate = new Date(taskContext.startTime);
    const endDate = new Date(taskContext.endTime);
    const startStr = startDate.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    const endStr = endDate.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    timelineInfo = `\nTimeline: ${startStr} - ${endStr}`;
  }

  // Format recent update history for context
  // Only include last 5 updates to keep prompt concise
  let updatesInfo = '';
  if (taskContext.updates && taskContext.updates.length > 0) {
    const recentUpdates = taskContext.updates.slice(-5).map((update, idx) => {
      const date = new Date(update.timestamp);
      const dateStr = date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      return `${idx + 1}. [${dateStr}] ${update.author}: ${update.content}`;
    }).join('\n');
    updatesInfo = `\n\nRecent Update History:\n${recentUpdates}`;
  }

  // Build comprehensive task information string
  const taskInfo = `Task Title: "${taskContext.title}"
${taskContext.description ? `Description: "${taskContext.description}"` : ''}
Owner: ${taskContext.owner || 'You'}
Status: ${taskContext.status}${timelineInfo}${updatesInfo}`;

  // Construct prompt for OpenAI API
  // Includes all task context for personalized suggestions
  const prompt = `You are an expert productivity assistant. Analyze the following task with all its context and provide personalized, specific suggestions.

${taskInfo}

Based on ALL the information provided (title, description, owner, status, timeline, and update history), provide helpful assistance in the following JSON format:
{
  "tips": ["tip1", "tip2", "tip3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "approach": "A step-by-step approach on how to tackle this task"
}

Guidelines:
- Make suggestions SPECIFIC to this task, not generic advice
- Consider the task's current status (${taskContext.status}) when providing advice
- If there's a timeline, consider time management and scheduling
- If there are updates, consider the conversation history and context
- If there's an owner, tailor suggestions for that person
- Keep tips and suggestions concise (1 sentence each)
- The approach should be 2-3 sentences
- Be practical, actionable, and encouraging`;

  try {
    // Make API request to OpenAI
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`, // Include API key in Authorization header
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Use GPT-4o-mini for cost efficiency
        messages: [
          {
            role: 'system',
            content: 'You are a helpful task management assistant. Provide practical, actionable advice for tasks. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7, // Balance between creativity and consistency
        max_tokens: 500, // Limit response length
      }),
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    // Parse JSON response (extract JSON from potential markdown formatting)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from OpenAI');
    }

    const suggestions: AISuggestions = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (!suggestions.tips || !suggestions.suggestions || !suggestions.approach) {
      throw new Error('Invalid response format from OpenAI');
    }

    return suggestions;
  } catch (error) {
    // Re-throw errors with proper error handling
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get AI suggestions');
  }
};

/**
 * Get AI-powered day optimization suggestions
 * 
 * Analyzes all tasks scheduled for a specific day
 * Provides break suggestions, energy management tips, and actionable steps
 * 
 * @param tasks - Array of tasks scheduled for the day
 * @returns AI-generated day optimization recommendations
 * @throws Error if API key is missing or API call fails
 */
export const getDayOptimization = async (tasks: Array<{ title: string; description?: string; startTime: string; endTime: string }>): Promise<DayOptimization> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY=your_key to your .env file.');
  }

  // Format tasks for the prompt with timing information
  const tasksList = tasks.map((task, index) => {
    const startDate = new Date(task.startTime);
    const endDate = new Date(task.endTime);
    const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)); // duration in minutes
    
    return `${index + 1}. "${task.title}"${task.description ? ` (${task.description})` : ''}
   Time: ${startTime} - ${endTime} (${duration} minutes)`;
  }).join('\n\n');

  const prompt = `You are an expert productivity and energy management coach. Analyze the user's schedule for today and provide optimization recommendations focused on breaks, energy management, and maintaining peak performance throughout the day.

Here is the user's schedule for today:
${tasksList}

Provide your response in JSON format:
{
  "summary": "A brief 2-3 sentence overview of the day's schedule and overall energy optimization strategy",
  "breakSuggestions": ["specific break suggestion 1 with timing", "specific break suggestion 2 with timing", "specific break suggestion 3 with timing"],
  "energyManagement": ["energy management tip 1", "energy management tip 2", "energy management tip 3"],
  "actionableSteps": ["actionable step 1", "actionable step 2", "actionable step 3"]
}

Guidelines:
- Focus on WHEN and HOW to take breaks to maintain energy
- Consider the timing and duration of tasks when suggesting breaks
- Provide specific, actionable recommendations (not generic advice)
- Suggest optimal break timing between tasks
- Consider energy levels throughout the day (morning, afternoon, evening)
- Keep each suggestion concise (1-2 sentences)
- Make recommendations practical and easy to implement
- Consider task intensity and suggest appropriate break activities`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert productivity and energy management coach. Provide practical, actionable advice for optimizing daily schedules. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from OpenAI');
    }

    const optimization: DayOptimization = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (!optimization.summary || !optimization.breakSuggestions || !optimization.energyManagement || !optimization.actionableSteps) {
      throw new Error('Invalid response format from OpenAI');
    }

    return optimization;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get day optimization');
  }
};

// Chat conversation for task AI help
export const sendTaskChatMessage = async (
  taskContext: TaskContext,
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured.');
  }

  // Format task context
  let timelineInfo = '';
  if (taskContext.startTime && taskContext.endTime) {
    const startDate = new Date(taskContext.startTime);
    const endDate = new Date(taskContext.endTime);
    const startStr = startDate.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
    });
    const endStr = endDate.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
    });
    timelineInfo = `\nTimeline: ${startStr} - ${endStr}`;
  }

  let updatesInfo = '';
  if (taskContext.updates && taskContext.updates.length > 0) {
    const recentUpdates = taskContext.updates.slice(-5).map((update, idx) => {
      const date = new Date(update.timestamp);
      const dateStr = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      return `${idx + 1}. [${dateStr}] ${update.author}: ${update.content}`;
    }).join('\n');
    updatesInfo = `\n\nRecent Update History:\n${recentUpdates}`;
  }

  const contextData = `Task Title: "${taskContext.title}"
${taskContext.description ? `Description: "${taskContext.description}"` : ''}
Owner: ${taskContext.owner || 'You'}
Status: ${taskContext.status}${timelineInfo}${updatesInfo}`;

  const systemPrompt = `You are an expert productivity assistant helping with a specific task. You have access to the task's full context including title, description, owner, status, timeline, and update history. Provide specific, actionable advice based on the conversation history and task context.`;

  // Truncate conversation history
  const truncatedHistory = truncateConversation(systemPrompt, contextData, conversationHistory);

  // Build messages array
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt + '\n\nTask Context:\n' + contextData },
  ];

  // Add conversation history
  truncatedHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  });

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to send chat message');
  }
};

// Chat conversation for day optimization
export const sendDayOptimizationChatMessage = async (
  tasks: Array<{ title: string; description?: string; startTime: string; endTime: string }>,
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured.');
  }

  // Format tasks for context
  const tasksList = tasks.map((task, index) => {
    const startDate = new Date(task.startTime);
    const endDate = new Date(task.endTime);
    const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    
    return `${index + 1}. "${task.title}"${task.description ? ` (${task.description})` : ''}
   Time: ${startTime} - ${endTime} (${duration} minutes)`;
  }).join('\n\n');

  const contextData = `Today's Schedule:\n${tasksList}`;
  const systemPrompt = `You are an expert productivity and energy management coach. Analyze the user's schedule for today and provide optimization recommendations focused on breaks, energy management, and maintaining peak performance throughout the day.`;

  // Truncate conversation history
  const truncatedHistory = truncateConversation(systemPrompt, contextData, conversationHistory);

  // Build messages array
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt + '\n\n' + contextData },
  ];

  // Add conversation history
  truncatedHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  });

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to send chat message');
  }
};
