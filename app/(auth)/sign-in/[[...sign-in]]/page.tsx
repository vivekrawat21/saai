"use client";

import { SignIn } from "@clerk/nextjs";

const CustomSignIn = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white">
      {/* Header */}
      <div className="text-center mt-10">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2">Sign In</h1>
        <p className="text-gray-400 text-lg">
          Access your account effortlessly with a quick sign-in.
        </p>
      </div>

      <div className="mt-8 w-full max-w-lg px-4">
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            appearance={{
              variables: {
                colorPrimary: "#14b8a6", // Teal for primary accents
                colorText: "#e5e7eb", // Light gray text
                borderRadius: "12px",
                fontFamily: "Roboto, sans-serif",
              },
              elements: {
                card: "bg-gray-800 text-white rounded-lg shadow-md",
                headerTitle: "text-2xl font-semibold text-center mb-4",
                formFieldInput:
                  "w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 outline-none", // Ensures visible text and placeholder
                formFieldLabel: "text-gray-300",
                formButtonPrimary:
                  "w-full py-3 mt-4 rounded-lg bg-gradient-to-r from-teal-500 to-lime-500 hover:from-lime-500 hover:to-teal-500 text-white font-semibold transition-all",
                footer: "bg-gray-900 text-gray-300", // Dark footer background
                footerActionLink: "text-teal-500 hover:underline",
                socialButtonsIcon: "text-gray-300", // Ensures GitHub icon is visible in dark mode
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomSignIn;
