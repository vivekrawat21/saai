// scripts/download-ytdlp.js
import YTDlpWrapModule from 'yt-dlp-wrap'; // Import the entire module
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- Correct way to get __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ---

// Access the actual class, often on the .default property if it's a CJS module being imported into ESM
const YTDlpWrap = YTDlpWrapModule.default || YTDlpWrapModule;


const binaryDir = path.join(__dirname, '..', 'bin');
const binaryPath = path.join(binaryDir, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

async function download() {
  if (!fs.existsSync(binaryDir)) {
    fs.mkdirSync(binaryDir, { recursive: true });
    console.log(`Created directory: ${binaryDir}`);
  }

  if (fs.existsSync(binaryPath)) {
    console.log('yt-dlp binary already exists at:', binaryPath);
    try {
        const ytDlpWrapInstance = new YTDlpWrap(binaryPath); // Use the resolved YTDlpWrap
        const version = await ytDlpWrapInstance.getVersion();
        console.log('Existing yt-dlp version:', version);
        return;
    } catch(e) {
        console.warn("Could not verify existing yt-dlp, will attempt redownload. Error:", e.message);
    }
  }

  console.log('Downloading latest yt-dlp to:', binaryPath);
  try {
    // Static methods are called on the class itself
    await YTDlpWrap.downloadFromGithub(binaryPath);
    console.log('yt-dlp downloaded successfully.');
    if (process.platform !== 'win32') {
      fs.chmodSync(binaryPath, '755');
      console.log(`Set executable permissions for ${binaryPath}`);
    }
  } catch (downloadError) {
    console.error('Failed to download yt-dlp:', downloadError);
    try {
        console.log("Attempting to use globally available yt-dlp as fallback...");
        const globalYtDlpWrapInstance = new YTDlpWrap(); // Use the resolved YTDlpWrap
        const version = await globalYtDlpWrapInstance.getVersion();
        console.log('Found globally installed yt-dlp version:', version);
        console.warn(`Using global yt-dlp. For consistent behavior, ensure ${binaryPath} is correctly populated.`);
    } catch (globalError) {
        console.error("Could not find or use a globally installed yt-dlp either.", globalError);
        throw downloadError;
    }
  }
}

download()
  .then(() => console.log('Download script finished.'))
  .catch(error => {
    console.error('Download script failed with an error:', error.message); // Log just the message for brevity
    // console.error(error); // Uncomment for full stack trace if needed
    process.exit(1);
  });