import {
    ImageIcon,
    Wand2Icon,
    ImageDownIcon,
    ZoomInIcon,
    SparklesIcon,
    HighlighterIcon,
    TextIcon,
    PenLineIcon,
    FileCode2Icon,
    UploadIcon,
    VideoOffIcon,
    VideoIcon,
    HardDriveDownloadIcon
  } from "lucide-react";
  
  export const sidebarSections = [
    {
      label: "Image Tools",
      icon: ImageIcon,
      items: [
        { href: "/background-remove", icon: Wand2Icon, label: "Background Remover" },
        { href: "/image-compressor", icon: ImageDownIcon, label: "Image Compressor" },
        { href: "/social-share", icon: ZoomInIcon, label: "Image Enhancer" },
        { href: "/image-generator", icon: SparklesIcon, label: "AI Image Generator" },
        { href: "/object-remover", icon: HighlighterIcon, label: "Object Remover" },
      ],
    },
    {
      label: "Text Tools",
      icon: TextIcon,
      items: [
        { href: "/summarizer", icon: TextIcon, label: "Article Summarizer" },
        { href: "/content-generator", icon: PenLineIcon, label: "AI Content Generator" },
        { href: "/grammer-corrector", icon: HighlighterIcon, label: "Grammar Corrector" },
        { href: "/code-explainer", icon: FileCode2Icon, label: "Code Explainer" },
      ],
    },
    
    {
      label: "Video Tools",
      icon: UploadIcon,
      items: [
        { href: "/video-upload", icon: UploadIcon, label: "Video Compressor" },
        { href: "/videobg-remover", icon: VideoOffIcon, label: "Video Background Remover" },
        { href: "/ytvideo-summarizer", icon: VideoIcon, label: "YT Video Summarizer" },
        { href: "/enhancer", icon: ZoomInIcon, label: "Frame Enhancer" },,
        { href: "/ytvideo-downloader", icon: HardDriveDownloadIcon, label: "YT Video Downloader" },
      ],
    },
  ];
  