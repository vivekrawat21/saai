// @/app/actions/aiObjectRemoverUrlActions.ts
'use server';

import axios from 'axios';
import querystring from 'node:querystring';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY_AI_OBJECT_REMOVER_URL;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST_AI_OBJECT_REMOVER_URL;
const API_ENDPOINT_PATH = '/public/removeobject_url';
const API_URL = `https://${RAPIDAPI_HOST}${API_ENDPOINT_PATH}`;

if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
  console.error("RapidAPI Key or Host for AI Object Remover (URL version) is not set in environment variables.");
}

export interface AiObjectRemoverUrlRequest {
  imageUrl: string;
  maskUrl: string;
}

// Updated to reflect the known output structure
export interface AiObjectRemoverUrlResponse {
  success: boolean;
  processedImageUrl?: string; // This will hold the value from the 'result' field
  processingTime?: number | string; // To store processing_time if needed
  error?: string;
  message?: string;
  originalRequest?: AiObjectRemoverUrlRequest;
  fullApiResponse?: Record<string, unknown>; // Optionally store the full API response for debugging
}

export async function removeObjectViaUrl(
  requestData: AiObjectRemoverUrlRequest
): Promise<AiObjectRemoverUrlResponse> {
  if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
    return { success: false, error: "API credentials not configured on server." };
  }

  if (!requestData.imageUrl || !requestData.imageUrl.trim().startsWith("http")) {
    return { success: false, error: "A valid imageUrl must be provided." };
  }
  if (!requestData.maskUrl || !requestData.maskUrl.trim().startsWith("http")) {
    return { success: false, error: "A valid maskUrl must be provided." };
  }

  const formData: Record<string, string> = {
    image_url: requestData.imageUrl,
    mask_url: requestData.maskUrl,
  };

  const encodedFormData = querystring.stringify(formData);

  console.log(`[AIObjectRemoverUrl Action] POST to ${API_URL}`);
  // console.log("[AIObjectRemoverUrl Action] Payload (form-urlencoded):", encodedFormData); // Avoid logging sensitive URLs in prod

  try {
    const response = await axios.post(API_URL, encodedFormData, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      timeout: 60000,
    });

    console.log("[AIObjectRemoverUrl Action] API Response Status:", response.status);
    // console.log("[AIObjectRemoverUrl Action] API Response Data (raw):", JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data && typeof response.data.result === 'string') {
      // Successfully found the 'result' field which contains the URL
      return {
        success: true,
        processedImageUrl: response.data.result, // Extract the URL from the 'result' field
        processingTime: response.data.processing_time, // Store processing_time if available
        originalRequest: requestData,
        fullApiResponse: response.data // Store full response if needed for client-side details
      };
    } else if (response.status === 200 && response.data) {
        // If status is 200 but 'result' field is missing or not a string
        console.warn("[AIObjectRemoverUrl Action] API response 200 but 'result' field is missing or invalid:", response.data);
        return {
            success: false,
            error: "API processed the request but the expected 'result' URL was not found in the response.",
            message: response.data.message || JSON.stringify(response.data), // Include API message if any
            originalRequest: requestData,
            fullApiResponse: response.data
        };
    }
     else {
      // For non-200 statuses or if response.data is missing
      return {
        success: false,
        error: `API returned status ${response.status}.`,
        message: response.data?.message || "Unexpected response from API.",
        originalRequest: requestData,
        fullApiResponse: response.data
      };
    }
  } catch (error: unknown) {
    let errorMessage = "Server action failed during AI Object Remover (URL) API call.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage += ` Axios error: ${error.message}.`;
      if (error.response) {
        errorMessage += ` Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data)}.`;
        const apiErrorDetail = error.response.data?.error || error.response.data?.message;
        if (apiErrorDetail) {
            errorMessage += ` API Error: ${apiErrorDetail}`;
        }
      }
    } else {
      if (error instanceof Error) {
        errorMessage += ` Non-Axios error: ${error.message}.`;
      } else {
        errorMessage += " Non-Axios error: Unknown error occurred.";
      }
    }
    console.error("[AIObjectRemoverUrl Action] Error:", errorMessage);
    return { success: false, error: errorMessage, originalRequest: requestData };
  }
}