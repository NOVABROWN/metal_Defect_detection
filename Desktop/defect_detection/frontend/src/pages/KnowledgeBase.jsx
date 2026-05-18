import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, Database, BookOpen } from 'lucide-react';

const KnowledgeBase = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileUpload = async (files) => {
    const allowedTypes = ['.pdf', '.txt', '.docx', '.csv'];
    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(ext)) {
        showNotification(`File type ${ext} not supported. Use PDF, TXT, DOCX, or CSV.`, 'error');
        return;
      }
    }

    setUploading(true);
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await axios.post('http://127.0.0.1:8000/api/ai/upload-docs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.success) {
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            chunks: res.data.data.chunks_added,
            status: 'indexed'
          }]);
          showNotification(`"${file.name}" indexed successfully with ${res.data.data.chunks_added} chunks.`);
        }
      } catch (err) {
        showNotification(`Failed to upload "${file.name}": ${err.message}`, 'error');
        setUploadedFiles(prev => [...prev, { name: file.name, status: 'error' }]);
      }
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto relative">
        {/* Mascot */}
        <div className="hidden lg:block absolute -top-10 -right-10 animate-[bounce_5s_ease-in-out_infinite] opacity-50 hover:opacity-100 transition-opacity">
          <img src="/mascot.png" alt="Mascot" className="w-32 h-32 object-contain" />
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Database className="text-amber-500 w-8 h-8" />
            <h1 className="text-4xl font-black text-zinc-100 uppercase tracking-tight">
              Industrial <span className="text-amber-500">Knowledge Base</span>
            </h1>
          </div>
          <p className="text-zinc-400 ml-11 font-mono text-sm tracking-widest uppercase">
            Upload schematics and manuals to power the RAG AI.
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 flex items-center gap-3 p-4 rounded-xl border ${
            notification.type === 'error'
              ? 'bg-red-900/40 border-red-700 text-red-200'
              : 'bg-emerald-900/40 border-emerald-700 text-emerald-200'
          }`}>
            {notification.type === 'error'
              ? <AlertCircle className="w-5 h-5 flex-shrink-0" />
              : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm">{notification.message}</span>
          </div>
        )}

        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer mb-8 relative overflow-hidden ${
            dragOver ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-700 bg-zinc-900/50 hover:border-amber-500/50 hover:bg-zinc-900'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          {uploading && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-[scan_2s_ease-in-out_infinite] blur-sm"></div>}
          
          <input
            id="fileInput"
            type="file"
            multiple
            accept=".pdf,.txt,.docx,.csv"
            className="hidden"
            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-4 text-amber-500">
              <Loader2 className="w-14 h-14 animate-spin" />
              <p className="font-mono text-sm tracking-widest uppercase">Processing & Indexing...</p>
            </div>
          ) : (
            <>
              <Upload className="w-14 h-14 text-zinc-500 mx-auto mb-4 animate-bounce" />
              <p className="text-zinc-100 text-lg font-bold mb-1 tracking-wider uppercase">Drop documents here or click to browse</p>
              <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Supports PDF, DOCX, TXT, CSV</p>
            </>
          )}
        </div>

        {/* Supported Formats Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3 shadow-lg">
            <div className="bg-red-900/50 border border-red-700 text-red-400 text-xs font-mono font-bold px-2 py-1 rounded tracking-widest">PDF</div>
            <span className="text-zinc-400 text-xs font-mono uppercase">Manuals</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3 shadow-lg">
            <div className="bg-amber-900/50 border border-amber-700 text-amber-400 text-xs font-mono font-bold px-2 py-1 rounded tracking-widest">DOCX</div>
            <span className="text-zinc-400 text-xs font-mono uppercase">SOPs</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3 shadow-lg">
            <div className="bg-emerald-900/50 border border-emerald-700 text-emerald-400 text-xs font-mono font-bold px-2 py-1 rounded tracking-widest">TXT</div>
            <span className="text-zinc-400 text-xs font-mono uppercase">Logs</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3 shadow-lg">
            <div className="bg-cyan-900/50 border border-cyan-700 text-cyan-400 text-xs font-mono font-bold px-2 py-1 rounded tracking-widest">CSV</div>
            <span className="text-zinc-400 text-xs font-mono uppercase">Data</span>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
              <BookOpen className="text-amber-500 w-5 h-5" />
              <h2 className="text-zinc-100 font-bold uppercase tracking-wider font-mono text-sm">Indexed Documents ({uploadedFiles.length})</h2>
            </div>
            <ul className="divide-y divide-zinc-800">
              {uploadedFiles.map((f, i) => (
                <li key={i} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-amber-500/70" />
                    <div>
                      <p className="text-zinc-200 text-sm font-bold font-mono tracking-wider">{f.name}</p>
                      <p className="text-zinc-500 font-mono text-xs mt-1 uppercase tracking-widest">{f.size} {f.chunks && `· ${f.chunks} chunks`}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold font-mono tracking-widest uppercase px-3 py-1 rounded ${
                    f.status === 'indexed'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {f.status === 'indexed' ? '✓ Indexed' : '✗ Failed'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
