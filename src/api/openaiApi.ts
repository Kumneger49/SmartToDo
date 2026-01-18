export interface AISuggestions {
  tips: string[];
  suggestions: string[];
  approach: string;
}

export interface DayOptimization {
  summary: string;
  breakSuggestions: string[];
  energyManagement: string[];
  actionableSteps: string[];
}

// Vite only exposes environment variables prefixed with VITE_ to the client
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface TaskContext {
  title: string;
  description?: string;
  owner?: string;
  status: 'not-started' | 'pending' | 'completed';
  startTime?: string;
  endTime?: string;
  updates?: Array<{
    author: string;
    content: string;
    timestamp: string;
    likes: number;
  }>;
}

export const getAISuggestions = async (taskContext: TaskContext): Promise<AISuggestions> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY=your_key to your .env file. Note: In Vite, environment variables must be prefixed with VITE_ to be accessible in the client.');
  }

  // Format timeline information
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

  // Format update history
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

  const taskInfo = `Task Title: "${taskContext.title}"
${taskContext.description ? `Description: "${taskContext.description}"` : ''}
Owner: ${taskContext.owner || 'Unassigned'}
Status: ${taskContext.status}${timelineInfo}${updatesInfo}`;

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
            content: 'You are a helpful task management assistant. Provide practical, actionable advice for tasks. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
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

    // Parse JSON response
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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get AI suggestions');
  }
};

export const getDayOptimization = async (tasks: Array<{ title: string; description?: string; startTime: string; endTime: string }>): Promise<DayOptimization> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY=your_key to your .env file.');
  }

  // Format tasks for the prompt
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
