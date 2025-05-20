import { useState } from 'react';
import { generateContent } from '@/app/actions/generateContent'

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendPrompt = async (prompt: string) => {
    try {
      setLoading(true);
      setError(null);
      setResponse('');

      const result = await generateContent(prompt);
      setResponse(result);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while generating content.');
    } finally {
      setLoading(false);
    }
  };

  return { sendPrompt, loading, response, error };
};
