import React from 'react';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-16">
        
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
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full uppercase tracking-wider font-black">AI+</span> 
            知识图谱
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
