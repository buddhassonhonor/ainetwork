import React from 'react';
import { FileText, Download, File, Server, LayoutTemplate } from 'lucide-react';

const resourcesData = [
  { id: 1, title: 'CH1-5ed 概述', type: 'pptx', url: '/courseware/CH1-5ed 概述.pptx', category: '基础认知模块' },
  { id: 2, title: 'CH2-5ed 物理层', type: 'pptx', url: '/courseware/CH2-5ed 物理层.pptx', category: '基础认知模块' },
  { id: 3, title: 'CH3-5ed 数据链路层', type: 'pptx', url: '/courseware/CH3-5ed 数据链路层.pptx', category: '基础认知模块' },
  { id: 4, title: 'CH4-5ed 网络层', type: 'pptx', url: '/courseware/CH4-5ed 网络层.pptx', category: '专业融合模块' },
  { id: 5, title: 'CH5-5ed 运输层', type: 'pptx', url: '/courseware/CH5-5ed 运输层.pptx', category: '专业融合模块' },
  { id: 6, title: 'CH6-5ed 应用层', type: 'pptx', url: '/courseware/CH6-5ed 应用层.pptx', category: '专业融合模块' },
  { id: 7, title: '实验1 网线的制作', type: 'docx', url: '/courseware/实验1 网线的制作.docx', category: '实践创新模块' },
  { id: 8, title: '实验3 --Packet-Tracer-入门', type: 'doc', url: '/courseware/实验3 --Packet-Tracer-入门.doc', category: '实践创新模块' },
];

const CourseResources = () => {
  const getIcon = (type) => {
    switch(type) {
      case 'pptx': return <LayoutTemplate className="text-orange-500" />;
      case 'docx':
      case 'doc': return <FileText className="text-blue-500" />;
      default: return <File className="text-slate-500" />;
    }
  };

  const categories = [...new Set(resourcesData.map(r => r.category))];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
        <Server className="text-indigo-600" /> 
        AI+ 课程资源中心
      </h3>
      
      <div className="space-y-8">
        {categories.map(category => (
          <div key={category}>
            <h4 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">
              {category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resourcesData.filter(r => r.category === category).map(resource => (
                <div key={resource.id} className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-2xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                      {getIcon(resource.type)}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
                        {resource.title}
                      </h5>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {resource.type}
                      </span>
                    </div>
                  </div>
                  <a 
                    href={resource.url} 
                    download
                    className="p-3 bg-white rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm"
                    title="下载资源"
                  >
                    <Download size={20} />
                  </a>
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