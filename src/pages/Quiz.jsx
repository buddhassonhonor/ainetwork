import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Award,
  BookOpen,
  Download,
  Search,
  RotateCcw,
  FileText,
  BarChart3,
  Users,
  Check,
  ChevronRight,
  AlertCircle,
  LogOut,
  GraduationCap,
  TrendingUp,
  Layers,
  HelpCircle,
  Send,
  Eye,
  ArrowRight,
  CheckSquare,
  Trash2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Lock,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import QuizPortal from '../components/QuizPortal';
import {
  CLASSES_CONFIG,
  getClassConfig,
  getStudentsForClass,
  getQuestionsForClass
} from '../data/classesConfig';

const CURRENT_STUDENT_KEY = 'ainetwork_quiz_current_student';
const DRAFT_ANSWERS_KEY = 'ainetwork_quiz_draft_answers_';

// ===== DEVICE LOCK ("一台电脑只能答一次") =====
// Browser security/privacy standards (W3C) strictly forbid JS from reading
// physical MAC addresses. The standard web solution is persistent device
// fingerprinting stored in localStorage + cookie.
const MASTER_PASSWORD = '5163'; // Teacher authorization password — NEVER shown in UI
const DEVICE_LOCK_PREFIX = 'ainetwork_device_lock_'; // key: DEVICE_LOCK_PREFIX + quizId

const getDeviceLock = (classId, quizId) => {
  try {
    const raw = localStorage.getItem(`${DEVICE_LOCK_PREFIX}${classId}_${quizId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveDeviceLock = (classId, quizId, lockData) => {
  try {
    localStorage.setItem(`${DEVICE_LOCK_PREFIX}${classId}_${quizId}`, JSON.stringify(lockData));
    document.cookie = `${DEVICE_LOCK_PREFIX}${classId}_${quizId}=${encodeURIComponent(JSON.stringify(lockData))};path=/;max-age=604800`;
  } catch {
    // ignore
  }
};

const clearDeviceLock = (classId, quizId) => {
  try {
    localStorage.removeItem(`${DEVICE_LOCK_PREFIX}${classId}_${quizId}`);
    document.cookie = `${DEVICE_LOCK_PREFIX}${classId}_${quizId}=;path=/;max-age=0`;
  } catch {
    // ignore
  }
};

export default function Quiz() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlClassId = searchParams.get('class');

  const getInitialClassId = () => {
    try {
      if (urlClassId && CLASSES_CONFIG.some((c) => c.id === urlClassId)) {
        return urlClassId;
      }
      const saved = localStorage.getItem('ainetwork_quiz_selected_class_id');
      if (saved && CLASSES_CONFIG.some((c) => c.id === saved)) {
        return saved;
      }
    } catch {}
    return '24-1';
  };

  const [currentClassId, setCurrentClassId] = useState(getInitialClassId);

  // Navigation / views: 'portal' | 'login' | 'testing' | 'review' | 'records'
  // When visiting /quiz (no ?class=...), ALWAYS display the unified portal
  const [view, setView] = useState(() => {
    if (urlClassId && CLASSES_CONFIG.some((c) => c.id === urlClassId)) {
      return 'login';
    }
    return 'portal';
  });

  // Keep view and classId synchronized with URL searchParams
  useEffect(() => {
    if (urlClassId && CLASSES_CONFIG.some((c) => c.id === urlClassId)) {
      setCurrentClassId(urlClassId);
      localStorage.setItem('ainetwork_quiz_selected_class_id', urlClassId);
      if (view === 'portal') {
        setView('login');
      }
    } else if (!urlClassId) {
      setView('portal');
    }
  }, [urlClassId]);

  const classConfig = useMemo(() => getClassConfig(currentClassId), [currentClassId]);
  const studentsData = useMemo(() => getStudentsForClass(currentClassId), [currentClassId]);
  const realStudentsData = useMemo(() => studentsData.filter((s) => !s.isTest), [studentsData]);
  const quizQuestions = useMemo(() => getQuestionsForClass(currentClassId), [currentClassId]);
  const QUIZ_MODULES = classConfig.quizModules;

  // Multi-quiz state
  const [currentQuizId, setCurrentQuizId] = useState(() => QUIZ_MODULES[0]?.id || 'quiz_ch1_ch2');
  const [selectedQuizId, setSelectedQuizId] = useState(() => QUIZ_MODULES[0]?.id || 'quiz_ch1_ch2');

  // Login inputs
  const [inputName, setInputName] = useState('');
  const [inputId, setInputId] = useState('');
  const [loginError, setLoginError] = useState('');

  // Retake password modal state
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [retakePasswordInput, setRetakePasswordInput] = useState('');
  const [retakeError, setRetakeError] = useState('');

  // Device Lock modal state
  const [showDeviceLockModal, setShowDeviceLockModal] = useState(false);
  const [deviceLockInfo, setDeviceLockInfo] = useState(null);
  const [deviceUnlockPasswordInput, setDeviceUnlockPasswordInput] = useState('');
  const [deviceUnlockError, setDeviceUnlockError] = useState('');
  const [pendingLoginStudent, setPendingLoginStudent] = useState(null);

  // Current authenticated student (strictly scoped to current class)
  const [currentStudent, setCurrentStudent] = useState(() => {
    try {
      const initialCls = getInitialClassId();
      const saved = localStorage.getItem(`${CURRENT_STUDENT_KEY}_${initialCls}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Test state
  const [answers, setAnswers] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Review state
  const [reviewFilter, setReviewFilter] = useState('all');
  const [activeReviewRecord, setActiveReviewRecord] = useState(null);

  // Records state
  const getClassStorageKey = (clsId) => `ainetwork_quiz_records_${clsId}_v2`;

  const loadClassRecords = (clsId) => {
    try {
      const key = getClassStorageKey(clsId);
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      if (clsId === '24-1') {
        const legacy = localStorage.getItem('ainetwork_quiz_records_v2');
        if (legacy) return JSON.parse(legacy);
      }
    } catch {}
    return [];
  };

  const [records, setRecords] = useState(() => loadClassRecords(getInitialClassId()));

  // Table filters for records
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatus, setTableStatus] = useState('all');

  // Handle returning to unified portal
  const handleBackToPortal = () => {
    setSearchParams({});
    setView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle selecting a class from Portal
  const handleSelectClass = (clsId) => {
    setCurrentClassId(clsId);
    localStorage.setItem('ainetwork_quiz_selected_class_id', clsId);
    setSearchParams({ class: clsId });
    setView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch class effect
  useEffect(() => {
    const loaded = loadClassRecords(currentClassId);
    setRecords(loaded);
    const cfg = getClassConfig(currentClassId);
    if (cfg && cfg.quizModules && cfg.quizModules.length > 0) {
      setCurrentQuizId(cfg.quizModules[0].id);
      setSelectedQuizId(cfg.quizModules[0].id);
    }
    const studentSaved = localStorage.getItem(`${CURRENT_STUDENT_KEY}_${currentClassId}`);
    if (studentSaved) {
      try {
        setCurrentStudent(JSON.parse(studentSaved));
      } catch {
        setCurrentStudent(null);
      }
    } else {
      setCurrentStudent(null);
    }
    setInputName('');
    setInputId('');
    setLoginError('');
  }, [currentClassId]);

  // Sync records to localStorage
  const saveRecords = (newRecords) => {
    setRecords(newRecords);
    const key = getClassStorageKey(currentClassId);
    localStorage.setItem(key, JSON.stringify(newRecords));
    if (currentClassId === '24-1') {
      localStorage.setItem('ainetwork_quiz_records_v2', JSON.stringify(newRecords));
    }
  };

  const currentQuizModule = useMemo(() => {
    return QUIZ_MODULES.find((m) => m.id === currentQuizId) || QUIZ_MODULES[0];
  }, [currentQuizId]);

  const selectedQuizModule = useMemo(() => {
    return (
      QUIZ_MODULES.find((m) => m.id === selectedQuizId) || {
        id: 'all',
        title: '全部随堂测验汇总',
        shortTitle: '全课程测验汇总',
        chapters: '全课程各章节',
        totalQuestions: quizQuestions.length,
      }
    );
  }, [selectedQuizId]);

  // Check if current logged-in student has already submitted for current quiz
  const currentStudentExistingRecord = useMemo(() => {
    if (!currentStudent) return null;
    const studentAttempts = records.filter(
      (r) =>
        r.studentId === currentStudent.id &&
        (r.quizId || 'quiz_ch1_ch2') === currentQuizId
    );
    if (studentAttempts.length === 0) return null;
    return studentAttempts[studentAttempts.length - 1];
  }, [currentStudent, records, currentQuizId]);

  // Automatically load draft or redirect if logged in
  useEffect(() => {
    if (currentStudent) {
      const draft = localStorage.getItem(DRAFT_ANSWERS_KEY + currentStudent.id);
      if (draft) {
        try {
          setAnswers(JSON.parse(draft));
        } catch {
          // ignore
        }
      }
    }
  }, [currentStudent]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanName = inputName.trim();
    const cleanId = inputId.trim();

    if (!cleanName || !cleanId) {
      setLoginError('请完整输入学生姓名和学号！');
      return;
    }

    const matched = studentsData.find(
      (s) => s.id === cleanId && s.name === cleanName
    );

    if (!matched) {
      const sample = realStudentsData[0] || { id: '240307001', name: '高鹏远' };
      setLoginError(
        `未在【${classConfig.name}】名单中匹配到此信息。请核对学号（例如 ${sample.id}）与姓名（例如 ${sample.name}）是否准确！`
      );
      return;
    }

    // ===== DEVICE LOCK CHECK =====
    // Check if this machine is already locked to a DIFFERENT student
    const lock = getDeviceLock(currentClassId, currentQuizId);
    if (lock && lock.studentId !== matched.id) {
      // Machine locked by another student — trigger device lock modal
      setDeviceLockInfo(lock);
      setPendingLoginStudent(matched);
      setDeviceUnlockPasswordInput('');
      setDeviceUnlockError('');
      setShowDeviceLockModal(true);
      return;
    }

    // Either no lock, or same student logging in again — proceed normally
    setCurrentStudent(matched);
    localStorage.setItem(`${CURRENT_STUDENT_KEY}_${currentClassId}`, JSON.stringify(matched));

    // Check if previously submitted
    const existing = records.find(
      (r) => r.studentId === matched.id && (r.quizId || 'quiz_ch1_ch2') === currentQuizId
    );
    if (existing) {
      setActiveReviewRecord(existing);
      setView('review');
    } else {
      setView('testing');
      setTimerActive(true);
      setTimerSeconds(0);
    }
  };

  // Unlock device and proceed with pending student login
  const handleVerifyDeviceUnlock = (e) => {
    if (e) e.preventDefault();
    if (deviceUnlockPasswordInput.trim() === MASTER_PASSWORD) {
      // Unlock: rebind device lock to the new student
      saveDeviceLock(currentClassId, currentQuizId, {
        studentId: pendingLoginStudent.id,
        studentName: pendingLoginStudent.name,
        lockedAt: new Date().toISOString(),
        unlockedFrom: deviceLockInfo?.studentId,
      });
      setShowDeviceLockModal(false);
      setDeviceUnlockPasswordInput('');
      setDeviceUnlockError('');

      // Now do the actual login for the pending student
      const student = pendingLoginStudent;
      setPendingLoginStudent(null);
      setDeviceLockInfo(null);

      setCurrentStudent(student);
      localStorage.setItem(`${CURRENT_STUDENT_KEY}_${currentClassId}`, JSON.stringify(student));

      const existing = records.find(
        (r) => r.studentId === student.id && (r.quizId || 'quiz_ch1_ch2') === currentQuizId
      );
      if (existing) {
        setActiveReviewRecord(existing);
        setView('review');
      } else {
        setView('testing');
        setTimerActive(true);
        setTimerSeconds(0);
      }
    } else {
      setDeviceUnlockError('教师授权密码错误，请联系任课教师');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentStudent(null);
    localStorage.removeItem(CURRENT_STUDENT_KEY);
    setAnswers({});
    setTimerActive(false);
    setTimerSeconds(0);
    setView('login');
  };

  // Select Option
  const handleSelectOption = (questionId, optionKey) => {
    const updated = { ...answers, [questionId]: optionKey };
    setAnswers(updated);
    if (currentStudent) {
      localStorage.setItem(DRAFT_ANSWERS_KEY + currentStudent.id, JSON.stringify(updated));
    }
  };

  // Start / Retake Test directly
  const handleStartTest = () => {
    setAnswers({});
    setTimerSeconds(0);
    setTimerActive(true);
    if (currentStudent) {
      localStorage.removeItem(DRAFT_ANSWERS_KEY + currentStudent.id);
    }
    setView('testing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Request Retake Test (Requires Authorization Password)
  const requestRetakeTest = () => {
    setRetakePasswordInput('');
    setRetakeError('');
    setShowRetakeModal(true);
  };

  // Verify Retake Password (teacher authorization password — hidden from UI)
  const handleVerifyRetakePassword = (e) => {
    if (e) e.preventDefault();
    if (retakePasswordInput.trim() === MASTER_PASSWORD) {
      setShowRetakeModal(false);
      setRetakePasswordInput('');
      setRetakeError('');
      handleStartTest();
    } else {
      setRetakeError('授权密码错误，请联系任课教师获取重新作答密码');
    }
  };

  // Submit test
  const handleConfirmSubmit = () => {
    setShowConfirmSubmit(false);
    setTimerActive(false);

    let correctCount = 0;
    const detailList = [];

    quizQuestions.forEach((q) => {
      const studentAns = answers[q.id] || '';
      const isCorrect = studentAns === q.answer;
      if (isCorrect) {
        correctCount += 1;
      }
      detailList.push({
        id: q.id,
        chapter: q.chapter,
        studentAns,
        correctAns: q.answer,
        isCorrect,
        score: isCorrect ? 1 : 0,
      });
    });

    const totalQuestions = quizQuestions.length;
    // 得分按比例计算，四舍五入取整数 为最终分数 (满分 100 分)
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Calculate attempt number for this student on this specific quiz (never overwrite!)
    const previousAttempts = records.filter(
      (r) =>
        r.studentId === currentStudent.id &&
        (r.quizId || 'quiz_ch1_ch2') === currentQuizId
    );
    const attempt = previousAttempts.length + 1;

    const newRecord = {
      recordId: `${currentStudent.id}_${currentQuizId}_${Date.now()}`,
      quizId: currentQuizId,
      quizTitle: currentQuizModule.title,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      gender: currentStudent.gender,
      class: currentStudent.class,
      college: currentStudent.college,
      major: currentStudent.major,
      score,
      correctCount,
      totalQuestions,
      attempt,
      durationSeconds: timerSeconds,
      submittedAt: new Date().toISOString(),
      answers,
      detailList,
    };

    // KEEP ALL RECORDS - DO NOT OVERWRITE! Append new attempt
    const nextRecords = [...records, newRecord];
    saveRecords(nextRecords);

    // Clear draft
    localStorage.removeItem(DRAFT_ANSWERS_KEY + currentStudent.id);

    // ===== SAVE DEVICE LOCK =====
    // Lock this machine to the current student for this quiz
    saveDeviceLock(currentClassId, currentQuizId, {
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      lockedAt: new Date().toISOString(),
    });

    setActiveReviewRecord(newRecord);
    setView('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Class Statistics Calculations (for selected quiz) — excludes test accounts
  const classStats = useMemo(() => {
    const totalStudents = realStudentsData.length; // real students only
    const targetRecords = records.filter((r) => {
      const qid = r.quizId || 'quiz_ch1_ch2';
      const isTestRecord = studentsData.find((s) => s.id === r.studentId)?.isTest;
      return !isTestRecord && (selectedQuizId === 'all' || qid === selectedQuizId);
    });

    const submittedStudentIds = new Set(targetRecords.map((r) => r.studentId));
    const submittedCount = submittedStudentIds.size;
    const submissionRate = ((submittedCount / totalStudents) * 100).toFixed(1);

    if (submittedCount === 0) {
      return {
        totalStudents,
        submittedCount: 0,
        totalAttempts: 0,
        submissionRate: '0.0',
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        passRate: '0.0',
        excellentRate: '0.0',
        distribution: [0, 0, 0, 0, 0],
      };
    }

    // Use each submitted student's best score for class statistics
    const bestScores = Array.from(submittedStudentIds).map((sid) => {
      const sRecords = targetRecords.filter((r) => r.studentId === sid);
      return Math.max(...sRecords.map((r) => r.score));
    });

    const avgScore = (bestScores.reduce((a, b) => a + b, 0) / bestScores.length).toFixed(1);
    const maxScore = Math.max(...bestScores);
    const minScore = Math.min(...bestScores);
    const passCount = bestScores.filter((s) => s >= 60).length;
    const excellentCount = bestScores.filter((s) => s >= 90).length;

    const passRate = ((passCount / bestScores.length) * 100).toFixed(1);
    const excellentRate = ((excellentCount / bestScores.length) * 100).toFixed(1);

    // Distribution: [90-100, 80-89, 70-79, 60-69, <60]
    const distribution = [
      bestScores.filter((s) => s >= 90).length,
      bestScores.filter((s) => s >= 80 && s < 90).length,
      bestScores.filter((s) => s >= 70 && s < 80).length,
      bestScores.filter((s) => s >= 60 && s < 70).length,
      bestScores.filter((s) => s < 60).length,
    ];

    return {
      totalStudents,
      submittedCount,
      totalAttempts: targetRecords.length,
      submissionRate,
      avgScore,
      maxScore,
      minScore,
      passRate,
      excellentRate,
      distribution,
    };
  }, [records, selectedQuizId]);

  // Merged Class Roster (real students only — excludes test accounts)
  const fullRoster = useMemo(() => {
    return realStudentsData.map((s) => {
      const studentAttempts = records.filter((r) => {
        const qid = r.quizId || 'quiz_ch1_ch2';
        return r.studentId === s.id && (selectedQuizId === 'all' || qid === selectedQuizId);
      });

      const attemptsCount = studentAttempts.length;
      // Best record (highest score, or latest)
      const bestRecord =
        attemptsCount > 0
          ? studentAttempts.reduce(
              (best, cur) => (cur.score >= best.score ? cur : best),
              studentAttempts[0]
            )
          : null;

      return {
        ...s,
        hasSubmitted: attemptsCount > 0,
        attemptsCount,
        allAttempts: studentAttempts,
        record: bestRecord,
      };
    });
  }, [records, selectedQuizId]);

  // Filtered Roster for Table
  const filteredRoster = useMemo(() => {
    return fullRoster.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.id.includes(tableSearch);
      if (!matchSearch) return false;

      if (tableStatus === 'submitted') return item.hasSubmitted;
      if (tableStatus === 'unsubmitted') return !item.hasSubmitted;
      return true;
    });
  }, [fullRoster, tableSearch, tableStatus]);

  // Ultra-reliable 3-tier file download trigger
  const triggerFileDownload = async (blob, filename, mimeType) => {
    // Strategy 1: Native Windows File System Access API (showSaveFilePicker)
    // Directly triggers the Windows "另存为" (Save As) dialog with exact pre-filled name & extension!
    // 100% immune to Chromium blob URL UUID bugs.
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window && !navigator.webdriver) {
      try {
        const isExcel = filename.endsWith('.xlsx');
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: isExcel ? 'Microsoft Excel 工作簿 (*.xlsx)' : 'CSV 逗号分隔文本 (*.csv)',
              accept: isExcel
                ? {
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
                      '.xlsx',
                    ],
                  }
                : { 'text/csv': ['.csv'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err) {
        if (err.name === 'AbortError') {
          // User clicked Cancel on Save dialog
          return;
        }
        console.warn('showSaveFilePicker fallback to server/anchor:', err);
      }
    }

    // Strategy 2: Server-side HTTP POST with Content-Disposition header
    // Browser treats this as real server attachment download, guaranteeing filename & extension
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/api/export-download';
        form.style.display = 'none';

        const inputFilename = document.createElement('input');
        inputFilename.type = 'hidden';
        inputFilename.name = 'filename';
        inputFilename.value = filename;
        form.appendChild(inputFilename);

        const inputMime = document.createElement('input');
        inputMime.type = 'hidden';
        inputMime.name = 'mimeType';
        inputMime.value = mimeType || 'application/octet-stream';
        form.appendChild(inputMime);

        const inputBase64 = document.createElement('input');
        inputBase64.type = 'hidden';
        inputBase64.name = 'base64';
        inputBase64.value = base64data;
        form.appendChild(inputBase64);

        document.body.appendChild(form);
        form.submit();
        setTimeout(() => {
          if (document.body.contains(form)) {
            document.body.removeChild(form);
          }
        }, 3000);
      };
      reader.readAsDataURL(blob);
      return;
    } catch (err) {
      console.warn('Server download fallback to anchor:', err);
    }

    // Strategy 3: Standard anchor dispatchEvent fallback
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, view: window })
    );
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2500);
  };

  // Export native Microsoft Excel (.xlsx) file via SheetJS
  const handleExportExcel = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanTitle = (selectedQuizModule.shortTitle || '全课程测验').replace(/[()（）]/g, '_');
    const fileName = `${classConfig.shortName}_${cleanTitle}_成绩单_${dateStr}.xlsx`;

    // 1. Sheet 1: Best score per student
    const sheet1Data = fullRoster.map((item) => ({
      '学号': item.id,
      '姓名': item.name,
      '性别': item.gender,
      '班级': item.class,
      '测验场次': selectedQuizModule.title,
      '测验状态': item.hasSubmitted ? '已完成' : '未完成',
      '作答次数': item.attemptsCount || 0,
      '最终得分': item.hasSubmitted ? item.record.score : '--',
      '答对题数': item.hasSubmitted ? `${item.record.correctCount}/${item.record.totalQuestions}` : '--',
      '作答用时': item.hasSubmitted ? formatTime(item.record.durationSeconds) : '--',
      '提交时间': item.hasSubmitted
        ? new Date(item.record.submittedAt).toLocaleString('zh-CN', { hour12: false })
        : '--',
    }));

    // 2. Sheet 2: All submission logs (never overwrite!)
    const targetQuizRecords = records.filter(
      (r) => !selectedQuizId || selectedQuizId === 'all' || (r.quizId || 'quiz_ch1_ch2') === selectedQuizId
    );
    const sheet2Data = targetQuizRecords.map((r, index) => ({
      '流水号': index + 1,
      '测验场次': r.quizTitle || selectedQuizModule.title,
      '学号': r.studentId,
      '姓名': r.studentName,
      '班级': r.class || classConfig.name,
      '作答轮次': `第 ${r.attempt || 1} 次作答`,
      '得分(满分100)': r.score,
      '答对题数': `${r.correctCount}/${r.totalQuestions}`,
      '用时': formatTime(r.durationSeconds),
      '提交时间': new Date(r.submittedAt).toLocaleString('zh-CN', { hour12: false }),
    }));

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
    ws1['!cols'] = [
      { wch: 14 }, { wch: 10 }, { wch: 6 }, { wch: 16 }, { wch: 30 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(wb, ws1, '班级成绩单(按最高分)');

    if (sheet2Data.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
      ws2['!cols'] = [
        { wch: 8 }, { wch: 30 }, { wch: 14 }, { wch: 10 }, { wch: 16 },
        { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 22 }
      ];
      XLSX.utils.book_append_sheet(wb, ws2, '历次测验原始流水');
    }

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    triggerFileDownload(
      blob,
      fileName,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  };

  // Export CSV (.csv)
  const handleExportCSV = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanTitle = (selectedQuizModule.shortTitle || '全课程测验').replace(/[()（）]/g, '_');
    const fileName = `2024级通信1班_${cleanTitle}_成绩单_${dateStr}.csv`;
    const headers = [
      '学号',
      '姓名',
      '性别',
      '班级',
      '测验场次',
      '测验状态',
      '作答次数',
      '最终得分',
      '答对题数',
      '作答用时',
      '提交时间',
    ];

    const rows = fullRoster.map((item) => [
      item.id,
      item.name,
      item.gender,
      item.class,
      selectedQuizModule.title,
      item.hasSubmitted ? '已完成' : '未完成',
      item.attemptsCount || 0,
      item.hasSubmitted ? item.record.score : '--',
      item.hasSubmitted
        ? `${item.record.correctCount}/${item.record.totalQuestions}`
        : '--',
      item.hasSubmitted ? formatTime(item.record.durationSeconds) : '--',
      item.hasSubmitted
        ? new Date(item.record.submittedAt).toLocaleString('zh-CN', {
            hour12: false,
          })
        : '--',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\r\n');

    // Add UTF-8 BOM for Excel Chinese support
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    triggerFileDownload(blob, fileName);
  };

  // Clear records for selected quiz
  const handleClearRecords = () => {
    const quizName = selectedQuizModule.title;
    if (
      window.confirm(
        `⚠️ 警告：确定要清空【${quizName}】的所有成绩记录吗？此操作不可恢复！`
      )
    ) {
      if (selectedQuizId === 'all') {
        saveRecords([]);
      } else {
        const remaining = records.filter(
          (r) => (r.quizId || 'quiz_ch1_ch2') !== selectedQuizId
        );
        saveRecords(remaining);
      }
      setActiveReviewRecord(null);
      if (view === 'review') setView('login');
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = quizQuestions.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  if (view === 'portal') {
    return (
      <QuizPortal
        onSelectClass={handleSelectClass}
        selectedClassId={currentClassId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/20 text-slate-900 pb-24 relative selection:bg-indigo-500 selection:text-white">
      {/* Decorative Ambient Lighting in Background */}
      <div className="fixed top-12 left-1/4 w-[480px] h-[480px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-12 right-1/4 w-[480px] h-[480px] bg-sky-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* DEDICATED QUIZ SYSTEM NAVBAR (REPLACES ORIGINAL SITE MENU) */}
      <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-xl border-b border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
          {/* Brand & Course info */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-none whitespace-nowrap">
                    {classConfig.courseShortName} · 随堂测验
                  </h1>
                  <button
                    onClick={handleBackToPortal}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all cursor-pointer shadow-2xs"
                    title="点击返回统一入口切换班级"
                  >
                    <span>{classConfig.shortName}</span>
                    <span className="text-[10px] text-indigo-500 bg-white/80 px-1.5 py-0.2 rounded-md font-bold">切换</span>
                  </button>
                </div>
                <p className="hidden lg:block text-[11px] text-slate-500 font-medium mt-1">
                  {classConfig.name} · {classConfig.courseName}
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Switchers */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <button
              onClick={handleBackToPortal}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100/80 flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
              title="返回统一入口选择班级"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">班级大厅</span>
            </button>
            {view === 'testing' && currentStudent && (
              <>
                {/* Real-time Clock */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 flex-shrink-0">
                  <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span className="font-mono text-xs sm:text-sm font-black text-slate-800 tracking-wider">
                    {formatTime(timerSeconds)}
                  </span>
                </div>

                {/* Progress pill */}
                <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-xs font-bold text-indigo-900 flex-shrink-0">
                  <span>进度</span>
                  <span className="font-mono text-indigo-600">{answeredCount}/{totalCount}</span>
                </div>
              </>
            )}

            <button
              id="btn-nav-records"
              onClick={() => setView('records')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer border flex-shrink-0 ${
                view === 'records'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200/90 shadow-xs'
                  : 'bg-indigo-50/70 text-indigo-600 hover:bg-indigo-100 border-indigo-100/80'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">全班成绩单与统计</span>
              <span className="sm:hidden">成绩榜</span>
            </button>

            {/* Top Submit Button in Testing View */}
            {view === 'testing' && currentStudent && (
              <button
                id="btn-submit-top"
                onClick={() => {
                  if (answeredCount === totalCount) {
                    handleConfirmSubmit();
                  } else {
                    setShowConfirmSubmit(true);
                  }
                }}
                className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>交卷并评分</span>
              </button>
            )}

            {currentStudent ? (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-2 bg-slate-100/90 hover:bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/80">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {currentStudent.name.slice(0, 1)}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-xs font-black text-slate-800 whitespace-nowrap">
                      {currentStudent.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {currentStudent.id}
                    </div>
                  </div>
                </div>

                {view !== 'testing' && (
                  <button
                    onClick={currentStudentExistingRecord ? requestRetakeTest : handleStartTest}
                    className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex-shrink-0 whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{currentStudentExistingRecord ? '重新测验' : '进入测验'}</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  title="退出登录"
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-all cursor-pointer flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              view !== 'login' && (
                <button
                  onClick={() => setView('login')}
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100/80 flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>学生登录</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* In testing mode: Slim Question Navigation Palette Strip directly attached to Header */}
        {view === 'testing' && currentStudent && (
          <div className="border-t border-slate-200/90 bg-slate-50/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-xs font-black text-slate-500 whitespace-nowrap mr-1 uppercase tracking-wider">
                  答题卡直达:
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {quizQuestions.map((q) => {
                    const isDone = !!answers[q.id];
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          const el = document.getElementById(`q-${q.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center cursor-pointer flex-shrink-0 ${
                          isDone
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200'
                        }`}
                        title={`第 ${q.id} 题 (${isDone ? '已作答' : '未作答'})`}
                      >
                        {q.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-3 w-44 flex-shrink-0">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="text-xs font-mono font-black text-slate-700">{progressPercent}%</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* VIEW 1: STUDENT LOGIN */}
        {view === 'login' && (
          <div className="w-full flex justify-center items-center py-4 sm:py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg mx-auto"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-8 sm:p-10 relative overflow-hidden">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
                    <User className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {classConfig.name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed text-center max-w-md mx-auto">
                    请输入您的姓名与学号，验证后立即开始【{classConfig.courseShortName}】随堂测验
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      核验库：{classConfig.shortName}（共 {realStudentsData.length} 名在籍学生）
                    </div>
                    <button
                      type="button"
                      onClick={handleBackToPortal}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                    >
                      <span>切换班级</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* If student already authenticated for this class, display a quick continue banner */}
                {currentStudent && (
                  <div className="mb-6 p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-sm shadow-indigo-600/20">
                        {currentStudent.name.slice(0, 1)}
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] text-indigo-600 font-extrabold tracking-wide uppercase">
                          已验证在籍学生
                        </div>
                        <div className="text-sm font-black text-slate-900 leading-tight">
                          {currentStudent.name}
                          <span className="text-xs font-mono font-normal text-slate-500 ml-1.5">
                            ({currentStudent.id})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                      <button
                        type="button"
                        onClick={currentStudentExistingRecord ? requestRetakeTest : handleStartTest}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>{currentStudentExistingRecord ? '查看/重测' : '直接进入测验'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 border border-slate-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      >
                        更换账号
                      </button>
                    </div>
                  </div>
                )}

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 leading-relaxed shadow-xs"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
                    <div>{loginError}</div>
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                        学生姓名
                      </label>
                      <select
                        id="quick-select-student"
                        className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1 outline-none font-bold cursor-pointer hover:bg-indigo-100 transition-colors"
                        onChange={(e) => {
                          const found = studentsData.find((s) => s.id === e.target.value);
                          if (found) {
                            setInputName(found.name);
                            setInputId(found.id);
                            setLoginError('');
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          点选名单快速填入 ({realStudentsData.length}人)...
                        </option>
                        {realStudentsData.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      id="student-name-input"
                      type="text"
                      value={inputName}
                      onChange={(e) => {
                        setInputName(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder={`请输入姓名，例如：${realStudentsData[0]?.name || '姓名'}`}
                      className="w-full px-4.5 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-900 font-bold transition-all text-sm bg-slate-50/50 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">
                      学号
                    </label>
                    <input
                      id="student-id-input"
                      type="text"
                      value={inputId}
                      onChange={(e) => {
                        setInputId(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder={`请输入学号，例如：${realStudentsData[0]?.id || '学号'}`}
                      className="w-full px-4.5 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-900 font-mono font-bold transition-all text-sm bg-slate-50/50 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      id="btn-login-submit"
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>验证身份并进入测验</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>

                {/* Quick Jump to Class Records */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <button
                    id="btn-login-view-records"
                    type="button"
                    onClick={() => setView('records')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4" />
                    教师/助教免密查看全班成绩统计看板 →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* VIEW 2: EXAM TAKING INTERFACE */}
        {view === 'testing' && currentStudent && (
          <div className="space-y-6 pt-2">
            {/* QUESTIONS LIST */}
            <div className="space-y-6">
              {quizQuestions.map((q, index) => {
                const selectedOption = answers[q.id];
                return (
                  <motion.div
                    key={q.id}
                    id={`q-${q.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all shadow-sm ${
                      selectedOption
                        ? 'border-indigo-200/90'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black font-mono shadow-xs">
                          第 {q.id} 题
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {q.chapter}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          按比例折算 · 百分制
                        </span>
                      </div>

                      {selectedOption ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          已选 [ {selectedOption} ]
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          待作答
                        </span>
                      )}
                    </div>

                    {/* Question Statement */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed my-4">
                      {q.question}
                    </h3>

                    {/* Options Grid (2 Columns on Desktop, Clean Gap between Letter and Text) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                      {q.options.map((opt) => {
                        const isSelected = selectedOption === opt.key;
                        return (
                          <button
                            key={opt.key}
                            id={`opt-${q.id}-${opt.key}`}
                            type="button"
                            onClick={() => handleSelectOption(q.id, opt.key)}
                            className={`group relative text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-50/90 via-sky-50/60 to-white border-indigo-600 shadow-md shadow-indigo-500/10 ring-4 ring-indigo-500/15'
                                : 'bg-slate-50/70 hover:bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-sm text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-4 sm:gap-5 flex-1 pr-2">
                              {/* Option Letter Badge with Distinct High-End Styling */}
                              <div
                                className={`w-10 h-10 min-w-[40px] rounded-xl text-sm font-mono font-black flex items-center justify-center flex-shrink-0 transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-tr from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30'
                                    : 'bg-white border-2 border-slate-200 text-slate-700 group-hover:border-indigo-400 group-hover:text-indigo-600'
                                }`}
                              >
                                {opt.key}
                              </div>

                              {/* Option Text with Ample Margins */}
                              <span
                                className={`text-sm sm:text-base leading-relaxed ${
                                  isSelected
                                    ? 'font-extrabold text-indigo-950'
                                    : 'font-medium text-slate-700 group-hover:text-slate-950'
                                }`}
                              >
                                {opt.text}
                              </span>
                            </div>

                            {/* Radio / Check Pill on the Right */}
                            <div className="flex-shrink-0 ml-2">
                              {isSelected ? (
                                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-indigo-400 bg-white"></div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Final Submit Banner */}
            <div className="bg-white rounded-3xl p-8 border-2 border-slate-200/90 text-center shadow-md">
              <h4 className="text-xl font-black text-slate-900 mb-2">
                已完成 {answeredCount} / {totalCount} 道题目
              </h4>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                {answeredCount < totalCount
                  ? `您尚有 ${totalCount - answeredCount} 道题未作答。未作答试题将计 0 分，确认检查无误后交卷。`
                  : '您已完成全部 20 道题目！点击下方按钮立即自动打分并生成诊断成绩单。'}
              </p>
              <button
                id="btn-submit-bottom"
                onClick={() => {
                  if (answeredCount === totalCount) {
                    handleConfirmSubmit();
                  } else {
                    setShowConfirmSubmit(true);
                  }
                }}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-black text-base shadow-xl shadow-indigo-600/30 transition-all inline-flex items-center gap-2.5 cursor-pointer hover:scale-102"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>立即交卷并查看成绩与考点解析</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: SCORE & DIAGNOSTIC REVIEW */}
        {view === 'review' && activeReviewRecord && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* High-Contrast Crisp Score Hero Card (Replaces Dark Mismatched Background) */}
            <div id="score-hero-card" className="bg-white text-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl border-2 border-slate-200/90 relative overflow-hidden">
              {/* Top ambient highlight gradient */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400"></div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-100">
                    <Award className="w-4 h-4 text-amber-500" />
                    随堂测验评估报告已生成并自动保存
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
                    {activeReviewRecord.studentName} 同学的测验成绩报告
                  </h2>
                  <p className="text-slate-600 text-sm font-semibold">
                    学号：<span className="font-mono text-slate-900">{activeReviewRecord.studentId}</span> · 班级：
                    <span className="text-indigo-700 font-bold">{activeReviewRecord.class || '2024级通信工程1班'}</span> · 学院：物理与信息工程学院
                  </p>
                  <p className="text-slate-400 text-xs mt-1.5 font-medium">
                    提交时间：
                    {new Date(activeReviewRecord.submittedAt).toLocaleString('zh-CN', {
                      hour12: false,
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap">
                  {/* Glowing Score Radial */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 border-2 border-indigo-100 min-w-[150px] shadow-sm">
                    <span className="text-xs text-indigo-900/80 font-black tracking-wider uppercase mb-1">
                      最终得分
                    </span>
                    <div className="text-5xl sm:text-6xl font-black text-indigo-600 font-mono tracking-tight">
                      {activeReviewRecord.score}
                    </div>
                    <span className="text-xs text-slate-400 font-bold mt-1">
                      满分 100 分
                    </span>
                  </div>

                  {/* Level Tag & Details */}
                  <div className="flex flex-col gap-2.5">
                    <div
                      className={`px-4 py-2 rounded-2xl text-center text-sm font-black shadow-xs ${
                        activeReviewRecord.score >= 90
                          ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300'
                          : activeReviewRecord.score >= 80
                          ? 'bg-sky-50 text-sky-800 border-2 border-sky-300'
                          : activeReviewRecord.score >= 60
                          ? 'bg-amber-50 text-amber-800 border-2 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-2 border-rose-300'
                      }`}
                    >
                      {activeReviewRecord.score >= 90
                        ? '等级：优秀 🌟'
                        : activeReviewRecord.score >= 80
                        ? '等级：良好 👍'
                        : activeReviewRecord.score >= 60
                        ? '等级：及格 📘'
                        : '等级：需努力 ✍️'}
                    </div>

                    <div className="text-xs text-slate-600 font-medium space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div>
                        答对题数：
                        <span className="font-black text-slate-900 font-mono text-sm ml-1">
                          {activeReviewRecord.correctCount} / {activeReviewRecord.totalQuestions}
                        </span>{' '}
                        题
                      </div>
                      <div>
                        测验用时：
                        <span className="font-black text-slate-900 font-mono text-sm ml-1">
                          {formatTime(activeReviewRecord.durationSeconds || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Hero */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    id="btn-retake-test"
                    onClick={requestRetakeTest}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-black text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20 hover:scale-102"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重新作答测验
                  </button>
                  <button
                    onClick={() => setView('records')}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center gap-2 border border-slate-200 cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    查看全班成绩榜单
                  </button>
                </div>
              </div>
            </div>

            {/* Questions Diagnosis & Explanations */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    题目答题诊断与原版课件考点解析
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    系统为您标注出每道题的作答情况与考点出处
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 text-xs font-bold shadow-xs">
                  <button
                    onClick={() => setReviewFilter('all')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      reviewFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    全部 ({activeReviewRecord.totalQuestions || quizQuestions.length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('wrong')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      reviewFilter === 'wrong'
                        ? 'bg-rose-600 text-white'
                        : 'text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    错题 (
                    {activeReviewRecord.totalQuestions -
                      activeReviewRecord.correctCount}
                    )
                  </button>
                  <button
                    onClick={() => setReviewFilter('correct')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      reviewFilter === 'correct'
                        ? 'bg-emerald-600 text-white'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    做对 ({activeReviewRecord.correctCount})
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {quizQuestions.map((q) => {
                  const studentAns = activeReviewRecord.answers[q.id] || '未作答';
                  const isCorrect = studentAns === q.answer;

                  if (reviewFilter === 'wrong' && isCorrect) return null;
                  if (reviewFilter === 'correct' && !isCorrect) return null;

                  return (
                    <div
                      key={q.id}
                      className={`bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all shadow-sm ${
                        isCorrect
                          ? 'border-emerald-200/90 bg-emerald-50/10'
                          : 'border-rose-200/90 bg-rose-50/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-8 h-8 rounded-xl text-xs font-black font-mono flex items-center justify-center ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {q.id}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            {q.chapter}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isCorrect ? (
                            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              回答正确 (已得分)
                            </span>
                          ) : (
                            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-rose-600" />
                              回答错误 (未得分)
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-relaxed mb-5">
                        {q.question}
                      </h4>

                      {/* Option breakdown (2-column layout with generous gap) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                        {q.options.map((opt) => {
                          const isStudentPick = studentAns === opt.key;
                          const isStandardAns = q.answer === opt.key;

                          let stateClasses =
                            'bg-slate-50 border-slate-200 text-slate-600';
                          if (isStandardAns) {
                            stateClasses =
                              'bg-emerald-50 border-emerald-500 font-bold text-emerald-950 ring-2 ring-emerald-500/20';
                          } else if (isStudentPick && !isCorrect) {
                            stateClasses =
                              'bg-rose-50 border-rose-400 font-bold text-rose-950';
                          }

                          return (
                            <div
                              key={opt.key}
                              className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 text-sm ${stateClasses}`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <span
                                  className={`w-8 h-8 rounded-lg font-mono font-bold flex items-center justify-center flex-shrink-0 text-xs ${
                                    isStandardAns
                                      ? 'bg-emerald-600 text-white'
                                      : isStudentPick
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-white text-slate-500 border border-slate-200'
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <div className="leading-relaxed">
                                  {opt.text}
                                </div>
                              </div>
                              {isStandardAns && (
                                <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex-shrink-0">
                                  正确答案
                                </span>
                              )}
                              {isStudentPick && !isCorrect && (
                                <span className="text-[11px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex-shrink-0">
                                  你的作答
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Courseware Reference Explanation */}
                      <div className="p-4.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 leading-relaxed flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-indigo-900 mr-1.5">
                            【考点解析】
                          </span>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: CLASS RECORDS & STATISTICS */}
        {view === 'records' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header / Actions */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {classConfig.name} · 测验成绩总榜
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  物理与信息工程学院 · {classConfig.courseName}
                </p>
              </div>

              {/* Quiz Module Switcher & Export Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Quiz Switcher Dropdown */}
                <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-600">测验批次:</span>
                  <select
                    id="select-quiz-module"
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {QUIZ_MODULES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                    <option value="all">全班所有测验总汇明细</option>
                  </select>
                </div>

                {/* Export Excel (.xlsx) */}
                <button
                  id="btn-export-excel"
                  onClick={handleExportExcel}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102"
                  title="导出带有样式和多Sheet的标准 Excel 工作簿"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>导出 Excel 成绩单 (.xlsx)</span>
                </button>

                <button
                  onClick={handleClearRecords}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="清空当前批次成绩记录"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border-2 border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">班级提交人数</span>
                  <Users className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {classStats.submittedCount}
                  <span className="text-sm font-normal text-slate-400 ml-1">
                    / {classStats.totalStudents} 人
                  </span>
                </div>
                <div className="text-xs font-bold text-indigo-600 mt-2">
                  提交率 {classStats.submissionRate}%
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border-2 border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">班级平均分</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {classStats.avgScore}
                  <span className="text-sm font-normal text-slate-400 ml-1">分</span>
                </div>
                <div className="text-xs font-bold text-slate-400 mt-2">
                  最高 {classStats.maxScore} 分 · 最低 {classStats.minScore} 分
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border-2 border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">及格率 (&ge;60分)</span>
                  <CheckCircle2 className="w-4 h-4 text-sky-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                  {classStats.passRate}%
                </div>
                <div className="text-xs font-bold text-slate-400 mt-2">
                  共 {records.filter((r) => r.score >= 60).length} 人及格
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border-2 border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">优秀率 (&ge;90分)</span>
                  <Award className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 font-mono">
                  {classStats.excellentRate}%
                </div>
                <div className="text-xs font-bold text-slate-400 mt-2">
                  共 {records.filter((r) => r.score >= 90).length} 人达到优秀
                </div>
              </div>
            </div>

            {/* Score Distribution Histogram */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                成绩区间分布统计
              </h3>
              <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center">
                {[
                  { label: '90-100分', count: classStats.distribution[0], color: 'bg-emerald-500' },
                  { label: '80-89分', count: classStats.distribution[1], color: 'bg-sky-500' },
                  { label: '70-79分', count: classStats.distribution[2], color: 'bg-indigo-500' },
                  { label: '60-69分', count: classStats.distribution[3], color: 'bg-amber-500' },
                  { label: '<60分', count: classStats.distribution[4], color: 'bg-rose-500' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 font-bold block">
                      {item.label}
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
                      {item.count} 人
                    </span>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full ${item.color}`}
                        style={{
                          width: `${
                            classStats.submittedCount
                              ? (item.count / classStats.submittedCount) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border-2 border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="按学号或姓名检索..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  onClick={() => setTableStatus('all')}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    tableStatus === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  全部学生 ({realStudentsData.length})
                </button>
                <button
                  onClick={() => setTableStatus('submitted')}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    tableStatus === 'submitted'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  已完成 ({classStats.submittedCount})
                </button>
                <button
                  onClick={() => setTableStatus('unsubmitted')}
                  className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                    tableStatus === 'unsubmitted'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  未交卷 ({realStudentsData.length - classStats.submittedCount})
                </button>
              </div>
            </div>

            {/* Full 43-student Roster Table */}
            <div className="bg-white rounded-3xl border-2 border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">序号</th>
                      <th className="px-4 py-3.5">学号</th>
                      <th className="px-4 py-3.5">姓名</th>
                      <th className="px-4 py-3.5">性别</th>
                      <th className="px-4 py-3.5">班级</th>
                      <th className="px-4 py-3.5">状态</th>
                      <th className="px-4 py-3.5">作答轮次</th>
                      <th className="px-4 py-3.5">最终得分</th>
                      <th className="px-4 py-3.5">答对数</th>
                      <th className="px-4 py-3.5">用时</th>
                      <th className="px-4 py-3.5">提交时间</th>
                      <th className="px-4 py-3.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRoster.map((student, idx) => {
                      const rec = student.record;
                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-slate-900 text-xs sm:text-sm">
                            {student.id}
                          </td>
                          <td className="px-4 py-3.5 font-black text-slate-900">
                            {student.name}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 text-xs">
                            {student.gender}
                          </td>
                          <td className="px-4 py-3.5 text-slate-500 text-xs">
                            {student.class}
                          </td>
                          <td className="px-4 py-3.5">
                            {student.hasSubmitted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                                <Check className="w-3 h-3 stroke-[3]" />
                                已完成
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-400">
                                未交卷
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {student.hasSubmitted ? (
                              student.attemptsCount > 1 ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  作答 {student.attemptsCount} 次 (取最高)
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500 font-medium">第 1 次</span>
                              )
                            ) : (
                              <span className="text-slate-300">--</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {student.hasSubmitted ? (
                              <span
                                className={`text-base font-black font-mono ${
                                  rec.score >= 90
                                    ? 'text-emerald-600'
                                    : rec.score >= 60
                                    ? 'text-indigo-600'
                                    : 'text-rose-600'
                                }`}
                              >
                                {rec.score}
                              </span>
                            ) : (
                              <span className="text-slate-300">--</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">
                            {student.hasSubmitted ? (
                              `${rec.correctCount}/${rec.totalQuestions}`
                            ) : (
                              <span className="text-slate-300">--</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">
                            {student.hasSubmitted ? (
                              formatTime(rec.durationSeconds || 0)
                            ) : (
                              <span className="text-slate-300">--</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-500">
                            {student.hasSubmitted ? (
                              new Date(rec.submittedAt).toLocaleString('zh-CN', {
                                hour12: false,
                              })
                            ) : (
                              <span className="text-slate-300">--</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {student.hasSubmitted ? (
                              <button
                                onClick={() => {
                                  setActiveReviewRecord(rec);
                                  setView('review');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-all inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                查阅答卷
                              </button>
                            ) : (
                              <span className="text-xs text-slate-300 font-mono">--</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* CONFIRMATION MODAL BEFORE SUBMIT (ROOT FIXED PORTAL) */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">确认交卷？</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              本次随堂测验共 <span className="font-bold text-slate-900">{totalCount}</span> 道单选题，当前已作答{' '}
              <span className="font-bold text-indigo-600">{answeredCount}</span> 题。
              {answeredCount < totalCount && (
                <span className="text-rose-600 font-bold block mt-2 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                  ⚠️ 尚有 {totalCount - answeredCount} 道题未作答，未作答题目将计 0 分！
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                id="btn-cancel-submit"
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer"
              >
                继续检查
              </button>
              <button
                id="btn-confirm-submit"
                type="button"
                onClick={handleConfirmSubmit}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                确认提交打分
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* RETAKE PASSWORD AUTHORIZATION MODAL (DEFAULT: 888888, HIDDEN FROM UI) */}
      {showRetakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">重新作答权限验证</h3>
                <p className="text-xs text-slate-500 mt-0.5">再次作答需经任课教师口令授权</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              您已有提交的测验记录。重新作答将覆盖原成绩单并重新计时。请输入重新作答授权密码：
            </p>

            <form onSubmit={handleVerifyRetakePassword} className="space-y-4">
              <div>
                <input
                  id="retake-password-input"
                  type="password"
                  value={retakePasswordInput}
                  onChange={(e) => {
                    setRetakePasswordInput(e.target.value);
                    if (retakeError) setRetakeError('');
                  }}
                  placeholder="请输入教师授权密码"
                  autoFocus
                  className="w-full px-4.5 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-900 font-bold transition-all text-sm bg-slate-50/50 focus:bg-white"
                />
                {retakeError && (
                  <p className="text-xs font-bold text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{retakeError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  id="btn-cancel-retake"
                  type="button"
                  onClick={() => {
                    setShowRetakeModal(false);
                    setRetakePasswordInput('');
                    setRetakeError('');
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  id="btn-confirm-retake-password"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  验证并开始作答
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* DEVICE LOCK MODAL — 一台电脑只能答一次 防代答安全锁 */}
      {showDeviceLockModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-rose-200"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  ⚠️ 本机已锁定，禁止代答
                </h3>
                <p className="text-xs text-rose-600 font-bold mt-1">
                  电脑防代答安全锁 · 一人一机严格执行
                </p>
              </div>
            </div>

            {/* Lock Info */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-5 text-sm leading-relaxed text-rose-900">
              <p>
                检测到本台电脑已由
                <span className="font-black mx-1 text-rose-700">
                  【{deviceLockInfo?.studentName}（{deviceLockInfo?.studentId}）】
                </span>
                完成作答并锁定。
              </p>
              <p className="mt-2 font-bold">
                严格执行【一人一机】制度，严禁在同一电脑上代他人重复作答！
              </p>
              {deviceLockInfo?.lockedAt && (
                <p className="text-xs text-rose-600 mt-2 font-mono">
                  锁定时间：{new Date(deviceLockInfo.lockedAt).toLocaleString('zh-CN', { hour12: false })}
                </p>
              )}
            </div>

            {/* Attempting student info */}
            {pendingLoginStudent && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-5 text-xs text-amber-800">
                <span className="font-bold">当前尝试登录：</span>
                {pendingLoginStudent.name}（{pendingLoginStudent.id}）
                — 如需在此机器作答，请向任课教师申请解锁授权。
              </div>
            )}

            {/* Unlock form */}
            <form onSubmit={handleVerifyDeviceUnlock} className="space-y-3">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                教师解锁授权密码
              </label>
              <input
                id="device-unlock-password-input"
                type="password"
                value={deviceUnlockPasswordInput}
                onChange={(e) => {
                  setDeviceUnlockPasswordInput(e.target.value);
                  if (deviceUnlockError) setDeviceUnlockError('');
                }}
                placeholder="请向任课教师获取解锁密码"
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-slate-900 font-bold transition-all text-sm bg-slate-50/50 focus:bg-white"
              />
              {deviceUnlockError && (
                <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{deviceUnlockError}</span>
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  id="btn-cancel-device-unlock"
                  type="button"
                  onClick={() => {
                    setShowDeviceLockModal(false);
                    setDeviceUnlockPasswordInput('');
                    setDeviceUnlockError('');
                    setPendingLoginStudent(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  id="btn-confirm-device-unlock"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-sm transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  教师授权解锁
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
