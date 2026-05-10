import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 hero">
        <div className="text-center mb-20 animate-fadeIn">
          <h1 className="text-responsive font-bold text-gray-900 mb-6 text-shadow">
            Smart Metal Defect Detection System
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            🤖 AI-powered detection and sustainable recycling management
          </p>
          <Link
            to="/upload"
            className="btn-primary inline-block"
          >
            🚀 Start Detecting
          </Link>
        </div>

        {/* Features */}
        <div className="card-grid mb-20">
          <div className="card-lg p-8 hover-glow">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">AI Detection</h2>
            <p className="text-gray-600 leading-relaxed">
              Advanced CNN-based defect detection with high accuracy rates for various defect types.
            </p>
          </div>

          <div className="card-lg p-8 hover-glow">
            <div className="text-5xl mb-4">♻️</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Recycling Recommendations</h2>
            <p className="text-gray-600 leading-relaxed">
              Smart recommendations for optimal recycling methods based on defect severity.
            </p>
          </div>

          <div className="card-lg p-8 hover-glow">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">Sustainability Metrics</h2>
            <p className="text-gray-600 leading-relaxed">
              Track CO₂ savings, cost reduction, and waste management metrics in real-time.
            </p>
          </div>
        </div>

        {/* Defect Types */}
        <div className="card-lg p-8 md:p-12 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center gradient-text">
            ⚙️ Detectable Defect Types
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Crazing', 'Inclusion', 'Patches', 'Pitted Surface', 'Rolled-in Scale', 'Scratches'].map((defect, index) => (
              <div 
                key={defect} 
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-600 hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                  <h3 className="font-bold text-lg text-gray-900">{defect}</h3>
                </div>
                <p className="text-gray-600 text-sm ml-6">
                  High-precision detection using advanced deep learning algorithms
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="card-lg p-8 hover-lift">
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">94%</p>
            <p className="text-gray-600 mt-2 font-semibold">Detection Accuracy</p>
          </div>
          <div className="card-lg p-8 hover-lift">
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">6</p>
            <p className="text-gray-600 mt-2 font-semibold">Defect Types</p>
          </div>
          <div className="card-lg p-8 hover-lift">
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">3</p>
            <p className="text-gray-600 mt-2 font-semibold">Severity Levels</p>
          </div>
          <div className="card-lg p-8 hover-lift">
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Real-time</p>
            <p className="text-gray-600 mt-2 font-semibold">Processing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
