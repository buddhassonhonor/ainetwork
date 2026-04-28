import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ArrowLeft, Network, Layers, Cpu, Globe, Shield, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── colour palette per graph tab ── */
const PALETTES = {
  overview:  { primary: '#6366f1', glow: 'rgba(99,102,241,', bg: '#f8fafc', accent: '#818cf8' },
  physical:  { primary: '#0ea5e9', glow: 'rgba(14,165,233,', bg: '#f0f9ff', accent: '#38bdf8' },
  network:   { primary: '#8b5cf6', glow: 'rgba(139,92,246,', bg: '#faf5ff', accent: '#a78bfa' },
  transport: { primary: '#f59e0b', glow: 'rgba(245,158,11,', bg: '#fffbeb', accent: '#fbbf24' },
  application:{ primary: '#10b981', glow: 'rgba(16,185,129,', bg: '#ecfdf5', accent: '#34d399' },
  security:  { primary: '#ef4444', glow: 'rgba(239,68,68,', bg: '#fef2f2', accent: '#f87171' },
};

/* ── graph data definitions ── */
const GRAPHS = {
  overview: {
    label: '全局总览', icon: <Network size={18}/>, color: '#6366f1',
    desc: '五层协议栈与 AI 赋能全景',
    nodes: [
      { id:'Phy', val:22, label:'物理层', group:1 },
      { id:'DL',  val:22, label:'数据链路层', group:2 },
      { id:'Net', val:26, label:'网络层', group:3 },
      { id:'Tr',  val:22, label:'运输层', group:4 },
      { id:'App', val:22, label:'应用层', group:5 },
      { id:'AI_Signal', val:16, label:'AI信号处理', isAI:true, group:1 },
      { id:'AI_Switch', val:16, label:'AI智能交换', isAI:true, group:2 },
      { id:'AI_Route',  val:18, label:'AI智能路由', isAI:true, group:3 },
      { id:'AI_QoS',    val:16, label:'AI流量预测', isAI:true, group:3 },
      { id:'AI_Cong',   val:16, label:'AI拥塞控制', isAI:true, group:4 },
      { id:'AI_DNS',    val:16, label:'AI智能解析', isAI:true, group:5 },
      { id:'AI_Sec',    val:18, label:'AI安全防御', isAI:true, group:5 },
    ],
    links: [
      {source:'Phy',target:'DL'},{source:'DL',target:'Net'},{source:'Net',target:'Tr'},{source:'Tr',target:'App'},
      {source:'Phy',target:'AI_Signal'},{source:'DL',target:'AI_Switch'},
      {source:'Net',target:'AI_Route'},{source:'Net',target:'AI_QoS'},
      {source:'Tr',target:'AI_Cong'},{source:'App',target:'AI_DNS'},{source:'App',target:'AI_Sec'},
      {source:'AI_Route',target:'AI_QoS'},{source:'AI_Sec',target:'AI_Route'},
    ],
  },
  physical: {
    label: '物理层 & 链路层', icon: <Wifi size={18}/>, color: '#0ea5e9',
    desc: '比特传输、成帧与差错控制',
    nodes: [
      { id:'Phy', val:28, label:'物理层核心', group:1 },
      { id:'Fiber', val:14, label:'光纤传输', group:1 },
      { id:'Wireless', val:14, label:'无线信道', group:1 },
      { id:'Modem', val:12, label:'调制解调', group:1 },
      { id:'AI_SNR', val:18, label:'AI降噪优化', isAI:true, group:1 },
      { id:'AI_Spectrum', val:16, label:'AI频谱管理', isAI:true, group:1 },
      { id:'DL', val:26, label:'数据链路层核心', group:2 },
      { id:'MAC', val:14, label:'MAC协议', group:2 },
      { id:'CSMA', val:12, label:'CSMA/CD', group:2 },
      { id:'Switch', val:14, label:'以太网交换', group:2 },
      { id:'VLAN', val:12, label:'VLAN划分', group:2 },
      { id:'AI_Switch', val:18, label:'AI智能交换', isAI:true, group:2 },
      { id:'AI_Collision', val:16, label:'AI冲突避免', isAI:true, group:2 },
    ],
    links: [
      {source:'Phy',target:'Fiber'},{source:'Phy',target:'Wireless'},{source:'Phy',target:'Modem'},
      {source:'Phy',target:'AI_SNR'},{source:'Wireless',target:'AI_Spectrum'},
      {source:'Phy',target:'DL'},
      {source:'DL',target:'MAC'},{source:'MAC',target:'CSMA'},{source:'DL',target:'Switch'},
      {source:'Switch',target:'VLAN'},{source:'DL',target:'AI_Switch'},{source:'CSMA',target:'AI_Collision'},
      {source:'AI_SNR',target:'AI_Spectrum'},
    ],
  },
  network: {
    label: '网络层', icon: <Layers size={18}/>, color: '#8b5cf6',
    desc: 'IP编址、路由选择与转发',
    nodes: [
      { id:'Net', val:30, label:'网络层核心', group:3 },
      { id:'IPv4', val:16, label:'IPv4协议', group:3 },
      { id:'IPv6', val:16, label:'IPv6协议', group:3 },
      { id:'CIDR', val:14, label:'CIDR子网划分', group:3 },
      { id:'ARP', val:12, label:'ARP协议', group:3 },
      { id:'ICMP', val:12, label:'ICMP协议', group:3 },
      { id:'OSPF', val:16, label:'OSPF路由', group:3 },
      { id:'BGP', val:16, label:'BGP路由', group:3 },
      { id:'NAT', val:14, label:'NAT转换', group:3 },
      { id:'AI_Route', val:20, label:'AI智能路由', isAI:true, group:3 },
      { id:'AI_QoS', val:18, label:'AI流量预测', isAI:true, group:3 },
      { id:'AI_SDN', val:18, label:'AI+SDN控制', isAI:true, group:3 },
    ],
    links: [
      {source:'Net',target:'IPv4'},{source:'Net',target:'IPv6'},{source:'IPv4',target:'CIDR'},
      {source:'Net',target:'ARP'},{source:'Net',target:'ICMP'},
      {source:'Net',target:'OSPF'},{source:'Net',target:'BGP'},{source:'Net',target:'NAT'},
      {source:'OSPF',target:'AI_Route'},{source:'BGP',target:'AI_Route'},
      {source:'Net',target:'AI_QoS'},{source:'AI_Route',target:'AI_SDN'},
      {source:'AI_QoS',target:'AI_SDN'},
    ],
  },
  transport: {
    label: '运输层', icon: <Cpu size={18}/>, color: '#f59e0b',
    desc: 'TCP/UDP、拥塞控制与可靠传输',
    nodes: [
      { id:'Tr', val:28, label:'运输层核心', group:4 },
      { id:'TCP', val:18, label:'TCP协议', group:4 },
      { id:'UDP', val:16, label:'UDP协议', group:4 },
      { id:'Handshake', val:14, label:'三次握手', group:4 },
      { id:'Window', val:14, label:'滑动窗口', group:4 },
      { id:'Reno', val:12, label:'TCP Reno', group:4 },
      { id:'QUIC', val:16, label:'QUIC协议', group:4 },
      { id:'AI_BBR', val:20, label:'AI-BBR拥塞', isAI:true, group:4 },
      { id:'AI_Retrans', val:16, label:'AI重传优化', isAI:true, group:4 },
      { id:'AI_LoadBal', val:16, label:'AI负载均衡', isAI:true, group:4 },
    ],
    links: [
      {source:'Tr',target:'TCP'},{source:'Tr',target:'UDP'},{source:'TCP',target:'Handshake'},
      {source:'TCP',target:'Window'},{source:'Window',target:'Reno'},{source:'Tr',target:'QUIC'},
      {source:'Reno',target:'AI_BBR'},{source:'TCP',target:'AI_Retrans'},
      {source:'Tr',target:'AI_LoadBal'},{source:'AI_BBR',target:'AI_LoadBal'},
    ],
  },
  application: {
    label: '应用层', icon: <Globe size={18}/>, color: '#10b981',
    desc: 'HTTP、DNS、FTP与应用协议',
    nodes: [
      { id:'App', val:28, label:'应用层核心', group:5 },
      { id:'HTTP', val:18, label:'HTTP/HTTPS', group:5 },
      { id:'DNS', val:16, label:'DNS系统', group:5 },
      { id:'FTP', val:12, label:'FTP协议', group:5 },
      { id:'SMTP', val:12, label:'SMTP邮件', group:5 },
      { id:'CDN', val:16, label:'CDN分发', group:5 },
      { id:'WebSocket', val:14, label:'WebSocket', group:5 },
      { id:'AI_DNS', val:18, label:'AI智能解析', isAI:true, group:5 },
      { id:'AI_Cache', val:16, label:'AI缓存优化', isAI:true, group:5 },
      { id:'AI_Rec', val:16, label:'AI内容推荐', isAI:true, group:5 },
    ],
    links: [
      {source:'App',target:'HTTP'},{source:'App',target:'DNS'},{source:'App',target:'FTP'},
      {source:'App',target:'SMTP'},{source:'HTTP',target:'CDN'},{source:'HTTP',target:'WebSocket'},
      {source:'DNS',target:'AI_DNS'},{source:'CDN',target:'AI_Cache'},{source:'App',target:'AI_Rec'},
      {source:'AI_DNS',target:'AI_Cache'},
    ],
  },
  security: {
    label: 'AI安全专题', icon: <Shield size={18}/>, color: '#ef4444',
    desc: '网络安全与AI赋能防御体系',
    nodes: [
      { id:'SecCore', val:28, label:'网络安全核心', group:6 },
      { id:'Firewall', val:16, label:'防火墙', group:6 },
      { id:'IDS', val:14, label:'入侵检测IDS', group:6 },
      { id:'TLS', val:16, label:'TLS/SSL加密', group:6 },
      { id:'VPN', val:14, label:'VPN隧道', group:6 },
      { id:'DDoS', val:14, label:'DDoS攻击', group:6 },
      { id:'AI_Detect', val:20, label:'AI异常检测', isAI:true, group:6 },
      { id:'AI_Threat', val:18, label:'AI威胁情报', isAI:true, group:6 },
      { id:'AI_ZeroTrust', val:18, label:'AI零信任', isAI:true, group:6 },
      { id:'AI_Forensic', val:16, label:'AI取证分析', isAI:true, group:6 },
    ],
    links: [
      {source:'SecCore',target:'Firewall'},{source:'SecCore',target:'IDS'},{source:'SecCore',target:'TLS'},
      {source:'SecCore',target:'VPN'},{source:'SecCore',target:'DDoS'},
      {source:'IDS',target:'AI_Detect'},{source:'DDoS',target:'AI_Detect'},
      {source:'AI_Detect',target:'AI_Threat'},{source:'SecCore',target:'AI_ZeroTrust'},
      {source:'AI_Threat',target:'AI_Forensic'},{source:'AI_ZeroTrust',target:'AI_Detect'},
    ],
  },
};

const TAB_KEYS = Object.keys(GRAPHS);

/* ── group colours for non-AI nodes ── */
const GROUP_COLORS = {
  1:'#0ea5e9', 2:'#06b6d4', 3:'#8b5cf6', 4:'#f59e0b', 5:'#10b981', 6:'#ef4444'
};

const KnowledgeGraph = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dims, setDims] = useState({ width: 1100, height: 650 });
  const fgRef = React.useRef();
  const palette = PALETTES[activeTab];
  const graph = GRAPHS[activeTab];

  useEffect(() => {
    const resize = () => {
      const el = document.getElementById('kg-canvas');
      if (el) setDims({ width: el.clientWidth, height: 650 });
    };
    window.addEventListener('resize', resize);
    setTimeout(resize, 100);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => fgRef.current?.zoomToFit(500, 80), 300);
    }
  }, [activeTab]);

  const graphData = useMemo(() => ({
    nodes: graph.nodes.map(n => ({...n})),
    links: graph.links.map(l => ({...l})),
  }), [activeTab]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const r = node.val / 2;
    const fontSize = Math.max(11 / globalScale, 3.5);
    const pal = PALETTES[activeTab];

    // glow
    if (node.isAI) {
      ctx.beginPath(); ctx.arc(node.x, node.y, r * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = pal.glow + '0.12)'; ctx.fill();
      ctx.beginPath(); ctx.arc(node.x, node.y, r * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = pal.glow + '0.25)'; ctx.fill();
    }

    // node circle
    ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = node.isAI ? pal.primary : (GROUP_COLORS[node.group] || '#94a3b8');
    ctx.fill();
    ctx.lineWidth = 2.5 / globalScale; ctx.strokeStyle = '#fff'; ctx.stroke();

    // label bg + text
    ctx.font = `bold ${fontSize}px "Inter",system-ui,sans-serif`;
    const tw = ctx.measureText(node.label).width;
    const pad = fontSize * 0.5;
    const bw = tw + pad * 2, bh = fontSize + pad * 1.6;
    const bx = node.x - bw / 2, by = node.y + r + 4;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 3 / globalScale); ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = node.isAI ? pal.primary : '#334155';
    ctx.fillText(node.label, node.x, by + bh / 2);
  }, [activeTab]);

  return (
    <div className="pt-24 min-h-screen relative overflow-hidden" style={{ background: palette.bg }}>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none" style={{ background: palette.glow + '0.08)' }}></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] blur-[100px] rounded-full pointer-events-none" style={{ background: palette.glow + '0.06)' }}></div>

      <div className="section-container relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:text-indigo-800 transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm border border-indigo-50 hover:shadow-md">
          <ArrowLeft size={20} /> 返回主页
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight flex items-center gap-4">
            <Network className="text-indigo-600" size={44}/>
            AI+ <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">多维知识图谱</span>
          </h1>
          <p className="text-lg text-slate-500 font-bold leading-relaxed max-w-3xl">
            按协议层级细分为 6 张专题图谱，点击切换卡片查看各层的核心知识点与 AI 赋能节点。可缩放、拖拽、聚焦。
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-10 mb-10 overflow-x-auto pb-2">
          {TAB_KEYS.map(key => {
            const g = GRAPHS[key];
            const active = activeTab === key;
            return (
              <button key={key} onClick={() => setActiveTab(key)}
                className="flex items-center justify-center gap-2.5 px-4 py-4 rounded-2xl font-bold text-sm transition-all duration-300 border-2"
                style={{
                  background: active ? g.color : '#fff',
                  color: active ? '#fff' : g.color,
                  borderColor: active ? g.color : g.color + '25',
                  boxShadow: active ? `0 8px 24px ${g.color}30` : '0 2px 8px rgba(0,0,0,0.04)',
                  transform: active ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                {g.icon} {g.label}
              </button>
            );
          })}
        </div>

        {/* Graph Canvas */}
        <div id="kg-canvas" className="relative bg-white border rounded-[2.5rem] overflow-hidden shadow-2xl" style={{ borderColor: palette.accent + '30' }}>
          {/* Legend */}
          <div className="absolute top-6 left-6 z-10 bg-white/85 backdrop-blur-xl p-5 rounded-2xl shadow-lg border border-slate-100 pointer-events-none">
            <h4 className="font-black text-slate-900 mb-3 text-xs tracking-[0.15em] uppercase">图例</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <span className="w-3.5 h-3.5 rounded-full" style={{ background: GROUP_COLORS[graph.nodes[0]?.group] || '#94a3b8' }}></span> 传统知识节点
              </div>
              <div className="flex items-center gap-3 text-xs font-bold" style={{ color: palette.primary }}>
                <div className="relative w-3.5 h-3.5">
                  <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ background: palette.primary }}></span>
                  <span className="absolute inset-0 rounded-full" style={{ background: palette.primary }}></span>
                </div>
                AI 赋能节点
              </div>
            </div>
          </div>

          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            width={dims.width} height={dims.height}
            backgroundColor={palette.bg}
            nodeRelSize={7}
            linkColor={() => palette.accent + '50'}
            linkWidth={2.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.004}
            linkDirectionalParticleWidth={3}
            linkDirectionalParticleColor={() => palette.accent}
            d3Force={(d3, force) => { force.link.distance(180); force.charge.strength(-1000); }}
            nodeCanvasObject={paintNode}
            onEngineStop={() => fgRef.current?.zoomToFit(500, 80)}
            nodeLabel={node => `<div style="background:white;padding:12px 16px;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.12);border:1px solid #f1f5f9;min-width:180px">
              <div style="font-weight:900;font-size:15px;margin-bottom:4px;color:${node.isAI ? palette.primary : '#1e293b'}">${node.label}</div>
              ${node.isAI ? '<div style="font-size:11px;font-weight:800;color:'+palette.primary+';text-transform:uppercase;letter-spacing:0.1em;margin-top:6px">✦ AI 赋能模块</div>' : ''}
            </div>`}
            onNodeClick={node => { fgRef.current.centerAt(node.x, node.y, 800); fgRef.current.zoom(2.5, 800); }}
          />
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {[
            { icon:'🗺️', title:'六大专题图谱', desc:'物理层、网络层、运输层、应用层、安全专题独立展开，拒绝杂乱一锅炖。' },
            { icon:'🎨', title:'多彩层级配色', desc:'每个协议栈独占专属色系，蓝/紫/黄/绿/红一目了然。' },
            { icon:'🔍', title:'交互式聚焦', desc:'点击任意节点即可平滑缩放聚焦，拖拽平移探索知识关系链。' },
            { icon:'✨', title:'AI 节点光晕', desc:'AI 赋能节点以脉冲光晕高亮，粒子沿连线流动展示数据路径。' },
            { icon:'📐', title:'自适应布局', desc:'力导向引擎自动计算最优节点分布，大小合理、间距舒适。' },
            { icon:'🧠', title:'知识关联推荐', desc:'跨层级 AI 连线揭示深层次的技术融合点与学习路径。' },
          ].map((item, i) => (
            <div key={i} className="group p-7 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left">{item.icon}</div>
              <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
              <p className="text-slate-500 font-bold text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;