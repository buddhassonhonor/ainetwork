import classRosters from './classRosters.json';
import networkQuizQuestions from './quizQuestions.json';
import networkQuizQuestionsCh3 from './quizQuestions_ch3.json';
import matlabQuizQuestions from './matlabQuestions.json';

export const CLASSES_CONFIG = [
  {
    id: '24-1',
    name: '2024级通信工程1班',
    shortName: '24通信1班',
    grade: '2024级',
    courseName: '数据通信与计算机网络',
    courseShortName: '计算机网络',
    courseCode: '0712065',
    seq: '01',
    college: '物理与信息工程学院',
    major: '通信工程',
    studentCount: 43,
    status: 'active',
    statusText: '随堂测验进行中',
    statusBadge: '测验进行中',
    description: '专业核心课 · 覆盖第1-4章随堂测验',
    accentColor: '#4f46e5',
    tagColor: 'indigo',
    questionsType: 'network',
    quizModules: [
      {
        id: 'quiz_ch1_ch2',
        title: '【习题1】第1-2章 概述与物理层随堂测验',
        shortTitle: '习题1_第1-2章',
        chapters: '第1章 概述 · 第2章 物理层',
        totalQuestions: 28,
      },
      {
        id: 'quiz_ch3',
        title: '【习题2】第3章 数据链路层随堂测验',
        shortTitle: '习题2_第3章',
        chapters: '第3章 数据链路层与局域网',
        totalQuestions: 16,
      },
      {
        id: 'quiz_ch4',
        title: '【习题3】第4章 网络层与IP协议随堂测验',
        shortTitle: '习题3_第4章',
        chapters: '第4章 网络层与IP编址路由',
        totalQuestions: 25,
      },
    ]
  },
  {
    id: '24-2',
    name: '2024级通信工程2班（闽台合作）',
    shortName: '24通信2班',
    grade: '2024级',
    courseName: '数据通信与计算机网络',
    courseShortName: '计算机网络',
    courseCode: '0712065',
    seq: '02',
    college: '物理与信息工程学院',
    major: '通信工程（闽台合作）',
    studentCount: 62,
    status: 'active',
    statusText: '随堂测验进行中',
    statusBadge: '测验进行中',
    description: '闽台合作项目 · 专业核心课 · 与1班题目同步，班级数据独立沉淀',
    accentColor: '#0ea5e9',
    tagColor: 'sky',
    questionsType: 'network',
    quizModules: [
      {
        id: 'quiz_ch1_ch2',
        title: '【习题1】第1-2章 概述与物理层随堂测验',
        shortTitle: '习题1_第1-2章',
        chapters: '第1章 概述 · 第2章 物理层',
        totalQuestions: 28,
      },
      {
        id: 'quiz_ch3',
        title: '【习题2】第3章 数据链路层随堂测验',
        shortTitle: '习题2_第3章',
        chapters: '第3章 数据链路层与局域网',
        totalQuestions: 16,
      },
      {
        id: 'quiz_ch4',
        title: '【习题3】第4章 网络层与IP协议随堂测验',
        shortTitle: '习题3_第4章',
        chapters: '第4章 网络层与IP编址路由',
        totalQuestions: 25,
      },
    ]
  },
  {
    id: '25-1',
    name: '2025级通信工程1班',
    shortName: '25通信1班',
    grade: '2025级',
    courseName: 'MATLAB程序设计与AI应用',
    courseShortName: 'MATLAB程序设计',
    courseCode: '0807411',
    seq: '01',
    college: '物理与信息工程学院',
    major: '通信工程',
    studentCount: 29,
    status: 'preview',
    statusText: '预留测试入口',
    statusBadge: '预留测试',
    description: '专业基础必修 · 算法仿真与AI工具编程 · 随堂测试题库预留',
    accentColor: '#059669',
    tagColor: 'emerald',
    questionsType: 'matlab',
    quizModules: [
      {
        id: 'quiz_matlab_1',
        title: '随堂测验 1：MATLAB基础语法与矩阵运算',
        shortTitle: '第1次测验_基础矩阵',
        chapters: '第1-2章 环境与矩阵数组运算',
        totalQuestions: 12,
      },
      {
        id: 'quiz_matlab_2',
        title: '随堂测验 2：程序控制与数据可视化',
        shortTitle: '第2次测验_控制绘图',
        chapters: '第3-5章 控制流、绘图与函数脚本',
        totalQuestions: 12,
      }
    ]
  },
  {
    id: '25-2',
    name: '2025级通信工程2班（闽台合作）',
    shortName: '25通信2班',
    grade: '2025级',
    courseName: 'MATLAB程序设计与AI应用',
    courseShortName: 'MATLAB程序设计',
    courseCode: '0807411',
    seq: '02',
    college: '物理与信息工程学院',
    major: '通信工程（闽台合作）',
    studentCount: 54,
    status: 'preview',
    statusText: '预留测试入口',
    statusBadge: '预留测试',
    description: '闽台合作项目 · 算法仿真与AI工具编程 · 随堂测试题库预留',
    accentColor: '#d97706',
    tagColor: 'amber',
    questionsType: 'matlab',
    quizModules: [
      {
        id: 'quiz_matlab_1',
        title: '随堂测验 1：MATLAB基础语法与矩阵运算',
        shortTitle: '第1次测验_基础矩阵',
        chapters: '第1-2章 环境与矩阵数组运算',
        totalQuestions: 12,
      },
      {
        id: 'quiz_matlab_2',
        title: '随堂测验 2：程序控制与数据可视化',
        shortTitle: '第2次测验_控制绘图',
        chapters: '第3-5章 控制流、绘图与函数脚本',
        totalQuestions: 12,
      }
    ]
  },
];

export const getQuestionsForClass = (classId, quizId = 'quiz_ch1_ch2') => {
  const cfg = CLASSES_CONFIG.find((c) => c.id === classId);
  if (cfg && cfg.questionsType === 'matlab') {
    if (quizId === 'quiz_matlab_2') {
      return matlabQuizQuestions.slice(12, 24);
    }
    return matlabQuizQuestions.slice(0, 12);
  }
  if (quizId === 'quiz_ch3') {
    return networkQuizQuestionsCh3;
  }
  return networkQuizQuestions;
};

export const getStudentsForClass = (classId) => {
  return classRosters[classId] || classRosters['24-1'] || [];
};

export const getClassConfig = (classId) => {
  return CLASSES_CONFIG.find((c) => c.id === classId) || CLASSES_CONFIG[0];
};
