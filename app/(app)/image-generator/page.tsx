"use client";

import React, { useState, useCallback, ChangeEvent } from "react";
// Ensure the path to your actions file is correct
// Import the options type along with the function and response type
import { generateImageFromPrompt, ImageGenerationResponse, GenerateImageOptions } from "@/app/actions/imageActions";

const AVAILABLE_ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "Specify Custom"];
const AVAILABLE_STYLE_PRESETS = [
  "None", "Photographic", "Digital Art", "Cinematic", "Anime",
  "Fantasy Art", "Neon Punk", "Isometric", "Low Poly", "Comic Book", "Pixel Art", "Impressionist Painting", "Watercolor"
];
const OUTPUT_FORMATS = ["png", "jpeg", "webp"] as const;
type OutputFormat = typeof OUTPUT_FORMATS[number];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>(AVAILABLE_ASPECT_RATIOS[0]);
  const [customAspectRatio, setCustomAspectRatio] = useState<string>("");
  const [stylePreset, setStylePreset] = useState<string>(AVAILABLE_STYLE_PRESETS[0]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResponse | null>(null);

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setApiError("Please enter a prompt for the image.");
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setGeneratedImage(null);

    // Determine the aspect ratio to use
    const currentAspectRatio = aspectRatio === "Specify Custom" ? customAspectRatio.trim() : aspectRatio;
    if (aspectRatio === "Specify Custom" && !/^\d+:\d+$/.test(currentAspectRatio)) {
        setApiError("Custom aspect ratio must be in format like '16:9' or '1:1'.");
        setIsLoading(false);
        return;
    }


    // Construct the options object with explicit typing
    const imageOptions: GenerateImageOptions = {
      aspect_ratio: currentAspectRatio,
      style_preset: stylePreset === "None" ? undefined : stylePreset.toLowerCase().replace(/\s+/g, '-'),
      output_format: outputFormat,
      // modelName: "gemini-1.5-pro-latest" // Example: if you want to specify a model
    };

    try {
      console.log("[Client] Sending image generation request with options:", imageOptions);
      const result = await generateImageFromPrompt(prompt.trim(), imageOptions);

      console.log("[Client] Received response from server action:", result);

      if (result.error) {
        setApiError(result.error);
      } else if (result.imageData) {
        setGeneratedImage(result);
      } else {
        setApiError("Received an unexpected response from the server (no image data or error).");
      }
    } catch (error: unknown) {
      console.error("[Client] Failed to call generateImageFromPrompt action:", error);
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError("An unexpected client-side error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, customAspectRatio, stylePreset, outputFormat]);

  const handleDownloadImage = () => {
    if (generatedImage?.imageData && generatedImage?.mimeType) {
      const link = document.createElement('a');
      link.href = `data:${generatedImage.mimeType};base64,${generatedImage.imageData}`;
      const fileExtension = generatedImage.mimeType.split('/')[1] || outputFormat;
      link.download = `ai_image_${prompt.substring(0,20).replace(/\s/g, '_') || Date.now()}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          AI Image Generator
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-lg">
          Describe the image you want to create. Choose your style and aspect ratio.
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-xl">
        <div className="flex flex-col gap-5">
          {/* Prompt Input */}
          <div>
            <label htmlFor="promptInput" className="block text-gray-300 text-sm font-medium mb-2">Image Description (Prompt):</label>
            <textarea
              id="promptInput"
              placeholder="e.g., A majestic dragon soaring through a nebula, digital painting"
              value={prompt}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              rows={4}
              className="block w-full p-3 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm custom-scrollbar"
            />
          </div>

          {/* Aspect Ratio & Style Preset */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="aspectRatioSelect" className="block text-gray-300 text-sm font-medium mb-2">Aspect Ratio:</label>
              <select
                id="aspectRatioSelect"
                value={aspectRatio}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setAspectRatio(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none text-sm custom-select-arrow"
              >
                {AVAILABLE_ASPECT_RATIOS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {aspectRatio === "Specify Custom" && (
                 <input
                    type="text"
                    placeholder="e.g., 3:4"
                    value={customAspectRatio}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomAspectRatio(e.target.value)}
                    className="mt-2 block w-full p-3 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                  />
              )}
            </div>

            <div className="flex-1">
              <label htmlFor="stylePresetSelect" className="block text-gray-300 text-sm font-medium mb-2">Style Preset:</label>
              <select
                id="stylePresetSelect"
                value={stylePreset}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStylePreset(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none text-sm custom-select-arrow"
              >
                {AVAILABLE_STYLE_PRESETS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="outputFormatSelect" className="block text-gray-300 text-sm font-medium mb-2">Output Format:</label>
            <select
              id="outputFormatSelect"
              value={outputFormat}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setOutputFormat(e.target.value as OutputFormat)}
              className="w-full p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none text-sm custom-select-arrow"
            >
              {OUTPUT_FORMATS.map((format) => (
                <option key={format} value={format}>{format.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerateImage}
            className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-150 ease-in-out
              ${(isLoading || !prompt.trim())
                ? "opacity-50 cursor-not-allowed"
                : "hover:from-pink-600 hover:to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500"
            }`}
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? "AI Generating Image..." : "Generate Image"}
          </button>
        </div>
      </div>

      {/* Output Section */}
      {(generatedImage || apiError || isLoading) && (
        <div className="mt-8 md:mt-10 w-full max-w-3xl bg-gray-800 p-5 md:p-6 rounded-lg shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-purple-400">
              {isLoading && !generatedImage && !apiError ? "Generating..." : "Generated Image:"}
            </h2>
            {generatedImage?.imageData && !isLoading && (
              <button
                onClick={handleDownloadImage}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
              >
                Download
              </button>
            )}
          </div>
          <div className="max-w-none text-gray-200">
            {apiError ? (
              <pre className="text-red-400 whitespace-pre-wrap break-words p-3 bg-red-900/30 rounded-md">{apiError}</pre>
            ) : isLoading && !generatedImage ? (
              <div className="flex justify-center items-center h-64 bg-gray-700 rounded-md animate-pulse">
                <svg className="w-12 h-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            ) : generatedImage?.imageData ? (
              <>
                <img
                  src={`data:${generatedImage.mimeType || `image/${outputFormat}`};base64,${generatedImage.imageData}`}
                  alt={prompt.substring(0, 100).trim() || "AI generated image"}
                  className="w-full h-auto rounded-md object-contain"
                  style={{ maxHeight: '70vh' }}
                />
              </>
            ) : null}
          </div>
        </div>
      )}
      {/* Ensure global styles for custom-scrollbar and custom-select-arrow are available */}
      <style jsx global>{`
        .custom-select-arrow {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem; /* Make space for the arrow */
        }
        /* Custom scrollbar for WebKit browsers */
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px; width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151; border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563; border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
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

export default ImageGenerator;