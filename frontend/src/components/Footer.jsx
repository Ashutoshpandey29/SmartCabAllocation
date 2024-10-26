import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 p-4 text-center">
      <p className="text-white mb-2">© Ashutosh Pandey</p>
      <div className="flex justify-center space-x-4">
        <a href="https://github.com/your-username" target="_blank" rel="noopener noreferrer">
          <FaGithub size={24} className="text-white hover:text-gray-400" />
        </a>
        <a href="https://linkedin.com/in/your-username" target="_blank" rel="noopener noreferrer">
          <FaLinkedin size={24} className="text-white hover:text-gray-400" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
