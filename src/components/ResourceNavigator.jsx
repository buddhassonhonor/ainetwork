import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resources } from '../data/courses';
import { FileText, Video, Link as LinkIcon, Download, Box, Presentation, Globe, BookOpen } from 'lucide-react';

const ResourceNavigator = () => {
  const [activeTab, setActiveTab] = useState(resources[0].category);

  return (
    <section id="resources" className="section-container bg-slate-50/50 py-24">
      <div className="text-center mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        <h2 className="text-4xl md:text-6xl mb-6 font-black tracking-tight text-slate-900">
          核心<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">资源矩阵</span>
        </h2>
        <p className="text-slate-500 text-xl font-bold max-w-2xl mx-auto">
          整合泉州师范学院教研组一手教学资料，从理论课件到创新实验指导手册，全方位赋能你的网络工程学习。
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
        <div className="lg:w-1/3">
          <div className="sticky top-32 flex flex-col gap-4">
            {resources.map((res) => (
              <button
                key={res.category}
                onClick={() => setActiveTab(res.category)}
                className={`group flex items-center justify-between p-6 rounded-[2rem] transition-all duration-300 font-extrabold text-xl text-left border-2 ${
                  activeTab === res.category 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 border-indigo-600' 
                    : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50'
                }`}
              >
                <span className="relative z-10">{res.category}</span>
                <Box size={24} className={`transition-transform duration-300 ${activeTab === res.category ? 'opacity-100 scale-110' : 'opacity-30 group-hover:opacity-100 group-hover:scale-110 group-hover:text-indigo-500'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6"
            >
              {resources.find(r => r.category === activeTab).items.map((item, idx) => (
                <div key={idx} className="group relative flex items-center justify-between p-8 bg-white rounded-[2.5rem] hover:bg-slate-50 transition-all border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-bl-full"></div>
                  
                  <div className="flex items-start md:items-center gap-6 relative z-10 w-full">
                    <div className="p-5 bg-slate-50 rounded-2xl text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:scale-110 transition-all shadow-sm border border-slate-100/50">
                      {['pptx', 'ppt'].includes(item.type.toLowerCase()) && <Presentation size={32} />}
                      {['docx', 'doc', 'pdf', 'article', 'manual', 'guide', 'markdown', 'cheat sheet'].includes(item.type.toLowerCase()) && <FileText size={32} />}
                      {item.type.toLowerCase() === 'video' && <Video size={32} />}
                      {item.type.toLowerCase() === 'github' && <Globe size={32} />}
                      {item.type.toLowerCase() === 'software' && <Box size={32} />}
                      {!['pptx', 'ppt', 'docx', 'doc', 'pdf', 'article', 'manual', 'guide', 'markdown', 'cheat sheet', 'video', 'github', 'software'].includes(item.type.toLowerCase()) && <BookOpen size={32} />}
                    </div>
                    
                    <div className="flex-1 pr-4">
                      <h4 className="text-2xl font-extrabold mb-2 text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                      {item.desc && (
                        <p className="text-slate-500 font-medium text-sm mb-4 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100/50 px-3 py-1.5 rounded-full">
                          {item.type}
                        </span>
                        {item.link.startsWith('/') && (
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100/50 px-3 py-1.5 rounded-full">
                            本地直链
                          </span>
                        )}
                      </div>
                    </div>

                    <a 
                      href={item.link} 
                      target={item.link.startsWith('/') ? "_self" : "_blank"} 
                      download={item.link.startsWith('/')}
                      rel="noopener noreferrer"
                      className="shrink-0 p-5 bg-white border border-slate-100 text-slate-400 rounded-full hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-600/20 group/btn"
                      title={item.link.startsWith('/') ? "点击下载资源" : "访问外部链接"}
                    >
                      {item.link.startsWith('/') ? <Download size={24} className="group-hover/btn:-translate-y-0.5 transition-transform" /> : <LinkIcon size={24} className="group-hover/btn:rotate-45 transition-transform" />}
                    </a>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ResourceNavigator;
