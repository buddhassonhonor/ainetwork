export const classStudents = [
  { id: 1, name: '黄炳炎', progress: 75, hours: 12, score: 85, rank: 5 },
  { id: 2, name: '张学伟', progress: 90, hours: 18, score: 95, rank: 1 },
  { id: 3, name: '张梦杰', progress: 60, hours: 10, score: 72, rank: 15 },
  { id: 4, name: '郑诗怡', progress: 85, hours: 15, score: 88, rank: 3 },
  { id: 5, name: '朱坤诚', progress: 45, hours: 6, score: 65, rank: 25 },
  { id: 6, name: '夏熙原', progress: 80, hours: 14, score: 82, rank: 8 },
  { id: 7, name: '林鋆溢', progress: 70, hours: 11, score: 78, rank: 12 },
  { id: 8, name: '池锦辉', progress: 95, hours: 20, score: 92, rank: 2 },
  { id: 9, name: '郑思瀚', progress: 55, hours: 8, score: 68, rank: 20 },
  { id: 10, name: '范杨静', progress: 82, hours: 13, score: 86, rank: 6 },
  { id: 11, name: '杨宇腾', progress: 65, hours: 9, score: 75, rank: 18 },
  { id: 12, name: '黄鸿祝', progress: 78, hours: 12, score: 80, rank: 10 },
  { id: 13, name: '蔡佳鑫', progress: 88, hours: 16, score: 90, rank: 4 },
  { id: 14, name: '龚祎帆', progress: 50, hours: 7, score: 60, rank: 28 },
  { id: 15, name: '郑亚琦', progress: 72, hours: 11, score: 76, rank: 14 },
];

export const generateStudentData = (student) => {
  // 生成一些伪随机但看起来合理的数据
  const base = student.score / 100;
  return {
    ...student,
    major: "通信工程",
    experiments: Math.floor(12 * (student.progress / 100)),
    totalExperiments: 12,
    diagnosticData: [
      { subject: '物理层', A: Math.min(100, Math.floor(100 * base * (0.9 + Math.random()*0.2))), fullMark: 100 },
      { subject: '链路层', A: Math.min(100, Math.floor(100 * base * (0.8 + Math.random()*0.3))), fullMark: 100 },
      { subject: '网络层', A: Math.min(100, Math.floor(100 * base * (0.7 + Math.random()*0.4))), fullMark: 100 },
      { subject: '传输层', A: Math.min(100, Math.floor(100 * base * (0.8 + Math.random()*0.3))), fullMark: 100 },
      { subject: '应用层', A: Math.min(100, Math.floor(100 * base * (0.9 + Math.random()*0.2))), fullMark: 100 },
      { subject: 'AI融合', A: Math.min(100, Math.floor(100 * base * (0.6 + Math.random()*0.5))), fullMark: 100 },
    ],
    weeklyProgress: [
      { name: 'W1', hours: Math.floor(student.hours * 0.2) },
      { name: 'W2', hours: Math.floor(student.hours * 0.3) },
      { name: 'W3', hours: Math.floor(student.hours * 0.15) },
      { name: 'W4', hours: Math.floor(student.hours * 0.35) },
    ]
  };
};