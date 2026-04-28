import React from 'react';
import { FileText, Download, File, Server, LayoutTemplate, FolderOpen, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';
import { resources } from '../data/courses';

const CourseResources = () => {
  const getIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'pptx': 
      case 'ppt': return <LayoutTemplate className="text-orange-500 w-6 h-6" />;
      case 'docx':
      case 'doc': return <FileText className="text-blue-500 w-6 h-6" />;
      case 'pdf': return <BookOpen className="text-red-500 w-6 h-6" />;
      default: return <File className="text-slate-500 w-6 h-6" />;
    }
  };

  const getCategoryIcon = (categoryName) => {
    if (categoryName.includes('课件')) return <PlayCircle className="text-orange-500 w-5 h-5" />;
    if (categoryName.includes('实验')) return <Server className="text-emerald-500 w-5 h-5" />;
    return <FolderOpen className="text-indigo-500 w-5 h-5" />;
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          <Server className="text-indigo-600" /> 
          全景化课程资源库
        </h3>
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">
          实时同步更新
        </span>
      </div>
      
      <div className="space-y-10">
        {resources.map((category, idx) => (
          <div key={idx} className="relative">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                {getCategoryIcon(category.category)}
              </div>
              <h4 className="text-xl font-bold text-slate-800">
                {category.category}
              </h4>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent ml-4"></div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {category.items.map(resource => (
                <div 
                  key={resource.id} 
                  className="group relative flex flex-col justify-between p-5 bg-white hover:bg-slate-50 border border-slate-100/80 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none"></div>
                  
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-slate-50 group-hover:bg-white rounded-xl shadow-sm border border-slate-100/50 transition-colors">
                        {getIcon(resource.type)}
                      </div>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100/50 px-2.5 py-1 rounded-md uppercase tracking-widest">
                        {resource.type}
                      </span>
                    </div>
                    
                    <h5 className="font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {resource.title}
                    </h5>
                    
                    {resource.desc && (
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {resource.desc}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                    <a 
                      href={resource.link}
                      download
                      className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all duration-300 w-full group/btn shadow-sm"
                    >
                      <Download size={16} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                      <span>获取资源</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseResources;