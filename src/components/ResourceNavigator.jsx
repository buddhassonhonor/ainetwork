import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resources } from '../data/courses';
import { FileText, Video, Link as LinkIcon, Download, Box, Presentation, Globe } from 'lucide-react';

const ResourceNavigator = () => {
  const [activeTab, setActiveTab] = useState(resources[0].category);

  return (
    <section id="resources" className="section-container bg-white/[0.02]">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl mb-6 font-extrabold">学习资源中心</h2>
        <p className="text-slate-500 text-2xl font-medium">来自泉州师范学院教研组的精品课件与实验手册</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/3">
          <div className="sticky top-32 flex flex-col gap-4">
            {resources.map((res) => (
              <button
                key={res.category}
                onClick={() => setActiveTab(res.category)}
                className={`flex items-center justify-between p-6 rounded-[2rem] transition-all font-extrabold text-xl text-left ${
                  activeTab === res.category 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' 
                    : 'bg-white text-slate-500 border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {res.category}
                <Box size={24} className={activeTab === res.category ? 'opacity-100' : 'opacity-20'} />
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
              className="grid gap-6"
            >
              {resources.find(r => r.category === activeTab).items.map((item, idx) => (
                <div key={idx} className="group flex items-center justify-between p-8 glass rounded-[2.5rem] hover:bg-indigo-50/30 transition-all border border-transparent hover:border-indigo-100">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                      {['PPTX', 'PPT'].includes(item.type) && <Presentation size={32} />}
                      {['DOCX', 'DOC', 'PDF', 'Article', 'Manual', 'Guide', 'Markdown', 'Cheat Sheet'].includes(item.type) && <FileText size={32} />}
                      {item.type === 'Video' && <Video size={32} />}
                      {item.type === 'GitHub' && <Globe size={32} />}
                      {item.type === 'Software' && <Box size={32} />}
                      {!['PPTX', 'PPT', 'DOCX', 'DOC', 'PDF', 'Article', 'Manual', 'Guide', 'Markdown', 'Cheat Sheet', 'Video', 'GitHub', 'Software'].includes(item.type) && <Globe size={32} />}
                    </div>
                    <div>
                      <h4 className="text-2xl font-extrabold mb-2 text-slate-800">{item.title}</h4>
                      <div className="flex gap-2">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-100 px-3 py-1 rounded-full">
                          {item.type}
                        </span>
                        {item.link.startsWith('/') && (
                          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
                            本地资源
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                    title={item.link.startsWith('/') ? "点击下载/打开" : "访问链接"}
                  >
                    {item.link.startsWith('/') ? <Download size={24} /> : <LinkIcon size={24} />}
                  </a>
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
