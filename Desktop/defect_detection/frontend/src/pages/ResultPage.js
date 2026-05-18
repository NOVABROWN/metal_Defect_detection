import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detection, setDetection] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'High':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return 'text-emerald-500';
    if (confidence > 0.5) return 'text-amber-500';
    return 'text-red-500';
  };

  useEffect(() => {
    const fetchDetection = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/detections/${id}`);
        if (response.data.success) {
          setDetection(response.data.data);

          // Fetch recommendation
          const recResponse = await axios.post(`${API_URL}/api/recommend`, {
            defectType: response.data.data.defectType,
            severity: response.data.data.severity,
            confidence: response.data.data.confidence
          });

          if (recResponse.data.success) {
            setRecommendation(recResponse.data.data);
          }
        }
      } catch (err) {
        setError('Error fetching detection result: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetection();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xl text-amber-500 font-mono tracking-widest uppercase animate-pulse">Running Diagnostics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 p-12 font-sans">
        <div className="bg-red-950/50 border border-red-900 text-red-200 px-6 py-4 rounded-xl shadow-lg max-w-2xl mx-auto font-mono text-sm">
          <p className="flex items-center gap-2"><span>⚠️</span> SYSTEM ERROR: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 font-sans">
      <div className="container mx-auto px-4 relative">
        <button
          onClick={() => navigate('/upload')}
          className="mb-8 text-zinc-400 hover:text-amber-400 flex items-center transition-colors font-mono text-sm uppercase tracking-wider"
        >
          ← Abort & Return
        </button>

        {/* Mascot HUD Element */}
        <div className="hidden lg:block absolute top-0 right-10 animate-[bounce_4s_ease-in-out_infinite] opacity-80 hover:opacity-100 transition-opacity">
          <div className="bg-zinc-800/80 backdrop-blur border border-zinc-700 p-3 rounded-xl shadow-xl absolute -left-48 top-10 w-40">
            <p className="text-amber-400 font-mono text-xs">Scan complete. HUD updated.</p>
          </div>
          <img src="/mascot.png" alt="Mascot" className="w-32 h-32 object-contain" />
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-zinc-100 mb-12 text-center uppercase tracking-tight">
            Diagnostic <span className="text-amber-500">Report</span>
          </h1>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Image */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/20 group-hover:bg-amber-500/50 transition-colors"></div>
              <h2 className="text-zinc-100 font-mono text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span> Raw Scan Data
              </h2>
            {detection?.imageUrl && (
              <img
                src={`${API_URL}${detection.imageUrl}`}
                alt="Analyzed"
                className="w-full h-96 object-cover rounded-lg"
              />
            )}
            </div>

            {/* Results */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6">
              <div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Defect Classification</p>
                <p className="text-2xl font-bold text-zinc-100 mt-1">{detection?.defectType}</p>
              </div>

              <div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Probability Metric</p>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      style={{ width: `${(detection?.confidence || 0) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`font-mono font-bold text-lg ${getConfidenceColor(detection?.confidence)}`}>
                    {((detection?.confidence || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Severity Index</p>
                <div className={`mt-2 inline-block px-3 py-1 rounded font-bold font-mono text-sm uppercase tracking-wide ${getSeverityColor(detection?.severity)}`}>
                  {detection?.severity}
                </div>
              </div>

              <div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Material Signature</p>
                <p className="text-lg font-semibold text-zinc-100 mt-1">{detection?.metalType}</p>
              </div>

              <div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Timestamp</p>
                <p className="text-zinc-400 font-mono text-sm mt-1">{new Date(detection?.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

        {/* Recommendation */}
        {recommendation && (
          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="text-9xl">♻️</span>
            </div>
            
            <h2 className="text-xl font-bold text-emerald-400 mb-6 font-mono uppercase tracking-wider flex items-center gap-3">
              <span className="bg-emerald-500/20 p-2 rounded-lg">♻️</span> Recovery Protocol
            </h2>

            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              <div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Recommended Action</p>
                <p className="text-2xl font-bold text-zinc-100 mt-2">{recommendation.action}</p>

                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-6">Processing Method</p>
                <p className="text-lg font-semibold text-zinc-300 mt-2">{recommendation.method}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-inner">
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Est. Resource Recovery Value</p>
                  <p className="text-3xl font-black text-amber-500 mt-1">${recommendation.costSaved}</p>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-inner">
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Carbon Footprint Reduction</p>
                  <p className="text-3xl font-black text-emerald-500 mt-1">{recommendation.co2Saved} <span className="text-lg">kg CO₂</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center mt-12">
          <button
            onClick={() => navigate('/upload')}
            className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-300 font-mono text-sm uppercase tracking-wider py-3 px-8 rounded-xl transition-all"
          >
            New Scan
          </button>
          <button
            onClick={() => navigate('/chat', { state: { prediction: {
              defectType: detection?.defectType,
              confidence: (detection?.confidence * 100).toFixed(1),
              severity: detection?.severity,
              metalType: detection?.metalType
            } } })}
            className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-black py-3 px-8 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-3 uppercase tracking-wider"
          >
            <span className="text-xl">🤖</span> Open AI Console
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-300 font-mono text-sm uppercase tracking-wider py-3 px-8 rounded-xl transition-all"
          >
            System Dash
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ResultPage;
