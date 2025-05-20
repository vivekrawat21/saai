"use client";

import Link from "next/link"; // For an accessible logo link
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"; // Added UserButton and useUser
import { LogInIcon, UserPlusIcon, SparklesIcon } from "lucide-react"; // Icons for buttons

const Header = () => {
  const { isSignedIn } = useUser(); // Get user state from Clerk

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-900/70 backdrop-blur-lg shadow-lg border-b border-gray-700/50">
      <div className="container mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="SaAi Home">
          <SparklesIcon className="h-8 w-8 sm:h-9 sm:w-9 text-teal-400 transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-110" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span className="text-gray-100 group-hover:text-white transition-colors">Sa</span>
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
              Ai
            </span>
          </h1>
        </Link>

        {/* Navigation & Auth Buttons */}
        <nav className="flex items-center gap-3 sm:gap-4">
          {isSignedIn ? (
            <>
              {/* Optional: Add other navigation links here if user is signed in */}
              {/* <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-teal-400 transition-colors">
                Dashboard
              </Link> */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 ring-2 ring-teal-500/50 hover:ring-teal-400", // Custom size and ring
                    userButtonPopoverCard: "bg-gray-800 border-gray-700 shadow-xl",
                    userButtonPopoverMain: "bg-gray-800",
                    userButtonPopoverActions: "bg-gray-800",
                    userButtonPopoverActionButton:"text-gray-200 hover:bg-gray-700",
                    userButtonPopoverActionButtonIcon: "text-teal-400",
                    userButtonPopoverFooter: "hidden", // Optionally hide Clerk footer
                  },
                }}
              />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button
                  className="group flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border-2 border-teal-500 
                             text-teal-400 font-semibold text-sm sm:text-md shadow-md 
                             transition-all duration-300 ease-in-out 
                             hover:bg-teal-500 hover:text-gray-900 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <LogInIcon className="w-4 h-4 sm:w-5 sm:w-5 mr-2 opacity-80 group-hover:opacity-100 transition-opacity" />
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="group flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border-2 border-teal-500 bg-teal-500 
                             text-gray-900 font-semibold text-sm sm:text-md shadow-md 
                             transition-all duration-300 ease-in-out 
                             hover:bg-teal-600 hover:border-teal-600 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <UserPlusIcon className="w-4 h-4 sm:w-5 sm:w-5 mr-2 opacity-80 group-hover:opacity-100 transition-opacity" />
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;