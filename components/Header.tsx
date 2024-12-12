import { SignInButton, SignUpButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-gray-800/60 backdrop-blur-md text-gray-200 shadow-md">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <h1 className="text-4xl font-bold">
          <span className="text-white">Sa</span>
          <span className="text-blue-500 font-cursive">Ai</span>
        </h1>
        <div className="flex gap-4">
          <SignInButton>
            <button className="px-4 py-2 rounded-md border-2 border-blue-500 text-blue-500 font-semibold text-md shadow-md transition-all duration-300 hover:border-blue-700 hover:text-white hover:bg-blue-500 hover:shadow-lg hover:scale-105 active:scale-95">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="px-4 py-2 rounded-md border-2 border-blue-500 bg-blue-500 text-white font-semibold text-md shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-95">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>
    </header>
  );
};

export default Header;
