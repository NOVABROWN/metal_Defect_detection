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
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg w-full max-w-md rounded-xl">
        <h3 className="text-2xl font-bold text-center text-gray-800">Create an account</h3>
        {error && <p className="text-red-500 text-sm mt-4 text-center bg-red-50 p-2 rounded">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-700">Username</label>
              <input type="text" placeholder="Username"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="mt-4">
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
            <div className="mt-4">
              <label className="block text-gray-700">Account Role</label>
              <select 
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                value={role} onChange={(e) => setRole(e.target.value)}
              >
                <option value="worker">Factory Worker (Upload & Personal Stats)</option>
                <option value="admin">Admin (Full Dashboard Access)</option>
              </select>
            </div>
            <div className="flex items-baseline justify-between mt-6">
              <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 w-full transition-colors">Register</button>
            </div>
            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:underline">Already have an account? Login here</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
