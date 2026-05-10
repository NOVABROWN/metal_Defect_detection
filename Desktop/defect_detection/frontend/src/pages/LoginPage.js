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
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg w-full max-w-md rounded-xl">
        <h3 className="text-2xl font-bold text-center text-gray-800">Login to your account</h3>
        {error && <p className="text-red-500 text-sm mt-4 text-center bg-red-50 p-2 rounded">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-700">Email</label>
              <input type="email" placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700">Password</label>
              <input type="password" placeholder="Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex items-baseline justify-between mt-6">
              <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 w-full transition-colors">Login</button>
            </div>
            <div className="mt-4 text-center">
              <Link to="/register" className="text-sm text-blue-600 hover:underline">Don't have an account? Register here</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
