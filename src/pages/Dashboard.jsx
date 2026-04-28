import React, { useState, useMemo, useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide as d3ForceCollide, forceX as d3ForceX, forceY as d3ForceY } from 'd3-force';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { User, BookOpen, Award, ArrowRight, Brain, Target, Sparkles,
  TrendingUp, Users, ArrowLeft, Activity, GraduationCap, BarChart3, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { classStudents, classStats, generateStudentData } from '../data/students';

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 shrink-0 min-w-[140px] flex-1">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '18', color }}>{icon}</div>
    <div>
      <div className="text-xl font-black text-slate-900 leading-none">{value}</div>
      <div className="text-[11px] font-bold text-slate-400 mt-0.5">{label}</div>
    </div>
  </div>
);

/* ─── Class Overview ─── */
const ClassOverview = ({ onSelect }) => {
  const [hovered, setHovered] = useState(null);
  const [dims, setDims] = useState({ w: 900, h: 480 });
  const cRef = useRef(null);
  const fgRef = useRef();

  useEffect(() => {
    const r = () => { if (cRef.current) setDims({ w: cRef.current.offsetWidth, h: cRef.current.offsetHeight }); };
    window.addEventListener('resize', r); r();
    return () => window.removeEventListener('resize', r);
  }, []);

  const gData = useMemo(() => ({
    nodes: classStudents.map(s => ({
      id: s.id, name: s.name,
      val: 5 + (s.score - 55) / 45 * 10,
      color: s.score >= 90 ? '#34d399' : s.score >= 80 ? '#818cf8' : s.score >= 70 ? '#fbbf24' : '#f87171',
      student: s,
    })),
    links: [],
  }), []);

  useEffect(() => {
    if (!fgRef.current) return;
    fgRef.current.d3Force('charge').strength(-60);
    fgRef.current.d3Force('link', null);
    fgRef.current.d3Force('center', null);
    fgRef.current.d3Force('x', d3ForceX(0).strength(0.12));
    fgRef.current.d3Force('y', d3ForceY(0).strength(0.12));
    fgRef.current.d3Force('collide', d3ForceCollide().radius(n => n.val + 16).iterations(4));
  }, [gData]);

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-12">
      <div className="section-container">
        {/* ── Title ── */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 mb-1 flex items-center gap-3">
            <GraduationCap className="text-indigo-600" size={32}/>
            2023级通信工程
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">学业诊断</span>
          </h1>
          <p className="text-sm text-slate-500 font-bold">AI 智能学情分析 · 点击星球进入专属报告</p>
        </div>

        {/* ── KPI Row ── */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-1 justify-center">
          <StatCard icon={<Users size={18}/>}        label="班级人数" value={classStats.total}                color="#6366f1"/>
          <StatCard icon={<BarChart3 size={18}/>}    label="班级均分" value={classStats.avgScore}            color="#10b981"/>
          <StatCard icon={<CheckCircle2 size={18}/>} label="及格率"   value={classStats.passRate + '%'}      color="#0ea5e9"/>
          <StatCard icon={<Award size={18}/>}        label="优秀率"   value={classStats.excellentRate + '%'} color="#f59e0b"/>
          <StatCard icon={<Clock size={18}/>}        label="累计学时" value={classStats.totalHours + 'h'}    color="#8b5cf6"/>
        </div>

        {/* ── Galaxy (full width) + Right Panel ── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-5">
          {/* Galaxy - wider */}
          <div className="xl:col-span-3 bg-slate-900 rounded-3xl shadow-xl overflow-hidden relative" style={{ height: 480, clipPath: 'inset(0 round 1.5rem)' }} ref={cRef}>
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md text-white rounded-xl text-xs font-bold border border-white/10">
              <Sparkles size={13} className="text-sky-400"/> 学业星系 · 点击星球查看报告
            </div>
            <div className="absolute top-4 right-4 z-20 flex gap-2 text-[10px] font-bold text-white/70">
              {[['#34d399','≥90'],['#818cf8','80-89'],['#fbbf24','70-79'],['#f87171','<70']].map(([c,l])=>(
                <span key={l} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:c}}/>{l}</span>
              ))}
            </div>
            <ForceGraph2D
              ref={fgRef} width={dims.w} height={dims.h}
              graphData={gData} nodeLabel="" nodeColor="color" nodeRelSize={1} nodeVal="val"
              onNodeClick={n => n && onSelect(generateStudentData(n.student))}
              onNodeHover={n => setHovered(n?.student || null)}
              backgroundColor="#0f172a"
              nodeCanvasObject={(node, ctx, gs) => {
                const r = node.val;
                ctx.shadowColor = node.color; ctx.shadowBlur = 14;
                ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
                ctx.fillStyle = node.color; ctx.fill(); ctx.shadowBlur = 0;
                const fs = Math.max(9 / gs, 2.5);
                ctx.font = `600 ${fs}px Inter,sans-serif`;
                ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(node.name, node.x, node.y + r + fs + 1);
              }}
            />
            <AnimatePresence>
              {hovered && (
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                  className="absolute bottom-4 right-4 z-50 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl w-52 text-white pointer-events-none">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-sm">{hovered.name}</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${hovered.score>=90?'bg-emerald-500/30 text-emerald-300':hovered.score>=80?'bg-indigo-500/30 text-indigo-300':hovered.score>=70?'bg-amber-500/30 text-amber-300':'bg-red-500/30 text-red-300'}`}>{hovered.score}分</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    {[[hovered.progress+'%','进度'],[hovered.hours+'h','学时'],[hovered.labCount,'实验']].map(([v,l])=>(
                      <div key={l} className="bg-white/5 p-1.5 rounded-lg"><div className="font-black text-xs">{v}</div>{l}</div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">
            {/* Leaderboard */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex-1">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Award size={14} className="text-amber-500"/> 学业风云榜
              </h3>
              <div className="space-y-1">
                {[...classStudents].sort((a,b)=>b.score-a.score).slice(0,8).map((s,i)=>(
                  <div key={s.id} onClick={()=>onSelect(generateStudentData(s))}
                    className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                      i===0?'bg-amber-400 text-white':i===1?'bg-slate-400 text-white':i===2?'bg-orange-400 text-white':'bg-slate-100 text-slate-400'}`}>{i+1}</div>
                    <span className="flex-1 text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{s.name}</span>
                    <span className="text-xs font-black text-slate-600">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Trend mini */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-xl"/>
              <div className="flex justify-between items-center mb-2 relative z-10">
                <span className="text-xs font-black flex items-center gap-1.5 uppercase tracking-wider"><Activity size={13}/> 周学时趋势</span>
                <span className="text-[10px] text-indigo-200">{classStats.totalHours}h累计</span>
              </div>
              <div className="h-20 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={classStats.weeklyTrend}>
                    <Line type="monotone" dataKey="hours" stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} dot={{r:3,fill:'#4f46e5',strokeWidth:2}}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Charts ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Distribution */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-1.5"><BarChart3 size={14} className="text-indigo-500"/> 成绩分布</h3>
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={classStats.distribution} dataKey="count" cx="50%" cy="50%" innerRadius={24} outerRadius={50} paddingAngle={3}>
                    {classStats.distribution.map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Pie></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5 flex-1">
                {classStats.distribution.map((d,i)=>(
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{background:d.color}}/>
                    <span className="font-bold text-slate-600 w-12">{d.range}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${d.count/30*100}%`,background:d.color}}/>
                    </div>
                    <span className="font-black text-slate-900 w-5 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chapter mastery */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-1.5"><Target size={14} className="text-indigo-500"/> 各章节掌握度</h3>
            <div className="space-y-3">
              {classStats.chapterMastery.map((ch,i)=>(
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 w-20 shrink-0">{ch.chapter}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${ch.mastery}%`,background:ch.mastery>=85?'#10b981':ch.mastery>=70?'#6366f1':'#f59e0b'}}/>
                  </div>
                  <span className="text-xs font-black w-8 text-right" style={{color:ch.mastery>=85?'#10b981':ch.mastery>=70?'#6366f1':'#f59e0b'}}>{ch.mastery}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Student Detail ─── */
const StudentDetail = ({ data, onBack }) => (
  <div className="pt-24 min-h-screen bg-slate-50 pb-12">
    <div className="section-container">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-6 hover:text-indigo-800 bg-white px-4 py-2 rounded-full shadow-sm border border-indigo-50 hover:shadow-md text-sm transition-all">
        <ArrowLeft size={16}/> 返回班级全景
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <User size={24}/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{data.studentName} 的学业看板</h1>
            <p className="text-xs text-slate-500 font-bold mt-0.5">{data.grade} {data.major} · 班级第 {data.classRank} / {data.totalStudents} 名</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[{l:'GPA',v:data.gpa,cls:'bg-white border border-slate-200',vc:'text-indigo-600'},
            {l:'综合分',v:data.score,cls:'bg-white border border-slate-200',vc:'text-emerald-600'},
            {l:'排名',v:`Top ${data.rank}`,cls:'bg-indigo-600 shadow-lg shadow-indigo-200',vc:'text-white'}
          ].map((b,i)=>(
            <div key={i} className={`px-4 py-2.5 rounded-xl text-center ${b.cls}`}>
              <p className="text-[10px] font-black uppercase mb-0.5" style={{color: i===2 ? 'rgba(255,255,255,.65)' : '#94a3b8'}}>{b.l}</p>
              <p className={`text-lg font-black ${b.vc}`}>{b.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 1: Progress + Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5"><BookOpen size={14} className="text-indigo-500"/> 课程进度</h3>
          <div className="h-2.5 w-full bg-slate-100 rounded-full mb-2 overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{width:`${data.progress}%`}}/>
          </div>
          <p className="text-xs text-slate-500 font-bold mb-5">已完成 {data.progress}% 理论课时</p>
          <div className="grid grid-cols-3 gap-2">
            {[{v:data.experiments,l:'实验'},{v:data.hours+'h',l:'学时'},{v:data.avgQuiz,l:'测验均分'}].map((x,i)=>(
              <div key={i} className="p-3 bg-slate-50 rounded-xl text-center">
                <p className="text-base font-black text-slate-900">{x.v}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{x.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Brain size={14} className="text-indigo-500"/> AI 学业诊断</h3>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100"><Sparkles size={11}/> AI 评估</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div style={{height:200}}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.diagnosticData}>
                  <PolarGrid stroke="#e2e8f0"/>
                  <PolarAngleAxis dataKey="subject" tick={{fill:'#64748b',fontSize:11,fontWeight:700}}/>
                  <Radar dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-1.5 text-xs"><Target size={13}/> 诊断结论</h4>
              <p className="text-indigo-700/80 text-xs leading-relaxed">
                {data.score>=85?`${data.studentName}综合表现优异，各层均衡发展，建议向AI融合方向深入拓展。`:
                 data.score>=70?`基础扎实，网络层与AI融合部分有提升空间，建议强化路由算法与流量预测。`:
                 `需加强基础巩固，优先回顾CH1-CH3并重做基础实验。`}
              </p>
              <button className="mt-3 w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1">
                查看 AI 补课方案 <ArrowRight size={13}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Weekly Bar + Suggestions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5"><TrendingUp size={14} className="text-indigo-500"/> 每周学习时长</h3>
          <div style={{height:180}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontWeight:600,fontSize:11}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontWeight:600,fontSize:11}}/>
                <Tooltip contentStyle={{borderRadius:'10px',border:'none',boxShadow:'0 4px 12px rgba(0,0,0,.08)',fontSize:12}} cursor={{fill:'#f8fafc'}}/>
                <Bar dataKey="hours" fill="#4f46e5" radius={[6,6,6,6]} barSize={26} name="学时(h)"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl"/>
          <h3 className="text-xs font-black mb-4 flex items-center gap-1.5 uppercase tracking-wider relative z-10"><Zap size={13} className="text-sky-400"/> AI 个性化建议</h3>
          <div className="space-y-2 relative z-10">
            {data.aiSuggestions.map((item,i)=>(
              <div key={i} className="p-3 bg-white/8 rounded-xl border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="font-bold text-xs group-hover:text-sky-300 transition-colors leading-snug">{item.title}</h4>
                  <span className="text-[8px] font-black bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded-full uppercase shrink-0">{item.level}</span>
                </div>
                <p className="text-[10px] text-white/40">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lab Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Award size={14} className="text-indigo-500"/> PT 实验记录</h3>
          <span className="text-[10px] font-bold text-slate-400">{data.experiments} / {data.totalExperiments} 完成</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[520px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                <th className="pb-3">实验名称</th><th className="pb-3">层级</th><th className="pb-3">AI评分</th><th className="pb-3">状态</th><th className="pb-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.labRecords.map((lab,i)=>(
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 font-bold text-slate-800 text-xs">{lab.name}</td>
                  <td className="py-3 text-xs text-slate-500">{lab.layer}</td>
                  <td className="py-3 font-black text-indigo-600 text-sm">{lab.score}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${lab.status==='优秀'?'bg-emerald-50 text-emerald-700':lab.status==='良好'?'bg-blue-50 text-blue-700':'bg-amber-50 text-amber-700'}`}>{lab.status}</span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all">查看报告</button>
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

/* ─── Main ─── */
const Dashboard = () => {
  const [sel, setSel] = useState(null);
  if (sel) return <StudentDetail data={sel} onBack={() => setSel(null)}/>;
  return <ClassOverview onSelect={setSel}/>;
};

export default Dashboard;