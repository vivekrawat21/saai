// @/app/actions/index.ts
'use server';

import axios from 'axios'; // For making HTTP requests

const apiKey = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

if (!apiKey) {
  console.warn("GEMINI_API_KEY environment variable is not set. Image generation will fail.");
}

export interface GenerateImageOptions {
  aspect_ratio?: string;
  style_preset?: string;
  output_format?: "png" | "jpeg" | "webp";
  modelName?: string; // e.g., "gemini-2.0-flash-preview-image-generation"
}

export interface ImageGenerationResponse {
  imageData?: string;
  accompanyingText?: string;
  error?: string;
  mimeType?: string;
}

// Helper to construct the prompt with style and aspect ratio hints
function constructFullPrompt(prompt: string, options?: GenerateImageOptions): string {
  let fullPrompt = prompt.trim();
  if (options?.style_preset && options.style_preset !== "none") {
    fullPrompt += `, style: ${options.style_preset}`;
  }
  if (options?.aspect_ratio) {
    fullPrompt += `, aspect ratio: ${options.aspect_ratio}`;
  }
  // The model itself will dictate format based on response_modalities & API behavior
  return fullPrompt;
}

export async function generateImageFromPrompt(
  prompt: string,
  options?: GenerateImageOptions
): Promise<ImageGenerationResponse> {
  if (!apiKey) {
    return { error: "Gemini API key is not configured." };
  }
  if (!prompt || prompt.trim() === "") {
    return { error: "Prompt cannot be empty." };
  }

  const modelId = options?.modelName || "gemini-2.0-flash-preview-image-generation";
  const effectivePrompt = constructFullPrompt(prompt, options);
  const requestedOutputFormat = options?.output_format || "png"; // For fallback mimeType

  const endpoint = `${GEMINI_API_BASE_URL}/models/${modelId}:generateContent?key=${apiKey}`;

  // Construct the request payload according to the REST API documentation
  // The key is finding where `response_modalities` goes.
  // Based on the error, it seems like a top-level or generationConfig parameter.
  // THIS IS A GUESS for the payload structure; **VERIFY WITH OFFICIAL DOCUMENTATION.**
  const payload = {
    contents: [
      {
        parts: [{ text: effectivePrompt }],
      },
    ],
    // OPTION A: If responseModalities is part of generationConfig
    // generationConfig: {
    //   responseModalities: ["TEXT", "IMAGE"], // Ensure this matches what the error says it accepts
    //   // candidateCount: 1, // Optional
    //   // temperature: 0.7, // Optional
    // },
    // OPTION B: If responseModalities is a top-level parameter (less likely but possible)
    // responseModalities: ["TEXT", "IMAGE"], // GUESS

    // **** IMPORTANT: You MUST find the correct way to specify responseModalities for the REST API. ****
    // **** The error message "accepts the following combination of response modalities: * TEXT, IMAGE"
    // **** strongly implies this needs to be set in the request.
    // **** Let's assume for this example it's in generationConfig as shown in Option A.
    // **** If the API doc says otherwise, adjust this payload.
    // **** If there's no explicit "responseModalities" param, but rather a "responseMimeTypes"
    // **** (like in some older Google APIs), that would be different. But the error points to "modalities".

    // Forcing the API to attempt the modality, as it's required for this model.
    // If your Python SDK's `types.GenerateContentConfig(response_modalities=...)` translates
    // to a specific field in the JSON, that's what you need here.
    // Often, the SDK is a wrapper, so `response_modalities` might be a top-level key in the
    // `GenerateContentConfig` object in the SDK, which then maps to a field in the REST payload.
    // Let's try putting it directly in generationConfig as it's a configuration for generation.
    generationConfig: {
      // This is the crucial part based on the error and your Python code.
      // The exact field name might be "responseModalities", "outputModalities", etc.
      // "response_modalities" (snake_case) is also possible if the API uses that.
      // Given the error uses "response modalities", "responseModalities" (camelCase) is a strong candidate for JSON.
      responseModalities: ["TEXT", "IMAGE"],
      // "response_mime_type": "image/png" // This is sometimes used for single image output,
                                        // but "responseModalities" seems more fitting here.
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  console.log(`[Server Action - REST] POST to ${endpoint}`);
  console.log("[Server Action - REST] Payload:", JSON.stringify(payload, null, 2));

  try {
    const apiResponse = await axios.post(endpoint, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log("[Server Action - REST] API Response Status:", apiResponse.status);
    console.log("[Server Action - REST] API Response Data:", JSON.stringify(apiResponse.data, null, 2));

    // Process the response - structure will depend on the actual API response
    // Example assumes response.data.candidates[0].content.parts structure
    const responseData = apiResponse.data;
    let imageBase64Data: string | undefined;
    let textOutput: string | undefined;
    let detectedMimeType: string | undefined;

    if (responseData.candidates && responseData.candidates[0]?.content?.parts) {
      for (const part of responseData.candidates[0].content.parts) {
        if (part.text) {
          textOutput = (textOutput ? textOutput + "\n" : "") + part.text.trim();
        } else if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
          imageBase64Data = part.inlineData.data;
          detectedMimeType = part.inlineData.mimeType;
          break;
        }
      }
    }

    if (!imageBase64Data) {
      const errorText = textOutput || "Model did not return image data in the expected format via REST.";
      return { error: `Failed to generate image: ${errorText}`, accompanyingText: textOutput };
    }

    return {
      imageData: imageBase64Data,
      accompanyingText: textOutput,
      mimeType: detectedMimeType || `image/${requestedOutputFormat}`,
    };

  } catch (error: unknown) {
    let errorMessage = "Server action failed during REST API call.";
    if (axios.isAxiosError(error)) {
      errorMessage += ` Axios error: ${error.message}.`;
      if (error.response) {
        errorMessage += ` Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data)}.`;
        // Check for the specific modality error again
        if (JSON.stringify(error.response.data).includes("response modalities")) {
            errorMessage += " The `responseModalities` parameter in the payload might still be incorrect or missing for the REST API."
        }
      }
    } else {
      if (error instanceof Error) {
        errorMessage += ` Non-Axios error: ${error.message}.`;
      } else {
        errorMessage += " Non-Axios error: An unknown error occurred.";
      }
    }
    console.error("[Server Action - REST] Error:", errorMessage);
    return { error: errorMessage };
  }
}