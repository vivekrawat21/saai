// @/app/actions/unscreenActions.ts
'use server';

import axios from 'axios';
import FormDataNode from 'form-data'; // Import the Node.js specific FormData

const UNSCREEN_API_KEY = process.env.UNSCREEN_API_KEY;
const UNSCREEN_API_BASE_URL = "https://api.unscreen.com/v1.0";

if (!UNSCREEN_API_KEY) {
  console.warn(
    "UNSCREEN_API_KEY environment variable is not set. Video background removal will fail."
  );
}

export interface UnscreenUploadResponse {
  videoId?: string;
  statusUrl?: string;
  error?: string;
}

export interface UnscreenStatusResponse {
  // ... (this interface remains the same)
  status?: 'queued' | 'processing' | 'done' | 'error';
  resultUrl?: string;
  progress?: number;
  error?: string;
  errorMessage?: string;
  originalVideoId?: string;
}

// Action to submit a video file for background removal
export async function removeVideoBackground(
  clientFormData: FormData // This is the FormData from the client
): Promise<UnscreenUploadResponse> {
  if (!UNSCREEN_API_KEY) {
    return { error: "Unscreen API key is not configured." };
  }

  const endpoint = `${UNSCREEN_API_BASE_URL}/videos`;

  try {
    // 1. Extract the file from the client FormData
    const file = clientFormData.get("video_file") as File | null;

    if (!file) {
      return { error: "No video_file found in the submitted data." };
    }

    // 2. Create a new FormData object for Node.js environment using 'form-data'
    const serverFormData = new FormDataNode();

    // 3. Convert the File object to a Buffer to append it
    //    (File objects from client FormData in Server Actions are instances of Blob)
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 4. Append the file buffer to the server-side FormData
    //    It's crucial to provide the filename for the Unscreen API.
    serverFormData.append("video_file", fileBuffer, {
      filename: file.name,
      contentType: file.type,
    });

    // Add any other parameters if needed (e.g., for Pro features, but we removed them for free tier)
    // serverFormData.append("parameter_name", "value");

    console.log("[Unscreen Action] Submitting video to Unscreen (Free Tier)...");

    // 5. Make the POST request with the server-side FormData
    const response = await axios.post(endpoint, serverFormData, {
      headers: {
        ...serverFormData.getHeaders(), // Now this will work correctly
        'X-Api-Key': UNSCREEN_API_KEY,
      },
      // It's good practice to set maxBodyLength for uploads, though Next.js serverActions.bodySizeLimit handles the incoming request size
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log("[Unscreen Action] Video submission response:", response.data);

    const videoId = response.data?.id || response.data?.data?.id;
    const selfLink = response.data?.links?.self || response.data?.data?.links?.self;

    if (!videoId || !selfLink) {
        console.error("[Unscreen Action] Unexpected response structure from video submission:", response.data);
        return { error: "Failed to get video ID or status URL from Unscreen API after submission. Ensure your API key is valid and has free tier access." };
    }

    return {
      videoId: videoId,
      statusUrl: selfLink,
    };

  } catch (error: unknown) {
    let errorMessage = "Failed to submit video to Unscreen.";
    // ... (rest of the error handling from the previous version can remain largely the same)
    if (axios.isAxiosError(error)) {
      errorMessage += ` Axios error: ${error.message}.`;
      if (error.response) {
        errorMessage += ` Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data)}.`;
        const responseData = error.response.data;
        let detail = "";
        if (responseData?.errors?.[0]?.detail) {
            detail = responseData.errors[0].detail;
        } else if (typeof responseData === 'string') {
            detail = responseData;
        }

        if (detail.toLowerCase().includes("subscription") || detail.toLowerCase().includes("credits")) {
            errorMessage = `Unscreen API indicated an issue with subscription or credits (Status: ${error.response.status}). The free tier might have limitations or require specific conditions. Please check your Unscreen account. Detail: ${detail}`;
        } else if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = `Authentication or Authorization error (Status: ${error.response.status}). Please verify your Unscreen API key and its permissions for free tier access. Detail: ${detail}`;
        } else if (error.response.data?.message?.toLowerCase().includes("file is too large")){ // Unscreen specific error for file size
            errorMessage = `The file is too large for Unscreen's limits. Please try a smaller file. (Unscreen error: ${error.response.data.message})`;
        }
         else {
            errorMessage = `Error submitting to Unscreen (Status: ${error.response.status}). Detail: ${detail || 'No specific detail provided.'}`;
        }
        console.error("[Unscreen Action] Axios error response:", responseData);
      }
    } else if (error instanceof Error) {
      errorMessage += ` Error: ${error.message}.`;
    }
    console.error("[Unscreen Action] Error submitting video:", errorMessage, error);
    return { error: errorMessage };
  }
}

// checkVideoStatus function remains the same as the previous corrected version
export async function checkVideoStatus(
  videoId: string
): Promise<UnscreenStatusResponse> {
  if (!UNSCREEN_API_KEY) {
    return { errorMessage: "Unscreen API key is not configured.", originalVideoId: videoId };
  }
  if (!videoId) {
    return { errorMessage: "Video ID is required to check status.", originalVideoId: videoId };
  }

  const endpoint = `${UNSCREEN_API_BASE_URL}/videos/${videoId}`;
  console.log(`[Unscreen Action] Checking status for video ID: ${videoId}`);

  try {
    const response = await axios.get(endpoint, {
      headers: {
        'X-Api-Key': UNSCREEN_API_KEY,
      },
    });

    console.log("[Unscreen Action] Video status response:", response.data);
    const attributes = response.data?.data?.attributes;

    if (!attributes) {
        console.error("[Unscreen Action] Unexpected response structure from status check:", response.data);
        return { errorMessage: "Failed to parse video status from Unscreen API response.", originalVideoId: videoId };
    }

    let unscreenErrorDetail = null;
    if (attributes.status === 'error') {
        const errorObj = attributes.error || {};
        unscreenErrorDetail = errorObj.detail || errorObj.title || attributes.error_message || "Unknown processing error from Unscreen. This might be due to file type/duration exceeding free tier limits.";
        if (unscreenErrorDetail && (unscreenErrorDetail.toLowerCase().includes("duration") || unscreenErrorDetail.toLowerCase().includes("length"))) {
            unscreenErrorDetail += " Ensure the video is very short (5-10s) for the free tier.";
        }
    }

    return {
      status: attributes.status,
      resultUrl: attributes.result_url,
      progress: attributes.progress,
      error: unscreenErrorDetail,
      originalVideoId: videoId,
    };

  } catch (error: unknown)
    {
     let errorMessage = `Failed to check status for video ${videoId}.`;
     if (axios.isAxiosError(error)) {
      errorMessage += ` Axios error: ${error.message}.`;
      if (error.response) {
        errorMessage += ` Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data)}.`;
         const responseData = error.response.data;
         let detail = "";
         if (responseData?.errors?.[0]?.detail) {
             detail = responseData.errors[0].detail;
         } else if (typeof responseData === 'string') {
             detail = responseData;
         }
         if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = `Authentication/Authorization error checking status (Status: ${error.response.status}). Verify API key. Detail: ${detail}`;
         } else {
            errorMessage = `Error checking status (Status: ${error.response.status}). Detail: ${detail || 'No specific detail.'}`;
         }
         console.error("[Unscreen Action] Axios error response during status check:", responseData);
      }
    } else if (error instanceof Error) {
      errorMessage += ` Error: ${error.message}.`;
    }
    console.error("[Unscreen Action] Error checking video status:", errorMessage, error);
    return { errorMessage: errorMessage, originalVideoId: videoId };
  }
}