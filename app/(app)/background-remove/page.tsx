"use client";
import React, { useState } from "react";

export default function RemoveBackground() {
  const [image, setImage] = useState<File | null>(null);
  const [bgRemove, setBgRemove] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRemoveBackground = async () => {
    const apiKey = process.env.NEXT_PUBLIC_REMOVEBG_API_KEY;
    const apiUrl = process.env.NEXT_PUBLIC_REMOVEBG_API_URL;

    if (!image) return;

    const formData = new FormData();
    formData.append("image_file", image, image.name);
    formData.append("size", "auto");

    setLoading(true);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
        },
        body: formData,
      });

      const data = await res.blob();

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setBgRemove(reader.result);
        }
      };
      reader.readAsDataURL(data);
    } catch (error) {
      console.error("Error removing background:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white">
      <div className="text-center mt-10">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">
          Background Remover
        </h1>
        <p className="text-gray-400 text-lg">
          Upload an image and remove its background effortlessly.
        </p>
      </div>
      <div className="mt-8 w-full max-w-lg px-4">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Select an image:
            </label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setImage(e.target.files[0]);
                  setBgRemove(null); // Reset the result when a new file is uploaded
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-teal-500 file:text-white hover:file:bg-teal-600"
            />
          </div>

          <button
            type="button"
            onClick={handleRemoveBackground}
            className={`w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-teal-500 to-lime-500 hover:from-lime-500 hover:to-teal-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {image && !loading ? "Remove Background" : "Select an Image"}
    
          </button>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-10">
        {/* Original Image */}
        {image && (
          <div className="flex flex-col items-center">
            <p className="mb-2 text-gray-400">Original Image</p>
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <img
                className="w-64 h-64 object-cover"
                src={URL.createObjectURL(image)}
                alt="Uploaded"
              />
            </div>
          </div>
        )}

        {bgRemove && (
          <div className="flex flex-col items-center">
            <p className="mb-2 text-gray-400">Background Removed</p>
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <img
                className="w-64 h-64 object-cover"
                src={bgRemove}
                alt="Processed"
              />
            </div>
          </div>
        )}
      </div>
      {bgRemove && (
        <div className="mt-6">
          <a href={bgRemove} download={"background-removed.png"}>
            <button className="px-6 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold">
              Download Image
            </button>
          </a>
        </div>
      )}
    </div>
  );
}
