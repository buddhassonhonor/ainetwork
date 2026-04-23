import React from 'react';
import { motion } from 'framer-motion';
import { Network, Search, Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass"
    >
      <div className="flex items-center gap-2">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <Network size={24} color="white" />
        </div>
        <span className="text-xl font-extrabold tracking-tighter text-white">NETCORE</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#home" className="hover:text-white transition-colors">首页</a>
        <a href="#courses" className="hover:text-white transition-colors">课程发现</a>
        <a href="#resources" className="hover:text-white transition-colors">学习资源</a>
        <a href="#tools" className="hover:text-white transition-colors">仿真工具</a>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <Search size={20} />
        </button>
        <button className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
          立即登录
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
