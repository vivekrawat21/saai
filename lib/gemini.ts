// In: @/lib/gemini.ts

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set on the server!");
  // Consider throwing an error here to prevent further execution if the key is critical
} else {
  console.log("Gemini Lib: API Key loaded (first 5 chars):", apiKey.substring(0, 5) + "...");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// --- DEFINE safetySettings HERE ---
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];
// --- END DEFINITION ---


export async function generateGeminiContent(prompt: string): Promise<string> {
  if (!genAI) {
    console.error("Gemini SDK not initialized. API Key was likely missing.");
    return 'Error: Gemini service is not configured correctly (API Key missing).';
  }

  try {
    // --- USE safetySettings HERE ---
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      safetySettings, // Now it's defined
      // generationConfig: { maxOutputTokens: 2048 } // Optional
    });

    console.log(`Sending prompt to Gemini: "${prompt}"`);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = result.response;

    if (response && response.text) {
      const text = response.text();
      console.log("Gemini Response Text:", text.substring(0,100) + "...");
      return text || 'Gemini returned an empty response.';
    } else if (response && response.promptFeedback && response.promptFeedback.blockReason) {
        console.warn("Gemini prompt was blocked. Reason:", response.promptFeedback.blockReason);
        console.warn("Safety Ratings:", response.promptFeedback.safetyRatings);
        return `Your prompt was blocked by the safety filter. Reason: ${response.promptFeedback.blockReason}`;
    } else if (response && response.candidates && response.candidates.length > 0 && response.candidates[0].finishReason !== 'STOP') {
        console.warn("Gemini generation stopped. Reason:", response.candidates[0].finishReason);
        console.warn("Candidate Safety Ratings:", response.candidates[0].safetyRatings);
        return `Content generation was stopped. Reason: ${response.candidates[0].finishReason}. Please check safety guidelines.`;
    } else {
      console.error("Gemini response structure unexpected or missing text. Full response:", JSON.stringify(response, null, 2));
      return 'Could not extract text from Gemini response.';
    }

  } catch (error: unknown) {
    console.error("------------------------------------------------------");
    console.error("ERROR DURING model.generateContent():");
    if (error instanceof Error) {
      console.error("Status:", (error instanceof Error && 'status' in error) ? (error as { status?: unknown }).status : 'Unknown'); // Safely access status
      console.error("Message:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }


    console.error("------------------------------------------------------");
    return 'Error: Failed to generate content due to an API error. Check server logs for details.';
  }
}