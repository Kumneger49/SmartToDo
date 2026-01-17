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

export const getAISuggestions = async (taskTitle: string, taskDescription?: string): Promise<AISuggestions> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY=your_key to your .env file. Note: In Vite, environment variables must be prefixed with VITE_ to be accessible in the client.');
  }

  const taskContext = taskDescription 
    ? `Task: "${taskTitle}"\nDescription: "${taskDescription}"`
    : `Task: "${taskTitle}"`;

  const prompt = `For the following task, provide helpful assistance in the following JSON format:
${taskContext}

Provide response in JSON format:
{
  "tips": ["tip1", "tip2", "tip3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "approach": "A step-by-step approach on how to tackle this task"
}

Make the response practical, actionable, and encouraging. Keep tips and suggestions concise (1 sentence each). The approach should be 2-3 sentences. Base your suggestions on both the task title and description if provided.`;

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
