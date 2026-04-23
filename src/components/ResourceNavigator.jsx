import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resources } from '../data/courses';
import { FileText, Video, Link as LinkIcon, Download, Box } from 'lucide-react';

const ResourceNavigator = () => {
  const [activeTab, setActiveTab] = useState(resources[0].category);

  return (
    <section id="resources" className="section-container bg-white/[0.02]">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl mb-4">学习资源中心</h2>
        <p className="text-slate-400 text-lg">全方位的学习资料，覆盖从理论到实践的每一个环节</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/3">
          <div className="sticky top-24 flex flex-col gap-2">
            {resources.map((res) => (
              <button
                key={res.category}
                onClick={() => setActiveTab(res.category)}
                className={`flex items-center justify-between p-5 rounded-2xl transition-all font-bold text-left ${
                  activeTab === res.category 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {res.category}
                <Box size={18} className={activeTab === res.category ? 'opacity-100' : 'opacity-20'} />
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
              className="grid gap-4"
            >
              {resources.find(r => r.category === activeTab).items.map((item, idx) => (
                <div key={idx} className="group flex items-center justify-between p-6 glass rounded-2xl hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                      {item.type === 'PDF' && <FileText size={24} />}
                      {item.type === 'Video' && <Video size={24} />}
                      {['Article', 'Guide', 'Markdown', 'Cheat Sheet'].includes(item.type) && <FileText size={24} />}
                      {item.type === 'Software' && <Box size={24} />}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-tighter bg-indigo-500/10 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <button className="p-3 bg-white/5 rounded-full hover:bg-indigo-600 hover:text-white transition-all">
                    <Download size={20} />
                  </button>
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
