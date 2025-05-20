'use server';

import { generateGeminiContent } from '@/lib/gemini';

export async function generateContent(prompt: string) {
  const result = await generateGeminiContent(prompt);
  return result;
}
