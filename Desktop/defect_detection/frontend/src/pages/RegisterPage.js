import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('worker');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await register(username, email, password, role);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Registration failed. Email might already exist.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-zinc-950 font-sans relative py-12">
      <div className="px-8 py-8 mt-4 text-left bg-zinc-900 border border-zinc-800 shadow-2xl w-full max-w-md rounded-2xl relative z-10">
        
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-zinc-950 rounded-full border-4 border-zinc-900 flex items-center justify-center animate-[bounce_4s_ease-in-out_infinite]">
          <img src="/mascot.png" alt="Mascot" className="w-16 h-16 object-contain" />
        </div>

        <h3 className="text-2xl font-black text-center text-zinc-100 uppercase tracking-tight mt-8">System <span className="text-amber-500">Registration</span></h3>
        <p className="text-center text-zinc-500 font-mono text-xs tracking-widest uppercase mt-2 mb-6">Initialize Operator Profile</p>
        
        {error && <p className="text-red-400 text-sm mt-4 text-center bg-red-500/10 border border-red-500/20 font-mono p-3 rounded-lg uppercase tracking-wider">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mt-4 space-y-6">
            <div>
              <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Operator Handle (Username)</label>
              <input type="text" placeholder="username"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            
            <div>
              <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Comms Link (Email)</label>
              <input type="email" placeholder="email@factory.local"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            
            <div>
              <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Security Key (Password)</label>
              <input type="password" placeholder="••••••••"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-widest"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            
            <div>
              <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Clearance Level (Role)</label>
              <select 
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
                value={role} onChange={(e) => setRole(e.target.value)}
              >
                <option value="worker">Level 1: Floor Operator</option>
                <option value="admin">Level 5: Systems Admin</option>
              </select>
            </div>
            
            <div className="mt-8">
              <button className="px-6 py-3 text-zinc-950 bg-emerald-600 rounded-xl font-black hover:bg-emerald-500 w-full transition-all uppercase tracking-widest shadow-lg shadow-emerald-500/20">Establish Profile</button>
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/login" className="text-xs text-emerald-500 hover:text-emerald-400 font-mono uppercase tracking-widest hover:underline transition-colors">Already registered? Authenticate</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
