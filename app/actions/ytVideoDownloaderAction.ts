// @/app/actions/ytVideoDownloaderAction.ts
"use server";

import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';
import fs from 'fs';

// --- Binary Path Logic (Revised for Vercel and Local) ---
const getBinaryPath = (): string => {
  const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';

  // 1. Check path for Vercel deployment (where 'bin/yt-dlp' from includeFiles is at function root)
  //    process.env.LAMBDA_TASK_ROOT points to the root of the Lambda function.
  //    The included file 'bin/yt-dlp' in vercel.json is copied as 'yt-dlp' at this root.
  if (process.env.LAMBDA_TASK_ROOT) {
    const vercelPath = path.join(process.env.LAMBDA_TASK_ROOT, binaryName); // Vercel copies the file directly, not the 'bin' folder
    if (fs.existsSync(vercelPath)) {
      console.log(`[PATH_RESOLVER] Using Vercel LAMBDA_TASK_ROOT path: ${vercelPath}`);
      // Attempt to ensure it's executable, though this might fail if already read-only
      try { fs.chmodSync(vercelPath, '755'); } catch (e) { console.warn(`[PATH_RESOLVER] Could not chmod on Vercel path: ${(e as Error).message}`); }
      return vercelPath;
    }
     // Fallback: Sometimes Vercel puts it in an 'api' directory or similar if not using App Router's default structure perfectly
    const vercelApiPath = path.join(process.env.LAMBDA_TASK_ROOT, 'api', binaryName);
    if (fs.existsSync(vercelApiPath)) {
      console.log(`[PATH_RESOLVER] Using Vercel LAMBDA_TASK_ROOT/api path: ${vercelApiPath}`);
      try { fs.chmodSync(vercelApiPath, '755'); } catch (e) { console.warn(`[PATH_RESOLVER] Could not chmod on Vercel API path: ${(e as Error).message}`); }
      return vercelApiPath;
    }
  }


  // 2. Check path for Vercel (alternative common structure, files are at function root)
  //    The file 'bin/yt-dlp' from includeFiles is often just 'yt-dlp' at the function's current working directory.
  //    When deployed, `process.cwd()` inside a Vercel function is its execution root.
  const vercelCwdPath = path.resolve(process.cwd(), binaryName);
  if (process.env.VERCEL && fs.existsSync(vercelCwdPath)) { // process.env.VERCEL is true in Vercel build/runtime
      console.log(`[PATH_RESOLVER] Using Vercel CWD path: ${vercelCwdPath}`);
      try { fs.chmodSync(vercelCwdPath, '755'); } catch (e) { console.warn(`[PATH_RESOLVER] Could not chmod on Vercel CWD path: ${(e as Error).message}`); }
      return vercelCwdPath;
  }


  // 3. Check local development path (project_root/bin/yt-dlp)
  //    process.cwd() in local dev is usually the project root.
  const localDevPath = path.resolve(process.cwd(), 'bin', binaryName);
  if (fs.existsSync(localDevPath)) {
    console.log(`[PATH_RESOLVER] Using local dev path: ${localDevPath}`);
    return localDevPath;
  }

  // 4. Fallback to system PATH (least reliable for deployments)
  console.warn(`[PATH_RESOLVER] yt-dlp binary not found in Vercel or local paths. Falling back to system PATH for '${binaryName}'. This will likely fail in sandboxed serverless environments.`);
  return binaryName; // e.g., 'yt-dlp' or 'yt-dlp.exe'
};


const ytDlpBinaryPath = getBinaryPath(); // Call it once at module load
let ytDlpWrapInstance: YTDlpWrap | null = null;

const getInstanceOfYtDlpWrap = (): YTDlpWrap => {
  if (!ytDlpWrapInstance) {
    try {
      console.log(`Initializing YTDlpWrap with resolved binary path: ${ytDlpBinaryPath}`);
      const YTDlpWrapActualConstructor: typeof YTDlpWrap = (YTDlpWrap as { default?: typeof YTDlpWrap }).default || YTDlpWrap;
      ytDlpWrapInstance = new YTDlpWrapActualConstructor(ytDlpBinaryPath);
    } catch (error: unknown) {
      let errorMessage = "An unknown error occurred during YTDlpWrap initialization.";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("FATAL: Failed to initialize YTDlpWrap:", error.message);
      } else {
        console.error("FATAL: Failed to initialize YTDlpWrap with non-Error object:", error);
      }
      // Add the resolved binary path to the error for easier debugging
      throw new Error(`YTDlpWrap could not be initialized with path '${ytDlpBinaryPath}': ${errorMessage}. Check binary existence, compatibility, and permissions.`);
    }
  }
  // This check is slightly redundant given the throw above, but good for clarity.
  if (!ytDlpWrapInstance) {
    throw new Error("YTDlpWrap instance is unexpectedly null after initialization attempt.");
  }
  return ytDlpWrapInstance;
};

// --- Interfaces (VideoFormatInfo, YoutubeVideoInfoResponse - remain the same as your last version) ---
export interface VideoFormatInfo {
  itag?: number;
  format_id?: string;
  qualityLabel: string | null;
  container: string;
  codecs?: string;
  hasAudio: boolean;
  hasVideo: boolean;
  contentLength?: string;
  url: string;
  resolution?: string;
  fps?: number;
  vbr?: number;
  abr?: number;
  protocol?: string;
}

export interface YoutubeVideoInfoResponse {
  title?: string;
  thumbnailUrl?: string;
  formats?: VideoFormatInfo[];
  error?: string;
  originalUrl?: string;
}


// --- Helper to map yt-dlp format (YtDlpRawFormat, mapYtDlpFormat - remain the same as your last version) ---
interface YtDlpRawFormat {
  url: string; vcodec?: string; acodec?: string; format_note?: string; height?: number;
  resolution?: string; fps?: number; vbr?: number; abr?: number; ext?: string;
  filesize?: number; filesize_approx?: number; format_id?: string; protocol?: string;
}

const mapYtDlpFormat = (ytDlpFormat: YtDlpRawFormat): VideoFormatInfo | null => {
  if (!ytDlpFormat.url) return null;

  const hasVideo = !!ytDlpFormat.vcodec && ytDlpFormat.vcodec !== 'none';
  const hasAudio = !!ytDlpFormat.acodec && ytDlpFormat.acodec !== 'none';
  if (!hasVideo && !hasAudio) return null;

  let qualityLabel = ytDlpFormat.format_note || null;
  if (!qualityLabel && hasVideo) {
    qualityLabel = ytDlpFormat.height ? `${ytDlpFormat.height}p` : (ytDlpFormat.resolution || 'Video');
    if (ytDlpFormat.fps) qualityLabel += ` ${Math.round(ytDlpFormat.fps)}fps`;
    if (ytDlpFormat.vbr) qualityLabel += ` (~${Math.round(ytDlpFormat.vbr)}kbps)`;
  } else if (!qualityLabel && hasAudio && !hasVideo) {
    qualityLabel = ytDlpFormat.abr ? `${Math.round(ytDlpFormat.abr)}kbps Audio` : 'Audio';
  } else if (!qualityLabel && hasAudio && hasVideo) {
    qualityLabel = ytDlpFormat.height ? `${ytDlpFormat.height}p (AV)` : 'Audio+Video';
  } else if (hasAudio && !hasVideo && ytDlpFormat.abr && qualityLabel && !qualityLabel.toLowerCase().includes("audio") && !qualityLabel.toLowerCase().includes("kbps")) {
     qualityLabel = `${qualityLabel} (${Math.round(ytDlpFormat.abr)}kbps Audio)`;
  }

  return {
    itag: ytDlpFormat.format_id && !isNaN(parseInt(ytDlpFormat.format_id.split('-')[0], 10)) ? parseInt(ytDlpFormat.format_id.split('-')[0], 10) : undefined,
    format_id: ytDlpFormat.format_id, qualityLabel: qualityLabel || 'Unknown', container: ytDlpFormat.ext || 'unknown',
    codecs: `${ytDlpFormat.vcodec || 'N/A'} / ${ytDlpFormat.acodec || 'N/A'}`,
    hasAudio: hasAudio, hasVideo: hasVideo,
    contentLength: ytDlpFormat.filesize?.toString() || ytDlpFormat.filesize_approx?.toString(),
    url: ytDlpFormat.url, resolution: ytDlpFormat.resolution, fps: ytDlpFormat.fps,
    vbr: ytDlpFormat.vbr, abr: ytDlpFormat.abr, protocol: ytDlpFormat.protocol,
  };
};

interface YtDlpMetadata {
    _type?: string; entries?: YtDlpMetadata[]; title?: string; thumbnail?: string;
    thumbnails?: { url: string }[]; formats?: YtDlpRawFormat[]; is_live?: boolean;
    availability?: string; age_limit?: number; _errormsg?: string;
}

// --- Main Server Action Function (remains the same as your last execPromise version) ---
export async function getVideoInfo(videoUrl: string): Promise<YoutubeVideoInfoResponse> {
  if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.trim()) {
    return { error: "Please enter a valid YouTube video URL.", originalUrl: videoUrl };
  }

  const controller = new AbortController();
  const timeoutMs = 200000; // Your timeout value
  let timeoutId: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<YoutubeVideoInfoResponse>((_, reject) => {
    timeoutId = setTimeout(() => {
      console.warn(`[TIMEOUT] yt-dlp operation for ${videoUrl} exceeded ${timeoutMs / 1000}s.`);
      controller.abort();
      reject(new Error(`Operation timed out after ${timeoutMs / 1000} seconds`));
    }, timeoutMs);
  });

  try {
    const operationPromise = (async (): Promise<YoutubeVideoInfoResponse> => {
      const ytDlpWrap = getInstanceOfYtDlpWrap();
      console.log(`[ACTION] Fetching info for: ${videoUrl} using yt-dlp execPromise (timeout: ${timeoutMs / 1000}s)`);

      const ytdlpArgs = [ videoUrl, '--dump-json', '--no-warnings' ];
      console.log(`[ACTION_DEBUG] Executing yt-dlp with args: ${ytdlpArgs.join(' ')}`);
      const stdout = await ytDlpWrap.execPromise(ytdlpArgs, {}, controller.signal);
      if (timeoutId) clearTimeout(timeoutId);

      let ytDlpMeta: YtDlpMetadata;
      try { ytDlpMeta = JSON.parse(stdout); } catch (parseError: unknown) {
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        console.error(`[ACTION_ERROR] Failed to parse JSON for ${videoUrl}. Error: ${errorMessage}. Output: ${stdout.substring(0,500)}`);
        return { error: `Failed to understand response from video processor. Invalid JSON.`, originalUrl: videoUrl };
      }

      if (ytDlpMeta && ytDlpMeta._type === 'playlist' && ytDlpMeta.entries && ytDlpMeta.entries.length > 0) {
          ytDlpMeta = ytDlpMeta.entries[0];
      }

      if (!ytDlpMeta || !ytDlpMeta.title) {
        console.error(`[ACTION_ERROR] Incomplete metadata for ${videoUrl}: ${JSON.stringify(ytDlpMeta).substring(0, 300)}`);
           return {
                error: "Failed to retrieve essential video metadata. Video might be private, deleted, or an issue occurred.",
                originalUrl: videoUrl, title: ytDlpMeta?.title,
                thumbnailUrl: ytDlpMeta?.thumbnail || (ytDlpMeta?.thumbnails && ytDlpMeta.thumbnails.length > 0 ? ytDlpMeta.thumbnails[ytDlpMeta.thumbnails.length - 1]?.url : undefined)
            };
      }

      const title = ytDlpMeta.title;
      const thumbnailUrl = ytDlpMeta.thumbnail || (ytDlpMeta.thumbnails && ytDlpMeta.thumbnails.length > 0 ? ytDlpMeta.thumbnails[ytDlpMeta.thumbnails.length - 1]?.url : undefined);

      let formats: VideoFormatInfo[] = [];
      if (ytDlpMeta.formats && Array.isArray(ytDlpMeta.formats)) {
        formats = ytDlpMeta.formats
          .map((f: YtDlpRawFormat) => mapYtDlpFormat(f))
          .filter((f: VideoFormatInfo | null): f is VideoFormatInfo => f !== null)
          .filter(f => f.protocol !== 'm3u8' && f.protocol !== 'm3u8_native' && f.protocol !== 'rtmp' && f.protocol !== 'rtsp' && f.protocol !== 'f4m')
          .sort((a, b) => {
            const aHasBoth = a.hasAudio && a.hasVideo; const bHasBoth = b.hasAudio && b.hasVideo;
            if (aHasBoth && !bHasBoth) return -1; if (!aHasBoth && bHasBoth) return 1;
            if (!aHasBoth && !bHasBoth) { if (a.hasVideo && !b.hasVideo) return -1; if (!a.hasVideo && b.hasVideo) return 1; }
            const resA = a.resolution ? parseInt(a.resolution.split('x')[1], 10) : 0; const resB = b.resolution ? parseInt(b.resolution.split('x')[1], 10) : 0;
            if (resA !== resB) return resB - resA;
            const fpsA = a.fps || 0; const fpsB = b.fps || 0; if (fpsA !== fpsB) return fpsB - fpsA;
            if (a.hasVideo && b.hasVideo) { const vbrA = a.vbr || 0; const vbrB = b.vbr || 0; if (vbrA !== vbrB) return vbrB - vbrA; }
            const abrA = a.abr || 0; const abrB = b.abr || 0; if (abrA !== abrB) return abrB - abrA;
            if (a.container === 'mp4' && b.container !== 'mp4') return -1; if (a.container !== 'mp4' && b.container === 'mp4') return 1;
            if (a.hasAudio && !a.hasVideo && a.container === 'm4a' && b.container !== 'm4a') return -1;
            if (a.hasAudio && !a.hasVideo && a.container !== 'm4a' && b.container === 'm4a') return 1;
            return 0;
          });
      }

      if (formats.length === 0) {
        let specificError = "No suitable direct download formats were found.";
        if (ytDlpMeta.is_live) specificError = "This is an active live stream. Formats available after stream ends.";
        else if (ytDlpMeta.availability === 'private') specificError = "Video is private.";
        else if (ytDlpMeta.age_limit && ytDlpMeta.age_limit > 0) specificError = "Video is age-restricted.";
        else if (ytDlpMeta._type === 'playlist' && (!ytDlpMeta.entries || ytDlpMeta.entries.length === 0)) specificError = "Empty or inaccessible playlist.";
        else if (ytDlpMeta._errormsg) specificError += ` (Details: ${ytDlpMeta._errormsg.substring(0,100)})`;
        console.warn(`[ACTION_WARN] No formats for ${videoUrl}. Meta: ${JSON.stringify(ytDlpMeta).substring(0,300)}`);
        return { title, thumbnailUrl, error: specificError, originalUrl: videoUrl };
      }

      console.log(`[ACTION_SUCCESS] Found ${formats.length} formats for ${videoUrl}`);
      return { title, thumbnailUrl, formats, originalUrl: videoUrl };
    })();

    return await Promise.race([operationPromise, timeoutPromise]);

  } catch (error: unknown) {
    if (timeoutId) clearTimeout(timeoutId);
    let detailedError = "An unknown error occurred during video processing.";
    let originalErrorMessage = "";

    if (error instanceof Error) {
        detailedError = error.message; originalErrorMessage = error.message;
        if (error.name === 'AbortError' || error.message.includes('aborted')) detailedError = `Process stopped (timeout or abort).`;
        else if (error.message.startsWith('Operation timed out')) detailedError = `Failed to fetch: ${error.message}.`;
        else if ('stderr' in error && typeof (error as { stderr: string }).stderr === 'string') {
            const stderrOutput = (error as { stderr: string }).stderr;
            detailedError = `yt-dlp execution error: ${stderrOutput.substring(0, 250)}${stderrOutput.length > 250 ? '...' : ''}`;
            console.error(`[ACTION_YTDLP_STDERR] For ${videoUrl}:`, stderrOutput);
        }
    } else { detailedError = String(error) || "An unspecified error occurred."; }
    console.error(`[ACTION_CRITICAL_ERROR] getVideoInfo for ${videoUrl}: ${originalErrorMessage || detailedError}`);
    return { error: detailedError, originalUrl: videoUrl };
  }
}