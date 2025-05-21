// @/app/actions/youtube-summarizer.ts
'use server';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { YoutubeTranscript, TranscriptResponse } from 'youtube-transcript'; // Import the library

const apiKey = process.env.GEMINI_API_KEY;

// Use a model efficient for text processing with a decent context window
const GEMINI_MODEL_NAME = "gemini-1.5-flash-latest";
// const GEMINI_MODEL_NAME = "gemini-1.5-pro-latest"; // More capable, but higher chance of rate limits on free tier

const MAX_TRANSCRIPT_CHARS = 30000; // Max characters of transcript to send to Gemini. Adjust as needed.
                                   // Gemini 1.5 Flash has a 1M token context, but shorter is faster & cheaper.
                                   // 30k chars is roughly 7.5k-10k tokens.

if (!apiKey) {
  console.warn(
    "GEMINI_API_KEY environment variable is not set. YouTube summarization will fail."
  );
}

export interface YoutubeSummaryResponse {
  summary?: string;
  error?: string;
  originalUrl?: string;
  transcriptFetched?: boolean;
}

function isValidYoutubeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
  ];
  return patterns.some(pattern => pattern.test(url));
}

async function getTranscript(videoUrlOrId: string): Promise<{ transcriptText: string | null, error?: string }> {
  try {
    console.log(`[Transcript Fetcher] Attempting to fetch transcript for: ${videoUrlOrId}`);
    // The library can usually handle full URLs or just video IDs
    const transcriptResponse: TranscriptResponse[] = await YoutubeTranscript.fetchTranscript(videoUrlOrId);

    if (transcriptResponse && transcriptResponse.length > 0) {
      let fullText = transcriptResponse.map(entry => entry.text).join(' ');
      console.log(`[Transcript Fetcher] Full transcript length: ${fullText.length} characters.`);
      if (fullText.length > MAX_TRANSCRIPT_CHARS) {
        fullText = fullText.substring(0, MAX_TRANSCRIPT_CHARS) + "\n... (transcript truncated due to length)";
        console.log(`[Transcript Fetcher] Transcript truncated to ${fullText.length} characters.`);
      }
      return { transcriptText: fullText };
    } else {
      return { transcriptText: null, error: "No transcript data found or transcript was empty." };
    }
  } catch (err: unknown) {
    let errorMessage = "Failed to fetch YouTube transcript.";
    if (err instanceof Error && err.message.includes('subtitles not found')) {
        errorMessage = "Subtitles (transcript) are not available for this video.";
    } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = `Error fetching transcript: ${err.message}`;
    }
    console.error(`[Transcript Fetcher] ${errorMessage}`, err);
    return { transcriptText: null, error: errorMessage };
  }
}


export async function summarizeYoutubeVideo(
  videoUrl: string
): Promise<YoutubeSummaryResponse> {
  if (!apiKey) {
    return { error: "Gemini API key is not configured.", originalUrl: videoUrl };
  }
  if (!videoUrl || videoUrl.trim() === "") {
    return { error: "YouTube video URL cannot be empty.", originalUrl: videoUrl };
  }
  if (!isValidYoutubeUrl(videoUrl)) {
    return { error: "Invalid YouTube video URL provided.", originalUrl: videoUrl };
  }

  // 1. Fetch Transcript
  const { transcriptText, error: transcriptError } = await getTranscript(videoUrl);

  if (transcriptError || !transcriptText) {
    return {
      error: transcriptError || "Failed to retrieve transcript, cannot summarize.",
      originalUrl: videoUrl,
      transcriptFetched: false,
    };
  }

  // 2. Summarize with Gemini using the transcript
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      systemInstruction: "You are an expert AI assistant specializing in summarizing text content. You will be provided with a transcript of a YouTube video. Your task is to create a concise, factual, and informative summary based *only* on the provided transcript.",
    });

    const generationConfig = {
      temperature: 0.2,
      topK: 1,
      topP: 0.9,
      maxOutputTokens: 1024, // Max tokens for the summary itself
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const prompt = `
      The following is a transcript from a YouTube video. Please provide a clear, concise, and factual summary of this transcript.
      Focus on the main topics, key arguments, and any significant conclusions or takeaways.
      Do not include any information not present in this transcript.
      Do not add any personal opinions or interpretations.
      If the transcript discusses steps or instructions, list them clearly.
      If it's a discussion, outline the core arguments.

      Video Transcript:
      ---
      ${transcriptText}
      ---

      Summary:
    `;

    console.log(`[Gemini Summarizer] Sending transcript (length: ${transcriptText.length}) to ${GEMINI_MODEL_NAME} for summarization.`);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{text: prompt}] }],
      generationConfig,
      safetySettings,
    });

    if (result.response) {
      const textSummary = result.response.text();
      if (textSummary && textSummary.trim() !== "") {
        console.log(`[Gemini Summarizer] Summary generated for ${videoUrl}.`);
        return { summary: textSummary, originalUrl: videoUrl, transcriptFetched: true };
      } else {
        console.warn(`[Gemini Summarizer] Model returned an empty summary for ${videoUrl} despite receiving transcript.`);
        return { error: "Model returned an empty summary even with the transcript.", originalUrl: videoUrl, transcriptFetched: true };
      }
    } else {
      interface PromptFeedback {
        blockReason?: string;
      }

      interface ResponseWithFeedback {
        promptFeedback?: PromptFeedback;
      }

      const blockReason = (result.response as ResponseWithFeedback)?.promptFeedback?.blockReason;
      console.error(`[Gemini Summarizer] No response or content blocked for ${videoUrl}. Reason: ${blockReason}`);
      let errorMessage = "Failed to generate summary from transcript. The model did not return a valid response.";
      if (blockReason) {
        errorMessage += ` Reason: ${blockReason}.`;
      }
      return { error: errorMessage, originalUrl: videoUrl, transcriptFetched: true };
    }

  } catch (error: unknown) {
    let errorMessage = `Server action failed during Gemini summarization of transcript for ${videoUrl}.`;
    if (error instanceof Error) {
      // Handle API specific errors (quota, model not found etc.)
      if (error.message.includes("429") || error.message.toLowerCase().includes("quota")) {
        errorMessage = `You've exceeded the API request limit for the current model (${GEMINI_MODEL_NAME}) while summarizing the transcript. Please try again later or consider upgrading your plan. Full error: ${error.message}`;
      } else if (error.message.includes("404") || error.message.toLowerCase().includes("not found")) {
        errorMessage = `The model "${GEMINI_MODEL_NAME}" was not found or is not supported for summarizing the transcript. Please check the model name. Full error: ${error.message}`;
      } else {
        errorMessage += ` Error: ${error.message}.`;
      }
    }
    console.error(`[Gemini Summarizer] Error:`, errorMessage, error);
    return { error: errorMessage, originalUrl: videoUrl, transcriptFetched: true };
  }
}