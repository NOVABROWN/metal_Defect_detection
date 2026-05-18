import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 font-sans relative">
      <div className="px-8 py-8 mt-4 text-left bg-zinc-900 border border-zinc-800 shadow-2xl w-full max-w-md rounded-2xl relative z-10">
        
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-zinc-950 rounded-full border-4 border-zinc-900 flex items-center justify-center animate-[bounce_4s_ease-in-out_infinite]">
          <img src="/mascot.png" alt="Mascot" className="w-16 h-16 object-contain" />
        </div>

        <h3 className="text-2xl font-black text-center text-zinc-100 uppercase tracking-tight mt-8">System <span className="text-amber-500">Access</span></h3>
        <p className="text-center text-zinc-500 font-mono text-xs tracking-widest uppercase mt-2 mb-6">Operator Login Protocol</p>
        
        {error && <p className="text-red-400 text-sm mt-4 text-center bg-red-500/10 border border-red-500/20 font-mono p-3 rounded-lg uppercase tracking-wider">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Operator ID (Email)</label>
              <input type="email" placeholder="email@factory.local"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mt-6">
              <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Access Code (Password)</label>
              <input type="password" placeholder="••••••••"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-widest"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="mt-8">
              <button className="px-6 py-3 text-zinc-950 bg-amber-600 rounded-xl font-black hover:bg-amber-500 w-full transition-all uppercase tracking-widest shadow-lg shadow-amber-500/20">Authenticate</button>
            </div>
            <div className="mt-6 text-center">
              <Link to="/register" className="text-xs text-amber-500 hover:text-amber-400 font-mono uppercase tracking-widest hover:underline transition-colors">Request Access Credentials</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
