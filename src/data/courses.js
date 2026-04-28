export const courses = [
  {
    id: 1,
    title: "计算机网络 + AI 核心理论",
    school: "泉州师范学院",
    lecturer: "黄志高",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800",
    tags: ["理论主讲", "AI 赋能"],
    description: "本课程由黄志高老师主讲，深度融合 AI 技术与传统网络架构。从比特流到神经网络流，探索未来互联网的演进逻辑。涵盖物理层、数据链路层及 AI 驱动的网络优化。",
    chapters: [
      { id: 1, title: "第一章：网络概论与 AI 视角", content: "理解互联网基础设施，探讨 AI 在流量调度中的应用。" },
      { id: 2, title: "第二章：物理层与智能编码", content: "深入波形、频率与 AI 降噪技术。" },
      { id: 3, title: "第三章：数据链路层协议", content: "CSMA/CD 协议、以太网交换机与智能路由。" }
    ]
  },
  {
    id: 2,
    title: "无线接入与智能物理链路",
    school: "泉州师范学院",
    lecturer: "郑世燕 (副教授, 博士)",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
    tags: ["无线网络", "智能链路"],
    description: "郑世燕博士团队主讲。本课程专注于计算机网络底层的无线接入与智能链路技术。探讨如何利用 AI 算法优化协议机制、实现智能冲突避免与动态频谱管理，提升复杂网络环境下的传输效能。",
    chapters: [
      { id: 1, title: "第一章：无线协议与智能接入", content: "IEEE 802.11 协议族及基于 AI 的媒体访问控制 (MAC) 优化。" },
      { id: 2, title: "第二章：网络资源动态调度", content: "利用强化学习实现多用户环境下的信道分配与流量整形。" }
    ]
  },
  {
    id: 3,
    title: "网络图像与智能多媒体",
    school: "泉州师范学院",
    lecturer: "李全法 (实验师)",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    tags: ["图像处理", "AI 视觉"],
    description: "李全法老师带你进入网络多媒体的世界。研究多媒体实验教学与系统维护，专注于实时视频流的物理链路优化。",
    chapters: [
      { id: 1, title: "第一章：多媒体编码", content: "HEVC、AV1 编码原理及 AI 视频增强。" },
      { id: 2, title: "第二章：CDN 分发网络", content: "内容分发网络与智能边缘缓存。" }
    ]
  }
];

export const resources = [
  {
    category: "核心课件 (PPTX)",
    items: [
      { id: 101, title: "CH1 概述 - 计算机网络核心概论", type: "pptx", link: "/courseware/CH1-5ed 概述.pptx", desc: "网络体系结构、互联网的组成与演进历程" },
      { id: 102, title: "CH2 物理层 - 信号与传输媒体", type: "pptx", link: "/courseware/CH2-5ed 物理层.pptx", desc: "信道复用、宽带接入与物理层核心技术" },
      { id: 103, title: "CH3 数据链路层 - 帧与协议", type: "pptx", link: "/courseware/CH3-5ed 数据链路层.pptx", desc: "CSMA/CD、MAC层机制与以太网交换" },
      { id: 104, title: "CH4 网络层 - IP 与路由算法", type: "pptx", link: "/courseware/CH4-5ed 网络层.pptx", desc: "IPv4/IPv6、路由选择协议(OSPF/BGP)" },
      { id: 105, title: "CH5 运输层 - TCP/UDP 深度剖析", type: "pptx", link: "/courseware/CH5-5ed 运输层.pptx", desc: "可靠传输机制、拥塞控制与流量调度" },
      { id: 106, title: "CH6 应用层 - 域名与应用协议", type: "pptx", link: "/courseware/CH6-5ed 应用层.pptx", desc: "DNS、HTTP、FTP与电子邮件系统" }
    ]
  },
  {
    category: "Packet Tracer 高阶实验",
    items: [
      { id: 201, title: "实验2：交换机基本配置与管理", type: "pptx", link: "/courseware/pt-labs/2 交换机的基本配置与管理.pptx", desc: "CLI模式登录、hostname/密码/端口配置" },
      { id: 202, title: "实验4：交换机划分VLAN配置", type: "pptx", link: "/courseware/pt-labs/4 交换机划分Vlan配置.pptx", desc: "VLAN创建、Trunk端口与跨交换机通信" },
      { id: 203, title: "实验7：路由器的基本配置", type: "pptx", link: "/courseware/pt-labs/7 路由器的基本配置.pptx", desc: "路由器接口配置、show命令与调试" },
      { id: 204, title: "实验7.5：静态路由配置", type: "pptx", link: "/courseware/pt-labs/7.5 静态路由配置.pptx", desc: "手动路由表项配置与多跳路径设定" },
      { id: 205, title: "实验8：RIP动态路由配置", type: "pptx", link: "/courseware/pt-labs/8 思科rip配置实验.pptx", desc: "RIPv1/v2协议配置与路由收敛验证" },
      { id: 206, title: "实验9：NAT地址转换实验", type: "pptx", link: "/courseware/pt-labs/9 NAT实验.pptx", desc: "静态NAT/动态NAT配置与内外网映射" },
      { id: 207, title: "实验10：NAPT端口转换实验", type: "pptx", link: "/courseware/pt-labs/10 NAPT配置实验.pptx", desc: "端口地址转换PAT与多对一映射" },
      { id: 208, title: "实验11：DHCP服务器配置", type: "pptx", link: "/courseware/pt-labs/11 DHCP配置实验.pptx", desc: "DHCP地址池、中继代理ip helper-address" },
      { id: 209, title: "实验14：三层交换机VLAN间通信", type: "pptx", link: "/courseware/pt-labs/14 三层交换机实现VLAN间通信.pptx", desc: "SVI接口与ip routing跨VLAN三层转发" },
      { id: 210, title: "实验15：访问控制列表ACL", type: "pptx", link: "/courseware/pt-labs/15 访问控制列表实验.pptx", desc: "标准/扩展ACL规则与流量过滤策略" }
    ]
  },
  {
    category: "基础动手实验",
    items: [
      { id: 211, title: "实验1：网线的制作与标准", type: "docx", link: "/courseware/experiments/实验1 网线的制作.docx", desc: "TIA/EIA 568A/B 标准与 RJ-45 压接实战" },
      { id: 212, title: "实验2：基于VPS的网站建设", type: "docx", link: "/courseware/experiments/实验2 基于VPS的网站建设.docx", desc: "云服务器配置、LNMP/LAMP 环境搭建" },
      { id: 213, title: "实验3：Packet Tracer 入门指南", type: "doc", link: "/courseware/experiments/实验3 --Packet-Tracer-入门.doc", desc: "思科模拟器基础组网操作与拓扑绘制" },
      { id: 214, title: "集线器与交换机的对比实验", type: "docx", link: "/courseware/pt-labs/2-3  集线器与交换机的对比实验.docx", desc: "广播域冲突域分析与抓包验证" },
      { id: 215, title: "无线局域网配置实验", type: "docx", link: "/courseware/pt-labs/12 无线局域网配置实验.docx", desc: "无线AP/路由器配置与SSID安全设置" },
      { id: 216, title: "交换机VLAN与广播包实验", type: "docx", link: "/courseware/pt-labs/13 交换机VLAN配置及广播包实验.docx", desc: "VLAN隔离效果验证与广播域分析" }
    ]
  },
  {
    category: "课堂练习与习题",
    items: [
      { id: 301, title: "第一章：概述练习题", type: "doc", link: "/courseware/exercises/第一章概述.doc", desc: "核心概念填空与简答" },
      { id: 302, title: "第二章：物理层练习题", type: "doc", link: "/courseware/exercises/第二章物理层.doc", desc: "奈氏准则、香农公式计算" },
      { id: 303, title: "第三章：数据链路层习题", type: "doc", link: "/courseware/exercises/第三章数据链路层习题.doc", desc: "帧结构与 CRC 校验" },
      { id: 304, title: "第四章：网络层与CIDR", type: "pptx", link: "/courseware/exercises/CIDR网络层练习.pptx", desc: "子网划分、路由表聚合与匹配" },
      { id: 305, title: "第五章：运输层习题", type: "doc", link: "/courseware/exercises/第五章运输层.doc", desc: "TCP 状态机与窗口计算" },
      { id: 306, title: "综合期末复习题库", type: "docx", link: "/courseware/exercises/计算机网络习题new .docx", desc: "全书重点题型汇总与详解" }
    ]
  }
];

export const studentStats = [
  { id: "220308001", student: "苏福伟", class: "22级通信(闽台)", progress: 85, activeTime: "12h" },
  { id: "220308002", student: "周俊中", class: "22级通信(闽台)", progress: 62, activeTime: "8h" },
  { id: "220308003", student: "陈婷婷", class: "22级通信(闽台)", progress: 94, activeTime: "20h" },
  { id: "220308004", student: "邱浩华", class: "22级通信(闽台)", progress: 45, activeTime: "5h" },
  { id: "220308005", student: "黄璇", class: "22级通信(闽台)", progress: 78, activeTime: "15h" },
  { id: "220308006", student: "杨智惠", class: "22级通信(闽台)", progress: 88, activeTime: "18h" },
  { id: "220308007", student: "苏荣坤", class: "22级通信(闽台)", progress: 91, activeTime: "22h" },
  { id: "220308008", student: "魏祎鑫", class: "22级通信(闽台)", progress: 55, activeTime: "7h" }
];
