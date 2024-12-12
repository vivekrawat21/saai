"use client";

import { SignUp } from "@clerk/nextjs";

const CustomSignUp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          appearance={{
            variables: {
              colorPrimary: "#14b8a6", // Teal for primary accents
              colorText: "#e5e7eb", // Light gray text
              borderRadius: "12px",
              fontFamily: "Roboto, sans-serif",
            },
            elements: {
              card: "bg-gray-800 text-white p-8 rounded-lg shadow-xl", // Black background and centered card
              headerTitle: "text-2xl font-bold text-center mb-4",
              formFieldInput:
                "w-full px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 outline-none", // Dark input fields with white text
              formFieldLabel: "text-gray-300", // Label color
              formButtonPrimary:
                "w-full py-3 rounded-md bg-gradient-to-r from-teal-500 to-lime-500 hover:from-lime-500 hover:to-teal-500 text-white font-semibold transition-all", // Gradient button similar to "Remove Background"
              socialButtons: "w-full mb-4", // Ensure social buttons take full width
              footer: "text-center text-sm mt-6 text-gray-400", // Light footer text
              footerActionLink: "text-teal-500 hover:underline", // Link color
            },
          }}
        />
      </div>
    </div>
  );
};

export default CustomSignUp;
