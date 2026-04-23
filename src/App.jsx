import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Dashboard from './pages/Dashboard';
import Tools from './pages/Tools';
import AIAssistant from './components/AIAssistant';
import { Network, MessageCircle, Mail, Share2 } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen selection:bg-indigo-500 selection:text-white">
        <Navbar />
        
        <main className="pt-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tools" element={<Tools />} />
          </Routes>
        </main>

        {/* Global AI Assistant */}
        <AIAssistant />

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
                  <li><a href="/knowledge-graph" className="hover:text-indigo-600 transition-colors">AI知识图谱</a></li>
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
    </Router>
  );
}

export default App;