import { FaCheckCircle } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-base-100 dark:bg-base-900">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 px-4 dark:bg-base-800 h-[100vh] mt-10">
        <h1 className="text-5xl font-bold text-primary-content dark:text-primary max-w-4xl mx-auto ">
          Welcome to SaAi
        </h1>
        <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto dark:text-gray-300 font-mono">
          Elevate your productivity with AI-driven tools, powered by Cloudinary.
          Seamlessly manage and optimize your content with cutting-edge
          technology.
        </p>
        <div className="flex gap-4 mt-8">
          <a href="#features">
            <button className="px-6 py-3 rounded-md text-white font-semibold text-lg shadow-md bg-blue-500 transition-all duration-300 hover:bg-blue-700 hover:scale-105 active:scale-95 animate-glow">
              Get Started
            </button>
          </a>
          <a href="#pricing">
            <button className="px-6 py-3 rounded-md border-2 border-blue-500 text-blue-500 bg-transparent font-semibold text-lg shadow-md transition-all duration-300 hover:bg-blue-500 hover:text-white hover:scale-105 active:scale-95 animate-glow">
              See Pricing
            </button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary-content mb-6 dark:text-primary">
            Features
          </h2>
          <p className="text-lg text-gray-400 mb-12">
            Everything you need to supercharge your workflow.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                title: "AI-Powered Insights",
                description:
                  "Use our AI-driven analytics to optimize your workflow. Get insights on project data, trends, and bottlenecks in real-time.",
              },
              {
                title: "Cloudinary Integration",
                description:
                  "Seamlessly upload, manage, and deliver media assets in various formats. Easily integrate with your existing systems.",
              },
              {
                title: "Real-Time Collaboration",
                description:
                  "Work with your team in real-time, anywhere in the world. Instant sync and messaging to keep everyone on the same page.",
              },
              {
                title: "Advanced File Compression",
                description:
                  "Compress large files with high efficiency without compromising quality. Save time and bandwidth when managing large media files.",
              },
              {
                title: "Aspect Ratio Correction",
                description:
                  "Automatically adjust and correct aspect ratios for images and videos to fit any platform requirements.",
              },
              {
                title: "Background Removal",
                description:
                  "Remove backgrounds from images effortlessly using AI technology, ensuring clean and professional visuals.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="card shadow-lg p-6 border-2 border-gray-500 rounded-lg bg-base-200 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-bold text-gray-200">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 mt-2">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-base-200 dark:bg-base-900">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary-content mb-6 dark:text-primary">
            Pricing
          </h2>
          <p className="text-lg text-gray-200 mb-12 font-semibold">
            Choose a plan that fits your needs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                title: "Free",
                features: [
                  "Up to 100MB of downloads",
                  "Basic file compression",
                  "Limited real-time collaboration",
                ],
                button: "Sign Up",
                buttonStyle:
                  "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
              },
              {
                title: "Pro",
                features: [
                  "Up to 10GB of downloads",
                  "Advanced file compression",
                  "Priority real-time collaboration",
                ],
                button: "Get Pro - $29/month",
                buttonStyle: "bg-blue-500 text-white hover:bg-blue-700",
              },
              {
                title: "Enterprise",
                features: [
                  "Unlimited downloads",
                  "Custom file compression settings",
                  "Dedicated account manager",
                ],
                button: "Contact Us",
                buttonStyle:
                  "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
              },
            ].map((plan, index) => (
              <div
                key={index}
                className="card shadow-lg p-6 dark:bg-base-700 border-2 border-gray-500 rounded-lg"
              >
                <h3 className="text-2xl font-extrabold text-gray-200">
                  {plan.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center text-sm text-gray-400"
                    >
                      <FaCheckCircle className="text-blue-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`px-6 py-3 rounded-md border-2 font-semibold text-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 mt-4 ${plan.buttonStyle}`}
                >
                  {plan.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
