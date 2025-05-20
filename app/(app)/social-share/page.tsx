"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CldImage } from "next-cloudinary";

// Define social formats with specific dimensions and aspect ratios
const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Instagram Story (9:16)": { width: 1080, height: 1920, aspectRatio: "9:16" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Post (1.91:1)": { width: 1200, height: 628, aspectRatio: "1.91:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" }, // Approx 2.62:1
  "LinkedIn Post (1.91:1)": { width: 1200, height: 628, aspectRatio: "1.91:1" },
  "Pinterest Pin (2:3)": { width: 1000, height: 1500, aspectRatio: "2:3" },
};

type SocialFormatKey = keyof typeof socialFormats;

export default function SocialShare() {
  const [uploadedImagePublicId, setUploadedImagePublicId] = useState<string | null>(null);
  const [selectedFormatKey, setSelectedFormatKey] = useState<SocialFormatKey>("Instagram Square (1:1)");
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false); // For CldImage loading state
  const [apiError, setApiError] = useState<string | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set preview loading to true when image or format changes, CldImage onLoad will set it to false
  useEffect(() => {
    if (uploadedImagePublicId) {
      setIsPreviewLoading(true);
    }
  }, [selectedFormatKey, uploadedImagePublicId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic file type check (optional, but good UX)
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!acceptedImageTypes.includes(file.type)) {
        setApiError("Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP).");
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
    }

    setIsUploading(true);
    setApiError(null);
    setUploadedImagePublicId(null); // Clear previous image while uploading new one

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/image-upload", { // Ensure this API endpoint is correct
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error
        throw new Error(errorData.message || `Failed to upload image. Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.publicId) {
        setUploadedImagePublicId(data.publicId);
      } else {
        throw new Error("Image uploaded, but publicId not received.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setApiError(error.message || "An unexpected error occurred during upload.");
      } else {
        setApiError("An unexpected error occurred during upload.");
      }
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!imageRef.current?.src || isPreviewLoading) return;

    try {
      const response = await fetch(imageRef.current.src);
      if (!response.ok) throw new Error('Failed to fetch image for download.');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const formatDetails = socialFormats[selectedFormatKey];
      const filename = `${selectedFormatKey.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}_${formatDetails.width}x${formatDetails.height}.png`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setApiError("Failed to download image. Please try again.");
    }
  }, [selectedFormatKey, isPreviewLoading]);

  const handleClearImage = () => {
    setUploadedImagePublicId(null);
    setSelectedFormatKey("Instagram Square (1:1)");
    setApiError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Resets the displayed file name in the input
    }
  };
  
  const currentFormat = socialFormats[selectedFormatKey];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
          Social Media Image Formatter
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-xl">
          Upload your image and instantly format it for various social media platforms.
        </p>
      </div>

      {/* Upload Section & Controls */}
      <div className="w-full max-w-lg bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        {!uploadedImagePublicId ? (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="imageUpload" className="block text-gray-300 text-sm font-medium mb-2">
                Upload an Image:
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled={isUploading}
              />
              <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF, WEBP accepted.</p>
            </div>

            {isUploading && (
              <div className="mt-2 text-center">
                <span className="loading loading-dots loading-md text-sky-400"></span>
                <p className="text-sm text-sky-400">Uploading...</p>
              </div>
            )}
          </div>
        ) : (
          // Controls shown after image is uploaded
          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="formatSelect" className="block text-gray-300 text-sm font-medium mb-2">
                Select Social Media Format:
              </label>
              <select
                id="formatSelect"
                className="block w-full px-3 py-2.5 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none appearance-none custom-select-arrow text-sm"
                value={selectedFormatKey}
                onChange={(e) => setSelectedFormatKey(e.target.value as SocialFormatKey)}
              >
                {Object.keys(socialFormats).map((formatName) => (
                  <option key={formatName} value={formatName}>
                    {formatName} ({socialFormats[formatName as SocialFormatKey].width}x{socialFormats[formatName as SocialFormatKey].height})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {apiError && (
          <div className="mt-4 p-3 bg-red-800/30 border border-red-700 text-red-300 rounded-md text-sm">
            <p><strong>Error:</strong> {apiError}</p>
          </div>
        )}
      </div>
      
      {/* Preview and Download Section - Shown only if image is uploaded */}
      {uploadedImagePublicId && (
        <div className="mt-8 w-full max-w-lg">
          <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
            <h3 className="text-xl font-semibold mb-4 text-sky-400 text-center">Preview</h3>
            {/* Preview Container */}
            <div 
              className="relative w-full max-w-md mx-auto bg-gray-700/50 rounded-md overflow-hidden border border-gray-700 mb-6"
              // Dynamically set aspect ratio for the container to prevent layout shifts
              style={{ aspectRatio: currentFormat.aspectRatio.replace(':', '/') || '1/1' }}
            >
              {isPreviewLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-20">
                  <span className="loading loading-spinner loading-lg text-sky-400"></span>
                </div>
              )}
              <CldImage
                key={selectedFormatKey + uploadedImagePublicId} // Force re-render on format or image change
                width={currentFormat.width}  // Request image at this width from Cloudinary
                height={currentFormat.height} // Request image at this height
                src={uploadedImagePublicId}
                alt={`Preview for ${selectedFormatKey}`}
                crop="fill" // Fills the dimensions, might crop
                // or use "pad" with background="auto" for letterboxing to fit aspect ratio
                gravity="auto" // Auto-detects important parts for cropping
                format="png" // Output format
                quality="auto"
                className="absolute inset-0 w-full h-full object-contain z-10" // Displayed image fits container
                onLoad={() => setIsPreviewLoading(false)}
                onError={() => {
                    setIsPreviewLoading(false);
                    setApiError("Error loading image preview. The image might be too large or format incompatible.");
                }}
                ref={imageRef}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                // **** THIS IS THE CORRECTED LINE ****
                className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-150 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500`}
                onClick={handleDownload}
                disabled={isPreviewLoading || !uploadedImagePublicId}
              >
                {isPreviewLoading ? "Preparing..." : `Download for ${selectedFormatKey}`}
              </button>
              <button
                className="w-full py-2.5 rounded-lg text-gray-300 font-medium bg-gray-700 hover:bg-gray-600 transition-colors"
                onClick={handleClearImage}
              >
                Upload New Image
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-select-arrow {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem; /* Make space for the arrow */
        }
      `}</style>
    </div>
  );
}