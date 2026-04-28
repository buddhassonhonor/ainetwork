import React, { useState } from 'react';
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
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen selection:bg-indigo-500 selection:text-white">
        <Navbar isAIOpen={isAIOpen} setIsAIOpen={setIsAIOpen} />
        
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
        <AIAssistant isOpen={isAIOpen} setIsOpen={setIsAIOpen} />

        <footer className="bg-white border-t border-slate-100 pt-12 pb-8">
          <div className="section-container">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <p className="text-slate-500 text-sm font-bold">
                福建省泉州市丰泽区东海大街 · 泉州师范学院物理与信息工程学院
              </p>
              <div className="flex gap-3">
                <a href="#" className="p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-400 border border-slate-100"><MessageCircle size={18} /></a>
                <a href="#" className="p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-400 border border-slate-100"><Share2 size={18} /></a>
                <a href="#" className="p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-400 border border-slate-100"><Mail size={18} /></a>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-xs font-bold">© 2026 泉州师范学院物信学院计算机网络教研组</p>
              <p className="text-slate-300 text-xs font-bold tracking-wider">AI+计算机网络 教学改革项目</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;