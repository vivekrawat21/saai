import type { Metadata } from "next";
import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs';



export const metadata: Metadata = {
  title: "Saai",
  description: "An Saas Platform using cloudinary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
      </html>
      </ClerkProvider>
  );
}
