export const courses = [
  {
    id: 1,
    title: "计算机网络",
    school: "哈尔滨工业大学",
    lecturer: "李全龙",
    image: "https://image.zhihuishu.com/zhs/onlineexam/ms_course_cover/201908/786a032d8b5b4f6e8b4e4e9a0e6b5b5b.jpg", // Placeholder or from Zhihuishu
    tags: ["国家精品", "基础理论"],
    description: "本课程系统地介绍了计算机网络的基本概念、原理和技术。涵盖物理层、数据链路层、网络层、传输层和应用层。"
  },
  {
    id: 2,
    title: "计算机网络原理",
    school: "清华大学",
    lecturer: "徐恪",
    image: "https://image.zhihuishu.com/zhs/onlineexam/ms_course_cover/201809/4a3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c.jpg",
    tags: ["硬核", "工程实践"],
    description: "深入剖析互联网体系结构及其核心协议，探讨现代网络技术的发展趋势。"
  },
  {
    id: 3,
    title: "网络安全导论",
    school: "上海交通大学",
    lecturer: "陈瑞华",
    image: "https://image.zhihuishu.com/zhs/onlineexam/ms_course_cover/202003/5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b.jpg",
    tags: ["安全", "前沿"],
    description: "介绍网络空间安全的基本理论、技术和应用，包括加密、防火墙、入侵检测等。"
  },
  {
    id: 4,
    title: "TCP/IP 协议分析",
    school: "浙江大学",
    lecturer: "王伟",
    image: "https://image.zhihuishu.com/zhs/onlineexam/ms_course_cover/202105/6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c.jpg",
    tags: ["协议", "进阶"],
    description: "逐层解析 TCP/IP 协议栈的工作机制，通过实验深入理解数据包的传输过程。"
  },
  {
    id: 5,
    title: "移动互联网技术",
    school: "华中科技大学",
    lecturer: "张勇",
    image: "https://image.zhihuishu.com/zhs/onlineexam/ms_course_cover/202201/7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d.jpg",
    tags: ["移动", "无线"],
    description: "探讨移动通信、无线网络及移动应用开发的相关技术。"
  }
];

export const resources = [
  {
    category: "理论基础",
    items: [
      { title: "OSI 七层模型详解", type: "PDF", link: "#" },
      { title: "TCP/IP 四层模型 vs OSI", type: "Article", link: "#" },
      { title: "计算机网络自顶向下方法 笔记", type: "Markdown", link: "#" }
    ]
  },
  {
    category: "协议深挖",
    items: [
      { title: "HTTP/3 原理与实战", type: "Video", link: "#" },
      { title: "DNS 查询全过程解析", type: "Animation", link: "#" },
      { title: "BGP 路由协议详解", type: "Slides", link: "#" }
    ]
  },
  {
    category: "实验工具",
    items: [
      { title: "Wireshark 抓包实战指南", type: "Guide", link: "#" },
      { title: "Packet Tracer 网络仿真", type: "Software", link: "#" },
      { title: "Linux 网络配置常用命令", type: "Cheat Sheet", link: "#" }
    ]
  }
];
