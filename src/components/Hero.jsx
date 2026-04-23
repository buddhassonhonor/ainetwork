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
          <h1 className="text-6xl md:text-8xl font-extrabold mb-10 leading-tight tracking-tighter">
            探索核心原理 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500">
              计算机网络 + AI
            </span>
          </h1>
          <p className="max-w-3xl mx-auto mb-12 text-xl md:text-2xl text-slate-500 font-semibold leading-relaxed">
            由泉州师范学院物信学院黄志高及专家团队倾力打造。汇集最前沿的网络技术与人工智能结合应用，从底层协议到AI赋能的网络架构。
          </p>
          

        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
    </section>
  );
};

export default Hero;
