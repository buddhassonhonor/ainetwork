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
    title: "信号处理与物理链路",
    school: "泉州师范学院",
    lecturer: "郑世燕 (副教授, 博士)",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
    tags: ["信号处理", "博士团队"],
    description: "由郑世燕博士团队主讲，聚焦物理层信号处理。探讨编码、调制与 AI 算法在复杂电磁环境下的稳健传输机制。",
    chapters: [
      { id: 1, title: "第一章：信号分析基础", content: "傅里叶变换及其在网络通信中的重要性。" },
      { id: 2, title: "第二章：现代调制技术", content: "QAM、OFDM 及其 AI 优化算法。" }
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
    category: "本地精品课件",
    items: [
      { title: "CH1 概述 - 计算机网络核心概论", type: "PPTX", link: "/courseware/CH1-5ed 概述.pptx" },
      { title: "CH2 物理层 - 信号与传输媒体", type: "PPTX", link: "/courseware/CH2-5ed 物理层.pptx" },
      { title: "CH3 数据链路层 - 帧与协议", type: "PPTX", link: "/courseware/CH3-5ed 数据链路层.pptx" },
      { title: "CH4 网络层 - IP 与路由算法", type: "PPTX", link: "/courseware/CH4-5ed 网络层.pptx" },
      { title: "CH5 运输层 - TCP/UDP 深度剖析", type: "PPTX", link: "/courseware/CH5-5ed 运输层.pptx" },
      { title: "CH6 应用层 - 域名与应用协议", type: "PPTX", link: "/courseware/CH6-5ed 应用层.pptx" },
      { title: "实验1：网线的制作与标准", type: "DOCX", link: "/courseware/实验1 网线的制作.docx" },
      { title: "实验3：Packet Tracer 入门指南", type: "DOC", link: "/courseware/实验3 --Packet-Tracer-入门.doc" }
    ]
  },
  {
    category: "理论讲义",
    items: [
      { title: "计算机网络课程大纲 2026", type: "PDF", link: "#" },
      { title: "黄志高老师：网络与 AI 融合专题课件", type: "PPT", link: "#" },
      { title: "网络协议精讲笔记（泉师院版）", type: "Markdown", link: "#" }
    ]
  },
  {
    category: "实验案例",
    items: [
      { title: "基于 AI 的网络拓扑自动优化实验", type: "GitHub", link: "https://github.com/PKUFlyingPig/Computer-Network-A-Top-Down-Approach" },
      { title: "Wireshark 抓包分析：三次握手深度剖析", type: "Guide", link: "https://xiaolincoding.com/network/" },
      { title: "Packet Tracer 校园网组网实验手册", type: "Manual", link: "#" }
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
