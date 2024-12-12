"use client";
import React, { useState } from "react";
import imageCompression from "browser-image-compression";

export default function ImageCompressor() {
  const [image, setImage] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageCompression = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024 };
      const compressedFile = await imageCompression(image, options);

      // Update compressed image size
      setCompressedSize(compressedFile.size);

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setCompressedImage(reader.result);
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white">
      {/* Header */}
      <div className="text-center mt-10">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">Image Compressor</h1>
        <p className="text-gray-400 text-lg">
          Upload an image, compress it, and download the optimized version.
        </p>
      </div>

      {/* Input Section */}
      <div className="mt-8 w-full max-w-lg px-4">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Select an image:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setImage(e.target.files[0]);
                  setCompressedImage(null); // Reset the result when a new file is uploaded
                  setCompressedSize(null); // Reset size info
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-teal-500 file:text-white hover:file:bg-teal-600"
            />
          </div>

          <button
            type="button"
            onClick={handleImageCompression}
            className={`w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-teal-500 to-lime-500 hover:from-lime-500 hover:to-teal-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading || !image}
          >
            {loading ? "Compressing..." : "Compress Image"}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="mt-10 flex flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-10">
        {/* Original Image */}
        {image && (
          <div className="flex flex-col items-center">
            <p className="mb-2 text-gray-400">Original Image</p>
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <img
                className="w-64 h-64 object-cover"
                src={URL.createObjectURL(image)}
                alt="Original"
              />
            </div>
            <p className="text-gray-400 mt-2">
              {`Size: ${(image.size / 1024 / 1024).toFixed(2)} MB`}
            </p>
          </div>
        )}

        {/* Compressed Image */}
        {compressedImage && (
          <div className="flex flex-col items-center">
            <p className="mb-2 text-gray-400">Compressed Image</p>
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <img
                className="w-64 h-64 object-cover"
                src={compressedImage}
                alt="Compressed"
              />
            </div>
            <p className="text-gray-400 mt-2">
              {`Size: ${(compressedSize! / 1024 / 1024).toFixed(2)} MB`}
            </p>
          </div>
        )}
      </div>

      {/* Download Button */}
      {compressedImage && (
        <div className="mt-6">
          <a href={compressedImage} download={"compressed-image.png"}>
            <button className="px-6 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold">
              Download Image
            </button>
          </a>
        </div>
      )}
    </div>
  );
}
