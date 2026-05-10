import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRobot, FaBars, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: '🏠 Home', always: true },
    { to: '/upload', label: '📤 Upload', auth: true },
    { to: '/dashboard', label: '📊 Dashboard', auth: true },
    { to: '/inventory', label: '📦 Inventory', adminOnly: true },
  ].filter(link =>
    link.always ||
    (link.auth && isAuthenticated) ||
    (link.adminOnly && isAuthenticated && user?.role === 'admin')
  );

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-2xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 text-2xl font-bold hover:scale-105 transition transform">
          <FaRobot className="text-3xl" />
          <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">DefectAI</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-blue-100 transition duration-300 font-semibold text-lg relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full">
                <FaUserCircle />
                <span className="font-semibold text-sm">{user?.username}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${user?.role === 'admin' ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition text-sm font-semibold"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="hover:text-blue-100 font-semibold transition">Login</Link>
              <Link to="/register" className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-1.5 rounded-lg font-semibold transition">Register</Link>
            </div>
          )}
        </div>

        <button
          className="md:hidden text-white hover:text-blue-100 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaBars size={28} />
        </button>

        {isOpen && (
          <div className="absolute top-20 right-0 bg-gradient-to-b from-blue-700 to-blue-900 w-full md:hidden shadow-2xl">
            <div className="flex flex-col space-y-4 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-blue-200 hover:ml-2 transition duration-300 font-semibold text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button onClick={handleLogout} className="text-left text-red-300 hover:text-red-100 font-semibold text-lg">
                  🚪 Logout ({user?.username})
                </button>
              ) : (
                <>
                  <Link to="/login" className="hover:text-blue-200 font-semibold text-lg" onClick={() => setIsOpen(false)}>🔑 Login</Link>
                  <Link to="/register" className="hover:text-blue-200 font-semibold text-lg" onClick={() => setIsOpen(false)}>📝 Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

