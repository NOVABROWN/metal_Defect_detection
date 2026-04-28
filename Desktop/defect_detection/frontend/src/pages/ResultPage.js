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
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.5) return 'text-yellow-600';
    return 'text-red-600';
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
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <button
        onClick={() => navigate('/upload')}
        className="mb-8 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to Upload
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Detection Results</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Image */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Analyzed Image</h2>
            {detection?.imageUrl && (
              <img
                src={detection.imageUrl}
                alt="Analyzed"
                className="w-full h-96 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <div>
              <p className="text-gray-500 text-sm">Defect Type</p>
              <p className="text-2xl font-bold text-gray-900">{detection?.defectType}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Confidence Score</p>
              <div className="flex items-center space-x-3 mt-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(detection?.confidence || 0) * 100}%` }}
                  ></div>
                </div>
                <span className={`font-bold text-xl ${getConfidenceColor(detection?.confidence)}`}>
                  {((detection?.confidence || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Severity Level</p>
              <div className={`mt-2 inline-block px-4 py-2 rounded-lg font-bold ${getSeverityColor(detection?.severity)}`}>
                {detection?.severity}
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Metal Type</p>
              <p className="text-lg font-semibold text-gray-900">{detection?.metalType}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Detected at</p>
              <p className="text-gray-600">{new Date(detection?.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {recommendation && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">♻️ Recycling Recommendation</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-500 text-sm">Recommended Action</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{recommendation.action}</p>

                <p className="text-gray-500 text-sm mt-6">Processing Method</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">{recommendation.method}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Estimated Cost Savings</p>
                  <p className="text-2xl font-bold text-blue-600">${recommendation.costSaved}</p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-gray-500 text-sm">CO₂ Emissions Saved</p>
                  <p className="text-2xl font-bold text-emerald-600">{recommendation.co2Saved} kg</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Analyze Another Image
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
