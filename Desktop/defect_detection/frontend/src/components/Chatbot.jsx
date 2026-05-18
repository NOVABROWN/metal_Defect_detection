import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Loader2, Upload, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Chatbot = ({ contextData = null, initialMessage = null }) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hello! I'm your AI Industrial Assistant. I can help with defect analysis, recycling recommendations, or search through our industrial knowledge base. How can I assist you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = useRef(`session_${Date.now()}`);
  const hasSentInitial = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send initialMessage if provided (e.g. from suggested queries)
  useEffect(() => {
    if (initialMessage && !hasSentInitial.current) {
      hasSentInitial.current = true;
      setInput(initialMessage);
      setTimeout(() => {
        document.getElementById('chatbot-form')?.requestSubmit();
      }, 100);
    }
  }, [initialMessage]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to UI
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Assuming ai-service is running on port 8000
      const response = await axios.post('http://127.0.0.1:8000/api/ai/chat', {
        message: userMessage,
        session_id: sessionId.current,
        context_data: contextData
      });

      if (response.data.success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '_ai',
          role: 'ai',
          content: response.data.data.response
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_err',
        role: 'ai',
        content: "Sorry, I encountered an error connecting to the AI service. Please make sure the service is running.",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-zinc-700">
      {/* Header */}
      <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex items-center gap-3">
        <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
          <Bot className="text-amber-400 w-7 h-7" />
        </div>
        <div>
          <h3 className="text-zinc-100 font-semibold text-lg tracking-wide uppercase">AI Industrial Assistant</h3>
          <p className="text-amber-400/80 text-xs font-mono">POWERED BY GROQ LLAMA-3 & RAG SYSTEM</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0 mt-1">
                {msg.role === 'user' ? (
                  <div className="bg-amber-500 rounded-lg p-2 border border-amber-600 shadow-sm">
                    <User className="w-5 h-5 text-zinc-900" />
                  </div>
                ) : (
                  <div className={`rounded-lg p-2 border ${msg.isError ? 'bg-red-900/50 border-red-700' : 'bg-zinc-800 border-zinc-700'}`}>
                    {msg.isError ? <AlertCircle className="w-5 h-5 text-red-400" /> : <Bot className="w-5 h-5 text-amber-400" />}
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={`p-4 rounded-xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-amber-500 text-zinc-900 rounded-tr-none font-medium' 
                  : msg.isError 
                    ? 'bg-red-950/30 text-red-200 rounded-tl-none border border-red-900/50'
                    : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className={`prose prose-invert prose-sm max-w-none ${msg.role === 'user' ? 'prose-zinc text-zinc-900' : 'prose-amber'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0 mt-1">
                <div className="bg-zinc-800 rounded-lg p-2 border border-zinc-700">
                  <Bot className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/80 rounded-tl-none border border-zinc-700/80 flex items-center gap-3 text-amber-500/80">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-mono tracking-widest uppercase">Processing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-800 border-t border-zinc-700">
        <form id="chatbot-form" onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your industrial query here..."
            className="flex-1 bg-zinc-900 text-zinc-100 border border-zinc-600 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors shadow-inner font-mono text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-amber-600 hover:bg-amber-500 text-zinc-900 font-bold p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
