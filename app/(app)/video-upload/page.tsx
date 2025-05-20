"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { UploadCloudIcon, FilmIcon, AlertTriangleIcon } from "lucide-react"; // Using lucide-react icons

// Helper function to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const MAX_FILE_SIZE_MB = 70;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const VideoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null); // For success message

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setUploadError(null); // Clear previous errors on new file selection
    setUploadSuccess(null); // Clear previous success message

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${formatBytes(selectedFile.size)}.`);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear the file input
        }
        return;
      }
      // Optional: Check video MIME type
      if (!selectedFile.type.startsWith("video/")) {
        setUploadError("Invalid file type. Please select a video file.");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!file) {
      setUploadError("Please select a video file to upload.");
      return;
    }
    if (!title.trim()) {
      setUploadError("Please enter a title for your video.");
      return;
    }
     // Redundant check, already handled in handleFileChange, but good for direct submit attempt
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("originalSize", file.size.toString());
    // You might also want to send file.type if your backend needs it
    // formData.append("mimeType", file.type);

    try {
      // Ensure your API endpoint is correct
      const response = await axios.post("/api/video-upload", formData, {
        // Optional: Add onUploadProgress for a progress bar
        // onUploadProgress: (progressEvent) => {
        //   if (progressEvent.total) {
        //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        //     console.log(percentCompleted);
        //     // setUploadProgress(percentCompleted); // You'd need a state for this
        //   }
        // },
      });

      if (response.status === 200 || response.status === 201) { // 201 for created often used
        setUploadSuccess(response.data.message || "Video uploaded successfully!");
        // Optionally reset form fields
        setTitle("");
        setDescription("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        // Navigate after a short delay to allow user to see success message
        setTimeout(() => {
          router.push("/"); // Or to a "my videos" page
          router.refresh(); // If you want to ensure fresh data on the destination page
        }, 2000);

      } else {
        // This case might not be hit if axios throws for non-2xx statuses by default
        throw new Error(response.data.message || `Failed to upload video. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Video upload failed:", error);
      let message = "An unexpected error occurred during upload.";
      if (axios.isAxiosError(error)) {
        interface ErrorResponse {
          message?: string;
        }
        const axiosError = error as AxiosError<ErrorResponse>; // Define a specific type for the error response
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.message) {
          message = axiosError.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          Upload Your Video
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-xl">
          Share your moments by uploading a video with a title and description. Max {MAX_FILE_SIZE_MB}MB.
        </p>
      </div>

      {/* Upload Form Section */}
      <div className="w-full max-w-lg bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="videoTitle" className="block text-gray-300 text-sm font-medium mb-1.5">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              id="videoTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Awesome Vacation Highlights"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
              required
              disabled={isUploading}
            />
          </div>

          <div>
            <label htmlFor="videoDescription" className="block text-gray-300 text-sm font-medium mb-1.5">
              Description (Optional)
            </label>
            <textarea
              id="videoDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your video content..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm resize-none"
              disabled={isUploading}
            />
          </div>

          <div>
            <label htmlFor="videoFile" className="block text-gray-300 text-sm font-medium mb-1.5">
              Video File <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <input
                id="videoFile"
                type="file"
                accept="video/*" // Be more specific if possible, e.g., "video/mp4, video/webm"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                disabled={isUploading}
                />
                <FilmIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-300 hidden sm:block" />
            </div>
            {file && (
              <p className="mt-1.5 text-xs text-gray-400">
                Selected: {file.name} ({formatBytes(file.size)})
              </p>
            )}
          </div>

          {/* Error Message Display */}
          {uploadError && (
            <div className="p-3 bg-red-800/30 border border-red-700 text-red-300 rounded-md text-sm flex items-start gap-2">
              <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>{uploadError}</p>
            </div>
          )}

           {/* Success Message Display */}
          {uploadSuccess && !isUploading && (
            <div className="p-3 bg-green-800/30 border border-green-700 text-green-300 rounded-md text-sm">
              <p>{uploadSuccess}</p>
            </div>
          )}


          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-600 to-purple-700 transition-all duration-150 ease-in-out
              ${(isUploading || !file || !title.trim())
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-600"
            }`}
            disabled={isUploading || !file || !title.trim() || !!uploadError} // Also disable if there's a pre-submit error
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <UploadCloudIcon className="w-5 h-5 mr-2" />
                Upload Video
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;