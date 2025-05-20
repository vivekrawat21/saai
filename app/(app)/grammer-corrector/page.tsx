"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useGemini } from "@/hooks/useGemini"; // Assuming this hook is correctly implemented
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Components } from "react-markdown";

// Define TypeScript interface for useGemini hook return values (if not already globally defined)
interface UseGeminiHook {
  sendPrompt: (prompt: string) => void;
  response: string | null;
  loading: boolean;
  error: string | null;
}

const GrammarCorrector: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [correctedTextActual, setCorrectedTextActual] = useState<string>(""); // Stores the full API response
  const [displayedText, setDisplayedText] = useState<string>(""); // For typing animation
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Component-level loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { 
    sendPrompt, 
    response: geminiResponse, 
    loading: geminiLoading, 
    error: geminiError 
  } = useGemini() as UseGeminiHook;

  // Markdown components configuration
  const markdownComponents: Components = {
    h1: ({ ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
    h2: ({ ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
    p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />, // Standard paragraph
    ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
    ol: ({  ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
    li: ({  ...props }) => <li className="mb-2" {...props} />,
    // Basic handling for code if AI returns it (less likely for grammar)
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

  const handleCorrectGrammar = useCallback(() => {
    if (!text.trim()) return;

    setIsLoading(true);
    setCorrectedTextActual("");
    setDisplayedText("");
    setIsTyping(false);
    setApiError(null);

    const prompt = `Correct the grammar and improve the following text while maintaining its original meaning. 
Return only the corrected text, preferably in plain text or simple markdown (like bold for emphasis if appropriate), without any additional explanations, introductions, or sign-offs like "Here's the corrected text:".
Original text:\n\n"${text.trim()}"`;

    sendPrompt(prompt);
  }, [text, sendPrompt]);

  // Handle Gemini response
  useEffect(() => {
    if (!geminiLoading) {
      setIsLoading(false);
      if (geminiError) {
        setApiError(geminiError);
        setCorrectedTextActual(""); 
      } else if (geminiResponse) {
        // Attempt to clean up potential AI preamble if the prompt wasn't strictly followed
        // This is a basic example; more sophisticated cleanup might be needed
        let cleanedResponse = geminiResponse.trim();
        const preambles = [
            "Here's the corrected text:",
            "Corrected text:",
            "Here is the corrected version:",
            "The corrected text is as follows:",
        ];
        for (const preamble of preambles) {
            if (cleanedResponse.toLowerCase().startsWith(preamble.toLowerCase())) {
                cleanedResponse = cleanedResponse.substring(preamble.length).trim();
                break;
            }
        }
        setCorrectedTextActual(cleanedResponse);
        setApiError(null);
      } else if (geminiResponse === "") {
        setCorrectedTextActual("");
        setApiError(null);
      }
    } else {
        setIsLoading(true);
    }
  }, [geminiResponse, geminiLoading, geminiError]);

  // Typing animation effect
  useEffect(() => {
    if (correctedTextActual && correctedTextActual.length > 0) {
      let index = -1;
      setDisplayedText(""); 
      setIsTyping(true);
      const interval = setInterval(() => {
        if (index < correctedTextActual.length) {
          setDisplayedText((prev) => prev + correctedTextActual.charAt(index));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20); // Slightly slower typing for readability
      return () => clearInterval(interval);
    } else {
      setDisplayedText(correctedTextActual || "");
      setIsTyping(false);
    }
  }, [correctedTextActual]);

  // Copy to clipboard functionality
  const handleCopy = () => {
    if (correctedTextActual) { // Copy the full corrected text
      navigator.clipboard.writeText(correctedTextActual);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header Section */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
          AI Grammar Corrector
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-md">
          Enter text below to check and improve your grammar using AI.
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-xl">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="textInput" className="block text-gray-300 text-sm font-medium mb-2">
              Enter Your Text:
            </label>
            <textarea
              id="textInput"
              placeholder="Paste your text here... For example: 'Me and him goes to the store yestaday.'"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="block w-full h-40 md:h-48 p-3.5 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none custom-scrollbar text-sm"
              spellCheck="false"
            />
          </div>

          <button
            type="button"
            onClick={handleCorrectGrammar}
            className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-teal-500 to-lime-500 transition-all duration-150 ease-in-out
              ${(isLoading || !text.trim())
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-lime-500 hover:to-teal-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-lime-500"
            }`}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? "AI Correcting..." : "Correct Grammar"}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {(correctedTextActual || apiError || isLoading) && (
        <div className="mt-8 md:mt-10 w-full max-w-3xl bg-gray-800 p-5 md:p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-teal-400">
              {isLoading && !correctedTextActual && !apiError ? "Correcting Text..." : "Corrected Text:"}
            </h2>
            {!apiError && correctedTextActual && !isTyping && (
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
              </div>
            ) : (
              // For grammar correction, often we don't need complex markdown,
              // but ReactMarkdown handles plain text fine. If the AI returns markdown, it will be rendered.
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents} // Use defined components
              >
                {displayedText}
              </ReactMarkdown>
            )}
            {isTyping && <span className="blinking-cursor">▎</span>}
          </div>
        </div>
      )}

      {/* Blinking cursor and custom scrollbar styles */}
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

export default GrammarCorrector;