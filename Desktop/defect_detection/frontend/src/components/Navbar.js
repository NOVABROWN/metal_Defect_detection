import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaBars } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold">
          <FaRobot />
          <span>DefectAI</span>
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-blue-200 transition">Home</Link>
          <Link to="/upload" className="hover:text-blue-200 transition">Upload</Link>
          <Link to="/dashboard" className="hover:text-blue-200 transition">Dashboard</Link>
          <Link to="/inventory" className="hover:text-blue-200 transition">Inventory</Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaBars size={24} />
        </button>

        {isOpen && (
          <div className="absolute top-16 right-0 bg-blue-700 w-full md:hidden">
            <div className="flex flex-col space-y-4 p-4">
              <Link to="/" className="hover:text-blue-200">Home</Link>
              <Link to="/upload" className="hover:text-blue-200">Upload</Link>
              <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
              <Link to="/inventory" className="hover:text-blue-200">Inventory</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
