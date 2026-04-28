import React, { useState } from 'react';
import { ArrowLeft, Download, ExternalLink, CheckCircle2, Sparkles, Zap, Shield, Wifi, Terminal, Eye, Server, Globe, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

const TOOLS = [
  {
    id: 'pt',
    name: 'Cisco Packet Tracer',
    tagline: '思科官方 · 零成本入门首选',
    desc: '全球使用最广泛的网络仿真教学工具，完美覆盖 CCNA 知识点。可视化数据包流转过程，支持路由器、交换机、终端等多种设备仿真，是初学者理解 OSI 模型和 TCP/IP 协议栈的绝佳工具。',
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200',
    shadowColor: 'shadow-sky-500/20',
    features: [
      { icon: <Server size={18}/>, text: '思科全系设备仿真 (Router, Switch, AP)' },
      { icon: <Eye size={18}/>, text: 'Simulation 逐帧封装动画模式' },
      { icon: <Wifi size={18}/>, text: 'IoT 物联网与智能家居场景' },
      { icon: <Terminal size={18}/>, text: '完整 CLI 命令行交互体验' },
      { icon: <Globe size={18}/>, text: '支持多人在线协作组网实验' },
    ],
    downloadUrl: 'https://www.netacad.com/courses/packet-tracer',
    docUrl: '/courseware/experiments/实验3 --Packet-Tracer-入门.doc',
    version: 'v8.2+',
    platform: 'Windows / macOS / Linux',
  },
  {
    id: 'ensp',
    name: '华为 eNSP',
    tagline: '华为认证 · 企业级仿真平台',
    desc: 'Enterprise Network Simulation Platform。华为推出的免费图形化网络模拟器，高度还原华为 VRP 系统命令行，支持路由器(AR)、交换机(S系列)、防火墙(USG)等企业级设备的拓扑搭建与调试。',
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    shadowColor: 'shadow-red-500/20',
    features: [
      { icon: <Shield size={18}/>, text: '华为 AR/S/USG 全系列设备模拟' },
      { icon: <Eye size={18}/>, text: '内置 Wireshark 协议抓包分析' },
      { icon: <Terminal size={18}/>, text: '100% 还原华为 VRP 命令行' },
      { icon: <Zap size={18}/>, text: '大型网络拓扑性能测试' },
      { icon: <Globe size={18}/>, text: '对接 HCIA/HCIP 认证考试' },
    ],
    downloadUrl: 'https://support.huawei.com/enterprise/zh/tool/ensp-TL1000000015',
    docUrl: '#',
    version: 'v1.3.00',
    platform: 'Windows',
  },
  {
    id: 'wireshark',
    name: 'Wireshark',
    tagline: '开源 · 全球第一抓包利器',
    desc: '世界上应用最广泛的开源网络协议分析器。可实时捕获和深度解析网络流量，支持超过 2000 种协议的解码。是网络工程师和安全分析师的必备工具，也是课程实验的核心配套软件。',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    shadowColor: 'shadow-emerald-500/20',
    features: [
      { icon: <Eye size={18}/>, text: '实时捕获与离线分析两种模式' },
      { icon: <Terminal size={18}/>, text: '强大的显示过滤器语法引擎' },
      { icon: <Zap size={18}/>, text: '支持 2000+ 网络协议深度解码' },
      { icon: <Globe size={18}/>, text: 'TCP 流追踪与 HTTP 会话还原' },
      { icon: <Shield size={18}/>, text: '安全审计与异常流量检测' },
    ],
    downloadUrl: 'https://www.wireshark.org/download.html',
    docUrl: 'https://xiaolincoding.com/network/',
    version: 'v4.2+',
    platform: 'Windows / macOS / Linux',
  },
];

const Tools = () => {
  const [activeTool, setActiveTool] = useState('pt');
  const tool = TOOLS.find(t => t.id === activeTool);

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-16 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-20 left-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="section-container relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:text-indigo-800 transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm border border-indigo-50 hover:shadow-md">
          <ArrowLeft size={20}/> 返回主页
        </Link>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 font-black text-sm tracking-wider mb-6">
            <Sparkles size={16}/> 3 大主流平台全覆盖
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            网络仿真<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">工具矩阵</span>
          </h1>
          <p className="text-xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed">
            从思科到华为，从数据包捕获到协议分析，一站汇聚网络工程师必备的核心仿真与诊断工具。
          </p>
        </div>

        {/* Tool Selector Tabs */}
        <div className="flex justify-center gap-6 mb-12">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setActiveTool(t.id)}
              className={`group relative px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 border-2 ${
                activeTool === t.id
                  ? `bg-gradient-to-r ${t.gradient} text-white border-transparent shadow-xl ${t.shadowColor}`
                  : `bg-white ${t.textColor} ${t.borderColor} hover:shadow-lg`
              }`}
            >
              {t.name}
              {activeTool === t.id && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/60 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Active Tool Detail */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          {/* Tool Header Banner */}
          <div className={`bg-gradient-to-r ${tool.gradient} p-10 md:p-14 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-sm"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-4">
                  {tool.tagline}
                </span>
                <h2 className="text-4xl md:text-5xl font-black mb-3">{tool.name}</h2>
                <div className="flex items-center gap-4 text-white/80 text-sm font-bold">
                  <span className="px-3 py-1 bg-white/15 rounded-lg">{tool.version}</span>
                  <span className="px-3 py-1 bg-white/15 rounded-lg">{tool.platform}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <a href={tool.downloadUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:scale-105 transition-transform shadow-xl text-base">
                  <Download size={20}/> 获取软件
                </a>
                {tool.docUrl !== '#' && (
                  <a href={tool.docUrl} target={tool.docUrl.startsWith('/') ? '_self' : '_blank'}
                    download={tool.docUrl.startsWith('/')}
                    className="flex items-center gap-2 px-6 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/30 transition-colors border border-white/20">
                    <ExternalLink size={18}/> 实验指导
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tool Body */}
          <div className="p-10 md:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Description */}
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-black text-slate-900 mb-4">工具简介</h3>
                <p className="text-slate-500 font-bold leading-loose text-base">{tool.desc}</p>
              </div>

              {/* Features */}
              <div className="lg:col-span-3">
                <h3 className="text-2xl font-black text-slate-900 mb-6">核心能力</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.features.map((f, i) => (
                    <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border ${tool.borderColor} ${tool.bgLight} transition-all hover:scale-[1.02] hover:shadow-md`}>
                      <div className={`p-2.5 rounded-xl bg-white shadow-sm ${tool.textColor}`}>
                        {f.icon}
                      </div>
                      <span className="text-slate-700 font-bold text-sm leading-relaxed pt-1">{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Compare */}
        <div className="mt-16">
          <h3 className="text-2xl font-black text-slate-900 mb-8 text-center">快速对比</h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-sm font-black text-slate-500 uppercase tracking-wider">特性</th>
                  {TOOLS.map(t => (
                    <th key={t.id} className="px-6 py-5 text-center">
                      <span className={`text-sm font-black ${t.textColor}`}>{t.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { label: '设备厂商', values: ['Cisco', '华为', '通用'] },
                  { label: '协议分析', values: ['基础', '内置Wireshark', '专业级'] },
                  { label: 'GUI拖拽', values: ['✅', '✅', '✅'] },
                  { label: 'CLI命令行', values: ['IOS', 'VRP', 'tshark'] },
                  { label: '认证对接', values: ['CCNA/CCNP', 'HCIA/HCIP', '—'] },
                  { label: '价格', values: ['免费', '免费', '免费开源'] },
                  { label: '跨平台', values: ['Win/Mac/Linux', 'Windows', 'Win/Mac/Linux'] },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 text-sm font-bold text-slate-700">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="px-6 py-4 text-center text-sm font-bold text-slate-600">
                        {v === '✅' ? <CheckCircle2 size={18} className="text-emerald-500 mx-auto"/> : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;