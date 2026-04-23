import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide as d3ForceCollide } from 'd3-force';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line
} from 'recharts';
import { 
  User, BookOpen, CheckCircle, Award, 
  ArrowRight, Brain, Target, Sparkles, TrendingUp, Users, ArrowLeft, MousePointerClick, Activity, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { classStudents, generateStudentData } from '../data/students';

const Dashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hoveredStudent, setHoveredStudent] = useState(null);
  
  // For Force Graph dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef(null);
  const fgRef = useRef();

  useEffect(() => {
    if (!selectedStudent && containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
    const handleResize = () => {
      if (!selectedStudent && containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedStudent]);

  // Graph Data Memoization
  const graphData = useMemo(() => {
    const nodes = [{ id: 'center', name: '通信工程\n2024级', val: 50, color: '#4f46e5', group: 0 }];
    const links = [];
    classStudents.forEach(student => {
      let color = '#818cf8'; // indigo-400
      if (student.score >= 90) color = '#34d399'; // emerald-400
      else if (student.score < 70) color = '#fbbf24'; // amber-400
      
      nodes.push({
        id: student.id,
        name: student.name,
        val: student.progress * 0.4, // Size scaling
        color: color,
        group: 1,
        student: student
      });
      links.push({ source: 'center', target: student.id, value: 1 });
    });
    return { nodes, links };
  }, []);

  const handleNodeClick = useCallback(node => {
    if (node.id !== 'center') {
      setSelectedStudent(generateStudentData(node.student));
    } else {
      // Re-center graph
      if (fgRef.current) {
        fgRef.current.zoomToFit(400);
      }
    }
  }, []);

  const handleNodeHover = useCallback(node => {
    if (node && node.id !== 'center') {
      setHoveredStudent(node.student);
    } else {
      setHoveredStudent(null);
    }
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      // Tweak physics forces to avoid node overlapping
      fgRef.current.d3Force('charge').strength(-300);
      fgRef.current.d3Force('link').distance(150);
      fgRef.current.d3Force('collide', fgRef.current.d3Force('collide') || d3ForceCollide().radius(node => Math.sqrt(node.val || 1) * 2 + 15).iterations(2));
    }
  }, [graphData]);

  // Class Overview View
  if (!selectedStudent) {
    return (
      <div className="pt-24 min-h-screen bg-slate-50 pb-16">
        <div className="section-container">
          <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <Users className="text-indigo-600" size={40} />
                班级学业全景视图
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-2xl">
                基于图谱化数据的智能学情分析。探索 2024 级每位同学的学业宇宙，点击进入专属诊断报告。
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">班级均分</span>
                <span className="text-2xl font-black text-indigo-600">82.5</span>
              </div>
              <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">进度中位数</span>
                <span className="text-2xl font-black text-emerald-500">76%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            {/* Universe/Galaxy View using ForceGraph */}
            <div className="lg:col-span-3 bg-slate-900 p-1 rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 relative overflow-hidden h-[600px] md:h-[700px] border border-slate-800 flex flex-col">
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-2xl text-sm font-bold border border-white/10 shadow-lg">
                <Sparkles size={16} className="text-sky-400" /> 
                <span className="opacity-90">学业星系图谱 - 点击星球查看详情</span>
              </div>
              
              <div className="flex-1 w-full h-full relative" ref={containerRef}>
                <ForceGraph2D
                  ref={fgRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  graphData={graphData}
                  nodeLabel=""
                  nodeColor="color"
                  nodeRelSize={1}
                  nodeVal="val"
                  onNodeClick={handleNodeClick}
                  onNodeHover={handleNodeHover}
                  linkColor={() => 'rgba(255,255,255,0.1)'}
                  linkWidth={2}
                  backgroundColor="#0f172a"
                  nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = node.id === 'center' ? 14/globalScale : 12/globalScale;
                    ctx.font = `bold ${fontSize}px Sans-Serif`;
                    
                    // Draw node glow
                    ctx.shadowColor = node.color;
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, Math.sqrt(node.val) * 2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();
                    ctx.shadowBlur = 0; // reset
                    
                    // Draw text label
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 
                    
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
                    if (node.id === 'center') {
                       ctx.fillText(label.split('\n')[0], node.x - textWidth/2, node.y - fontSize/2);
                       ctx.fillText(label.split('\n')[1], node.x - textWidth/2, node.y + fontSize/2 + 2);
                    } else {
                       ctx.fillStyle = '#f8fafc';
                       ctx.textAlign = 'center';
                       ctx.textBaseline = 'middle';
                       ctx.fillText(label, node.x, node.y + Math.sqrt(node.val) * 2 + fontSize + 2);
                    }
                  }}
                />
              </div>

              {/* Hover Tooltip/Card */}
              <AnimatePresence>
                {hoveredStudent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-6 right-6 z-50 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl w-72 shadow-2xl text-white pointer-events-none"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black">{hoveredStudent.name}</h3>
                        <p className="text-sky-300 text-sm font-bold mt-1">全省排名 Top {hoveredStudent.rank}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${
                        hoveredStudent.score >= 90 ? 'bg-emerald-500 shadow-emerald-500/50' : 
                        hoveredStudent.score < 70 ? 'bg-amber-500 shadow-amber-500/50' : 
                        'bg-indigo-500 shadow-indigo-500/50'
                      }`}>
                        {hoveredStudent.score}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-sm font-medium mb-1.5">
                          <span className="text-slate-300">课程进度</span>
                          <span className="font-bold">{hoveredStudent.progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${hoveredStudent.progress}%` }}
                            className={`h-full rounded-full ${
                              hoveredStudent.progress >= 80 ? 'bg-emerald-400' : 
                              hoveredStudent.progress < 60 ? 'bg-amber-400' : 
                              'bg-sky-400'
                            }`} 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <div className="text-xs text-slate-400 mb-1">在线时长</div>
                          <div className="font-bold text-lg">{hoveredStudent.hours}h</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <div className="text-xs text-slate-400 mb-1">活跃度</div>
                          <div className="font-bold text-lg text-emerald-400">High</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Class Stats Sidebar */}
            <div className="flex flex-col gap-6">
              {/* Leaderboard */}
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Award className="text-amber-500" /> 学业风云榜
                </h3>
                <div className="flex-1 space-y-4">
                  {classStudents.sort((a,b) => b.score - a.score).slice(0, 5).map((student, i) => (
                    <div key={student.id} 
                         onClick={() => setSelectedStudent(generateStudentData(student))}
                         className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100 group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        i === 0 ? 'bg-amber-100 text-amber-600' : 
                        i === 1 ? 'bg-slate-100 text-slate-500' : 
                        i === 2 ? 'bg-orange-100 text-orange-700' : 
                        'bg-slate-50 text-slate-400'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</div>
                        <div className="text-xs text-slate-500">综合得分 {student.score}</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                        {student.progress}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Activity Trend Mini */}
              <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                <h3 className="text-lg font-black mb-2 flex items-center gap-2 relative z-10">
                  <Activity size={20} /> 本周学习热度
                </h3>
                <p className="text-indigo-200 text-sm mb-6 relative z-10">全班累计在线 420 小时，较上周增长 12%</p>
                
                <div className="h-24 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'Mon', val: 30 }, { name: 'Tue', val: 45 }, { name: 'Wed', val: 38 },
                      { name: 'Thu', val: 65 }, { name: 'Fri', val: 55 }, { name: 'Sat', val: 85 }, { name: 'Sun', val: 95 }
                    ]}>
                      <Line type="monotone" dataKey="val" stroke="#ffffff" strokeWidth={3} dot={{r:4, fill:"#4f46e5", strokeWidth: 2}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick List - Cards Design */}
          <div className="mt-8">
            <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Users className="text-slate-400" size={24} /> 所有学生名录
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {classStudents.map(student => (
                <motion.button 
                  whileHover={{ y: -5 }}
                  key={student.id}
                  onClick={() => setSelectedStudent(generateStudentData(student))}
                  className="bg-white p-4 rounded-3xl border border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all text-left flex flex-col group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-black group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {student.name.charAt(0)}
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                      student.score >= 90 ? 'bg-emerald-50 text-emerald-600' :
                      student.score < 70 ? 'bg-amber-50 text-amber-600' :
                      'bg-sky-50 text-sky-600'
                    }`}>
                      {student.score}分
                    </div>
                  </div>
                  <div className="font-black text-slate-900 mb-1">{student.name}</div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-auto mb-1">
                    <div className={`h-1.5 rounded-full ${
                      student.progress >= 80 ? 'bg-emerald-400' :
                      student.progress < 60 ? 'bg-amber-400' :
                      'bg-indigo-400'
                    }`} style={{ width: `${student.progress}%` }}></div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 text-right">{student.progress}%</div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Individual Student Dashboard View
  const mockData = selectedStudent;

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-16">
      <div className="section-container">
        
        <button 
          onClick={() => setSelectedStudent(null)}
          className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft size={20} /> 返回班级全景
        </button>

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