"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios"; // Import AxiosError for better error typing
import VideoCard from "@/components/VideoCard"; // Assuming this component is well-defined
import { Video } from "@/types"; // Assuming this type is correctly defined
import { Blocks } from "react-loader-spinner";
import { VideoIcon, RefreshCwIcon,CircleAlert } from "lucide-react"; // Added RefreshCwIcon

const Home = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Renamed for clarity
  const [apiError, setApiError] = useState<string | null>(null); // Renamed for clarity

  const fetchVideos = useCallback(async () => {
    setIsLoading(true); // Set loading true at the start of fetch
    setApiError(null);  // Clear previous errors
    try {
      const response = await axios.get("/api/videos"); // Ensure this API endpoint is correct
      if (Array.isArray(response.data)) {
        setVideos(response.data);
      } else if (response.data && Array.isArray(response.data.videos)) { // Common practice to nest array
        setVideos(response.data.videos);
      }
      else {
        console.warn("Unexpected response format from /api/videos:", response.data);
        throw new Error("Videos data is not in the expected array format.");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      let message = "Failed to fetch videos. Please try again later.";
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.message) {
          message = axiosError.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDownload = useCallback((url: string, title: string) => {
    // Basic validation
    if (!url || !title) {
      console.error("Download failed: URL or title is missing.");
      // Optionally, show a user-facing error message here
      return;
    }
    try {
      const link = document.createElement("a");
      link.href = url;
      
      // Sanitize title for filename and ensure it ends with .mp4
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s-_]/g, "").trim() || "video";
      link.setAttribute("download", `${sanitizedTitle}.mp4`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error during download initiation:", e);
      // Optionally, show a user-facing error
    }
  }, []);


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <Blocks
          height="100" // Slightly larger
          width="100"
          color="#2DD4BF" // teal-400
          ariaLabel="blocks-loading"
          visible={true}
        />
        <p className="mt-6 text-teal-300 text-xl font-semibold animate-pulse">
          Loading Your Videos...
        </p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md">
          <CircleAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-red-400 mb-3">Oops! Something Went Wrong</h2>
          <p className="text-gray-400 mb-6">{apiError}</p>
          <button
            onClick={fetchVideos} // Allow user to retry
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center mx-auto"
          >
            <RefreshCwIcon className="w-5 h-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <header className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 bg-clip-text text-transparent">
              Your Video Library
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-400 sm:mt-4">
            Browse, watch, and manage your recently uploaded videos.
          </p>
        </header>

        {videos.length === 0 ? (
          <div className="text-center py-16 md:py-24 bg-gray-800 rounded-xl shadow-lg">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-700 rounded-full mb-6 ring-4 ring-gray-600">
              <VideoIcon className="w-12 h-12 text-teal-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">No Videos Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              It looks like your library is empty. Upload some videos to see them appear here!
            </p>
            {/* Optional: Add an upload button or link here */}
            {/* <button className="mt-6 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg">
                Upload Video
            </button> */}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8 md:gap-x-8 md:gap-y-10">
            {videos.map((video) => (
              <VideoCard
                key={video.id || video.url} // Use URL as fallback key if id isn't always present
                video={video}
                onDownload={handleDownload}
                className="transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/30 rounded-lg overflow-hidden bg-gray-800"
                // Removed fixed minHeight, let content dictate or VideoCard handle its own responsive height
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;