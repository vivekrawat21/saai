"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";

// Helper function to format bytes into a readable string
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export default function ImageCompressor() {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageURL, setOriginalImageURL] = useState<string | null>(null);
  const [originalImageName, setOriginalImageName] = useState<string | null>(null);
  
  const [compressedImageURL, setCompressedImageURL] = useState<string | null>(null);
  const [compressedImageBlob, setCompressedImageBlob] = useState<Blob | null>(null); // To get accurate type for download
  
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionError, setCompressionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to create object URL for original image preview and revoke it on cleanup
  useEffect(() => {
    if (originalImageFile) {
      const objectUrl = URL.createObjectURL(originalImageFile);
      setOriginalImageURL(objectUrl);
      setOriginalImageName(originalImageFile.name);
      setOriginalSize(originalImageFile.size);

      // Cleanup function to revoke the object URL
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setOriginalImageURL(null);
      setOriginalImageName(null);
      setOriginalSize(null);
    }
  }, [originalImageFile]);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic file type check
      const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!acceptedImageTypes.includes(file.type)) {
          setCompressionError("Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP).");
          setOriginalImageFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
      }
      setOriginalImageFile(file);
      setCompressedImageURL(null);
      setCompressedImageBlob(null);
      setCompressedSize(null);
      setCompressionError(null);
    }
  };

  const handleImageCompression = async () => {
    if (!originalImageFile) return;

    setIsCompressing(true);
    setCompressionError(null);
    setCompressedImageURL(null);
    setCompressedImageBlob(null);
    setCompressedSize(null);

    try {
      // More granular options
      const options = {
        maxSizeMB: 1,          // Max file size in MB
        maxWidthOrHeight: 1024, // Max width or height
        useWebWorker: true,    // Use web worker for better performance
        // initialQuality: 0.7, // You can experiment with this
        // fileType: 'image/jpeg' // Force output type if needed
      };
      
      console.log(`Original file size: ${formatBytes(originalImageFile.size)}`);
      const compressedFileBlob = await imageCompression(originalImageFile, options);
      console.log(`Compressed file size: ${formatBytes(compressedFileBlob.size)}`);

      setCompressedSize(compressedFileBlob.size);
      setCompressedImageBlob(compressedFileBlob); // Store blob for download

      // Create a data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setCompressedImageURL(reader.result);
        } else {
          throw new Error("Failed to read compressed file for preview.");
        }
      };
      reader.onerror = () => {
        throw new Error("Error reading compressed file.");
      };
      reader.readAsDataURL(compressedFileBlob);

    } catch (error: unknown) {
      if (error instanceof Error) {
        setCompressionError(error.message || "An unknown error occurred during compression.");
      } else {
        setCompressionError("An unknown error occurred during compression.");
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!compressedImageBlob || !originalImageName) return;
    const downloadUrl = URL.createObjectURL(compressedImageBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    
    const nameParts = originalImageName.split('.');
    const extension = nameParts.pop();
    const baseName = nameParts.join('.');
    // Try to use the compressed blob's type for a more accurate extension, fallback to original or png
    const mimeType = compressedImageBlob.type;
    let newExtension = 'png'; // Default
    if (mimeType === 'image/jpeg') newExtension = 'jpg';
    else if (mimeType === 'image/png') newExtension = 'png';
    else if (mimeType === 'image/webp') newExtension = 'webp';
    else if (extension) newExtension = extension; // Fallback to original if type is unknown

    link.download = `${baseName}_compressed.${newExtension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }, [compressedImageBlob, originalImageName]);

  const handleClear = () => {
    setOriginalImageFile(null);
    setCompressedImageURL(null);
    setCompressedImageBlob(null);
    setCompressedSize(null);
    setCompressionError(null);
    setIsCompressing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const compressionPercentage = originalSize && compressedSize
    ? Math.max(0, ((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white px-4 py-8">
      {/* Header */}
      <div className="text-center my-8 md:my-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-emerald-400 via-green-500 to-lime-500 bg-clip-text text-transparent">
          Image Compressor
        </h1>
        <p className="text-gray-400 text-md md:text-lg max-w-xl">
          Optimize your images by reducing file size without significant quality loss.
        </p>
      </div>

      {/* Input and Controls Section */}
      <div className="w-full max-w-lg bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="imageUpload" className="block text-gray-300 text-sm font-medium mb-2">
              Select an Image:
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isCompressing}
            />
             <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF, WEBP accepted. Max size after compression: ~1MB.</p>
          </div>

          {originalImageFile && (
            <button
              type="button"
              onClick={handleImageCompression}
              className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-green-500 to-lime-600 transition-all duration-150 ease-in-out
                ${(isCompressing || !originalImageFile)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-lime-600 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-lime-500"
              }`}
              disabled={isCompressing || !originalImageFile}
            >
              {isCompressing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Compressing...
                </span>
              ) : "Compress Image"}
            </button>
          )}
          
          {compressionError && (
            <div className="mt-2 p-3 bg-red-800/30 border border-red-700 text-red-300 rounded-md text-sm">
              <p><strong>Error:</strong> {compressionError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Output Section - Shown if original image is selected */}
      {(originalImageURL || compressedImageURL) && (
        <div className="mt-8 w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Original Image Preview */}
            {originalImageURL && originalSize != null && (
              <div className="bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-3 text-gray-300">Original Image</h3>
                <img
                  className="max-w-full h-auto max-h-80 rounded border border-gray-700 object-contain"
                  src={originalImageURL}
                  alt="Original Preview"
                />
                <p className="text-gray-400 mt-3 text-sm">
                  Size: {formatBytes(originalSize)}
                </p>
              </div>
            )}

            {/* Compressed Image Preview */}
            {compressedImageURL && compressedSize != null && (
              <div className="bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-3 text-green-400">Compressed Image</h3>
                <img
                  className="max-w-full h-auto max-h-80 rounded border border-gray-700 object-contain"
                  src={compressedImageURL}
                  alt="Compressed Preview"
                />
                <p className="text-green-400 mt-3 text-sm">
                  Size: {formatBytes(compressedSize)}
                </p>
                {originalSize && (
                   <p className="text-xs text-gray-500 mt-1">
                    Reduced by {compressionPercentage.toFixed(1)}%
                  </p>
                )}
                 <button
                  onClick={handleDownload}
                  className="mt-4 px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors"
                >
                  Download Compressed Image
                </button>
              </div>
            )}
          </div>
           {/* Clear Button */}
          {(originalImageFile || compressedImageURL) && (
            <div className="mt-8 text-center">
              <button
                onClick={handleClear}
                className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium text-sm transition-colors"
                >
                Clear & Compress Another
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}