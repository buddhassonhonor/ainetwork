import React from 'react';
import { CLASSES_CONFIG } from '../data/classesConfig';
import {
  GraduationCap,
  BookOpen,
  Users,
  ChevronRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  School,
  FileSpreadsheet,
  ClipboardCheck
} from 'lucide-react';

export default function QuizPortal({ onSelectClass, selectedClassId, onOpenAttendance }) {
  const networkClasses = CLASSES_CONFIG.filter(c => c.questionsType === 'network');
  const matlabClasses = CLASSES_CONFIG.filter(c => c.questionsType === 'matlab');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Portal Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs sm:text-sm font-black mb-4 shadow-xs">
            <School className="w-4 h-4" />
            <span>泉州师范学院 · 物理与信息工程学院</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            课程随堂测验与学业测评中心
          </h1>

          <p className="text-center text-slate-500 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            请选择您所在的专业班级进入对应课程的随堂测验系统。<br className="hidden sm:inline" />各班级测验题目、成绩榜单与作答记录独立归档管理。
          </p>

          {/* Quick Metrics & Actions */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>2 门在线测评课程</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>4 个教学班级 · 188 名学生</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>成绩自动沉淀 · Excel导出</span>
            </div>
            <button
              onClick={onOpenAttendance}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 text-emerald-800 shadow-xs cursor-pointer transition-all hover:scale-102"
              title="教师密码5163：统计当前学生实时登录并保存签到记录"
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              <span>📋 课堂统计登录与考勤 (口令5163)</span>
            </button>
          </div>
        </div>

        {/* Course Group 1: 计算机网络 (2024级) */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    数据通信与计算机网络
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800">
                    2024级 · 专业核心课
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  课程代码：0712065 · 两个班级测验题目统一，各自成绩独立统计
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 self-start sm:self-auto">
              ✓ 随堂测验正在进行
            </span>
          </div>

          {/* Cards for 24级 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {networkClasses.map((cls) => {
              const isSelected = selectedClassId === cls.id;
              return (
                <div
                  key={cls.id}
                  onClick={() => onSelectClass(cls.id)}
                  className={`relative group bg-white rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${
                    isSelected
                      ? 'border-indigo-600 shadow-lg shadow-indigo-600/10'
                      : 'border-slate-200/90 hover:border-indigo-400/80 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Top Row: Tag & Status */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-700">
                        课序号 {cls.seq}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {cls.statusBadge}
                      </span>
                    </div>

                    {/* Class Name */}
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight mb-2">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                      {cls.description}
                    </p>

                    {/* Info Pills */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="text-[11px] font-bold text-slate-400">班级学生总数</div>
                        <div className="text-lg font-black text-slate-800 mt-0.5">
                          {cls.studentCount} <span className="text-xs font-normal text-slate-500">人</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="text-[11px] font-bold text-slate-400">开放测验批次</div>
                        <div className="text-lg font-black text-slate-800 mt-0.5">
                          {cls.quizModules.length} <span className="text-xs font-normal text-slate-500">批</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-400 group-hover:text-indigo-600 transition-colors">
                      包含全班名单 · 支持实时测评
                    </span>
                    <button
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all group-hover:gap-2 cursor-pointer"
                    >
                      <span>进入班级测验</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Group 2: MATLAB程序设计 (2025级) */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    MATLAB程序设计与AI应用
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                    2025级 · 专业基础课
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  课程代码：0807411 · 算法设计与工程计算 · 预留随堂测试演练入口
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
              ✦ 预留测试入口已就绪
            </span>
          </div>

          {/* Cards for 25级 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matlabClasses.map((cls) => {
              const isSelected = selectedClassId === cls.id;
              return (
                <div
                  key={cls.id}
                  onClick={() => onSelectClass(cls.id)}
                  className={`relative group bg-white rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${
                    isSelected
                      ? 'border-emerald-600 shadow-lg shadow-emerald-600/10'
                      : 'border-slate-200/90 hover:border-emerald-400/80 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Top Row: Tag & Status */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-700">
                        课序号 {cls.seq}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200/60">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {cls.statusBadge}
                      </span>
                    </div>

                    {/* Class Name */}
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight mb-2">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                      {cls.description}
                    </p>

                    {/* Info Pills */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="text-[11px] font-bold text-slate-400">班级学生总数</div>
                        <div className="text-lg font-black text-slate-800 mt-0.5">
                          {cls.studentCount} <span className="text-xs font-normal text-slate-500">人</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <div className="text-[11px] font-bold text-slate-400">预留测验题目</div>
                        <div className="text-lg font-black text-slate-800 mt-0.5">
                          12 <span className="text-xs font-normal text-slate-500">题 (测试版)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-400 group-hover:text-emerald-600 transition-colors">
                      已载入选课名单 · 随时启动测试
                    </span>
                    <button
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all group-hover:gap-2 cursor-pointer"
                    >
                      <span>进入预留测试</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portal Bottom Tips */}
        <div className="mt-12 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              <span className="font-black text-slate-800">使用提示：</span>
              点击上方班级卡片即可进入对应班级；进入测验后，可在顶部栏随时点击
              <span className="font-bold text-indigo-600 mx-1">【切换班级】</span>
              返回本入口重新选班。
            </div>
          </div>
          <div className="text-xs font-bold text-slate-400 whitespace-nowrap">
            2024-2026 学年第二学期教学系统
          </div>
        </div>

      </div>
    </div>
  );
}
