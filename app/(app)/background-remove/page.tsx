"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { UploadCloudIcon, ImageIcon, SparklesIcon, DownloadIcon, AlertTriangleIcon, RefreshCcwIcon } from "lucide-react"; // Using lucide-react icons

export default function RemoveBackground() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageURL, setOriginalImageURL] = useState<string | null>(null);
  const [originalImageName, setOriginalImageName] = useState<string | null>(null);

  const [processedImageURL, setProcessedImageURL] = useState<string | null>(null);
  const [processedImageBlob, setProcessedImageBlob] = useState<Blob | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to create object URL for original image preview and revoke it on cleanup
  useEffect(() => {
    if (originalImageFile) {
      const objectUrl = URL.createObjectURL(originalImageFile);
      setOriginalImageURL(objectUrl);
      setOriginalImageName(originalImageFile.name);

      // Cleanup function to revoke the object URL when the component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setOriginalImageURL(null);
      setOriginalImageName(null);
    }
  }, [originalImageFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic file type check
      const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp']; // remove.bg supports these well
      if (!acceptedImageTypes.includes(file.type)) {
          setApiError("Invalid file type. Please upload a JPEG, PNG, or WEBP image.");
          setOriginalImageFile(null);
          setProcessedImageURL(null);
          setProcessedImageBlob(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
      }
      setOriginalImageFile(file);
      setProcessedImageURL(null); // Reset previous processed image
      setProcessedImageBlob(null);
      setApiError(null); // Clear previous errors
    }
  };

  const handleRemoveBackground = async () => {
    const apiKey = process.env.NEXT_PUBLIC_REMOVEBG_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_REMOVEBG_API_URL;

    if (!apiKey || !apiUrl) {
      setApiError("API configuration is missing. Please contact support.");
      console.error("Remove.bg API Key or URL is not configured in .env.local");
      return;
    }

    if (!originalImageFile) {
      setApiError("Please select an image file first.");
      return;
    }

    const formData = new FormData();
    formData.append("image_file", originalImageFile, originalImageFile.name);
    formData.append("size", "auto"); // remove.bg recommends 'auto'

    setIsLoading(true);
    setApiError(null);
    setProcessedImageURL(null);
    setProcessedImageBlob(null);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          // 'Accept': 'application/json' // If you want to get error messages as JSON
        },
        body: formData,
      });

      if (!res.ok) {
        // Try to get error details from response (remove.bg returns JSON for errors)
        let errorDetails = `API Error: ${res.status} ${res.statusText}`;
        try {
          const errorData = await res.json(); // remove.bg often returns JSON errors
          if (errorData.errors && errorData.errors.length > 0 && errorData.errors[0].title) {
            errorDetails = errorData.errors[0].title;
          }
        } catch {
          // If response is not JSON, use the status text
        }
        throw new Error(errorDetails);
      }

      const imageBlob = await res.blob();
      if (imageBlob.type && !imageBlob.type.startsWith('image/')) {
        throw new Error("Received non-image data from API. Please check the input image or API limits.");
      }
      setProcessedImageBlob(imageBlob);

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProcessedImageURL(reader.result);
        } else {
           throw new Error("Failed to read processed image for preview.");
        }
      };
      reader.onerror = () => {
        throw new Error("Error reading processed image data.");
      };
      reader.readAsDataURL(imageBlob);

    } catch (error: unknown) {
      console.error("Error removing background:", error);
      if (error instanceof Error) {
        setApiError(error.message || "An unknown error occurred.");
      } else {
        setApiError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!processedImageBlob || !originalImageName) return;

    const downloadUrl = URL.createObjectURL(processedImageBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    
    const nameParts = originalImageName.split('.');
    nameParts.pop(); // Remove original extension
    const baseName = nameParts.join('.') || "image";
    link.download = `${baseName}_no_bg.png`; // remove.bg typically returns PNG

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }, [processedImageBlob, originalImageName]);

  const handleClear = () => {
    setOriginalImageFile(null);
    setOriginalImageURL(null);
    setProcessedImageURL(null);
    setProcessedImageBlob(null);
    setApiError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          AI Background Remover
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-xl">
          Upload an image and let AI effortlessly remove its background in seconds.
        </p>
      </div>

      {/* Input and Controls Section */}
      <div className="w-full max-w-md bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="imageUpload" className="block text-gray-300 text-sm font-medium mb-2">
              Select an Image:
            </label>
            <div className="relative">
                <input
                id="imageUpload"
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
                />
                <UploadCloudIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 hidden sm:block" />
            </div>
            <p className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP accepted. Max 15MB.</p>
          </div>

          {originalImageFile && (
            <button
              type="button"
              onClick={handleRemoveBackground}
              className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-150 ease-in-out
                ${(isLoading || !originalImageFile)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
              }`}
              disabled={isLoading || !originalImageFile}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Remove Background
                </span>
              )}
            </button>
          )}
          
          {apiError && (
            <div className="mt-2 p-3 bg-red-800/30 border border-red-700 text-red-300 rounded-md text-sm flex items-start gap-2">
              <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p><strong>Error:</strong> {apiError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Output Section - Shown if original image or processed image exists */}
      {(originalImageURL || processedImageURL) && (
        <div className="mt-8 w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Original Image Preview */}
            {originalImageURL && (
              <div className="bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-3 text-gray-300 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" /> Original Image
              </h3>
                <img
                  className="max-w-full h-auto max-h-96 rounded border border-gray-700 object-contain"
                  src={originalImageURL}
                  alt="Original Preview"
                />
              </div>
            )}

            {/* Processed Image Preview */}
            {processedImageURL && (
              <div className="bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-3 text-purple-400 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" /> Background Removed
                </h3>
                <img
                  className="max-w-full h-auto max-h-96 rounded border border-gray-700 object-contain"
                  src={processedImageURL}
                  alt="Background Removed Preview"
                />
                 <button
                  onClick={handleDownload}
                  className="mt-4 px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download Image
                </button>
              </div>
            )}
          </div>
          {/* Clear Button */}
          {(originalImageFile || processedImageURL || apiError) && (
             <div className="mt-8 text-center">
              <button
                onClick={handleClear}
                className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium text-sm transition-colors flex items-center gap-2 mx-auto"
                >
                <RefreshCcwIcon className="w-4 h-4" />
                Clear & Start Over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}