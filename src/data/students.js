export const classStudents = [
  { id: 1,  name: '黄炳炎', progress: 75, hours: 12, score: 85, rank: 5,  avgQuiz: 82, labCount: 8 },
  { id: 2,  name: '张学伟', progress: 90, hours: 18, score: 95, rank: 1,  avgQuiz: 96, labCount: 11 },
  { id: 3,  name: '张梦杰', progress: 60, hours: 10, score: 72, rank: 15, avgQuiz: 68, labCount: 6 },
  { id: 4,  name: '郑诗怡', progress: 85, hours: 15, score: 88, rank: 3,  avgQuiz: 90, labCount: 10 },
  { id: 5,  name: '朱坤诚', progress: 45, hours: 6,  score: 65, rank: 25, avgQuiz: 58, labCount: 4 },
  { id: 6,  name: '夏熙原', progress: 80, hours: 14, score: 82, rank: 8,  avgQuiz: 79, labCount: 9 },
  { id: 7,  name: '林鋆溢', progress: 70, hours: 11, score: 78, rank: 12, avgQuiz: 74, labCount: 7 },
  { id: 8,  name: '池锦辉', progress: 95, hours: 20, score: 92, rank: 2,  avgQuiz: 94, labCount: 12 },
  { id: 9,  name: '郑思瀚', progress: 55, hours: 8,  score: 68, rank: 20, avgQuiz: 62, labCount: 5 },
  { id: 10, name: '范杨静', progress: 82, hours: 13, score: 86, rank: 6,  avgQuiz: 84, labCount: 9 },
  { id: 11, name: '杨宇腾', progress: 65, hours: 9,  score: 75, rank: 18, avgQuiz: 70, labCount: 6 },
  { id: 12, name: '黄鸿祝', progress: 78, hours: 12, score: 80, rank: 10, avgQuiz: 76, labCount: 8 },
  { id: 13, name: '蔡佳鑫', progress: 88, hours: 16, score: 90, rank: 4,  avgQuiz: 92, labCount: 10 },
  { id: 14, name: '龚祎帆', progress: 50, hours: 7,  score: 60, rank: 28, avgQuiz: 55, labCount: 4 },
  { id: 15, name: '郑亚琦', progress: 72, hours: 11, score: 76, rank: 14, avgQuiz: 72, labCount: 7 },
  { id: 16, name: '蔡文熙', progress: 92, hours: 19, score: 94, rank: 3,  avgQuiz: 95, labCount: 11 },
  { id: 17, name: '许浩帆', progress: 58, hours: 9,  score: 70, rank: 19, avgQuiz: 65, labCount: 5 },
  { id: 18, name: '刘海超', progress: 84, hours: 14, score: 87, rank: 7,  avgQuiz: 85, labCount: 9 },
  { id: 19, name: '何达煌', progress: 68, hours: 10, score: 74, rank: 16, avgQuiz: 71, labCount: 7 },
  { id: 20, name: '王思琪', progress: 77, hours: 12, score: 81, rank: 9,  avgQuiz: 78, labCount: 8 },
  { id: 21, name: '陈家豪', progress: 62, hours: 9,  score: 73, rank: 17, avgQuiz: 69, labCount: 6 },
  { id: 22, name: '李文博', progress: 86, hours: 15, score: 89, rank: 5,  avgQuiz: 88, labCount: 10 },
  { id: 23, name: '吴晓峰', progress: 48, hours: 6,  score: 62, rank: 26, avgQuiz: 56, labCount: 4 },
  { id: 24, name: '赵雨萱', progress: 91, hours: 17, score: 93, rank: 2,  avgQuiz: 93, labCount: 11 },
  { id: 25, name: '孙浩然', progress: 73, hours: 11, score: 77, rank: 13, avgQuiz: 73, labCount: 7 },
  { id: 26, name: '周雅琴', progress: 81, hours: 13, score: 84, rank: 7,  avgQuiz: 81, labCount: 9 },
  { id: 27, name: '钱志远', progress: 42, hours: 5,  score: 58, rank: 30, avgQuiz: 52, labCount: 3 },
  { id: 28, name: '林嘉怡', progress: 79, hours: 13, score: 83, rank: 8,  avgQuiz: 80, labCount: 8 },
  { id: 29, name: '黄俊杰', progress: 67, hours: 10, score: 76, rank: 15, avgQuiz: 72, labCount: 7 },
  { id: 30, name: '方晨曦', progress: 87, hours: 16, score: 91, rank: 4,  avgQuiz: 90, labCount: 10 },
];

// 班级整体统计
export const classStats = {
  total: 30,
  avgScore: Math.round(classStudents.reduce((s, st) => s + st.score, 0) / classStudents.length),
  avgProgress: Math.round(classStudents.reduce((s, st) => s + st.progress, 0) / classStudents.length),
  passRate: Math.round(classStudents.filter(s => s.score >= 60).length / classStudents.length * 100),
  excellentRate: Math.round(classStudents.filter(s => s.score >= 90).length / classStudents.length * 100),
  totalHours: classStudents.reduce((s, st) => s + st.hours, 0),
  // 分数段分布
  distribution: [
    { range: '90-100', count: classStudents.filter(s => s.score >= 90).length, color: '#10b981' },
    { range: '80-89',  count: classStudents.filter(s => s.score >= 80 && s.score < 90).length, color: '#6366f1' },
    { range: '70-79',  count: classStudents.filter(s => s.score >= 70 && s.score < 80).length, color: '#f59e0b' },
    { range: '60-69',  count: classStudents.filter(s => s.score >= 60 && s.score < 70).length, color: '#f97316' },
    { range: '<60',    count: classStudents.filter(s => s.score < 60).length, color: '#ef4444' },
  ],
  // 周活跃趋势
  weeklyTrend: [
    { week: '第1周', hours: 180, active: 28 },
    { week: '第2周', hours: 210, active: 29 },
    { week: '第3周', hours: 195, active: 26 },
    { week: '第4周', hours: 260, active: 30 },
    { week: '第5周', hours: 320, active: 30 },
    { week: '第6周', hours: 280, active: 28 },
    { week: '第7周', hours: 350, active: 30 },
    { week: '第8周', hours: 420, active: 30 },
  ],
  // 各章节掌握度
  chapterMastery: [
    { chapter: 'CH1概述', mastery: 92 },
    { chapter: 'CH2物理层', mastery: 85 },
    { chapter: 'CH3链路层', mastery: 78 },
    { chapter: 'CH4网络层', mastery: 72 },
    { chapter: 'CH5运输层', mastery: 68 },
    { chapter: 'CH6应用层', mastery: 74 },
  ],
};

export const generateStudentData = (student) => {
  const base = student.score / 100;
  const seed = student.id * 7;
  const pseudo = (n) => ((seed * n + 13) % 37) / 37;

  return {
    ...student,
    studentName: student.name,
    major: "通信工程",
    grade: "2023级",
    experiments: student.labCount,
    totalExperiments: 12,
    gpa: (2.5 + base * 1.5).toFixed(1),
    classRank: student.rank,
    totalStudents: 30,
    diagnosticData: [
      { subject: '物理层', A: Math.min(100, Math.floor(100 * base * (0.85 + pseudo(1) * 0.2))), fullMark: 100 },
      { subject: '链路层', A: Math.min(100, Math.floor(100 * base * (0.80 + pseudo(2) * 0.25))), fullMark: 100 },
      { subject: '网络层', A: Math.min(100, Math.floor(100 * base * (0.70 + pseudo(3) * 0.35))), fullMark: 100 },
      { subject: '传输层', A: Math.min(100, Math.floor(100 * base * (0.75 + pseudo(4) * 0.3))), fullMark: 100 },
      { subject: '应用层', A: Math.min(100, Math.floor(100 * base * (0.85 + pseudo(5) * 0.2))), fullMark: 100 },
      { subject: 'AI融合', A: Math.min(100, Math.floor(100 * base * (0.55 + pseudo(6) * 0.5))), fullMark: 100 },
    ],
    weeklyProgress: [
      { name: 'W1', hours: Math.max(1, Math.floor(student.hours * (0.1 + pseudo(7) * 0.15))) },
      { name: 'W2', hours: Math.max(1, Math.floor(student.hours * (0.15 + pseudo(8) * 0.15))) },
      { name: 'W3', hours: Math.max(1, Math.floor(student.hours * (0.1 + pseudo(9) * 0.1))) },
      { name: 'W4', hours: Math.max(1, Math.floor(student.hours * (0.2 + pseudo(10) * 0.15))) },
      { name: 'W5', hours: Math.max(1, Math.floor(student.hours * (0.15 + pseudo(11) * 0.2))) },
      { name: 'W6', hours: Math.max(1, Math.floor(student.hours * (0.1 + pseudo(12) * 0.15))) },
      { name: 'W7', hours: Math.max(2, Math.floor(student.hours * (0.2 + pseudo(13) * 0.2))) },
      { name: 'W8', hours: Math.max(2, Math.floor(student.hours * (0.25 + pseudo(14) * 0.15))) },
    ],
    labRecords: [
      { name: '交换机基本配置与管理', layer: '链路层', score: Math.min(100, Math.floor(base * 100 * (0.85 + pseudo(15) * 0.2))), status: base > 0.75 ? '优秀' : base > 0.6 ? '良好' : '待改进' },
      { name: '交换机VLAN划分配置', layer: '链路层', score: Math.min(100, Math.floor(base * 100 * (0.8 + pseudo(16) * 0.25))), status: base > 0.78 ? '优秀' : base > 0.62 ? '良好' : '待改进' },
      { name: '静态路由配置', layer: '网络层', score: Math.min(100, Math.floor(base * 100 * (0.7 + pseudo(17) * 0.35))), status: base > 0.8 ? '优秀' : base > 0.65 ? '良好' : '待改进' },
      { name: 'RIP动态路由配置', layer: '网络层', score: Math.min(100, Math.floor(base * 100 * (0.75 + pseudo(18) * 0.3))), status: base > 0.82 ? '优秀' : base > 0.68 ? '良好' : '待改进' },
      { name: 'NAT地址转换实验', layer: '网络层', score: Math.min(100, Math.floor(base * 100 * (0.72 + pseudo(19) * 0.3))), status: base > 0.8 ? '优秀' : base > 0.65 ? '良好' : '待改进' },
      { name: 'ACL访问控制列表', layer: '安全', score: Math.min(100, Math.floor(base * 100 * (0.65 + pseudo(20) * 0.4))), status: base > 0.85 ? '优秀' : base > 0.7 ? '良好' : '待改进' },
    ],
    // AI个性化建议
    aiSuggestions: base >= 0.85 ? [
      { title: '挑战三层交换机VLAN间通信', time: '预计 60min', level: '进阶' },
      { title: '阅读SDN与AI融合白皮书', time: '预计 30min', level: '拓展' },
      { title: '完成ACL综合实验设计', time: '预计 90min', level: '创新' },
    ] : base >= 0.7 ? [
      { title: '复习网络层路由算法', time: '预计 45min', level: '高优先' },
      { title: '完成NAT/NAPT实验练习', time: '预计 60min', level: '必做' },
      { title: '观看AI流量预测视频', time: '预计 20min', level: '拓展' },
    ] : [
      { title: '回顾CH1-CH3基础概念', time: '预计 30min', level: '紧急' },
      { title: '重做交换机配置实验', time: '预计 45min', level: '必做' },
      { title: '完成物理层习题集', time: '预计 40min', level: '高优先' },
    ],
  };
};