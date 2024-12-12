"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const VideoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  // max file size 70MB
  const MAX_FILE_SIZE = 70 * 1024 * 1024;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File size too large");
      return;
    }
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalSize", file.size.toString());

    try {
      const response = await axios.post("/api/video-upload", formData);

      if (response.status === 200) {
        alert("Video uploaded successfully");
        router.push("/");
      } else {
        alert("Failed to upload video");
      }
    } catch (error) {
      console.error(`upload video failed ${error}`);
      alert("Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white">
      {/* Header */}
      <div className="text-center mt-10">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">Upload Video</h1>
        <p className="text-gray-400 text-lg">
          Upload your video with title and description.
        </p>
      </div>
      <div className="mt-8 w-full max-w-lg px-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full text-gray-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full text-gray-300"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="file-input file-input-bordered w-full"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-teal-500 to-lime-500 hover:from-lime-500 hover:to-teal-500 ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;
