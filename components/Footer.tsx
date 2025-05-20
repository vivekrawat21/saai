"use client";

import Link from "next/link";
import { SparklesIcon } from "lucide-react"; // For the new logo
import { FaHeart } from "react-icons/fa";
import { Twitter, Github, Linkedin, Zap } from "lucide-react"; // Using lucide-react for social icons for consistency

const SocialLink = ({ href, icon: Icon, label, hoverColorClass }: { href: string, icon: React.ElementType, label: string, hoverColorClass: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`p-2 rounded-full text-gray-400 dark:text-gray-500 transition-all duration-300 ease-in-out hover:scale-110 ${hoverColorClass}`}
  >
    <Icon size={22} /> {/* Slightly larger icons */}
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-gray-800/70 dark:bg-gray-900/80 backdrop-blur-md text-gray-400 dark:text-gray-500 py-10 sm:py-12 border-t border-gray-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Column 1: Logo and Brand */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 group mb-3" aria-label="SaAi Home">
              <SparklesIcon className="h-7 w-7 sm:h-8 sm:w-8 text-teal-400 transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-110" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                <span className="text-gray-200 dark:text-gray-100 group-hover:text-white transition-colors">Sa</span>
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
                  Ai
                </span>
              </h1>
            </Link>
            <p className="text-xs text-center md:text-left">
              AI-Powered Productivity Tools.
            </p>
          </div>

          {/* Column 2: Navigation Links (Optional) */}
          <nav className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-sm">
            <Link href="/#features" className="hover:text-teal-400 dark:hover:text-teal-300 transition-colors">
              Features
            </Link>
            <Link href="/#pricing" className="hover:text-teal-400 dark:hover:text-teal-300 transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-teal-400 dark:hover:text-teal-300 transition-colors">
              Contact
            </Link>
            {/* Add more links like "Blog", "Docs", etc. if needed */}
          </nav>

          {/* Column 3: Social Media Links */}
          <div className="flex justify-center md:justify-end items-center space-x-4">
            <SocialLink href="https://twitter.com/your_handle" icon={Twitter} label="Twitter" hoverColorClass="hover:bg-sky-500/20 hover:text-sky-400" />
            <SocialLink href="https://github.com/your_handle" icon={Github} label="GitHub" hoverColorClass="hover:bg-gray-500/20 hover:text-gray-300" />
            <SocialLink href="https://linkedin.com/in/your_handle" icon={Linkedin} label="LinkedIn" hoverColorClass="hover:bg-blue-600/20 hover:text-blue-500" />
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="text-center border-t border-gray-700/60 pt-8 mt-8 sm:mt-10">
          <p className="text-sm mb-2">
            © {new Date().getFullYear()} SaAi. All rights reserved.
          </p>
          <p className="text-xs flex items-center justify-center">
            Built with <FaHeart className="inline text-red-500 mx-1.5" /> and powered by
            <a
              href="https://cloudinary.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-medium text-teal-400 dark:text-teal-300 hover:underline hover:text-teal-200 transition-colors flex items-center gap-1"
            >
              Cloudinary <Zap size={14} className="opacity-75" />
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;