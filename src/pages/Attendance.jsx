import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  CLASSES_CONFIG,
  getClassConfig,
  getStudentsForClass
} from '../data/classesConfig';
import {
  recordStudentLoginEvent,
  getStudentLogins,
  fetchServerStudentLogins,
  clearStudentLogins,
  loadAttendanceRecords,
  fetchServerAttendanceRecords,
  saveAttendanceRecords
} from '../utils/attendanceStorage';
import { fetchQuizRecords } from '../utils/syncStorage';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Users,
  Calendar,
  Layers,
  ArrowLeft,
  Search,
  Download,
  Trash2,
  Lock,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Zap,
  Check,
  ChevronRight,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

const ATTENDANCE_PASSWORD = '5163';
const AUTH_SESSION_KEY = 'ainetwork_teacher_authed';

/** Today date helper */
const todayStr = () => {
  const d = new Date();
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
};

/**
 * Teacher Password Gate Component
 */
function LoginGate({ onAuth, onCancel }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pwd.trim() === ATTENDANCE_PASSWORD) {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      onAuth();
    } else {
      setErr('密码错误！请输入教师管理授权密码 5163');
      setPwd('');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/90 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          教师考勤管理授权
        </h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          实时统计学生登录情况与考勤归档需输入管理密码
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              教师授权密码
            </label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => {
                setPwd(e.target.value);
                if (err) setErr('');
              }}
              placeholder="请输入密码（5163）"
              autoFocus
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-slate-900 font-bold transition-all text-sm bg-slate-50/50 focus:bg-white text-center tracking-widest text-lg"
              required
            />
          </div>

          {err && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{err}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all cursor-pointer"
              >
                返回
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              验证并进入考勤
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Main Attendance Component
 */
export default function Attendance({ initialClassId = '24-1', onBack }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlClassId = searchParams.get('class');

  // Teacher authentication state
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Current selected class
  const [currentClassId, setCurrentClassId] = useState(() => {
    if (urlClassId && CLASSES_CONFIG.some((c) => c.id === urlClassId)) {
      return urlClassId;
    }
    return initialClassId || '24-1';
  });

  // Active sub-tab: 'checkin' | 'history' | 'absence_stats'
  const [activeTab, setActiveTab] = useState('checkin');

  // Check-in state
  const [date, setDate] = useState(todayStr);
  const [session, setSession] = useState('第1次课');
  const [statuses, setStatuses] = useState({}); // { [studentId]: 'present' | 'absent' | 'leave' }
  const [loginTimes, setLoginTimes] = useState({}); // { [studentId]: 'HH:mm' }
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Class config & students
  const classConfig = useMemo(() => getClassConfig(currentClassId), [currentClassId]);
  const studentsList = useMemo(() => getStudentsForClass(currentClassId).filter(s => !s.isTest), [currentClassId]);

  // Attendance records for this class
  const [records, setRecords] = useState(() => loadAttendanceRecords(currentClassId));

  // Search filter for student cards / history
  const [searchTerm, setSearchTerm] = useState('');

  const [isDetecting, setIsDetecting] = useState(false);

  // Reload records when class changes
  useEffect(() => {
    const recs = loadAttendanceRecords(currentClassId);
    setRecords(recs);
    setSaveSuccessMsg('');
    fetchServerAttendanceRecords(currentClassId).then((serverRecs) => {
      if (serverRecs && serverRecs.length > 0) {
        setRecords(serverRecs);
      }
    });
    autoDetectLogins();
  }, [currentClassId]);

  /**
   * Auto-detect student logins for the current class
   * Combines:
   * 1. Server API real-time student logins
   * 2. Server API quiz records (any student who submitted a quiz)
   * 3. Local storage fallback
   */
  const autoDetectLogins = async () => {
    setIsDetecting(true);
    try {
      // 1. Fetch real-time student logins from server API
      const logins = await fetchServerStudentLogins(currentClassId);

      // 2. Also check quiz records to capture any student who submitted
      let quizRecs = [];
      try {
        const serverQuiz = await fetchQuizRecords(currentClassId);
        if (serverQuiz) quizRecs = serverQuiz;
      } catch {}

      const newStatuses = {};
      const newTimes = {};
      const loggedInIds = new Set();

      logins.forEach((l) => {
        loggedInIds.add(l.id);
        if (l.timeStr) newTimes[l.id] = l.timeStr;
      });

      quizRecs.forEach((r) => {
        if (r.studentId) {
          loggedInIds.add(r.studentId);
          if (!newTimes[r.studentId] && r.submittedAt) {
            try {
              const d = new Date(r.submittedAt);
              newTimes[r.studentId] = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
            } catch {}
          }
        }
      });

      studentsList.forEach((s) => {
        if (loggedInIds.has(s.id)) {
          newStatuses[s.id] = 'present';
        } else {
          newStatuses[s.id] = 'absent';
        }
      });

      setStatuses(newStatuses);
      setLoginTimes(newTimes);
    } catch (e) {
      console.error('Failed to auto-detect logins:', e);
    } finally {
      setIsDetecting(false);
    }
  };

  // Run auto-detect on mount
  useEffect(() => {
    autoDetectLogins();
  }, [studentsList]);

  // Toggle single student status
  const toggleStudentStatus = (id) => {
    setStatuses((prev) => {
      const cur = prev[id] || 'absent';
      const next = cur === 'present' ? 'absent' : cur === 'absent' ? 'leave' : 'present';
      return { ...prev, [id]: next };
    });
    setSaveSuccessMsg('');
  };

  // Bulk actions
  const markAll = (val) => {
    const update = {};
    studentsList.forEach((s) => {
      update[s.id] = val;
    });
    setStatuses(update);
    setSaveSuccessMsg('');
  };

  // Metrics
  const presentCount = useMemo(() => studentsList.filter(s => statuses[s.id] === 'present').length, [studentsList, statuses]);
  const absentCount = useMemo(() => studentsList.filter(s => statuses[s.id] === 'absent').length, [studentsList, statuses]);
  const leaveCount = useMemo(() => studentsList.filter(s => statuses[s.id] === 'leave').length, [studentsList, statuses]);
  const attendanceRate = useMemo(() => {
    if (studentsList.length === 0) return '0%';
    return `${Math.round((presentCount / studentsList.length) * 100)}%`;
  }, [presentCount, studentsList]);

  // Confirm and save attendance record
  const handleConfirmSave = () => {
    const presentList = studentsList.filter(s => statuses[s.id] === 'present');
    const absentList = studentsList.filter(s => statuses[s.id] === 'absent');
    const leaveList = studentsList.filter(s => statuses[s.id] === 'leave');

    const nextNo = records.length + 1;
    const newRecord = {
      id: Date.now(),
      no: nextNo,
      noText: `第 ${nextNo} 次签到`,
      classId: currentClassId,
      className: classConfig.name,
      courseName: classConfig.courseName,
      date,
      session,
      savedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      totalStudents: studentsList.length,
      presentCount: presentList.length,
      absentCount: absentList.length,
      leaveCount: leaveList.length,
      attendanceRate: `${Math.round((presentList.length / studentsList.length) * 100)}%`,
      statuses: { ...statuses },
      presentStudents: presentList.map(s => ({ id: s.id, name: s.name, time: loginTimes[s.id] || '' })),
      absentStudents: absentList.map(s => ({ id: s.id, name: s.name })),
      leaveStudents: leaveList.map(s => ({ id: s.id, name: s.name }))
    };

    const updated = [...records, newRecord];
    setRecords(updated);
    saveAttendanceRecords(currentClassId, updated);

    setShowPreviewModal(false);
    setSaveSuccessMsg(`✅ 【${session}】考勤名单已成功归档并保存为【第 ${nextNo} 次签到】记录！`);
    setActiveTab('history');
  };

  // Delete an attendance record
  const handleDeleteRecord = (id) => {
    if (!window.confirm('确定要删除本次考勤签到记录吗？')) return;
    const updated = records.filter(r => r.id !== id).map((r, i) => ({
      ...r,
      no: i + 1,
      noText: `第 ${i + 1} 次签到`
    }));
    setRecords(updated);
    saveAttendanceRecords(currentClassId, updated);
  };

  // Cumulative absence calculations across all records
  const absenceSummary = useMemo(() => {
    const studentStats = {};
    studentsList.forEach((s) => {
      studentStats[s.id] = {
        id: s.id,
        name: s.name,
        absentCount: 0,
        leaveCount: 0,
        presentCount: 0,
        absentSessions: []
      };
    });

    records.forEach((r) => {
      studentsList.forEach((s) => {
        const st = r.statuses?.[s.id];
        if (st === 'absent') {
          studentStats[s.id].absentCount++;
          studentStats[s.id].absentSessions.push(`${r.session} (${r.date})`);
        } else if (st === 'leave') {
          studentStats[s.id].leaveCount++;
        } else if (st === 'present') {
          studentStats[s.id].presentCount++;
        }
      });
    });

    return Object.values(studentStats).sort((a, b) => {
      if (b.absentCount !== a.absentCount) {
        return b.absentCount - a.absentCount;
      }
      return a.id.localeCompare(b.id);
    });
  }, [studentsList, records]);

  // Export current attendance record to Excel
  const exportSingleRecordToExcel = (rec) => {
    const rows = [
      ['泉州师范学院 · 物理与信息工程学院 课堂考勤签到记录单'],
      [`班级：${rec.className}`, `课程：${rec.courseName}`, `课次：${rec.session}`, `日期：${rec.date}`],
      [`签到编号：${rec.noText}`, `总人数：${rec.totalStudents}人`, `出勤：${rec.presentCount}人`, `缺勤：${rec.absentCount}人`, `出勤率：${rec.attendanceRate}`],
      [],
      ['序号', '学号', '学生姓名', '考勤状态', '登录/签到时间', '备注']
    ];

    studentsList.forEach((s, idx) => {
      const st = rec.statuses?.[s.id] || 'absent';
      const stText = st === 'present' ? '出勤 (已登录)' : st === 'leave' ? '请假' : '缺勤 (未登录)';
      const time = rec.presentStudents?.find(x => x.id === s.id)?.time || '--';
      rows.push([idx + 1, s.id, s.name, stText, time, '']);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '考勤单');
    XLSX.writeFile(wb, `${rec.className}_${rec.session}_签到单_${rec.date}.xlsx`);
  };

  // Export cumulative absence summary to Excel
  const exportAbsenceSummaryToExcel = () => {
    const rows = [
      [`${classConfig.name} 课堂考勤与累计缺勤汇总表`],
      [`课程：${classConfig.courseName}`, `累计归档签到次数：${records.length} 次`, `统计日期：${todayStr()}`],
      [],
      ['序号', '学号', '学生姓名', '累计缺勤次数', '请假次数', '出勤次数', '总出勤率', '缺勤具体课次明细']
    ];

    absenceSummary.forEach((item, idx) => {
      const rate = records.length > 0 ? `${Math.round((item.presentCount / records.length) * 100)}%` : '100%';
      rows.push([
        idx + 1,
        item.id,
        item.name,
        item.absentCount,
        item.leaveCount,
        item.presentCount,
        rate,
        item.absentSessions.join('； ') || '全勤'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 35 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '缺勤统计汇总');
    XLSX.writeFile(wb, `${classConfig.name}_累计缺勤人次汇总表_${todayStr()}.xlsx`);
  };

  // If not authed, show password gate
  if (!authed) {
    return <LoginGate onAuth={() => setAuthed(true)} onCancel={onBack} />;
  }

  // Filter students by search term
  const filteredStudents = studentsList.filter(
    s => s.name.includes(searchTerm.trim()) || s.id.includes(searchTerm.trim())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/20 text-slate-900 pb-20">
      {/* Attendance Header */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-xl border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="返回随堂测验界面"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">返回测验</span>
              </button>
            ) : (
              <Link
                to="/quiz"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">返回大厅</span>
              </Link>
            )}

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 flex-shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight leading-none">
                课堂统计登录与考勤签到
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {classConfig.name} · {classConfig.courseShortName}
              </p>
            </div>
          </div>

          {/* Quick Exit Auth */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              教师授权已验证
            </span>
            <button
              onClick={() => {
                sessionStorage.removeItem(AUTH_SESSION_KEY);
                setAuthed(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-bold transition-all cursor-pointer"
              title="锁定退出"
            >
              锁定考勤
            </button>
          </div>
        </div>

        {/* Class Selection Tabs Bar */}
        <div className="bg-slate-50/90 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-0.5">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
              选择教学班级:
            </span>
            {CLASSES_CONFIG.map((cls) => {
              const isSelected = currentClassId === cls.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => {
                    setCurrentClassId(cls.id);
                    setSearchParams({ class: cls.id });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'bg-white hover:bg-indigo-50 text-slate-600 border border-slate-200/90'
                  }`}
                >
                  <span>{cls.shortName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {cls.studentCount}人
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Mode Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('checkin')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'checkin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-black'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>课堂实时登录采集与签到</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-black'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>历史签到归档 ({records.length} 次)</span>
            </button>

            <button
              onClick={() => setActiveTab('absence_stats')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'absence_stats'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-black'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>缺勤人次汇总统计</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'absence_stats' && (
              <button
                onClick={exportAbsenceSummaryToExcel}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>导出缺勤汇总 Excel</span>
              </button>
            )}
          </div>
        </div>

        {/* Save success banner */}
        {saveSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMsg('')}
              className="text-xs text-emerald-600 hover:text-emerald-900 underline cursor-pointer"
            >
              关闭
            </button>
          </div>
        )}

        {/* TAB 1: REAL-TIME CHECKIN */}
        {activeTab === 'checkin' && (
          <div className="space-y-6">
            {/* Top Control Bar: Session, Date & Auto-sync */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500">考勤日期</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-500">课次序号</label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-indigo-500 cursor-pointer"
                  >
                    {Array.from({ length: 20 }, (_, i) => `第${i + 1}次课`).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* The core classroom feature requested by the user */}
                <button
                  type="button"
                  onClick={autoDetectLogins}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:scale-102"
                  title="自动读取学生在本次测验系统中的实时登录情况并标为出勤"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ 一键采集本节课学生实时登录</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => markAll('present')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
                >
                  全部出勤
                </button>
                <button
                  onClick={() => markAll('absent')}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                >
                  全部缺勤
                </button>
                <button
                  onClick={autoDetectLogins}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>刷新登录状态</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase">全班学生总数</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {studentsList.length} <span className="text-xs font-normal text-slate-500">人</span>
                </div>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
                <div className="text-[11px] font-bold text-emerald-600 uppercase">已登录 · 出勤</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {presentCount} <span className="text-xs font-normal text-emerald-600">人</span>
                </div>
              </div>

              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 shadow-xs">
                <div className="text-[11px] font-bold text-rose-600 uppercase">未登录 · 缺勤</div>
                <div className="text-2xl font-black text-rose-700 mt-1">
                  {absentCount} <span className="text-xs font-normal text-rose-600">人</span>
                </div>
              </div>

              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200/80 shadow-xs">
                <div className="text-[11px] font-bold text-indigo-600 uppercase">当前课堂到课率</div>
                <div className="text-2xl font-black text-indigo-700 mt-1">
                  {attendanceRate}
                </div>
              </div>
            </div>

            {/* Search Filter for Student Cards */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索学生姓名或学号..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                点击学生卡片可手动切换状态（出勤 ⇄ 缺勤 ⇄ 请假）
              </div>
            </div>

            {/* Student Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredStudents.map((s, idx) => {
                const status = statuses[s.id] || 'absent';
                const isPresent = status === 'present';
                const isLeave = status === 'leave';
                const time = loginTimes[s.id];

                return (
                  <div
                    key={s.id}
                    onClick={() => toggleStudentStatus(s.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between hover:shadow-md ${
                      isPresent
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : isLeave
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                          isPresent
                            ? 'bg-emerald-600 text-white'
                            : isLeave
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                          isPresent
                            ? 'bg-emerald-100 text-emerald-800'
                            : isLeave
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {isPresent ? '✓ 出勤' : isLeave ? '请假' : '✗ 缺勤'}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-black text-slate-900 tracking-tight">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {s.id}
                      </div>
                    </div>

                    {/* Login timestamp pill if available */}
                    <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] flex items-center justify-between text-slate-500 font-medium">
                      <span>{time ? `${time} 登录` : (isPresent ? '已签到' : '未检测到登录')}</span>
                      <span className="text-[9px] text-indigo-500 font-bold">点按切换</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Footer */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                当前检测到：出勤 <strong className="text-emerald-600">{presentCount}</strong> 人，缺勤 <strong className="text-rose-600">{absentCount}</strong> 人。核对无误后点击右侧保存。
              </div>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102"
              >
                <span>查看并确认签到名单</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY RECORDS */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                【{classConfig.name}】历史签到记录（共 {records.length} 次）
              </h2>
              <button
                onClick={() => setActiveTab('checkin')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
              >
                + 新建课堂签到
              </button>
            </div>

            {records.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-sm text-slate-600">暂无归档的考勤记录</p>
                <p className="text-xs text-slate-400 mt-1">
                  上课时点击【新建课堂签到】，一键采集登录情况并确认保存即可生成记录。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...records].reverse().map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-indigo-200 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black">
                          {rec.noText || `第 ${rec.no} 次签到`}
                        </span>
                        <div>
                          <div className="text-base font-black text-slate-900">
                            {rec.session} · {rec.date}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            归档时间：{rec.savedAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          出勤 {rec.presentCount} 人 ({rec.attendanceRate})
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          缺勤 {rec.absentCount} 人
                        </span>
                      </div>
                    </div>

                    {/* Absent students pills */}
                    {rec.absentStudents && rec.absentStudents.length > 0 && (
                      <div className="mt-4 p-3 rounded-2xl bg-rose-50/70 border border-rose-100 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-black text-rose-700">缺勤学生（{rec.absentStudents.length}人）：</span>
                        {rec.absentStudents.map((s) => (
                          <span
                            key={s.id}
                            className="px-2.5 py-0.5 rounded-full bg-white text-rose-700 border border-rose-200 font-bold"
                          >
                            {s.name} ({s.id})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Present students summary */}
                    <div className="mt-3 flex items-center justify-between pt-2">
                      <div className="text-xs text-slate-500 font-medium">
                        出勤学生：{rec.presentStudents?.slice(0, 8).map(s => s.name).join('、')}
                        {rec.presentStudents?.length > 8 ? ` 等共 ${rec.presentStudents.length} 人` : ''}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => exportSingleRecordToExcel(rec)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>导出Excel</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all cursor-pointer"
                          title="删除本次记录"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUMULATIVE ABSENCE SUMMARY TABLE */}
        {activeTab === 'absence_stats' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    【{classConfig.name}】每人缺勤人次统计汇总表
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    基于已归档的 {records.length} 次签到记录自动汇总，按缺勤次数由高到低降序排列。
                  </p>
                </div>

                <button
                  onClick={exportAbsenceSummaryToExcel}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>导出全班缺勤汇总 Excel 报表</span>
                </button>
              </div>

              {records.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  暂无历史签到记录，保存签到后即可在此自动汇总全班缺勤人次与详情。
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/90 text-slate-600 font-black">
                        <th className="p-3.5 text-center w-14">#</th>
                        <th className="p-3.5">学号</th>
                        <th className="p-3.5">姓名</th>
                        <th className="p-3.5 text-center">累计缺勤次数</th>
                        <th className="p-3.5 text-center">出勤率</th>
                        <th className="p-3.5">缺勤具体课次记录</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {absenceSummary.map((item, idx) => {
                        const hasAbsence = item.absentCount > 0;
                        const rate = records.length > 0 ? `${Math.round((item.presentCount / records.length) * 100)}%` : '100%';

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              hasAbsence ? 'bg-rose-50/20' : ''
                            }`}
                          >
                            <td className="p-3.5 text-center font-mono font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="p-3.5 font-mono text-slate-700 font-bold">
                              {item.id}
                            </td>
                            <td className="p-3.5 font-black text-slate-900">
                              {item.name}
                            </td>
                            <td className="p-3.5 text-center">
                              {hasAbsence ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-xs">
                                  {item.absentCount} 次缺勤
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                                  全勤
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-center font-bold">
                              <span className={hasAbsence ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'}>
                                {rate}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-600">
                              {item.absentSessions.length > 0 ? (
                                <span className="text-rose-700 font-bold">
                                  {item.absentSessions.join('； ')}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal">--</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* CONFIRM / PREVIEW MODAL BEFORE SAVING */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black">
                  确认考勤归档
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {classConfig.name} · {session}
                </h3>
                <p className="text-xs text-slate-500 font-medium">考勤日期：{date}</p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-black">
                编号 #{records.length + 1}
              </span>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200/80">
                  <div className="text-xs font-bold text-emerald-700">✓ 出勤学生（{presentCount}人）</div>
                  <div className="text-lg font-black text-emerald-800 mt-0.5">{attendanceRate}</div>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200/80">
                  <div className="text-xs font-bold text-rose-700">✗ 缺勤学生（{absentCount}人）</div>
                  <div className="text-lg font-black text-rose-800 mt-0.5">
                    {Math.round((absentCount / studentsList.length) * 100)}%
                  </div>
                </div>
              </div>

              {absentCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200">
                  <div className="text-xs font-black text-rose-800 mb-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>确认缺勤学生名单（{absentCount}人）：</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {studentsList.filter(s => statuses[s.id] === 'absent').map(s => (
                      <span key={s.id} className="px-2.5 py-0.5 rounded-full bg-white text-rose-700 border border-rose-200 text-xs font-bold">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-700">出勤人员概览：</span>
                {studentsList.filter(s => statuses[s.id] === 'present').map(s => s.name).join('、')}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
              >
                返回核对
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>确认保存并生成签到记录</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
