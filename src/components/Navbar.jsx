import React from 'react';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';

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
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Network size={22} color="white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">NETCORE</span>
        </div>

        {/* Nav Links - centered */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { name: '首页', href: '#home' },
            { name: '名师团队', href: '#courses' },
            { name: '学习资源', href: '#resources' },
            { name: '仿真工具', href: '#tools' },
          ].map((link) => (
            <a
              key={link.name}
              href={link.href}
              style={{ textDecoration: 'none' }}
              className="text-base font-semibold text-slate-600 hover:text-indigo-600 transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Spacer to balance logo */}
        <div className="w-24" />
      </div>
    </motion.nav>
  );
};

export default Navbar;
