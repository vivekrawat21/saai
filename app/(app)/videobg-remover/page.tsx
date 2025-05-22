// @/components/VideoBackgroundRemover.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { removeVideoBackground, checkVideoStatus, UnscreenUploadResponse, UnscreenStatusResponse } from "@/app/actions/videoBackgroundRemover";
import { UploadCloudIcon, FilmIcon, AlertTriangleIcon, CheckCircleIcon, Loader2Icon } from "lucide-react";

const MAX_FILE_SIZE_MB = 8; // Conservative limit for free tier (e.g., short 360p clips)
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const EXPECTED_FREE_TIER_DURATION_S = 10; // Max ~10 seconds
const POLL_INTERVAL_MS = 5000;

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const VideoBackgroundRemover = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [showDurationWarning, setShowDurationWarning] = useState<boolean>(false);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setProcessingError(null);
    setResultUrl(null);
    setProcessingStatus(null);
    setVideoId(null);
    setShowDurationWarning(false);


    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setProcessingError(`File is too large (Max ${MAX_FILE_SIZE_MB}MB for this demo). Your file: ${formatBytes(selectedFile.size)}. Please use a smaller, shorter clip for the free tier.`);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!selectedFile.type.startsWith("video/") && selectedFile.type !== "image/gif") {
        setProcessingError("Invalid file type. Please select a video file or a GIF.");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Basic check for videos (GIFs are usually short)
      if (selectedFile.type.startsWith("video/")) {
        // Attempt to get duration (works in some modern browsers for SOME video types from File object)
        // This is not foolproof and often requires loading into a <video> element.
        // For now, just show a general warning if it's a video.
        setShowDurationWarning(true);
      }

    }
    setFile(selectedFile);
  };

  const clearPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearPolling();
  }, []);

  const startPollingStatus = (currentVideoId: string) => {
    clearPolling();
    setProcessingStatus("Polling Unscreen for status...");

    pollIntervalRef.current = setInterval(async () => {
      if (!currentVideoId) {
        clearPolling();
        return;
      }
      try {
        const statusRes: UnscreenStatusResponse = await checkVideoStatus(currentVideoId);
        if (statusRes.errorMessage) {
          setProcessingError(`Error checking status: ${statusRes.errorMessage}. This might be an API key or network issue.`);
          setIsProcessing(false);
          clearPolling();
          return;
        }

        setProcessingStatus(`Unscreen status: ${statusRes.status}${statusRes.progress ? ` (${statusRes.progress}%)` : ''}`);

        if (statusRes.status === 'done') {
          setResultUrl(statusRes.resultUrl || null);
          if (!statusRes.resultUrl) {
            setProcessingError("Processing marked done by Unscreen, but no result URL was provided. This can happen with free tier limits or unsupported content.");
          }
          setIsProcessing(false);
          clearPolling();
        } else if (statusRes.status === 'error') {
          setProcessingError(`Unscreen processing error: ${statusRes.error || "Unknown error from Unscreen."} This often happens if the video exceeds free tier limits (e.g., duration > 5-10s, unsupported format, or content issues).`);
          setIsProcessing(false);
          clearPolling();
        }
      } catch (err) {
        console.error("Polling error:", err);
        setProcessingError("A network or unexpected error occurred while checking video status.");
        setIsProcessing(false);
        clearPolling();
      }
    }, POLL_INTERVAL_MS);
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessingError(null);
    setResultUrl(null);
    setProcessingStatus(null);
    setVideoId(null);
    clearPolling();

    if (!file) {
      setProcessingError("Please select a video file or GIF.");
      return;
    }

    setIsUploading(true);
    setIsProcessing(true);
    setProcessingStatus("Uploading file to Unscreen...");

    const formData = new FormData();
    formData.append("video_file", file);

    try {
      const uploadRes: UnscreenUploadResponse = await removeVideoBackground(formData);
      setIsUploading(false);

      if (uploadRes.error) {
        setProcessingError(uploadRes.error); // Display error from server action
        setIsProcessing(false);
        return;
      }

      if (uploadRes.videoId) {
        setVideoId(uploadRes.videoId);
        setProcessingStatus("File submitted to Unscreen. Waiting for processing to start...");
        startPollingStatus(uploadRes.videoId);
      } else {
        setProcessingError("Failed to get a Video ID from Unscreen after upload. Please check console for details.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Background removal failed:", error);
      setProcessingError("An unexpected client-side error occurred during the upload process.");
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsUploading(false);
    setIsProcessing(false);
    setProcessingError(null);
    setResultUrl(null);
    setProcessingStatus(null);
    setVideoId(null);
    setShowDurationWarning(false);
    clearPolling();
  };


  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-600 bg-clip-text text-transparent">
          Video & GIF Background Remover
        </h1>
      </div>

      <div className="w-full max-w-lg bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="videoFile" className="block text-gray-300 text-sm font-medium mb-1.5">
              Video or GIF File <span className="text-red-500">*</span> (Max ~{MAX_FILE_SIZE_MB}MB, {EXPECTED_FREE_TIER_DURATION_S}s recommended)
            </label>
            <div className="relative">
                <input
                id="videoFile"
                type="file"
                accept="video/*,image/gif"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
                disabled={isUploading || isProcessing}
                />
                <FilmIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-300 hidden sm:block" />
            </div>
            {file && (
              <p className="mt-1.5 text-xs text-gray-400">
                Selected: {file.name} ({formatBytes(file.size)}) {file.type === "image/gif" && "(GIF)"}
              </p>
            )}
            {showDurationWarning && file && file.type.startsWith("video/") && (
                 <p className="mt-1 text-xs text-yellow-400">
                    <AlertTriangleIcon className="inline w-3 h-3 mr-1" />
                    Ensure video is very short (under {EXPECTED_FREE_TIER_DURATION_S}s) for best results with the free tier.
                </p>
            )}
          </div>

          {processingError && (
            <div className="p-3 bg-red-800/30 border border-red-700 text-red-300 rounded-md text-sm flex items-start gap-2">
              <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="break-words">{processingError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
                type="submit"
                className={`w-full sm:w-auto flex-grow py-3 px-6 rounded-lg text-white font-semibold bg-gradient-to-r from-cyan-600 to-sky-700 transition-all duration-150 ease-in-out
                ${(isUploading || isProcessing || !file)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:from-sky-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-600"
                }`}
                disabled={isUploading || isProcessing || !file || !!processingError}
            >
                {isUploading ? (
                <span className="flex items-center justify-center"><Loader2Icon className="animate-spin h-5 w-5 mr-2" /> Uploading...</span>
                ) : isProcessing ? (
                <span className="flex items-center justify-center"><Loader2Icon className="animate-spin h-5 w-5 mr-2" /> Processing (Unscreen)...</span>
                ) : (
                <span className="flex items-center justify-center"><UploadCloudIcon className="w-5 h-5 mr-2" /> Remove Background</span>
                )}
            </button>
             {(file || videoId || resultUrl || processingError) && (
                 <button
                    type="button"
                    onClick={handleClear}
                    className={`w-full sm:w-auto py-3 px-5 rounded-lg text-gray-300 font-semibold bg-gray-600 hover:bg-gray-500 transition-colors duration-150 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500
                        ${isUploading || isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isUploading || isProcessing}
                 >
                    Clear
                </button>
            )}
          </div>
        </form>

        {(processingStatus && !resultUrl && !processingError) && (
            <div className="mt-6 p-3 bg-gray-700/50 border border-gray-600 rounded-md text-sm text-gray-300">
                <p>{processingStatus}</p>
            </div>
        )}

        {resultUrl && (
            <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-xl font-semibold mb-3 text-cyan-400 flex items-center">
                    <CheckCircleIcon className="w-6 h-6 mr-2 text-green-400" />
                    Processing Complete!
                </h3>
                <p className="text-gray-300 mb-1">Unscreen free tier result (watermarked, 360p, short duration):</p>
                <a
                    href={resultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    Download Processed File
                </a>
                {(resultUrl.endsWith('.gif')) ? (
                    <img src={resultUrl} alt="Processed GIF from Unscreen" className="mt-4 rounded-lg w-full max-h-80 object-contain bg-gray-700 border border-gray-600" />
                ) : (
                    <video controls muted loop playsInline src={resultUrl} className="mt-4 rounded-lg w-full max-h-80 object-contain bg-gray-700 border border-gray-600">
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default VideoBackgroundRemover;