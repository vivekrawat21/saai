"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useGemini } from "@/hooks/useGemini"; // Assuming this hook is correctly implemented
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Components } from "react-markdown";

const CodeExplainer: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [displayedText, setDisplayedText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { sendPrompt, response, loading: geminiLoading, error: geminiError } = useGemini();

  // Markdown components configuration
  const markdownComponents: Components = {
    h1: ({ ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
    h2: ({ ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
    p: ({ ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
    ul: ({  ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
    // Custom component for <pre> tags to handle code blocks styling and overflow
    pre: ({ children, ...props }) => (
      <pre
        className="bg-gray-700 p-4 my-3 rounded-md overflow-x-auto text-sm font-mono custom-scrollbar"
        {...props}
      >
        {children}
      </pre>
    ),
    // Custom component for <code> tags
    code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
      if (inline) {
        return (
          <code
            className="bg-gray-600 text-lime-300 px-1.5 py-0.5 mx-0.5 rounded-md text-xs font-mono"
            {...props}
          >
            {children}
          </code>
        );
      }
      // For code within a <pre> block (styled by the `pre` component above)
      // We ensure `whitespace-pre` to respect formatting, and remove trailing newlines from children
      return (
        <code className={`${className || ''} whitespace-pre font-mono`} {...props}>
          {String(children).replace(/\n$/, '')}
        </code>
      );
    },
    li: ({ ...props }) => <li className="mb-2" {...props} />,
  };

  const handleExplain = useCallback(() => {
    if (!code.trim()) return;

    setLoading(true);
    setExplanation(""); // Clear previous full explanation
    setDisplayedText(""); // Clear previously displayed text
    setTyping(false); // Reset typing state
    setError(null);

    // More concise prompt, asking for brief explanation
    const prompt = `Concisely explain the following code. Use markdown for key points, lists, and code snippets if necessary. Focus on the core logic and purpose:\n\n\`\`\`\n${code}\n\`\`\``;
    sendPrompt(prompt);
  }, [code, sendPrompt]);

  // Typing animation
  useEffect(() => {
    if (explanation && explanation.length > 0) { // Trigger animation if there's a full explanation
      let i = -1;
      setDisplayedText(""); // Start with empty displayed text
      setTyping(true);
      const typingInterval = setInterval(() => {
        if (i < explanation.length) {
          setDisplayedText(prev => prev + explanation.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setTyping(false);
        }
      }, 15); // Adjusted typing speed (milliseconds)
      return () => clearInterval(typingInterval); // Cleanup on unmount or if explanation changes
    } else {
      // If explanation is empty (e.g. after reset or error), ensure typing is off
      setDisplayedText(explanation || ""); // Show empty string if explanation is null/undefined
      setTyping(false);
    }
  }, [explanation]); // Depend only on the full explanation content

  // Handle Gemini response
  useEffect(() => {
    if (!geminiLoading) {
      if (geminiError) {
        setError(geminiError);
        setExplanation(""); // Clear explanation on error
        setLoading(false);
      } else if (response) {
        setExplanation(response); // Set the full explanation, triggering the typing effect
        setLoading(false);
      } else if (response === "") { // Handle explicitly empty successful response
        setExplanation("");
        setLoading(false);
      }
    }
  }, [response, geminiLoading, geminiError]);

  // Copy to clipboard
  const handleCopy = () => {
    if (explanation) { // Copy the full explanation
      navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">
          Code Explainer AI
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-md">
          Paste your code snippet to get a concise, AI-powered explanation.
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-xl">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="codeInput" className="block text-gray-300 text-sm font-medium mb-2">
              Your Code:
            </label>
            <textarea
              id="codeInput"
              placeholder="Enter or paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-52 md:h-60 p-3.5 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-mono text-sm resize-none custom-scrollbar"
              spellCheck="false"
            />
          </div>

          <button
            onClick={handleExplain}
            className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-teal-500 to-lime-500 transition-all duration-150 ease-in-out
              ${(loading || !code.trim())
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-lime-500 hover:to-teal-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-lime-500"
            }`}
            disabled={loading || !code.trim()}
          >
            {loading ? "AI Thinking..." : "Explain Code"}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {(explanation || error || loading) && ( // Show output section if there's content, error, or loading explanation
        <div className="mt-8 md:mt-10 w-full max-w-3xl bg-gray-800 p-5 md:p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-teal-400">
              {loading && !explanation && !error ? "Generating Explanation..." : "Explanation:"}
            </h2>
            {!error && explanation && !typing && ( // Show copy button only when explanation is fully displayed
              <button
                onClick={handleCopy}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-gray-200">
            {error ? (
              <pre className="text-red-400 whitespace-pre-wrap break-words p-3 bg-red-900/30 rounded-md">{error}</pre>
            ) : loading && !displayedText && !error ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {displayedText}
              </ReactMarkdown>
            )}
            {typing && <span className="blinking-cursor">▎</span>}
          </div>
        </div>
      )}

      {/* Blinking cursor and custom scrollbar styles */}
      <style jsx global>{`
        .blinking-cursor {
          display: inline-block;
          animation: blink 1s steps(1) infinite;
          color: #5eead4; // teal-300
          margin-left: 2px;
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

export default CodeExplainer;