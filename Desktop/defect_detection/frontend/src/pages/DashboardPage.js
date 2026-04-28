import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/analytics`);
        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } catch (err) {
        setError('Error fetching analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Sustainability Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500 text-sm">Total Detections</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{summary.totalDetections || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500 text-sm">Recycling Actions</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{summary.totalRecyclingActions || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500 text-sm">Total Cost Saved</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">${summary.totalCostSaved || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500 text-sm">CO₂ Saved (kg)</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{summary.totalCo2Saved || 0}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Defects by Type */}
        {analytics?.detectionsByType && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Defects by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.detectionsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Severity Distribution */}
        {analytics?.severityDistribution && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Severity Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.severityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recycling by Action */}
        {analytics?.recyclingStats && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recycling Actions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.recyclingStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Scrap by Metal Type */}
        {analytics?.scrapByType && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Scrap Inventory by Metal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.scrapByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalQuantity" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Metrics Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-lg text-green-900 mb-4">♻️ Reused Metal</h3>
          <p className="text-3xl font-bold text-green-600">{summary.reusedMetalPercentage || 0}%</p>
          <p className="text-sm text-green-700 mt-2">Of total scrap inventory</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-lg text-blue-900 mb-4">📊 Inventory Items</h3>
          <p className="text-3xl font-bold text-blue-600">{summary.totalScrapInventory || 0}</p>
          <p className="text-sm text-blue-700 mt-2">Active in storage</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-lg text-orange-900 mb-4">🌍 Environmental Impact</h3>
          <p className="text-3xl font-bold text-orange-600">{summary.totalCo2Saved || 0}</p>
          <p className="text-sm text-orange-700 mt-2">kg of CO₂ prevented</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
