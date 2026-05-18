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
    <div className="min-h-screen bg-zinc-950 py-12 font-sans">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fadeIn flex flex-col items-center justify-center">
            <div className="bg-amber-500/10 p-4 rounded-full border border-amber-500/20 mb-6">
              <span className="text-5xl">📷</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-zinc-100 mb-4 tracking-tight uppercase">
              Upload Inspection Image
            </h1>
            <p className="text-lg text-zinc-400 max-w-xl mx-auto font-mono text-sm">
              Initialize AI-powered defect analysis by uploading a high-resolution surface scan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Background Scanner Line Effect */}
            {loading && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-[scan_2s_ease-in-out_infinite] blur-sm"></div>}

            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragDrop}
              className={`border-2 border-dashed ${file ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-700 hover:border-amber-500 hover:bg-zinc-800/50'} rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-8 relative group`}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer block relative z-10">
                {preview ? (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="relative inline-block">
                      <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded-xl shadow-2xl ring-4 ring-zinc-800" />
                      {/* Scanning overlay effect */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 animate-[pulse_2s_infinite]"></div>
                    </div>
                    <p className="text-sm text-amber-500 font-mono tracking-widest uppercase">✏️ Click to re-scan</p>
                  </div>
                ) : (
                  <div className="space-y-4 py-8">
                    <div className="text-6xl animate-bounce">📥</div>
                    <p className="text-2xl font-bold text-zinc-100">Drag and drop scan data here</p>
                    <p className="text-zinc-500 font-mono text-sm">or click to browse local drives</p>
                    <div className="inline-block mt-4 px-3 py-1 bg-zinc-800 rounded text-xs font-mono text-zinc-400 border border-zinc-700">
                      SUPPORTED: JPG, PNG, WEBP
                    </div>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="bg-red-950/50 border-l-4 border-red-500 text-red-200 px-6 py-4 rounded-r-lg mb-8 animate-fadeIn font-mono text-sm">
                <p className="font-semibold flex items-center gap-2"><span>⚠️</span> {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform tracking-widest uppercase ${
                loading || !file
                  ? 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center font-mono text-sm">
                  <div className="w-5 h-5 border-2 border-zinc-500 border-t-amber-500 rounded-full animate-spin mr-3"></div>
                  INITIATING ANALYSIS...
                </span>
              ) : (
                '⚡ Run Diagnostics'
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-amber-500/30 transition-colors">
              <h3 className="font-bold text-xl text-zinc-100 mb-6 flex items-center uppercase tracking-wider font-mono text-sm">
                <span className="text-2xl mr-3 text-amber-500">⚙️</span> Calibration Requirements
              </h3>
              <ul className="text-zinc-400 space-y-4 font-mono text-sm">
                <li className="flex items-center"><span className="text-amber-500 mr-3">✓</span> Min Resolution: 224x224 px</li>
                <li className="flex items-center"><span className="text-amber-500 mr-3">✓</span> Clear, well-lit surface</li>
                <li className="flex items-center"><span className="text-amber-500 mr-3">✓</span> Max File Size: 50MB</li>
                <li className="flex items-center"><span className="text-amber-500 mr-3">✓</span> Formats: JPG, PNG, WEBP</li>
              </ul>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-colors">
              <h3 className="font-bold text-xl text-zinc-100 mb-6 flex items-center uppercase tracking-wider font-mono text-sm">
                <span className="text-2xl mr-3 text-emerald-500">📊</span> Output Data
              </h3>
              <ul className="text-zinc-400 space-y-4 font-mono text-sm">
                <li className="flex items-center"><span className="text-emerald-500 mr-3">→</span> Defect classification</li>
                <li className="flex items-center"><span className="text-emerald-500 mr-3">→</span> Confidence probability</li>
                <li className="flex items-center"><span className="text-emerald-500 mr-3">→</span> Severity index</li>
                <li className="flex items-center"><span className="text-emerald-500 mr-3">→</span> Remediation protocol</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
