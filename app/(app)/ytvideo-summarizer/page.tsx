// @/components/VideoSummarizer.tsx
"use client";

import React, { useState, useRef, FormEvent, useEffect } from "react";
import { summarizeYoutubeVideo, YoutubeSummaryResponse } from "@/app/actions/youtubeSummarizerActions";
import { YoutubeIcon, SparklesIcon, AlertTriangleIcon, RotateCcwIcon } from "lucide-react";

// Helper function to strip Markdown (basic version)
function stripMarkdown(markdown: string): string {
  if (!markdown) return "";
  let output = markdown;
  output = output.replace(/^#{1,6}\s+(.*)/gm, '$1');
  output = output.replace(/(\*\*|__)(.*?)\1/g, '$2');
  output = output.replace(/(\*|_)(.*?)\1/g, '$2');
  output = output.replace(/~~(.*?)~~/g, '$1');
  output = output.replace(/`([^`]+)`/g, '$1');
  output = output.replace(/```[\s\S]*?```/g, '');
  output = output.replace(/!\[.*?\]\(.*?\)/g, '');
  output = output.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  output = output.replace(/^\s*([-*_]){3,}\s*$/gm, '');
  output = output.replace(/^>\s+/gm, '');
  output = output.replace(/^\s*[\*\-\+]\s+(.*)/gm, '$1');
  output = output.replace(/^\s*\d+\.\s+(.*)/gm, '$1');
  output = output.replace(/\n{2,}/g, '\n\n');
  output = output.split('\n\n').map(paragraph =>
    paragraph.split('\n').join(' ')
  ).join('\n\n');
  return output.trim();
}


const VideoSummarizer = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [summaryResult, setSummaryResult] = useState<YoutubeSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [rawSummaryText, setRawSummaryText] = useState<string>("");
  const [displayedSummary, setDisplayedSummary] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setSummaryResult({ error: "Please enter a YouTube video URL." });
      return;
    }

    setIsLoading(true);
    setSummaryResult(null);
    setRawSummaryText("");
    setDisplayedSummary("");

    try {
      const result = await summarizeYoutubeVideo(videoUrl);
      setSummaryResult(result);
      if (result.summary) {
        setRawSummaryText(stripMarkdown(result.summary));
      }
    } catch (error) {
      console.error("Error calling summarization action:", error);
      setSummaryResult({
        error: "An unexpected error occurred while trying to summarize the video.",
        originalUrl: videoUrl,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (rawSummaryText && !isLoading) {
      let index = 0;
      setDisplayedSummary("");
      // === FASTER TYPING INTERVAL ===
      const interval = setInterval(() => {
        if (index < rawSummaryText.length) {
          // Append more characters at once for speed, e.g., 2 or 3
          const nextChars = rawSummaryText.substring(index, Math.min(index + 2, rawSummaryText.length));
          setDisplayedSummary((prev) => prev + nextChars);
          index += nextChars.length;
        } else {
          clearInterval(interval);
        }
      }, 1); 
      return () => clearInterval(interval);
    } else if (!isLoading) {
        setDisplayedSummary("");
    }
  }, [rawSummaryText, isLoading]);

  const handleClear = () => {
    setVideoUrl("");
    setSummaryResult(null);
    setIsLoading(false);
    setRawSummaryText("");
    setDisplayedSummary("");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          YouTube Video Summarizer
        </h1>
      </div>

      {/* Summarizer Form Section */}
      <div className="w-full max-w-2xl bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="youtubeUrl" className="block text-gray-300 text-sm font-medium mb-1.5">
              YouTube Video URL <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <YoutubeIcon className="absolute left-3 h-5 w-5 text-pink-400 pointer-events-none" />
              <input
                id="youtubeUrl"
                type="url"
                ref={inputRef}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={`w-full sm:w-auto flex-grow py-3 px-6 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-600 to-purple-700 transition-all duration-150 ease-in-out
                ${isLoading || !videoUrl.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-600"
              }`}
              disabled={isLoading || !videoUrl.trim()}
            >
              {isLoading && !rawSummaryText && !summaryResult?.error ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Summarizing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Generate Summary
                </span>
              )}
            </button>
            {(videoUrl || summaryResult || rawSummaryText) && (
                 <button
                    type="button"
                    onClick={handleClear}
                    className={`w-full sm:w-auto py-3 px-5 rounded-lg text-gray-300 font-semibold bg-gray-600 hover:bg-gray-500 transition-colors duration-150 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isLoading}
                >
                    <span className="flex items-center justify-center">
                        <RotateCcwIcon className="w-5 h-5 mr-2" />
                        Clear
                    </span>
                </button>
            )}
          </div>
        </form>

        {(isLoading || summaryResult?.error || rawSummaryText) && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            {summaryResult?.error && !isLoading && (
              <div className="p-4 bg-red-800/30 border border-red-700 text-red-300 rounded-md text-sm flex items-start gap-3">
                <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="break-words w-full">
                    <p className="font-semibold">Error Summarizing Video</p>
                    <p>{summaryResult.error}</p>
                    {summaryResult.transcriptFetched === false && (
                        <p className="text-xs mt-1 text-red-400">
                            (Could not fetch video transcript)
                        </p>
                    )}
                    {summaryResult.originalUrl && <p className="text-xs mt-1 text-red-400">URL: {summaryResult.originalUrl}</p>}
                </div>
              </div>
            )}

            {isLoading && !rawSummaryText && !summaryResult?.error && (
                <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-md">
                    <h3 className="text-xl font-semibold mb-3 text-pink-400 animate-pulse">Summary:</h3>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-600 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-600 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-600 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-600 rounded w-3/4 animate-pulse"></div>
                    </div>
                </div>
            )}

            {(!isLoading || displayedSummary) && rawSummaryText && !summaryResult?.error && (
              <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-md">
                <h3 className="text-xl font-semibold mb-3 text-pink-400">Summary:</h3>
                <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed summary-text-animation">
                  {/* === FASTER CHARACTER RENDERING (CSS ONLY) === */}
                  {displayedSummary.split('').map((char, index) => (
                    <span
                      key={index}
                      className="char-animate-fast" // Use new class for faster animation
                      style={{ animationDelay: `${index * 0.005}s` }} // Much smaller delay
                    >
                      {char === '\n' ? <br/> : char}
                    </span>
                  ))}
                </div>
                {summaryResult?.originalUrl && displayedSummary.length === rawSummaryText.length && rawSummaryText.length > 0 && (
                  <p className="text-xs mt-4 text-gray-500">
                    Original URL:{" "}
                    <a href={summaryResult.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 underline">
                      {summaryResult.originalUrl}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        /* === MODIFIED ANIMATION: No blur, faster, simple fade-in and slight scale/translate === */
        .summary-text-animation .char-animate-fast { /* Renamed class */
          display: inline-block;
          opacity: 0;
          /* filter: blur(5px); REMOVED BLUR */
          transform: translateY(5px) scale(0.95); /* Slightly less movement */
          animation: fadeInSimpleChar 0.2s forwards; /* Faster animation duration */
        }

        @keyframes fadeInSimpleChar {
          to {
            opacity: 1;
            /* filter: blur(0); REMOVED BLUR */
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default VideoSummarizer;