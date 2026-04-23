import React from 'react';
import Hero from '../components/Hero';
import CourseGrid from '../components/CourseGrid';
import ResourceNavigator from '../components/ResourceNavigator';

const Home = () => {
  return (
    <>
      {/* Centered Hero Section */}
      <section id="home" className="section-container relative z-10 flex flex-col items-center justify-center text-center min-h-[70vh] pt-16">
        
        {/* Hero Text */}
        <div className="max-w-5xl relative z-10">
          <span className="inline-block px-6 py-2 mb-8 text-sm font-black tracking-[0.2em] text-indigo-600 uppercase bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm">
            泉州师范学院专属门户
          </span>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.05] tracking-tighter text-slate-900">
            探索核心原理 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-400">
              计算机网络 + AI
            </span>
          </h1>
          <p className="mb-12 text-xl md:text-2xl text-slate-500 font-bold leading-relaxed max-w-3xl mx-auto">
            由物信学院黄志高及专家团队倾力打造。汇集最前沿的网络技术与人工智能结合应用，从底层协议到AI赋能的未来网络架构。
          </p>
        </div>
        
        {/* Background Decor */}
        <div className="glow top-1/4 left-1/4"></div>
        <div className="glow bottom-1/4 right-1/4" style={{ background: 'rgba(168, 85, 247, 0.4)' }}></div>
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </section>

      <CourseGrid />
      <ResourceNavigator />

      {/* Call to Action */}
      <section className="section-container">
        <div className="relative glass p-12 md:p-24 rounded-[3rem] overflow-hidden text-center bg-gradient-to-r from-slate-50 to-indigo-50">
          <div className="glow top-0 left-1/2 -translate-x-1/2"></div>
          <h2 className="text-5xl md:text-7xl mb-8 leading-tight font-extrabold text-slate-900">开启你的 <br />智能网络之旅</h2>
          <p className="max-w-2xl mx-auto mb-10 text-slate-500 text-2xl font-bold leading-relaxed">
            加入泉州师范学院计算机网络与人工智能前沿学习社区，获取黄志高团队的最新实验手册和专家指导。
          </p>
          <button className="px-12 py-6 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 text-2xl">
            立即注册个人账号
          </button>
        </div>
      </section>
    </>
  );
};

export default Home;