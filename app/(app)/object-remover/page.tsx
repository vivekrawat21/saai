// components/AiObjectRemoverUrlComponent.tsx
"use client";

import React, { useState, useCallback, ChangeEvent } from 'react';
// Ensure this path and function name correctly match your server action file
import { removeObjectViaUrl, AiObjectRemoverUrlResponse, AiObjectRemoverUrlRequest } from '@/app/actions/aiObjectRemoverUrlActions';

const AiObjectRemoverUrlComponent: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [maskUrl, setMaskUrl] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  // Stores relevant parts of the successful API response
  const [result, setResult] = useState<Pick<AiObjectRemoverUrlResponse, 'processedImageUrl' | 'processingTime' | 'fullApiResponse'> | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!imageUrl.trim().startsWith("http") || !maskUrl.trim().startsWith("http")) {
      setApiError("Please provide valid URLs for both the image and the mask.");
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setResult(null);

    const requestPayload: AiObjectRemoverUrlRequest = {
      imageUrl: imageUrl.trim(),
      maskUrl: maskUrl.trim(),
    };

    try {
      const response: AiObjectRemoverUrlResponse = await removeObjectViaUrl(requestPayload);

      if (response.success && response.processedImageUrl) {
        setResult({
            processedImageUrl: response.processedImageUrl,
            processingTime: response.processingTime,
            fullApiResponse: response.fullApiResponse
        });
      } else {
        setApiError(response.error || response.message || "Failed to remove object or 'result' URL not found in API response.");
         if (response.fullApiResponse) {
            console.warn("API response from server action (on client) did not contain expected 'processedImageUrl':", response.fullApiResponse);
        }
      }
    } catch (error: unknown) {
      console.error("[Client] Error calling removeObjectViaUrl action:", error);
      setApiError("An unexpected client-side error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [imageUrl, maskUrl]);

  const handleDownloadOrOpenImage = async () => {
    if (!result?.processedImageUrl) {
      alert("No processed image URL available to download or open.");
      return;
    }

    const imageUrlToProcess = result.processedImageUrl;
    // Try to derive a filename
    let fileName = `object_removed_${Date.now()}`;
    try {
        const urlParts = new URL(imageUrlToProcess).pathname.split('/');
        const lastPart = urlParts.pop() || 'image.png'; // Fallback filename part
        if (lastPart.includes('.')) {
            fileName = `object_removed_${lastPart}`;
        } else {
            // If no extension, try to guess based on common image types or default
            fileName = `${fileName}.${lastPart.includes('webp') ? 'webp' : lastPart.includes('jpg') || lastPart.includes('jpeg') ? 'jpeg' : 'png'}`;
        }
    } catch {
        console.warn("Could not parse URL for filename, using default.");
    }


    try {
      // Attempt to fetch the image data to enable a true "download with filename"
      // This will likely fail due to CORS if the image server doesn't allow it.
      console.log(`Attempting to fetch for download: ${imageUrlToProcess}`);
      const response = await fetch(imageUrlToProcess); // Default mode is 'cors'
      if (!response.ok) {
        // If fetch itself fails (e.g. network error, or CORS preflight denied, though CORS usually errors differently)
        throw new Error(`HTTP error! status: ${response.status}. Falling back to opening image directly.`);
      }
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); // Clean up blob URL
    } catch (fetchError: unknown) {
      // This catch block will often be hit due to CORS restrictions
      // when fetching from a different domain.
      if (fetchError instanceof Error) {
        console.warn("Could not fetch image for direct download due to error (likely CORS or network issue):", fetchError.message);
      } else {
        console.warn("An unknown error occurred while fetching the image for download.");
      }
      console.log("Opening image in a new tab as a fallback.");
      // Fallback: Open the image in a new tab, user can save from there
      window.open(imageUrlToProcess, '_blank');
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
          AI Object Remover (URL Input)
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-lg">
          Provide public URLs for your image and mask to remove objects.
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-xl">
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="imageUrlInput" className="block text-gray-300 text-sm font-medium mb-2">Image URL:</label>
            <input
              id="imageUrlInput"
              type="url"
              placeholder="https://example.com/your-image.jpg"
              value={imageUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
              className="block w-full p-3 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm custom-scrollbar"
            />
          </div>
          <div>
            <label htmlFor="maskUrlInput" className="block text-gray-300 text-sm font-medium mb-2">Mask URL (White on Black):</label>
            <input
              id="maskUrlInput"
              type="url"
              placeholder="https://example.com/your-mask.png"
              value={maskUrl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMaskUrl(e.target.value)}
              className="block w-full p-3 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm custom-scrollbar"
            />
             <p className="text-xs text-gray-500 mt-1">The mask should be a black image with the object to remove painted in white, accessible via a public URL.</p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className={`w-full py-3 mt-2 rounded-lg text-white font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-150 ease-in-out
              ${(isLoading || !imageUrl.trim().startsWith("http") || !maskUrl.trim().startsWith("http"))
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-teal-600 hover:to-emerald-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500"
            }`}
            disabled={isLoading || !imageUrl.trim().startsWith("http") || !maskUrl.trim().startsWith("http")}
          >
            {isLoading ? "Processing..." : "Remove Object"}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {(result || apiError || isLoading) && (
        <div className="mt-8 md:mt-10 w-full max-w-3xl bg-gray-800 p-5 md:p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-emerald-400">
              {isLoading && !result && !apiError ? "Processing..." : "Result:"}
            </h2>
            {result?.processedImageUrl && !isLoading && (
              <button
                onClick={handleDownloadOrOpenImage}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                Download / Open Image
              </button>
            )}
          </div>
          <div className="max-w-none text-gray-200">
            {apiError ? (
              <pre className="text-red-400 whitespace-pre-wrap break-words p-3 bg-red-900/30 rounded-md">{apiError}</pre>
            ) : isLoading && !result ? (
              <div className="flex justify-center items-center h-64 bg-gray-700 rounded-md animate-pulse">
                <svg className="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5.16 14.55A4.5 4.5 0 008.11 21H15.89a4.5 4.5 0 002.95-6.45l-3.931-4.141a2.25 2.25 0 01-.659-1.591V3.104M15.75 4.896V3.104M8.25 4.896V3.104M3 12.75l2.25 2.25M21 12.75l-2.25 2.25M12 3s.527 1.04 0 1.527V3zm0 0c-.527.487 0 1.527 0 1.527V3zm0 0s.527 1.04 0 1.527V3zm0 0c-.527.487 0 1.527 0 1.527V3z"/>
                </svg>
                <span className="ml-2">Removing object...</span>
              </div>
            ) : result?.processedImageUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={result.processedImageUrl}
                  alt="Object removed"
                  className="w-full h-auto rounded-md object-contain"
                  style={{ maxHeight: '70vh', border: '1px solid #4A5568' }}
                  onError={(e) => {
                    console.error("Error loading processed image from URL:", result.processedImageUrl, e);
                    setApiError(`Failed to load image from URL: ${result.processedImageUrl}. Check if the URL is valid, publicly accessible, and allows embedding (CORS).`);
                    (e.target as HTMLImageElement).style.display = 'none'; // Hide broken image icon
                  }}
                />
                {result.processingTime && (
                    <p className="text-xs text-gray-400 mt-2">Processing time: {result.processingTime} (units may vary)</p>
                )}
              </div>
            ) : result && !result.processedImageUrl ? (
                 <div className="text-center text-gray-400">
                    <p>Processing likely completed, but no image URL was found in the API response.</p>
                    {result.processingTime && ( <p className="text-xs text-gray-400 mt-2">Processing time: {result.processingTime}</p> )}
                    <p className="text-xs mt-1">Review raw API data or server logs.</p>
                    {result.fullApiResponse && (
                         <pre className="mt-4 bg-gray-700 p-3 rounded-md overflow-x-auto text-xs text-left custom-scrollbar max-h-60">
                            {JSON.stringify(result.fullApiResponse, null, 2)}
                        </pre>
                    )}
                </div>
            ) : null}
          </div>
        </div>
      )}
       {/* Global styles */}
       <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #374151; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #4b5563 #374151; }
      `}</style>
    </div>
  );
};

export default AiObjectRemoverUrlComponent;