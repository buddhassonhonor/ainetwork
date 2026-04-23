import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, ArrowLeft, Bot, CheckCircle, Video } from 'lucide-react';
import CourseResources from '../components/CourseResources';

const CourseDetail = () => {
  const { id } = useParams();

  return (
    <div className="pt-24 min-h-screen pb-16">
      <div className="section-container">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:text-indigo-800 transition-colors">
          <ArrowLeft size={20} /> 返回课程大厅
        </Link>

        {/* Course Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold">
              <Bot size={16} /> AI赋能精品课
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              计算机网络：从底层协议到AI智能路由
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              本课程由数字人教师与黄志高老师联合主讲。课程内容紧密结合《人工智能通识课程建设指南》，引入智能路由算法、流量预测等前沿AI技术，提供沉浸式的数字学习体验。
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30">
                <PlayCircle size={24} /> 开始学习
              </button>
              <button className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                <Video size={24} /> 观看数字人导学
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">课程包含</h3>
            <ul className="space-y-4">
              {[
                '68 课时理论精讲 (含数字人授课)',
                'AI网络助教 24h 答疑',
                '12 个核心实验手册下载',
                '计算机网络AI知识图谱',
                '智能学业诊断报告'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle size={20} className="text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Video Player Placeholder */}
        <div className="w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden mb-16 relative flex items-center justify-center border-4 border-slate-100 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
          <PlayCircle size={80} className="text-white/80 z-20 cursor-pointer hover:scale-110 transition-transform" />
          <div className="absolute bottom-6 left-6 z-20">
            <h3 className="text-2xl text-white font-bold mb-2">CH1-5ed 概述 - AI导读版</h3>
            <p className="text-slate-300">主讲：黄志高团队 & AI数字人</p>
          </div>
          {/* Fake AI Subtitles */}
          <div className="absolute bottom-6 right-6 z-20 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-green-400 text-sm font-bold mb-1">
              <Bot size={14} /> AI 实时字幕
            </div>
            <p className="text-white text-sm">“欢迎来到计算机网络的世界，本节课我们将探讨...”</p>
          </div>
        </div>

        {/* Resources Section (Task 3 integration) */}
        <CourseResources />
      </div>
    </div>
  );
};

export default CourseDetail;