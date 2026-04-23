import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { 
  User, BookOpen, CheckCircle, Award, 
  ArrowRight, Brain, Target, Sparkles, TrendingUp
} from 'lucide-react';

const mockData = {
  studentName: "黄炳炎",
  major: "通信工程",
  progress: 75,
  experiments: 8,
  totalExperiments: 12,
  diagnosticData: [
    { subject: '物理层', A: 90, fullMark: 100 },
    { subject: '链路层', A: 75, fullMark: 100 },
    { subject: '网络层', A: 60, fullMark: 100 },
    { subject: '传输层', A: 85, fullMark: 100 },
    { subject: '应用层', A: 70, fullMark: 100 },
    { subject: 'AI融合', A: 50, fullMark: 100 },
  ],
  weeklyProgress: [
    { name: 'W1', hours: 4 },
    { name: 'W2', hours: 7 },
    { name: 'W3', hours: 5 },
    { name: 'W4', hours: 10 },
  ]
};

const Dashboard = () => {
  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-16">
      <div className="section-container">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <User size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">{mockData.studentName}的学业看板</h1>
              <p className="text-slate-500 font-bold">{mockData.major} · 2024级</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase mb-1">当前学分</p>
              <p className="text-2xl font-black text-indigo-600">3.5 / 4.0</p>
            </div>
            <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <p className="text-xs font-black text-white/70 uppercase mb-1">全省排名</p>
              <p className="text-2xl font-black">Top 15%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Progress Card */}
          <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="text-indigo-600" /> 课程进度
                </h3>
                <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">进行中</span>
              </div>
              <div className="relative h-4 w-full bg-slate-100 rounded-full mb-4 overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-1000"
                  style={{ width: `${mockData.progress}%` }}
                ></div>
              </div>
              <p className="text-slate-500 font-bold mb-8">已完成 {mockData.progress}% 的理论课时学习</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-slate-900">{mockData.experiments}</p>
                <p className="text-xs font-bold text-slate-400 uppercase">已完实验</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-slate-900">12h</p>
                <p className="text-xs font-bold text-slate-400 uppercase">在线时长</p>
              </div>
            </div>
          </div>

          {/* AI Diagnostic Report (Radar Chart) */}
          <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Brain className="text-indigo-600" /> AI 学业诊断报告
              </h3>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-sm font-bold border border-indigo-100">
                <Sparkles size={16} /> AI 智能评估
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
              <div className="h-[250px] md:h-full w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockData.diagnosticData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                    <Radar
                      name="能力值"
                      dataKey="A"
                      stroke="#4f46e5"
                      fill="#4f46e5"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 h-full flex flex-col justify-center">
                  <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <Target size={18} /> 诊断结论
                  </h4>
                  <p className="text-indigo-700/80 text-sm leading-relaxed font-medium">
                    你在“物理层”和“运输层”表现优异，但“网络层”与“AI融合应用”部分存在薄弱环节，建议加强对 IP 路由算法及神经网络在流量预测中应用的复习。
                  </p>
                </div>
                <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                  查看 AI 补课方案 <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Weekly Activity */}
          <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" /> 学习活跃度
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="hours" fill="#4f46e5" radius={[10, 10, 10, 10]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-indigo-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-200">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <Sparkles className="text-sky-400" /> 下一步建议
            </h3>
            <div className="space-y-4">
              {[
                { title: '复习网络层路由算法', time: '预计 45min', level: '高优先级' },
                { title: '完成实验 3：Packet Tracer 入门', time: '预计 60min', level: '必做' },
                { title: '阅读 AI 赋能网络白皮书', time: '预计 20min', level: '拓展' },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/20 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold group-hover:text-sky-300 transition-colors">{item.title}</h4>
                    <span className="text-[10px] font-black bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full uppercase tracking-tighter">{item.level}</span>
                  </div>
                  <p className="text-xs text-white/50 font-bold uppercase tracking-wider">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New Section: Recent Labs */}
        <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="text-indigo-600" /> 最新实验实训记录
            </h3>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              查看全部
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-400">
                  <th className="pb-4 font-bold">实验名称</th>
                  <th className="pb-4 font-bold">涉及层级</th>
                  <th className="pb-4 font-bold">AI 评分</th>
                  <th className="pb-4 font-bold">状态</th>
                  <th className="pb-4 font-bold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: '实验3 --Packet-Tracer-入门', layer: '链路层/网络层', score: 92, status: '优秀' },
                  { name: '实验1 网线的制作', layer: '物理层', score: 88, status: '良好' },
                  { name: 'AI 辅助 OSPF 路由配置', layer: '网络层', score: 76, status: '需改进' },
                ].map((lab, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                    <td className="py-5 font-bold text-slate-800">{lab.name}</td>
                    <td className="py-5 text-slate-500 font-medium">{lab.layer}</td>
                    <td className="py-5 font-black text-indigo-600">{lab.score}</td>
                    <td className="py-5">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${lab.status === '优秀' ? 'bg-green-100 text-green-700' : lab.status === '良好' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {lab.status}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                        查看报告
                      </button>
                    </td>
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

export default Dashboard;