import { FaHeart, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-base-200 text-base-content py-10">
      {/* Social Media Links */}
      <div className="flex justify-center space-x-6 mb-6">
        <a
          href="https://twitter.com/your_handle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-400 transition-colors"
          aria-label="Twitter"
        >
          <FaTwitter size={20} />
        </a>
        <a
          href="https://github.com/your_handle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="GitHub"
        >
          <FaGithub size={20} />
        </a>
        <a
          href="https://linkedin.com/in/your_handle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors"
          aria-label="LinkedIn"
        >
          <FaLinkedin size={20} />
        </a>
      </div>

      {/* Footer Bottom Section */}
      <div className=" text-center border-t border-gray-700 pt-6">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Saai. All rights reserved.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Built with <FaHeart className="inline text-red-500 mx-1" /> and powered by{" "}
          <a
            href="https://cloudinary.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-accent"
          >
            Cloudinary
          </a>
          .
        </p>
      </div>
    </footer>
  );
};

export default Footer;
