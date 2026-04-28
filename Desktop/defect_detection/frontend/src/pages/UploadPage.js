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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Upload Image for Defect Detection</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDragDrop}
            className="border-4 border-dashed border-blue-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition mb-8"
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded-lg" />
                  <p className="text-sm text-gray-500">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-2xl">📁</p>
                  <p className="text-lg font-semibold text-gray-700">Drag and drop your image here</p>
                  <p className="text-gray-500">or click to select from your computer</p>
                  <p className="text-sm text-gray-400">Supported formats: JPG, PNG, GIF, WEBP</p>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white transition ${
              loading || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Detecting Defects...' : 'Analyze Image'}
          </button>
        </form>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg text-blue-900 mb-4">📸 Image Requirements</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Minimum 224x224 pixels</li>
              <li>✓ Clear, well-lit image</li>
              <li>✓ Maximum 50MB file size</li>
              <li>✓ Supported formats: JPG, PNG, GIF, WEBP</li>
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg text-green-900 mb-4">⚡ What You'll Get</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✓ Defect type classification</li>
              <li>✓ Confidence score</li>
              <li>✓ Severity assessment</li>
              <li>✓ Recycling recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
