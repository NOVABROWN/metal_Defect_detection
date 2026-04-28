import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Smart Metal Defect Detection System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered detection and sustainable recycling management
          </p>
          <Link
            to="/upload"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Start Detecting
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">🔍 AI Detection</h2>
            <p className="text-gray-600">
              Advanced CNN-based defect detection with high accuracy rates for various defect types.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-green-600 mb-4">♻️ Recycling Recommendations</h2>
            <p className="text-gray-600">
              Smart recommendations for optimal recycling methods based on defect severity.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">📊 Sustainability Metrics</h2>
            <p className="text-gray-600">
              Track CO₂ savings, cost reduction, and waste management metrics in real-time.
            </p>
          </div>
        </div>

        {/* Defect Types */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Detectable Defect Types</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Crazing', 'Inclusion', 'Patches', 'Pitted Surface', 'Rolled-in Scale', 'Scratches'].map((defect) => (
              <div key={defect} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-bold text-lg text-gray-900">{defect}</h3>
                <p className="text-gray-600 text-sm mt-2">
                  High-precision detection using advanced deep learning algorithms
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-3xl font-bold text-blue-600">94%</p>
            <p className="text-gray-600">Detection Accuracy</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-3xl font-bold text-green-600">6</p>
            <p className="text-gray-600">Defect Types</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-3xl font-bold text-emerald-600">3</p>
            <p className="text-gray-600">Severity Levels</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-3xl font-bold text-indigo-600">Real-time</p>
            <p className="text-gray-600">Processing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
