import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, Terminal } from 'lucide-react';

const DEEPSEEK_API_KEY = 'sk-5b3bb21e05ae44da9f0e6ac5446eff1b';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: '你好！我是由 DeepSeek 驱动的 AI 网络助教。我可以帮你解答计算机网络原理、协议分析及 Cisco 配置等问题。', isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), text: inputValue, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的计算机网络助教，擅长解释OSI模型、TCP/IP协议栈、Cisco路由配置以及人工智能在网络中的应用。你的回答应当专业、准确且富有启发性。' },
            { role: 'user', content: inputValue }
          ]
        })
      });

      const data = await response.json();
      const botResponse = data.choices[0].message.content;
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, isBot: true }]);
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: '抱歉，我现在连接 DeepSeek 服务时遇到了点小问题，请稍后再试。', isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Prominent Trigger Button in bottom-right */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 px-6 py-4 bg-indigo-600 border border-indigo-500 text-white font-black rounded-full shadow-2xl hover:bg-indigo-700 transition-all duration-300 transform ${isOpen ? 'scale-0' : 'scale-100'}`}
        >
          <div className="relative">
            <Bot size={24} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500 border border-white"></span>
            </span>
          </div>
          AI 网络助教
        </button>
      </div>

      {/* Floating Chat Window */}
      <div className={`fixed bottom-6 right-6 h-[600px] max-h-[85vh] w-[380px] bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] z-[100] transform transition-all duration-300 ease-in-out border border-slate-200 flex flex-col ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'} origin-bottom-right`}>
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-sky-500 rounded-t-[2rem] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white shadow-inner">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-black text-white text-lg flex items-center gap-2">
                DeepSeek AI <Sparkles className="text-amber-300" size={16} />
              </h3>
              <p className="text-white/80 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> 智能助教在线
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-2.5 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.isBot ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {msg.isBot ? <Bot size={14} /> : <Terminal size={14} />}
                </div>
                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed font-medium shadow-sm border ${
                  msg.isBot 
                    ? 'bg-white border-slate-200 text-slate-800 rounded-tl-none' 
                    : 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[90%] items-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1 items-center h-10">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 bg-white border-t border-slate-100 rounded-b-[2rem]">
          <form onSubmit={handleSend} className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="问我计网或路由配置问题..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none font-medium text-slate-800"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="absolute bottom-3 right-3 bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90] md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default AIAssistant;