"use client";

import React from "react";
import { SignUp } from "@clerk/nextjs";

const CustomSignUp = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="mt-3 text-md text-gray-400">
            Join SaAi today and unlock powerful AI tools.
          </p>
        </header>

        {/* Clerk Sign-Up Component Wrapper */}
        <div className="bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8"> {/* Consistent wrapper styling */}
          <SignUp
            path="/sign-up"      // Clerk will handle this path
            routing="path"       // Use path-based routing
            signInUrl="/sign-in"  // Redirect to your custom sign-in page
            // afterSignUpUrl="/dashboard" // Optional: Redirect after successful sign-up
            // afterSignInUrl="/dashboard" // Optional: Redirect after successful sign-in (if coming from sign-up)
            appearance={{
              variables: {
                colorPrimary: "#14b8a6",          // Teal-500 (Tailwind)
                colorBackground: "#1f2937",      // Gray-800 (Tailwind) - for internal Clerk elements if needed
                colorText: "#e5e7eb",            // Gray-200 (Tailwind) - for general text
                colorTextSecondary: "#9ca3af",   // Gray-400 (Tailwind) - for secondary text
                colorInputBackground: "#111827", // Gray-900 (Tailwind) - for input fields
                colorInputText: "#f3f4f6",       // Gray-100 (Tailwind) - for input text
                colorShimmer: "rgba(20, 184, 166, 0.2)", // Shimmer with teal accent
                borderRadius: "0.75rem",        // 12px
                fontFamily: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`, // Consistent font stack
              },
              elements: {
                // Main card styling - make it transparent as our wrapper handles the card look
                card: "bg-transparent shadow-none border-none", 
                
                // Header elements
                headerTitle: "text-2xl font-bold text-center mb-6 text-gray-100",
                headerSubtitle: "text-sm text-center text-gray-400 mb-6",
                
                // Form fields
                formFieldLabel: "text-sm font-medium text-gray-300 mb-1 block",
                formFieldInput: `
                  w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 
                  text-gray-100 placeholder-gray-500 
                  focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none
                  transition-colors duration-150 ease-in-out
                `,
                formFieldHintText: "text-xs text-gray-400 mt-1",
                formFieldErrorText: "text-xs text-red-400 mt-1",
                
                // Checkbox for terms/privacy (if enabled in Clerk dashboard)
                checkboxLabel: "text-sm text-gray-300 cursor-pointer", // Added cursor-pointer
                checkboxInput: "focus:ring-teal-500 text-teal-600 border-gray-600 bg-gray-700 checked:bg-teal-500", // Styled the checkbox

                // Buttons
                formButtonPrimary: `
                  w-full py-3 mt-6 rounded-lg bg-gradient-to-r from-teal-500 to-lime-500 
                  text-white font-semibold text-base
                  hover:from-lime-500 hover:to-teal-500 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-lime-500
                  transition-all duration-150 ease-in-out
                  disabled:opacity-60
                `,
                
                // Social buttons (e.g., "Continue with GitHub")
                socialButtonsIconButton: `
                  border border-gray-700 hover:bg-gray-700/50
                  transition-colors duration-150 ease-in-out
                `,
                socialButtonsProviderIcon: "text-gray-200",
                
                // Footer links (e.g., "Already have an account? Sign In")
                footer: "mt-6", 
                footerActionText: "text-sm text-gray-400",
                footerActionLink: "text-sm text-teal-400 hover:text-teal-300 font-medium",

                // Other elements for consistency
                dividerText: "text-xs text-gray-500", // "or" text between methods
                dividerLine: "bg-gray-700",          // Line for the divider
                
                // For Terms and Privacy links if you configure them in Clerk Dashboard
                footerPagesLink: "text-xs text-gray-400 hover:text-teal-400 underline",

                // General alerts (e.g., for verification email sent)
                alertText: "text-sm",
                alertIcon: "text-teal-400", // For success alerts

                // Select Triggers (e.g. for phone input country code)
                selectButton: "bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200",
                selectOptionsContainer:"bg-gray-700 border-gray-600 text-gray-200",
              },
              layout: {
                socialButtonsPlacement: 'bottom', // 'top', 'bottom', 'none'
                socialButtonsVariant: 'iconButton', // 'button', 'iconButton'
                // termsPageUrl: '/legal/terms', // Example: Make sure these pages exist if you uncomment
                // privacyPageUrl: '/legal/privacy', // Example
              }
            }}
          />
        </div>
        <p className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} SaAi. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default CustomSignUp;