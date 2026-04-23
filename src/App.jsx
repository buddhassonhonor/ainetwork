import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CourseGrid from './components/CourseGrid';
import ResourceNavigator from './components/ResourceNavigator';
import { Network, Github, Mail, Twitter } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen selection:bg-indigo-500 selection:text-white">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Statistics Section */}
        <div className="section-container pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 glass p-10 rounded-[2rem]">
            {[
              { label: '在线课程', value: '50+' },
              { label: '学习资源', value: '1.2k' },
              { label: '活跃学生', value: '150k' },
              { label: '覆盖协议', value: '200+' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-indigo-400 mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <CourseGrid />
        <ResourceNavigator />

        {/* Call to Action */}
        <section className="section-container">
          <div className="relative glass p-12 md:p-24 rounded-[3rem] overflow-hidden text-center">
            <div className="glow top-0 left-1/2 -translate-x-1/2"></div>
            <h2 className="text-4xl md:text-6xl mb-8 leading-tight">准备好深入 <br />网络世界了吗？</h2>
            <p className="max-w-xl mx-auto mb-10 text-slate-400 text-lg">
              加入我们的学习社区，获取最新的实验手册和专家指导，开启你的网络工程师之旅。
            </p>
            <button className="px-10 py-5 bg-white text-black font-bold rounded-2xl hover:bg-slate-200 transition-all shadow-2xl shadow-white/10">
              免费注册账号
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-black/50 border-t border-white/5 py-20">
        <div className="section-container flex flex-col md:flex-row justify-between gap-12">
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-6">
              <Network size={28} className="text-indigo-500" />
              <span className="text-2xl font-extrabold tracking-tighter">NETCORE</span>
            </div>
            <p className="text-slate-500 font-medium">
              致力于提供最优质的计算机网络学习资源，构建开放、深度、互动的学习平台。
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h4 className="text-white mb-6">平台</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-medium">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">课程发现</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">资源中心</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">社区论坛</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white mb-6">联系我们</h4>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-slate-400 hover:text-white"><Github size={20} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-slate-400 hover:text-white"><Twitter size={20} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-slate-400 hover:text-white"><Mail size={20} /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="section-container py-0 mt-20 text-center border-t border-white/5 pt-8 text-slate-600 text-xs font-bold tracking-widest uppercase">
          © 2026 NETCORE LEARNING HUB. POWERED BY AI NETWORK.
        </div>
      </footer>
    </div>
  );
}

export default App;
