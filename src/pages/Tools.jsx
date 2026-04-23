import React from 'react';
import { ArrowLeft, Monitor, Download, Server, Cpu, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Tools = () => {
  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-16">
      <div className="section-container">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:text-indigo-800 transition-colors">
          <ArrowLeft size={20} /> 返回课程大厅
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 flex justify-center items-center gap-4">
            <Monitor className="text-indigo-600" size={48} />
            网络仿真工具中心
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            掌握主流的网络模拟软件是进行复杂网络设计与协议分析的基础。本中心提供 Cisco 与 华为 两大主流设备的仿真平台指引。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Cisco Packet Tracer Card */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-[100px] z-0 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                <Server size={40} />
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-4">Cisco Packet Tracer</h2>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed h-24">
                思科官方推出的网络仿真与可视化学习工具。支持构建复杂的网络拓扑，直观地观察数据包在网络中每一层的封装与解封装过程，非常适合初学者理解 OSI 模型与 TCP/IP 协议栈。
              </p>
              
              <div className="space-y-4 mb-10">
                <h4 className="font-bold text-slate-900">核心功能：</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Cpu size={16} className="text-sky-500" /> 支持最新 Cisco IOS 设备模拟</li>
                  <li className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Cpu size={16} className="text-sky-500" /> 实时仿真模式（Simulation Mode）</li>
                  <li className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Cpu size={16} className="text-sky-500" /> 物联网 (IoT) 与智能家居设备集成</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 flex justify-center items-center gap-2 bg-sky-600 text-white py-4 rounded-2xl font-bold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200">
                  <Download size={20} /> 获取软件
                </button>
                <a href="/courseware/实验3 --Packet-Tracer-入门.doc" className="flex-1 flex justify-center items-center gap-2 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
                  下载实验指导
                </a>
              </div>
            </div>
          </div>

          {/* Huawei eNSP Card */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[100px] z-0 transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                <ShieldCheck size={40} />
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-4">华为 eNSP</h2>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed h-24">
                Enterprise Network Simulation Platform。华为提供的一款免费的、可扩展的、图形化操作的网络仿真工具平台，完美支持华为企业级路由器、交换机、WLAN等设备的模拟。
              </p>
              
              <div className="space-y-4 mb-10">
                <h4 className="font-bold text-slate-900">核心功能：</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Cpu size={16} className="text-red-500" /> 完美对接真实网络抓包工具 (Wireshark)</li>
                  <li className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Cpu size={16} className="text-red-500" /> 高度拟真的华为 VRP 命令行系统</li>
                  <li className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Cpu size={16} className="text-red-500" /> 支持大型复杂企业网拓扑搭建与测试</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 flex justify-center items-center gap-2 bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                  <Download size={20} /> 获取软件
                </button>
                <button className="flex-1 flex justify-center items-center gap-2 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
                  在线实训手册
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Tools;