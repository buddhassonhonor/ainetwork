import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CourseGrid from './components/CourseGrid';
import ResourceNavigator from './components/ResourceNavigator';
import { Network, MessageCircle, Mail, Share2, BarChart2, BookOpen, Users, Clock, Hash, Activity, Zap, Globe, ShieldCheck } from 'lucide-react';
import { studentStats } from './data/courses';

function App() {
  const [activeView, setActiveView] = useState('home');

  return (
    <div className="min-h-screen selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="pt-24">
        {/* Centered Hero Section */}
        <section id="home" className="section-container relative z-10 flex flex-col items-center justify-center text-center min-h-[70vh] pt-16">
          
          {/* Hero Text */}
          <div className="max-w-3xl relative z-10">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-indigo-500 uppercase bg-indigo-50 rounded-full">
              泉州师范学院专属门户
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-5 leading-[1.15] tracking-tight text-slate-900">
              探索核心原理 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">
                计算机网络 + AI
              </span>
            </h1>
            <p className="mb-8 text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
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
      </main>

      <footer className="bg-white border-t border-slate-100 py-24">
        <div className="section-container flex flex-col md:flex-row justify-between gap-16">
          <div className="md:w-1/3">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-600 rounded-xl">
                <Network size={32} className="text-white" />
              </div>
              <span className="text-3xl font-extrabold tracking-tighter text-slate-900">NETCORE</span>
            </div>
            <p className="text-slate-500 text-xl font-bold leading-relaxed">
              泉州师范学院物理与信息工程学院倾力打造，致力于提供最优质的计算机网络与AI结合的学习资源。
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-16">
            <div>
              <h4 className="text-slate-900 text-2xl mb-8 font-black">平台导航</h4>
              <ul className="space-y-6 text-slate-500 text-xl font-bold">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">课程体系</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">实验资源</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">讨论社区</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 text-2xl mb-8 font-black">联系我们</h4>
              <div className="flex gap-6">
                <a href="#" className="p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-400"><MessageCircle size={28} /></a>
                <a href="#" className="p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-400"><Share2 size={28} /></a>
                <a href="#" className="p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-400"><Mail size={28} /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="section-container py-0 mt-20 text-center border-t border-slate-100 pt-12 text-slate-400 text-sm font-black tracking-widest uppercase">
          © 2026 泉州师范学院物信学院计算机网络教研组. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}

export default App;
