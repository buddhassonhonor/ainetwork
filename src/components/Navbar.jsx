import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Network } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true); // scrolling down & passed header
    } else {
      setHidden(false); // scrolling up
    }
    
    setIsScrolled(latest > 20);
  });

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-md border-b border-slate-200' : 'bg-white/50 backdrop-blur-sm border-transparent'
      }`}
    >
      <div className={`max-w-7xl mx-auto px-8 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="p-2.5 bg-indigo-600 rounded-xl">
            <Network size={28} color="white" />
          </div>
          <span className="text-3xl font-black tracking-tighter text-slate-900">NETCORE</span>
        </Link>

        {/* Nav Links - centered */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200 uppercase no-underline">首页</Link>
          <a href="/#courses" className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200 uppercase no-underline">教学团队</a>
          <a href="/#resources" className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200 uppercase no-underline">学习资源</a>
          <Link to="/tools" className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200 uppercase no-underline">仿真工具</Link>
          <Link to="/knowledge-graph" className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200 flex items-center gap-1.5 uppercase no-underline">
            <span className="text-indigo-600 font-black">AI+</span>知识图谱
          </Link>
          <Link to="/dashboard" className="text-xl font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200 flex items-center gap-1 uppercase no-underline">
            学业诊断
          </Link>
        </div>

        {/* Right Actions - AI Assistant Entry */}
        <div className="hidden md:flex items-center gap-4 w-48 justify-end">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-assistant'))}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100"
          >
            <div className="relative">
              <div className="w-2 h-2 bg-sky-400 rounded-full absolute -top-0.5 -right-0.5 animate-ping opacity-75"></div>
              <div className="w-2 h-2 bg-sky-500 rounded-full absolute -top-0.5 -right-0.5"></div>
              <span className="text-lg">🤖</span>
            </div>
            <span>AI 助教</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
