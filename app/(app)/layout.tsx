"use client";

import React, { useState, ReactNode, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon, // For the hamburger
  XIcon, // Optional: For a close icon inside the sidebar
  SparklesIcon, // Added SparklesIcon
} from "lucide-react";
import { sidebarSections } from "@/config/sidebar"; // Assume you moved sections to config

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // This state will control the drawer
  const [openSections, setOpenSections] = useState<string[]>([]);
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const drawerCheckboxRef = useRef<HTMLInputElement>(null);

  const toggleSection = (label: string) => {
    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  // Function to close the sidebar, typically called on link clicks on mobile
  const closeSidebar = () => {
    if (drawerCheckboxRef.current && drawerCheckboxRef.current.checked) { // Check the checkbox state directly
      setSidebarOpen(false);
      drawerCheckboxRef.current.checked = false;
    }
  };

  // Effect to close sidebar on route change for mobile
  useEffect(() => {
    closeSidebar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);


  return (
    <div className="drawer lg:drawer-open">
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        ref={drawerCheckboxRef}
        checked={sidebarOpen}
        onChange={(e) => setSidebarOpen(e.target.checked)}
      />

      {/* Main Content */}
      <div className="drawer-content flex flex-col">
        {/* Navbar for mobile toggle and potentially other content */}
        <div className="navbar bg-base-100 lg:hidden sticky top-0 z-30 shadow">
          <div className="flex-none">
            <label
              htmlFor="sidebar-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <MenuIcon className="w-6 h-6" />
            </label>
          </div>
          <div className="flex-1">
            {/* Updated Mobile Navbar Logo */}
            <Link href="/" className="flex items-center gap-1.5 p-2 group" aria-label="SaAi Home">
              <SparklesIcon className="h-6 w-6 text-teal-400 transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-110" />
              <h1 className="text-xl font-extrabold tracking-tight">
                <span className="text-gray-100 group-hover:text-white transition-colors">Sa</span>
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
                  Ai
                </span>
              </h1>
            </Link>
          </div>
          {/* You can add other navbar items here like a user dropdown for mobile if needed */}
        </div>

        <main className="flex-grow">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-8">
            {children}
          </div>
        </main>
      </div>

      {/* Enhanced Sidebar */}
      <div className="drawer-side h-screen fixed lg:static z-40"> {/* Ensure fixed positioning for mobile overlay */}
        <label
          htmlFor="sidebar-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <aside className="w-72 h-full flex flex-col bg-base-200/95 backdrop-blur-lg shadow-xl">
          {/* Sidebar Header with Logo and optional close button for mobile */}
          <div className="p-4 border-b border-base-300 flex justify-between items-center">
            {/* Updated Sidebar Logo */}
            <Link href="/" className="flex items-center gap-2 group" onClick={closeSidebar} aria-label="SaAi Home">
              <SparklesIcon className="h-8 w-8 sm:h-9 sm:w-9 text-teal-400 transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-110" />
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                <span className="text-gray-100 group-hover:text-white transition-colors">Sa</span>
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
                  Ai
                </span>
              </h1>
            </Link>
            <label
              htmlFor="sidebar-drawer"
              aria-label="close sidebar"
              className="btn btn-ghost btn-sm btn-circle lg:hidden" // Hide on large screens
            >
              <XIcon className="w-5 h-5" />
            </label>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <Link
              href="/home"
              onClick={closeSidebar} // Close sidebar on click
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                pathname === "/home"
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "hover:bg-base-300/50"
              }`}
            >
              <LayoutDashboardIcon className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>

            {sidebarSections.map((section) => (
              <div key={section.label} className="space-y-1">
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-base-300/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-5 h-5 text-base-content/70" />
                    <span className="font-medium">{section.label}</span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${
                      openSections.includes(section.label) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openSections.includes(section.label) && (
                  <div className="ml-8 space-y-1">
                    {section.items.map((item) =>
                      item ? (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeSidebar} // Close sidebar on click
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                            pathname === item.href
                              ? "text-primary bg-primary/10 border-l-2 border-primary"
                              : "hover:bg-base-300/20"
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Section */}
          {user && (
            <div className="p-4 border-t border-base-300">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-9 h-9 rounded-full ring-2 ring-primary ring-offset-base-100">
                    <img src={user.imageUrl} alt={user.fullName || "User"} />
                  </div>
                </div>
                <div className="flex-1 min-w-0"> {/* Added min-w-0 for better truncation */}
                  <p className="text-sm font-medium truncate">
                    {user.fullName || user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    closeSidebar(); // Also close sidebar on sign out if open
                  }}
                  className="btn btn-ghost btn-sm btn-square hover:text-error"
                  aria-label="Sign out"
                >
                  <LogOutIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}