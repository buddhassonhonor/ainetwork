import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ArrowLeft, Bot, Sparkles, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

const KnowledgeGraph = () => {
  const graphData = useMemo(() => {
    const nodes = [
      // Layer 1: Physical
      { id: 'Physical', group: 1, val: 20, label: '物理层 (Physical Layer)', desc: '比特流传输, 信号调制' },
      { id: 'Fiber', group: 1, val: 10, label: '光纤传输', desc: '高速信号传输' },
      { id: 'SignalAI', group: 1, val: 15, label: 'AI信号处理', desc: '基于AI的信噪比优化' },
      
      // Layer 2: Data Link
      { id: 'DataLink', group: 2, val: 20, label: '数据链路层 (Data Link Layer)', desc: '成帧, 差错控制' },
      { id: 'MAC', group: 2, val: 10, label: 'MAC地址', desc: '介质访问控制' },
      { id: 'SwitchingAI', group: 2, val: 15, label: 'AI智能交换', desc: '自适应负载均衡' },
      
      // Layer 3: Network
      { id: 'NetworkLayer', group: 3, val: 25, label: '网络层 (Network Layer)', desc: 'IP编址, 路由选择' },
      { id: 'IP', group: 3, val: 12, label: 'IPv4/IPv6', desc: '全球唯一标识' },
      { id: 'RoutingAI', group: 3, val: 18, label: 'AI智能路由', desc: '强化学习路径优化', isAI: true },
      { id: 'QoS_AI', group: 3, val: 15, label: 'AI流量预测', desc: '基于LSTM的拥塞控制', isAI: true },
      
      // Layer 4: Transport
      { id: 'Transport', group: 4, val: 20, label: '运输层 (Transport Layer)', desc: '进程间通信, TCP/UDP' },
      { id: 'TCP', group: 4, val: 10, label: 'TCP协议', desc: '可靠传输' },
      { id: 'CongestionAI', group: 4, val: 15, label: 'AI拥塞算法', desc: 'BBR-AI 深度学习优化', isAI: true },
      
      // Layer 5-7: Application
      { id: 'Application', group: 5, val: 20, label: '应用层 (Application Layer)', desc: 'HTTP, DNS, FTP' },
      { id: 'DNS_AI', group: 5, val: 15, label: 'AI智能解析', desc: '防止DNS劫持与加速', isAI: true },
      { id: 'SecurityAI', group: 5, val: 18, label: 'AI网络安全', desc: '异常流量检测与防御', isAI: true },
    ];

    const links = [
      { source: 'Physical', target: 'DataLink' },
      { source: 'Physical', target: 'Fiber' },
      { source: 'Physical', target: 'SignalAI' },
      
      { source: 'DataLink', target: 'NetworkLayer' },
      { source: 'DataLink', target: 'MAC' },
      { source: 'DataLink', target: 'SwitchingAI' },
      
      { source: 'NetworkLayer', target: 'Transport' },
      { source: 'NetworkLayer', target: 'IP' },
      { source: 'NetworkLayer', target: 'RoutingAI' },
      { source: 'NetworkLayer', target: 'QoS_AI' },
      
      { source: 'Transport', target: 'Application' },
      { source: 'Transport', target: 'TCP' },
      { source: 'Transport', target: 'CongestionAI' },
      
      { source: 'Application', target: 'DNS_AI' },
      { source: 'Application', target: 'SecurityAI' },
      
      // Inter-layer AI connections
      { source: 'RoutingAI', target: 'QoS_AI' },
      { source: 'SecurityAI', target: 'RoutingAI' },
    ];

    return { nodes, links };
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <div className="section-container">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:text-indigo-800 transition-colors">
          <ArrowLeft size={20} /> 返回课程大厅
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 flex items-center gap-4">
              <Network className="text-indigo-600" size={48} />
              AI+ 计算机网络 <span className="text-indigo-600 underline decoration-sky-400">知识图谱</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              基于《人工智能通识课程建设指南》，本图谱展示了计算机网络五层协议栈与 AI 技术的深度融合点。点击节点可查看 AI 赋能详情。
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <p className="text-indigo-900 font-black text-xl">AI 节点占比 45%</p>
              <p className="text-indigo-600 text-sm font-bold uppercase tracking-wider">智能驱动的教学体系</p>
            </div>
          </div>
        </div>

        {/* Graph Visualization */}
        <div className="relative bg-white border border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden min-h-[700px]">
          <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-3 text-sm">图例说明</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-indigo-600"></span> 传统网络协议
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-sky-400 animate-pulse"></span> AI 赋能节点
                </div>
              </div>
            </div>
          </div>

          <ForceGraph2D
            graphData={graphData}
            nodeLabel={(node) => `
              <div class="bg-white text-slate-800 p-3 rounded-xl shadow-2xl border border-slate-200">
                <p class="font-black text-lg mb-1">${node.label}</p>
                <p class="text-slate-500 text-xs">${node.desc}</p>
                ${node.isAI ? '<p class="mt-2 text-indigo-600 text-[10px] font-black uppercase">✨ AI 赋能模块</p>' : ''}
              </div>
            `}
            nodeColor={(node) => (node.isAI ? '#4f46e5' : '#94a3b8')}
            nodeRelSize={6}
            linkColor={() => '#cbd5e1'}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            backgroundColor="#ffffff"
            width={1200}
            height={700}
            d3Force={(d3, force) => {
              force.link.distance(80);
              force.charge.strength(-400);
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.label;
              const fontSize = 12/globalScale;
              ctx.font = `bold ${fontSize}px Inter, sans-serif`;
              
              // Draw Node
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
              ctx.fillStyle = node.isAI ? '#4f46e5' : '#94a3b8';
              ctx.fill();
              
              // Draw Text
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#1e293b';
              ctx.fillText(label, node.x, node.y + (node.val / 2) + fontSize + 2);
            }}
            onNodeClick={(node) => {
              alert(`正在加载 ${node.label} 的 AI 赋能学习资源...`);
            }}
          />
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: '个性化学习路径', desc: 'AI 根据图谱掌握情况自动生成' },
            { title: '知识关联推荐', desc: '深度挖掘计网与 AI 的交叉点' },
            { title: '智能诊断反馈', desc: '实时分析知识点薄弱环节' },
            { title: '沉浸式交互', desc: '可视化展示协议运行过程' },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-xl font-black text-slate-900 mb-3">{item.title}</h4>
              <p className="text-slate-500 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;