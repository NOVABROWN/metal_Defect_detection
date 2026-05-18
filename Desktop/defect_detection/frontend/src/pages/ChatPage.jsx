import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import { MessageSquare, Cpu, RefreshCw, ShieldCheck, Wrench, Recycle, BarChart2 } from 'lucide-react';

const SUGGESTED_QUERIES = [
  { icon: <Cpu className="w-4 h-4" />, text: "Why was my metal classified as defective?" },
  { icon: <Wrench className="w-4 h-4" />, text: "How to repair surface cracks in steel?" },
  { icon: <Recycle className="w-4 h-4" />, text: "What recycling method is suitable for aluminum?" },
  { icon: <ShieldCheck className="w-4 h-4" />, text: "Industrial safety guidelines for metal inspection?" },
  { icon: <BarChart2 className="w-4 h-4" />, text: "How can factory waste be reduced?" },
  { icon: <RefreshCw className="w-4 h-4" />, text: "What causes corrosion defects in metals?" },
];

const ChatPage = () => {
  const location = useLocation();
  const [chatKey, setChatKey] = useState(0);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [contextData, setContextData] = useState(null);

  useEffect(() => {
    if (location.state?.prediction) {
      setContextData({ prediction: location.state.prediction });
      setSelectedSuggestion("Why was this metal classified as defective?");
      setChatKey(k => k + 1);
    }
  }, [location.state]);

  const handleSuggestionClick = (text) => {
    // Pass suggestion text to Chatbot via key reset and prop
    setSelectedSuggestion(text);
    setChatKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 bg-cyan-900/30 border border-cyan-800 rounded-full px-5 py-2 mb-5">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-cyan-300 text-sm font-medium">AI Industrial Assistant — Online</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">
            AI Chatbot
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Ask anything about metal defects, repair methods, sustainability, or industrial best practices.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar — Suggestions */}
          <div className="xl:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-6">
              <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="text-cyan-400 w-5 h-5" />
                <h2 className="text-slate-200 font-semibold">Suggested Queries</h2>
              </div>
              <div className="space-y-2">
                {SUGGESTED_QUERIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(q.text)}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-700 text-slate-300 hover:text-slate-100 text-sm transition-all duration-200"
                  >
                    <span className="text-cyan-400 mt-0.5 flex-shrink-0">{q.icon}</span>
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>

              {/* Tips Box */}
              <div className="mt-6 bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <h3 className="text-slate-300 font-medium text-sm mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Tips
                </h3>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li>• Upload PDFs in Knowledge Base to extend AI knowledge.</li>
                  <li>• The AI uses your detection results as context automatically.</li>
                  <li>• Ask follow-up questions for deeper analysis.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="xl:col-span-3">
            <Chatbot
              key={chatKey}
              initialMessage={selectedSuggestion}
              contextData={contextData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
