import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, Terminal } from 'lucide-react';

const DEEPSEEK_API_KEY = 'sk-5b3bb21e05ae44da9f0e6ac5446eff1b';

const AIAssistant = ({ isOpen, setIsOpen }) => {
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
      {/* Floating Trigger Button Removed */}

      {/* Floating Chat Window */}
      <div style={{
        position: 'fixed', top: '5.5rem', right: '2rem',
        height: '700px', maxHeight: 'calc(100vh - 7rem)', width: '450px',
        background: 'white', borderRadius: '2rem',
        boxShadow: '0 20px 50px -12px rgba(0,0,0,0.25)',
        zIndex: 100,
        border: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        transformOrigin: 'top right',
        transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-20px)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease'
      }}>
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-sky-500 rounded-t-[2rem] text-white">
          <div className="flex items-center gap-3">
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
        <div style={{ flex: 1, overflowY: 'scroll', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-2.5 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
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
          
          {messages.length === 1 && (
            <div className="grid grid-cols-1 gap-2 mt-4">
              {[
                '解释一下 OSI 七层模型',
                '如何配置 Cisco 静态路由？',
                '什么是 AI 智能路由优化？',
                'TCP 与 UDP 的主要区别'
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(q);
                  }}
                  className="text-left p-3 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[90%] items-center">
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
          <form onSubmit={handleSend} style={{ position: 'relative' }}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="有问题，尽管问..."
              rows={3}
              style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '1.25rem', padding: '1rem 3.5rem 1rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, color: '#1e293b', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
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
              style={{
                position: 'absolute', bottom: '0.6rem', right: '0.6rem',
                width: '2.25rem', height: '2.25rem',
                background: !inputValue.trim() || isTyping ? '#cbd5e1' : 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                color: 'white', border: 'none', cursor: !inputValue.trim() || isTyping ? 'not-allowed' : 'pointer',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(79,70,229,0.3)', transition: 'all 0.2s ease'
              }}
            >
              <Send size={15} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      </div>

      {/* Backdrop — click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[90]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AIAssistant;