// @/components/YoutubeDownloader.tsx
"use client";

import React, { useState, useRef, FormEvent } from "react";
import { getVideoInfo, type YoutubeVideoInfoResponse, type VideoFormatInfo } from "@/app/actions/ytVideoDownloaderAction";
import {
  YoutubeIcon, DownloadCloudIcon, AlertTriangleIcon, RotateCcwIcon, Loader2Icon, InfoIcon,
  VideoIcon, VideoOffIcon, Volume2Icon, VolumeXIcon, FilmIcon // Added FilmIcon for generic media
} from "lucide-react";

const YoutubeDownloader = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<YoutubeVideoInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setVideoInfo({ error: "Please enter a YouTube video URL." });
      return;
    }
    setIsLoading(true);
    setVideoInfo(null);
    try {
      const result = await getVideoInfo(videoUrl);
      setVideoInfo(result);
    } catch (error: unknown) {
      console.error("Error calling getVideoInfo action from component:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to communicate with server.';
      setVideoInfo({
        error: `An unexpected error occurred: ${errorMessage}`,
        originalUrl: videoUrl,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setVideoUrl("");
    setVideoInfo(null);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const formatContentLength = (contentLengthStr?: string): string => {
    if (!contentLengthStr || contentLengthStr === "0") return "N/A";
    try {
      const bytes = parseInt(contentLengthStr, 10);
      if (isNaN(bytes) || bytes === 0) return "N/A";
      if (bytes < 1024) return `${bytes} B`;
      const kb = bytes / 1024;
      if (kb < 1024) return `${kb.toFixed(1)} KB`;
      const mb = kb / 1024;
      if (mb < 1024) return `${mb.toFixed(1)} MB`;
      const gb = mb / 1024;
      return `${gb.toFixed(1)} GB`;
    } catch (e) {
      console.error("Error formatting content length:", e);
      return "N/A";
    }
  };

  const handleDownloadClick = (format: VideoFormatInfo, title: string) => {
    console.log("Attempting to download format:", format);
    console.log("Original URL for download:", format.url);

    // Check for manifest protocols (M3U8, MPD) - server action should ideally filter these
    if (format.protocol && ['m3u8', 'm3u8_native', 'mpd', 'rtmp', 'rtsp', 'f4m'].includes(format.protocol.toLowerCase())) {
      alert(`This format (${format.qualityLabel || 'Unknown'}) is a streaming manifest or protocol (${format.protocol.toUpperCase()}). Direct download as a single file is not supported by clicking this button. Please choose a format like MP4, WebM, M4A, etc.`);
      return;
    }
    // Fallback check if protocol isn't explicitly set but URL looks like a manifest
    if (format.url.toLowerCase().includes('.m3u8') || format.url.toLowerCase().includes('.mpd')) {
        alert(`This format link (${format.qualityLabel || 'Unknown'}) appears to be a streaming manifest. Direct download as a single file is not supported. Please choose a different format type.`);
        return;
    }

    const link = document.createElement('a');
    link.href = format.url;

    const safeTitle = (title || "youtube_video")
      .replace(/[<>:"/\\|?*.]+/g, '_')
      .replace(/\s+/g, '_')
      .replace(/__+/g, '_') // Consolidate multiple underscores
      .substring(0, 60);

    let qualitySuffix = 'media';
    if (format.qualityLabel && format.qualityLabel !== 'Unknown') {
      qualitySuffix = format.qualityLabel
        .replace(/[<>:"/\\|?* .]+/g, '_')
        .replace(/_+/g, '_');
    } else if (format.resolution && format.hasVideo) {
        qualitySuffix = format.resolution.replace('x','p');
        if(format.fps) qualitySuffix += `_${Math.round(format.fps)}fps`;
    } else if (format.abr && format.hasAudio && !format.hasVideo) {
        qualitySuffix = `${Math.round(format.abr)}kbps_audio`;
    } else if (format.format_id) {
      qualitySuffix = format.format_id.replace(/[<>:"/\\|?* .]+/g, '_');
    }

    let desiredExtension = 'dat'; // Default for truly unknown
    if (format.hasAudio && !format.hasVideo) {
        desiredExtension = 'mp3'; // Suggest MP3 for audio-only
    } else if (format.hasVideo) {
        // Prioritize common video containers from yt-dlp's `ext`
        if (format.container && ['mp4', 'webm', 'mkv', 'flv'].includes(format.container.toLowerCase())) {
            desiredExtension = format.container.toLowerCase();
        } else {
            desiredExtension = 'mp4'; // Default to MP4 for video if container is unusual
        }
    } else if (format.hasAudio) { // Should be caught by the first audio-only case, but as a fallback
        desiredExtension = (format.container && format.container.toLowerCase() === 'm4a') ? 'm4a' : 'mp3';
    }

    link.download = `${safeTitle}_${qualitySuffix}.${desiredExtension}`;
    console.log("Suggested download filename:", link.download);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8 selection:bg-rose-500 selection:text-white">
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 bg-clip-text text-transparent">
          YouTube Video Downloader
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-xl">
          Paste a YouTube video link to fetch available download options.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-gray-800 shadow-xl rounded-lg p-6 md:p-8 mb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="youtubeUrl" className="block text-gray-300 text-sm font-medium mb-1.5">
              YouTube Video URL <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <YoutubeIcon className="absolute left-3 h-5 w-5 text-red-400 pointer-events-none" />
              <input
                id="youtubeUrl"
                type="url"
                ref={inputRef}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={`w-full sm:w-auto flex-grow py-3 px-6 rounded-lg text-white font-semibold bg-gradient-to-r from-rose-600 to-pink-700 transition-all duration-150 ease-in-out
                ${isLoading || !videoUrl.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-pink-700 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-600"
              }`}
              disabled={isLoading || !videoUrl.trim()}
            >
              {isLoading ? (
                <span className="flex items-center justify-center"><Loader2Icon className="animate-spin h-5 w-5 mr-2" /> Fetching Info...</span>
              ) : (
                <span className="flex items-center justify-center"><DownloadCloudIcon className="w-5 h-5 mr-2" /> Get Video Formats</span>
              )}
            </button>
            {(videoUrl || videoInfo) && (
                 <button type="button" onClick={handleClear} className={`w-full sm:w-auto py-3 px-5 rounded-lg text-gray-300 font-semibold bg-gray-600 hover:bg-gray-500 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-rose-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={isLoading}>
                    <RotateCcwIcon className="w-5 h-5 mr-2 inline" /> Clear
                </button>
            )}
          </div>
        </form>

        {isLoading && !videoInfo && (
             <div className="mt-8 pt-6 border-t border-gray-700"><div className="p-4 bg-gray-700/50 border border-gray-600 rounded-md"><div className="flex items-center justify-center text-gray-400"><Loader2Icon className="animate-spin h-6 w-6 mr-3" />Fetching video details...</div></div></div>
        )}

        {videoInfo && !isLoading && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            {videoInfo.error && (
              <div className="p-4 bg-red-800/30 border border-red-700 text-red-300 rounded-md text-sm flex items-start gap-3">
                <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="break-words w-full">
                    <p className="font-semibold">Error Fetching Video Info</p>
                    <p>{videoInfo.error}</p>
                    {videoInfo.originalUrl && <p className="text-xs mt-1 text-red-400">URL: {videoInfo.originalUrl}</p>}
                </div>
              </div>
            )}

            {videoInfo.title && !videoInfo.error && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-rose-400 mb-1">{videoInfo.title}</h3>
                    {videoInfo.thumbnailUrl && (<img src={videoInfo.thumbnailUrl} alt={videoInfo.title || 'Video thumbnail'} className="rounded-lg max-w-xs w-full sm:max-w-sm mx-auto my-3 border border-gray-600 shadow-md" />)}
                </div>
            )}

            {videoInfo.formats && videoInfo.formats.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-300 mb-3">Available Download Formats:</h4>
                <div className="space-y-3">
                  {videoInfo.formats.map((format) => (
                    <div key={format.url + (format.format_id || '')} /* More unique key */
                         className="p-3 bg-gray-700/60 rounded-md border border-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                            {format.hasVideo && format.hasAudio ? <FilmIcon className="w-4 h-4 text-sky-400 flex-shrink-0" /> :
                             format.hasVideo ? <VideoIcon className="w-4 h-4 text-sky-400 flex-shrink-0" /> :
                             format.hasAudio ? <Volume2Icon className="w-4 h-4 text-sky-400 flex-shrink-0" /> :
                             <InfoIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            }
                            <span className="font-semibold text-rose-300">{format.qualityLabel || 'Unknown Quality'}</span>
                            <span className="text-gray-400">|</span>
                            <span className="uppercase text-gray-300">{format.container}</span>
                        </div>
                        {format.codecs && format.codecs !== 'N/A / N/A' && <p className="text-xs text-gray-500 truncate" title={format.codecs}>Codecs: {format.codecs}</p>}
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                            <span className="flex items-center" title="Audio Present?">
                                {format.hasAudio ? <Volume2Icon className="w-3.5 h-3.5 text-green-400 mr-0.5"/> : <VolumeXIcon className="w-3.5 h-3.5 text-red-400 mr-0.5"/>}
                                <span className="hidden sm:inline">Audio</span>
                            </span>
                            <span className="text-gray-600">|</span>
                            <span className="flex items-center" title="Video Present?">
                                {format.hasVideo ? <VideoIcon className="w-3.5 h-3.5 text-green-400 mr-0.5"/> : <VideoOffIcon className="w-3.5 h-3.5 text-red-400 mr-0.5"/>}
                                <span className="hidden sm:inline">Video</span>
                            </span>
                            <span className="text-gray-600">|</span>
                            <span>Size: ~{formatContentLength(format.contentLength)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadClick(format, videoInfo.title || 'youtube_video')}
                        className="mt-2 sm:mt-0 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors flex items-center shrink-0 self-start sm:self-center"
                        title={`Download ${format.qualityLabel} (${format.container || 'file'})`}
                      >
                        <DownloadCloudIcon className="w-4 h-4 mr-1.5" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
                 <p className="text-xs text-gray-500 mt-4"><InfoIcon className="inline w-3 h-3 mr-1" />Download links are direct from YouTube and may be temporary.</p>
              </div>
            )}
            {videoInfo.title && !videoInfo.error && (!videoInfo.formats || videoInfo.formats.length === 0) && (
                <div className="p-4 bg-sky-800/30 border border-sky-700 text-sky-300 rounded-md text-sm flex items-start gap-3 mt-4">
                    <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div><p className="font-semibold">No Downloadable Formats Found</p><p>No direct download formats were found. This can happen with live streams or videos with specific restrictions.</p></div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YoutubeDownloader;