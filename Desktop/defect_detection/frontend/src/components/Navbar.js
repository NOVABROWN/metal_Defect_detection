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
    { to: '/chat', label: '🤖 AI Chat', auth: true },
    { to: '/inventory', label: '📦 Inventory', adminOnly: true },
    { to: '/knowledge-base', label: '🧠 Knowledge Base', adminOnly: true },
  ].filter(link =>
    link.always ||
    (link.auth && isAuthenticated) ||
    (link.adminOnly && isAuthenticated && user?.role === 'admin')
  );

  return (
    <nav className="bg-zinc-900 border-b border-zinc-700 text-zinc-100 shadow-2xl sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3 text-2xl font-bold hover:scale-105 transition transform">
          <FaRobot className="text-3xl text-amber-500" />
          <span className="text-amber-500 tracking-wider font-mono uppercase">DefectAI</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-amber-400 transition duration-300 font-semibold text-sm tracking-wide uppercase relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg">
                <FaUserCircle className="text-amber-500" />
                <span className="font-mono text-sm">{user?.username}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${user?.role === 'admin' ? 'bg-amber-500 text-zinc-900' : 'bg-emerald-500 text-zinc-900'}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-900/50 border border-red-700 hover:bg-red-800 text-red-200 px-3 py-1.5 rounded-lg transition text-sm font-semibold uppercase tracking-wider"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="hover:text-amber-400 font-mono text-sm uppercase tracking-wide transition">Login</Link>
              <Link to="/register" className="bg-amber-500 text-zinc-900 hover:bg-amber-400 px-4 py-1.5 rounded-lg font-bold font-mono text-sm uppercase tracking-wide transition shadow-lg shadow-amber-500/20">Register</Link>
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
          <div className="absolute top-[68px] right-0 bg-zinc-900 border-b border-zinc-700 w-full md:hidden shadow-2xl">
            <div className="flex flex-col space-y-4 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-amber-400 hover:ml-2 transition duration-300 font-mono text-sm uppercase tracking-wide"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300 font-mono text-sm uppercase tracking-wide mt-4">
                  🚪 Logout ({user?.username})
                </button>
              ) : (
                <div className="flex flex-col space-y-4 pt-4 border-t border-zinc-700">
                  <Link to="/login" className="hover:text-amber-400 font-mono text-sm uppercase tracking-wide" onClick={() => setIsOpen(false)}>🔑 Login</Link>
                  <Link to="/register" className="text-amber-500 font-mono text-sm uppercase tracking-wide" onClick={() => setIsOpen(false)}>📝 Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

