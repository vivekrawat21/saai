"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Components } from "react-markdown";

const ArticleSummarizer: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const [fullSummary, setFullSummary] = useState<string | null>(null); // Stores the complete summary
  const [displayedText, setDisplayedText] = useState<string>(""); // For typing animation
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Markdown components configuration
  const markdownComponents: Components = {
    h1: ({ ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
    h2: ({ ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
    p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
    li: ({ ...props }) => <li className="mb-2" {...props} />,
    // Basic handling for code if API returns it (unlikely for summary, but good for consistency)
    code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
        if (inline) {
          return (
            <code
              className="bg-gray-700 text-lime-300 px-1 py-0.5 mx-0.5 rounded text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          );
        }
        return (
            <pre className="bg-gray-700 p-3 my-3 rounded-md overflow-x-auto text-sm font-mono custom-scrollbar">
                <code className={`${className || ''} whitespace-pre-wrap`} {...props}>
                    {String(children).replace(/\n$/, '')}
                </code>
            </pre>
        );
      },
    pre: ({ ...props }) => (
      <pre className="bg-gray-700 p-3 my-3 rounded-md overflow-x-auto text-sm font-mono custom-scrollbar" {...props} />
    ),
  };

  const validateUrl = (inputUrl: string): boolean => {
    try {
      new URL(inputUrl);
      return true;
    } catch {
      return false;
    }
  };

  const summarizeArticle = useCallback(async () => {
    if (!url.trim()) {
      setApiError("Please enter a URL.");
      return;
    }
    if (!validateUrl(url)) {
        setApiError("Please enter a valid URL (e.g., http://example.com).");
        return;
    }
    if (!process.env.NEXT_PUBLIC_RAPIDAPI_KEY || !process.env.NEXT_PUBLIC_RAPIDAPI_HOST) {
      setApiError("API configuration is missing. Please contact support.");
      console.error("RapidAPI Key or Host is not configured in .env.local");
      return;
    }

    setIsLoading(true);
    setFullSummary(null);
    setDisplayedText("");
    setIsTyping(false);
    setApiError(null);

    try {
      const res = await fetch(
        `https://article-extractor-and-summarizer.p.rapidapi.com/summarize?url=${encodeURIComponent(url)}&lang=en&engine=2`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
            "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPIDAPI_HOST,
          },
        }
      );

      if (!res.ok) {
        let errorMessage = `API Error: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || `${errorMessage} - ${res.statusText}`;
        } catch {
           errorMessage = `${errorMessage} - ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data?.summary) {
        setFullSummary(data.summary.trim());
      } else {
        setApiError(data?.message || "No summary available for the given URL or invalid response.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err instanceof Error) {
          setApiError(err.message || "An error occurred while summarizing. Please try again.");
        } else {
          setApiError("An unexpected error occurred. Please try again.");
        }
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  // Typing animation effect
  useEffect(() => {
    if (fullSummary && fullSummary.length > 0) {
      let index = 0;
      setDisplayedText(""); 
      setIsTyping(true);
      const interval = setInterval(() => {
        if (index < fullSummary.length) {
          setDisplayedText((prev) => prev + fullSummary.charAt(index));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 15); // Typing speed
      return () => clearInterval(interval);
    } else {
        setDisplayedText(fullSummary || ""); // Ensure displayedText is empty if fullSummary is null
        setIsTyping(false);
    }
  }, [fullSummary]);

  // Copy to clipboard functionality
  const handleCopy = () => {
    if (fullSummary) { // Copy the full, untyped summary
      navigator.clipboard.writeText(fullSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header Section */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Article Summarizer
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-md">
          Paste an article URL below to get a concise summary.
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-xl">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="urlInput" className="block text-gray-300 text-sm font-medium mb-2">
              Enter Article URL:
            </label>
            <input
              id="urlInput"
              type="url"
              placeholder="https://example.com/news/my-interesting-article"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (apiError) setApiError(null); // Clear error on input change
              }}
              className={`block w-full p-3.5 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 border ${apiError && !url.trim() ? 'border-red-500' : 'border-gray-700'} focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm`}
            />
          </div>

          <button
            type="button"
            onClick={summarizeArticle}
            className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-150 ease-in-out
              ${(isLoading || !url.trim())
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-red-500 hover:to-pink-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
            }`}
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? "AI Summarizing..." : "Summarize Article"}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {(fullSummary || apiError || isLoading) && (
        <div className="mt-8 md:mt-10 w-full max-w-3xl bg-gray-800 p-5 md:p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-pink-400">
              {isLoading && !fullSummary && !apiError ? "Generating Summary..." : "Summary:"}
            </h2>
            {!apiError && fullSummary && !isTyping && (
              <button
                onClick={handleCopy}
                className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-gray-200">
            {apiError ? (
              <pre className="text-red-400 whitespace-pre-wrap break-words p-3 bg-red-900/30 rounded-md">{apiError}</pre>
            ) : isLoading && !displayedText && !apiError ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {displayedText}
              </ReactMarkdown>
            )}
            {isTyping && <span className="blinking-cursor">▎</span>}
          </div>
        </div>
      )}
      
      {/* Environment Variable Note (Optional - for development guidance) */}
      {/* 
      {!process.env.NEXT_PUBLIC_RAPIDAPI_KEY && !process.env.NEXT_PUBLIC_RAPIDAPI_HOST && (
        <div className="mt-6 p-3 bg-yellow-800 text-yellow-100 rounded-md text-sm text-center max-w-xl">
          <strong>Note:</strong> API functionality is limited. Ensure <code>NEXT_PUBLIC_RAPIDAPI_KEY</code> and <code>NEXT_PUBLIC_RAPIDAPI_HOST</code> are set in your <code>.env.local</code> file.
        </div>
      )}
      */}


      {/* Blinking cursor and custom scrollbar styles */}
      <style jsx global>{`
        .blinking-cursor {
          display: inline-block;
          animation: blink 1s steps(1) infinite;
          color: #f472b6; /* pink-400 */
          margin-left: 2px;
          font-weight: bold;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        /* Custom scrollbar for WebKit browsers (Chrome, Safari, Edge) */
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px; /* Height of horizontal scrollbar */
          width: 8px;  /* Width of vertical scrollbar */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151; /* gray-700 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563; /* gray-600 */
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280; /* gray-500 */
        }
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #374151;
        }
      `}</style>
    </div>
  );
};

export default ArticleSummarizer;