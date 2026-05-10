import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      setError('');
    }
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(droppedFile);
      setError('');
    } else {
      setError('Please drop an image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_URL}/api/detections/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        navigate(`/result/${response.data.data.detectionId}`);
      } else {
        setError('Upload failed: ' + response.data.message);
      }
    } catch (err) {
      setError('Error uploading image: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fadeIn">
            <h1 className="text-responsive font-bold text-gray-900 mb-4 text-shadow">
              🔍 Upload Image for Defect Detection
            </h1>
            <p className="text-lg text-gray-600">
              Upload a high-quality image of metal surface for AI-powered defect analysis
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-lg p-8 md:p-12">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragDrop}
              className="border-4 border-dashed border-blue-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition duration-300 mb-8"
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                {preview ? (
                  <div className="space-y-4 animate-slideInUp">
                    <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded-lg shadow-lg hover:shadow-2xl transition" />
                    <p className="text-sm text-gray-500 font-semibold">✏️ Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl animate-bounce">📁</div>
                    <p className="text-2xl font-bold text-gray-900">Drag and drop your image here</p>
                    <p className="text-gray-600">or click to select from your computer</p>
                    <p className="text-sm text-gray-500">Supported formats: JPG, PNG, GIF, WEBP</p>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="bg-gradient-to-r from-red-100 to-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8 animate-slideInLeft">
                <p className="font-semibold">❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition transform ${
                loading || !file
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="spinner mr-3"></div>
                  Analyzing Defects...
                </span>
              ) : (
                '⚡ Analyze Image'
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="card-lg p-8 bg-gradient-to-br from-blue-50 to-blue-100 hover-lift">
              <h3 className="font-bold text-xl text-blue-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">📸</span>Image Requirements
              </h3>
              <ul className="text-blue-800 space-y-3">
                <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Minimum 224x224 pixels</li>
                <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Clear, well-lit image</li>
                <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Maximum 50MB file size</li>
                <li className="flex items-center"><span className="text-green-600 mr-3">✓</span> Supported: JPG, PNG, GIF, WEBP</li>
              </ul>
            </div>

            <div className="card-lg p-8 bg-gradient-to-br from-green-50 to-green-100 hover-lift">
              <h3 className="font-bold text-xl text-green-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">⚡</span>What You'll Get
              </h3>
              <ul className="text-green-800 space-y-3">
                <li className="flex items-center"><span className="text-blue-600 mr-3">→</span> Defect type classification</li>
                <li className="flex items-center"><span className="text-blue-600 mr-3">→</span> Confidence score (%)</li>
                <li className="flex items-center"><span className="text-blue-600 mr-3">→</span> Severity assessment</li>
                <li className="flex items-center"><span className="text-blue-600 mr-3">→</span> Recycling recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
