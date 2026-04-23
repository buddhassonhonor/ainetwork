import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="glow top-1/4 left-1/4"></div>
      <div className="glow bottom-1/4 right-1/4" style={{ background: 'rgba(168, 85, 247, 0.4)' }}></div>
      
      <div className="section-container text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-indigo-400 uppercase glass rounded-full">
            辅助学习课程资源门户
          </span>
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight">
            从比特到 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              全球互联
            </span>
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-lg md:text-xl text-slate-400 font-medium">
            探索计算机网络的奥秘。汇集智慧树及各大名校精品资源，助你构建坚实的网络技术底座，从协议分析到实战仿真。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/25 group">
              开始探索 <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
              <Play size={20} className="fill-white" /> 观看导论
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
    </section>
  );
};

export default Hero;
