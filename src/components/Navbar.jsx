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
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Network size={22} color="white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">NETCORE</span>
        </Link>

        {/* Nav Links - centered */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-lg font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200">首页</Link>
          <a href="/#courses" className="text-lg font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200">教学团队</a>
          <a href="/#resources" className="text-lg font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200">学习资源</a>
          <Link to="/tools" className="text-lg font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200">仿真工具</Link>
          <Link to="/knowledge-graph" className="text-lg font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200 flex items-center gap-1.5">
            <span className="text-indigo-600 font-black">AI+</span>知识图谱
          </Link>
          <Link to="/dashboard" className="text-lg font-bold text-slate-800 hover:text-indigo-600 transition-colors duration-200 flex items-center gap-1">
            学业诊断
          </Link>
        </div>

        {/* Spacer to balance logo */}
        <div className="w-24" />
      </div>
    </motion.nav>
  );
};

export default Navbar;
