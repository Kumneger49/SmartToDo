export interface AISuggestions {
  tips: string[];
  suggestions: string[];
  approach: string;
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
