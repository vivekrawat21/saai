"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useGemini } from "@/hooks/useGemini"; // Assuming this hook is correctly implemented
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Components } from "react-markdown";

// Define TypeScript interface for useGemini hook return values
interface UseGeminiHook {
  sendPrompt: (prompt: string) => void;
  response: string | null;
  loading: boolean;
  error: string | null;
}

const ContentGenerator: React.FC = () => {
  const [topic, setTopic] = useState<string>("");
  const [tone, setTone] = useState<string>("Neutral");
  const [wordCount, setWordCount] = useState<string>("300"); // Keep as string for input control
  
  const [generatedContent, setGeneratedContent] = useState<string>(""); // Stores the full response
  const [displayedText, setDisplayedText] = useState<string>(""); // For typing animation
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Component-level loading and error states, derived from the hook
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Type the useGemini hook using the interface
  const { 
    sendPrompt, 
    response: geminiResponse, 
    loading: geminiLoading, 
    error: geminiError 
  } = useGemini() as UseGeminiHook;

  const handleGenerate = useCallback(() => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setGeneratedContent(""); // Clear previous full content
    setDisplayedText("");   // Clear previously displayed text
    setIsTyping(false);     // Reset typing state
    setApiError(null);      // Clear previous errors

    const prompt = `Generate an article on the topic "${topic.trim()}" with a ${tone.toLowerCase()} tone and approximately ${wordCount} words. Use appropriate markdown formatting for headings, lists, and emphasis. Ensure the content is coherent and well-structured.`;
    sendPrompt(prompt);
  }, [topic, tone, wordCount, sendPrompt]);

  // Effect to handle response from Gemini hook
  useEffect(() => {
    if (!geminiLoading) {
      setIsLoading(false); // Update component loading state
      if (geminiError) {
        setApiError(geminiError);
        setGeneratedContent(""); // Clear content on error
      } else if (geminiResponse) {
        setGeneratedContent(geminiResponse);
        setApiError(null);
      } else if (geminiResponse === "") { // Handle explicitly empty successful response
        setGeneratedContent("");
        setApiError(null);
      }
    } else {
        setIsLoading(true); // Ensure loading is true if geminiLoading is true
    }
  }, [geminiResponse, geminiLoading, geminiError]);

  // Typing animation effect based on generatedContent
  useEffect(() => {
    if (generatedContent && generatedContent.length > 0) {
      let index = 0;
      setDisplayedText(""); // Start with empty displayed text for the new content
      setIsTyping(true);
      const interval = setInterval(() => {
        if (index < generatedContent.length) {
          setDisplayedText((prev) => prev + generatedContent.charAt(index));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 15); // Adjusted typing speed
      return () => clearInterval(interval);
    } else {
      // If generatedContent is empty (e.g., after reset or error), ensure typing is off
      setDisplayedText(generatedContent || "");
      setIsTyping(false);
    }
  }, [generatedContent]);

  // Copy to clipboard
  const handleCopy = () => {
    if (generatedContent) { // Copy the full, untyped content
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Type-safe ReactMarkdown components
  const markdownComponents: Components = {
    h1: ({ ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
    h2: ({ ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
    p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
    li: ({ ...props }) => <li className="mb-2" {...props} />,
    code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
        const match = /language-(\w+)/.exec(className || '');
        if (inline) {
          return (
            <code className="bg-gray-700 text-lime-300 px-1 py-0.5 mx-0.5 rounded text-sm" {...props}>
              {children}
            </code>
          );
        }
        return !match ? (
           <pre className="bg-gray-700 p-3 my-3 rounded-md overflow-x-auto text-sm custom-scrollbar">
            <code className={`${className || ''} whitespace-pre-wrap`} {...props}>
              {String(children).replace(/\n$/, '')}
            </code>
          </pre>
        ) : (
            <pre className="bg-gray-700 p-3 my-3 rounded-md overflow-x-auto text-sm custom-scrollbar" {...props}>
                <code className={`${className || ''} whitespace-pre-wrap`}>
                 {String(children).replace(/\n$/, '')}
                </code>
            </pre>
        );
      },
      pre: ({  ...props }) => (
        <pre className="bg-gray-700 p-3 my-3 rounded-md overflow-x-auto text-sm custom-scrollbar" {...props} />
      ),
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-teal-400 via-sky-400 to-lime-400 bg-clip-text text-transparent">
          AI Content Generator
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-lg">
          Provide a topic and preferences to generate custom content using AI.
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-xl">
        <div className="flex flex-col gap-5">
          {/* Topic Input */}
          <div>
            <label htmlFor="topicInput" className="block text-gray-300 text-sm font-medium mb-2">Topic:</label>
            <input
              id="topicInput"
              type="text"
              placeholder="e.g., The Future of Renewable Energy"
              value={topic}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
              className="block w-full p-3 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
            />
          </div>

          {/* Tone & Word Count */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="toneSelect" className="block text-gray-300 text-sm font-medium mb-2">Tone:</label>
              <select
                id="toneSelect"
                value={tone}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTone(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none text-sm custom-select-arrow"
              >
                {["Neutral", "Formal", "Casual", "Persuasive", "Inspirational", "Humorous", "Technical"].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="wordCountInput" className="block text-gray-300 text-sm font-medium mb-2">Approx. Words:</label>
              <input
                id="wordCountInput"
                type="number"
                min="50"
                max="2000"
                step="50"
                value={wordCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWordCount(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-teal-500 to-lime-500 transition-all duration-150 ease-in-out
              ${(isLoading || !topic.trim())
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-lime-500 hover:to-teal-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-lime-500"
            }`}
            disabled={isLoading || !topic.trim()}
          >
            {isLoading ? "AI Generating..." : "Generate Content"}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {(generatedContent || apiError || isLoading) && (
        <div className="mt-8 md:mt-10 w-full max-w-3xl bg-gray-800 p-5 md:p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-teal-400">
              {isLoading && !generatedContent && !apiError ? "Generating Content..." : "Generated Content:"}
            </h2>
            {!apiError && generatedContent && !isTyping && (
              <button
                onClick={handleCopy}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
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

      {/* Blinking cursor, custom select arrow, and custom scrollbar styles */}
      <style jsx global>{`
        .blinking-cursor {
          display: inline-block;
          animation: blink 1s steps(1) infinite;
          color: #5eead4; /* teal-300 */
          margin-left: 2px;
          font-weight: bold;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .custom-select-arrow {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem; /* Make space for the arrow */
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

export default ContentGenerator;