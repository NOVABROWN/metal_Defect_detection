import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 hero">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 animate-fadeIn">
          
          <div className="flex-1 text-left space-y-6">
            <div className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 font-mono text-sm tracking-widest uppercase mb-2">
              System Online
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-zinc-100 tracking-tight">
              Smart Metal <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">
                Defect Detection
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-xl">
              AI-powered inspection and sustainable recycling management for modern industrial environments.
            </p>
            <div className="pt-4">
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 uppercase tracking-wider"
              >
                <span>🚀 Start Detecting</span>
              </Link>
            </div>
          </div>

          <div className="flex-1 relative flex justify-center items-center">
            {/* Mascot Container */}
            <div className="relative animate-[bounce_3s_ease-in-out_infinite]">
              <div className="absolute -top-12 -left-12 bg-zinc-800 border border-zinc-700 p-4 rounded-2xl shadow-xl z-10 animate-pulse">
                <p className="text-amber-400 font-mono text-sm">Hi! I'm your AI Assistant.</p>
              </div>
              <img 
                src="/mascot.png" 
                alt="Industrial AI Mascot" 
                className="w-64 md:w-80 h-auto object-contain drop-shadow-2xl"
              />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-10 bg-black/50 blur-xl rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-amber-500/50 transition-all shadow-xl group">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">🔍</div>
            <h2 className="text-2xl font-bold text-amber-500 mb-4">AI Detection</h2>
            <p className="text-zinc-400 leading-relaxed">
              Advanced CNN-based defect detection with high accuracy rates for various metal defect types.
            </p>
          </div>

          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-emerald-500/50 transition-all shadow-xl group">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">♻️</div>
            <h2 className="text-2xl font-bold text-emerald-500 mb-4">Recycling Engine</h2>
            <p className="text-zinc-400 leading-relaxed">
              Smart recommendations for optimal recycling methods based on defect severity and material.
            </p>
          </div>

          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-cyan-500/50 transition-all shadow-xl group">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">📊</div>
            <h2 className="text-2xl font-bold text-cyan-500 mb-4">Metrics Dashboard</h2>
            <p className="text-zinc-400 leading-relaxed">
              Track CO₂ savings, cost reduction, and waste management metrics in real-time.
            </p>
          </div>
        </div>

        {/* Defect Types */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 mb-24 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="w-12 h-1 bg-amber-500"></div>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-100 text-center uppercase tracking-wider">
              Detectable Defects
            </h2>
            <div className="w-12 h-1 bg-amber-500"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {['Crazing', 'Inclusion', 'Patches', 'Pitted Surface', 'Rolled-in Scale', 'Scratches'].map((defect, index) => (
              <div 
                key={defect} 
                className="bg-zinc-950 p-6 rounded-xl border-l-4 border-amber-500 hover:-translate-y-1 transition-transform"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-3 animate-pulse"></div>
                  <h3 className="font-bold text-lg text-zinc-100 font-mono uppercase">{defect}</h3>
                </div>
                <p className="text-zinc-500 text-sm ml-5">
                  High-precision identification via neural networks.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-400">94%</p>
            <p className="text-zinc-400 mt-3 font-mono text-sm uppercase tracking-wider">Detection Accuracy</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-300">6</p>
            <p className="text-zinc-400 mt-3 font-mono text-sm uppercase tracking-wider">Defect Types</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-cyan-300">3</p>
            <p className="text-zinc-400 mt-3 font-mono text-sm uppercase tracking-wider">Severity Levels</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-300">SUB-SEC</p>
            <p className="text-zinc-400 mt-3 font-mono text-sm uppercase tracking-wider">Processing Time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
