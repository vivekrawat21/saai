"use client";

import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import {
  BarChart3, // For AI-Powered Insights
  CloudCog,    // For Cloudinary Integration
  Users2,      // For Real-Time Collaboration
  Minimize,    // For Advanced File Compression
  ImageUp , // For Aspect Ratio Correction
  ScissorsLineDashed, // For Background Removal
  Rocket,      // For Get Started button
  Sparkles,    // For general flair or section titles
  DollarSign,  // For Pricing button
} from "lucide-react";
import Header from "@/components/Header"; // Assuming this path is correct
import Footer from "@/components/Footer"; // Assuming this path is correct

const LandingPage = () => {
  const features = [
    {
      icon: <BarChart3 className="w-10 h-10 mb-4 text-blue-500" />,
      title: "AI-Powered Insights",
      description:
        "Use our AI-driven analytics to optimize your workflow. Get insights on project data, trends, and bottlenecks in real-time.",
    },
    {
      icon: <CloudCog className="w-10 h-10 mb-4 text-blue-500" />,
      title: "Cloudinary Integration",
      description:
        "Seamlessly upload, manage, and deliver media assets. Optimized for performance and scalability with Cloudinary.",
    },
    {
      icon: <Users2 className="w-10 h-10 mb-4 text-blue-500" />,
      title: "Real-Time Collaboration",
      description:
        "Work with your team in real-time, anywhere. Instant sync and messaging to keep everyone on the same page.",
    },
    {
      icon: <Minimize className="w-10 h-10 mb-4 text-blue-500" />,
      title: "Advanced File Compression",
      description:
        "Compress large files with high efficiency without compromising quality. Save time and bandwidth with our smart algorithms.",
    },
    {
      icon: <ImageUp className="w-10 h-10 mb-4 text-blue-500" />,
      title: "Aspect Ratio Correction",
      description:
        "Automatically adjust and correct aspect ratios for images and videos to fit any platform requirements perfectly.",
    },
    {
      icon: <ScissorsLineDashed className="w-10 h-10 mb-4 text-blue-500" />,
      title: "Background Removal",
      description:
        "Remove backgrounds from images effortlessly using AI, ensuring clean and professional visuals for your projects.",
    },
  ];

  const pricingPlans = [
    {
      title: "Starter",
      price: "Free",
      priceDetails: "for basic needs",
      features: [
        "Up to 100MB of downloads",
        "Basic file compression",
        "Limited real-time collaboration",
        "Community support",
      ],
      buttonText: "Sign Up for Free",
      buttonStyle:
        "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-base-900",
      highlight: false,
    },
    {
      title: "Pro",
      price: "$29",
      priceDetails: "/month",
      features: [
        "Up to 10GB of downloads",
        "Advanced file compression",
        "Priority real-time collaboration",
        "Advanced AI insights",
        "Email & chat support",
      ],
      buttonText: "Get Pro",
      buttonStyle:
        "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500",
      highlight: true,
    },
    {
      title: "Enterprise",
      price: "Custom",
      priceDetails: "for large teams",
      features: [
        "Unlimited downloads & storage",
        "Custom file compression settings",
        "Dedicated account manager",
        "Custom integrations",
        "24/7 premium support",
      ],
      buttonText: "Contact Sales",
      buttonStyle:
        "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-base-900",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-base-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 selection:bg-blue-500 selection:text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center min-h-[calc(100vh-5rem)] pt-24 pb-16 px-4 bg-gradient-to-br from-base-100 via-base-200 to-base-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Optional: Subtle background pattern or illustration */}
          {/* <div className="absolute inset-0 opacity-5 bg-[url('/path-to-pattern.svg')]"></div> */}
          <Sparkles className="w-16 h-16 text-blue-500 dark:text-blue-400 mb-6 animate-pulse" />
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-500 via-teal-400 to-lime-400 bg-clip-text text-transparent">SaAi</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mt-6 max-w-2xl mx-auto font-normal">
            Elevate your productivity with AI-driven tools, powered by Cloudinary.
            Seamlessly manage and optimize your content with cutting-edge technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <a href="#features">
              <button className="w-full sm:w-auto group flex items-center justify-center px-8 py-3.5 rounded-lg text-white font-semibold text-lg shadow-lg bg-blue-500 transition-all duration-300 hover:bg-blue-600 hover:shadow-xl hover:scale-105 active:scale-95 animate-glow">
                <Rocket className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-[-15deg]" />
                Get Started
              </button>
            </a>
            <a href="#pricing">
              <button className="w-full sm:w-auto group flex items-center justify-center px-8 py-3.5 rounded-lg border-2 border-blue-500 text-blue-500 bg-transparent font-semibold text-lg shadow-md transition-all duration-300 hover:bg-blue-500 hover:text-white hover:scale-105 active:scale-95 animate-glow dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900">
                <DollarSign className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                See Pricing
              </button>
            </a>
          </div>
           {/* Scroll down indicator (optional) */}
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
            <a href="#features" aria-label="Scroll to features">
              <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-28 px-6 bg-base-100 dark:bg-gray-800" aria-labelledby="features-heading">
          <div className="container mx-auto text-center">
            <h2 id="features-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features, Simple Workflow
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto">
              Everything you need to supercharge your content creation and management, all in one intelligent platform.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group flex flex-col items-center text-center bg-base-200 dark:bg-gray-800/50 p-8 rounded-xl shadow-lg border border-base-300 dark:border-gray-700 hover:shadow-2xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2"
                >
                  {feature.icon}
                  <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-md text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 lg:py-28 px-6 bg-base-200 dark:bg-gray-900" aria-labelledby="pricing-heading">
          <div className="container mx-auto text-center">
            <h2 id="pricing-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
              Choose the plan that scales with your ambition. No hidden fees, ever.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 items-stretch">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`flex flex-col bg-base-100 dark:bg-gray-800 rounded-xl shadow-xl p-8 border 
                    ${plan.highlight 
                      ? 'border-blue-500 dark:border-blue-400 ring-4 ring-blue-500/30 dark:ring-blue-400/30 relative' 
                      : 'border-base-300 dark:border-gray-700'
                    } transition-all duration-300 hover:shadow-2xl`}
                >
                  {plan.highlight && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 dark:bg-blue-400 text-white dark:text-gray-900 px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {plan.title}
                  </h3>
                  <p className="text-4xl font-bold text-blue-500 dark:text-blue-400 mb-1">
                    {plan.price}
                    <span className="text-lg font-normal text-gray-500 dark:text-gray-400">{plan.priceDetails}</span>
                  </p>
                  
                  <ul className="mt-6 space-y-3 text-left flex-grow">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start text-md text-gray-600 dark:text-gray-400"
                      >
                        <FaCheckCircle className="text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full px-6 py-3.5 rounded-lg border-2 font-semibold text-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 mt-8 ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
              Need something different? <a href="/contact" className="text-blue-500 dark:text-blue-400 hover:underline">Contact us</a> for custom enterprise solutions.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;