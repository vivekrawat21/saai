"use client";

import React, { useState, useEffect } from "react";

export default function ArticleSummarizer() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState(""); // For typing effect
  const [loading, setLoading] = useState(false);

  const summarizeArticle = async () => {
    if (!url) return;

    setLoading(true);
    setSummary(null);
    setDisplayedText("");

    try {
      const res = await fetch(
        `https://article-extractor-and-summarizer.p.rapidapi.com/summarize?url=${encodeURIComponent(
          url
        )}&lang=en&engine=2`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
            "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPIDAPI_HOST,
          },
        }
      );

      const data = await res.json();

      if (data?.summary) {
        setSummary(data.summary);
      } else {
        setSummary("No summary available for the given URL.");
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummary("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Typing effect logic
  useEffect(() => {
    if (summary) {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + summary[index]);
        index++;
        if (index >= summary.length) clearInterval(interval);
      }, 10); // Adjust typing speed here
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [summary]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4">
      {/* Header */}
      <div className="text-center mt-10">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">Article Summarizer</h1>
        <p className="text-gray-400 text-lg">
          Paste a URL below to extract and summarize its content.
        </p>
      </div>

      {/* Input Section */}
      <div className="mt-8 w-full max-w-lg">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Enter Article URL:</label>
            <input
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="block w-full p-3 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={summarizeArticle}
            className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-teal-500 to-lime-500 hover:from-lime-500 hover:to-teal-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Summarizing..." : "Summarize Article"}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {summary && (
        <div className="mt-10 w-full max-w-3xl bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-teal-400">Summary:</h2>
          <p className="text-gray-300 whitespace-pre-wrap">
            {displayedText}
            <span className="blinking-cursor">|</span>
          </p>
        </div>
      )}

    </div>
  );
}
