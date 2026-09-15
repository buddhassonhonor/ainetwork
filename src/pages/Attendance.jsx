import React, { useState, useEffect } from 'react';
import { classStudents } from '../data/students';

const ATTENDANCE_PASSWORD = '5163';
const STORAGE_KEY = 'attendance_records';

// ── helpers ──────────────────────────────────────────────────────────────────
const loadRecords = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const saveRecords = (records) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const today = () => {
  const d = new Date();
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const nowStr = () => {
  const d = new Date();
  return d.toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// ── sub-components ────────────────────────────────────────────────────────────

/** Password gate */
function LoginGate({ onAuth }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (pwd === ATTENDANCE_PASSWORD) {
      onAuth();
    } else {
      setErr('密码错误，请重试');
      setShake(true);
      setPwd('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      padding: '1rem'
    }}>
      {/* bg dots */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#818cf8 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '1.5rem',
        padding: '3rem 2.5rem', width: '100%', maxWidth: '400px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        animation: shake ? 'shake 0.5s ease' : 'none'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📋</div>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.03em', margin: 0 }}>签到管理系统</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: '0.5rem', fontSize: '0.9rem' }}>24通信·计算机网络</p>
        </div>

        <form onSubmit={submit}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            管理员密码
          </label>
          <input
            type="password"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setErr(''); }}
            placeholder="请输入密码"
            autoFocus
            style={{
              width: '100%', padding: '0.85rem 1rem', borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.08)', border: err ? '1.5px solid #f87171' : '1.5px solid rgba(255,255,255,0.15)',
              color: '#fff', fontSize: '1.1rem', outline: 'none',
              letterSpacing: '0.2em', boxSizing: 'border-box', transition: 'border 0.2s'
            }}
          />
          {err && <p style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.5rem', marginBottom: 0 }}>{err}</p>}

          <button type="submit" style={{
            marginTop: '1.5rem', width: '100%', padding: '0.9rem',
            background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
            color: '#fff', fontWeight: 800, fontSize: '1rem', border: 'none',
            borderRadius: '0.75rem', cursor: 'pointer', letterSpacing: '0.04em',
            boxShadow: '0 8px 24px rgba(79,70,229,0.4)', transition: 'transform 0.15s, box-shadow 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(79,70,229,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.4)'; }}
          >
            验证登录 →
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  );
}

/** Student card in check-in grid */
function StudentCard({ student, no, status, onClick }) {
  const colors = {
    present: { bg: '#022c22', border: '#10b981', dot: '#10b981', text: '#6ee7b7', badge: '✓ 出勤' },
    absent:  { bg: '#2d0e0e', border: '#ef4444', dot: '#ef4444', text: '#fca5a5', badge: '✗ 缺勤' },
    none:    { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', dot: '#475569', text: '#94a3b8', badge: '待签' },
  };
  const c = colors[status];
  return (
    <div onClick={onClick} style={{
      background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: '0.875rem',
      padding: '0.9rem 1rem', cursor: 'pointer', userSelect: 'none',
      transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.2s',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      boxShadow: status !== 'none' ? `0 4px 16px ${c.dot}22` : 'none'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${c.dot}33`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = status !== 'none' ? `0 4px 16px ${c.dot}22` : 'none'; }}
    >
      <span style={{
        minWidth: '1.8rem', height: '1.8rem', borderRadius: '50%',
        background: c.dot, color: '#fff', fontWeight: 800, fontSize: '0.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>{no}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
        <div style={{ color: c.text, fontSize: '0.72rem', fontWeight: 600, marginTop: '0.1rem' }}>{c.badge}</div>
      </div>
    </div>
  );
}

/** Preview modal */
function PreviewModal({ date, session, statuses, onConfirm, onCancel }) {
  const presentList = classStudents.filter(s => statuses[s.id] === 'present');
  const absentList  = classStudents.filter(s => statuses[s.id] === 'absent');
  const unmarked    = classStudents.filter(s => !statuses[s.id] || statuses[s.id] === 'none');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '1.5rem', width: '100%', maxWidth: '540px',
        maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)'
      }}>
        {/* header */}
        <div style={{ padding: '1.5rem 2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#818cf8', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>确认签到名单</div>
          <div style={{ color: '#f1f5f9', fontWeight: 900, fontSize: '1.3rem' }}>{date} {session}</div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
            <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>✓ 出勤 {presentList.length} 人</span>
            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>✗ 缺勤 {absentList.length} 人</span>
            {unmarked.length > 0 && <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>⚠ 未标记 {unmarked.length} 人</span>}
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }}>
          {unmarked.length > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>⚠ 以下学生未标记（将视为缺席）</div>
              <div style={{ color: '#fde68a', fontSize: '0.82rem' }}>{unmarked.map(s => s.name).join('、')}</div>
            </div>
          )}

          {absentList.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>缺勤名单</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {absentList.map(s => (
                  <span key={s.id} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600 }}>{s.name}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>出勤名单（{presentList.length}人）</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {presentList.map(s => (
                <span key={s.id} style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600 }}>{s.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: '1rem 2rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.75rem' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '0.8rem', borderRadius: '0.75rem',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#94a3b8', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer'
          }}>返回修改</button>
          <button onClick={onConfirm} style={{
            flex: 2, padding: '0.8rem', borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
            border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(79,70,229,0.35)'
          }}>
            💾 确认保存签到名单
          </button>
        </div>
      </div>
    </div>
  );
}

/** History + absence stats tab */
function HistoryView({ records, onDelete }) {
  const [selected, setSelected] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  // compute absence counts per student
  const absenceCounts = {};
  classStudents.forEach(s => { absenceCounts[s.id] = 0; });
  records.forEach(r => {
    classStudents.forEach(s => {
      if (r.statuses[s.id] !== 'present') absenceCounts[s.id]++;
    });
  });
  const absentStudents = classStudents
    .map(s => ({ ...s, absences: absenceCounts[s.id] }))
    .filter(s => s.absences > 0)
    .sort((a, b) => b.absences - a.absences);

  const selectedRecord = records.find(r => r.id === selected);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,320px)', gap: '1.5rem', alignItems: 'start' }}>

      {/* left: records list */}
      <div>
        <div style={{ color: '#cbd5e1', fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', letterSpacing: '0.03em' }}>
          📅 历史签到记录（共 {records.length} 次）
        </div>
        {records.length === 0 ? (
          <div style={{ color: '#475569', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
            暂无签到记录
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {records.map((r, i) => {
              const absent = classStudents.filter(s => r.statuses[s.id] !== 'present').length;
              const present = classStudents.length - absent;
              const isActive = selected === r.id;
              return (
                <div key={r.id}
                  onClick={() => setSelected(isActive ? null : r.id)}
                  style={{
                    background: isActive ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${isActive ? 'rgba(79,70,229,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '0.875rem', padding: '1rem 1.25rem', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        minWidth: '2rem', height: '2rem', background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                        borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 900, fontSize: '0.8rem'
                      }}>#{r.no}</span>
                      <div>
                        <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '0.95rem' }}>{r.date} {r.session}</div>
                        <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.15rem' }}>保存于 {r.savedAt}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>✓ {present}</span>
                      {absent > 0 && <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>✗ {absent}</span>}
                      <button onClick={e => { e.stopPropagation(); setConfirmDel(r.id); }}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '0.5rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}>
                        删除
                      </button>
                    </div>
                  </div>

                  {/* expanded detail */}
                  {isActive && selectedRecord && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      {classStudents.filter(s => selectedRecord.statuses[s.id] !== 'present').length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>缺勤：</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {classStudents.filter(s => selectedRecord.statuses[s.id] !== 'present').map((s, idx) => (
                              <span key={s.id} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600 }}>
                                {idx + 1}. {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>出勤（{present}人）：</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {classStudents.filter(s => selectedRecord.statuses[s.id] === 'present').map((s, idx) => (
                            <span key={s.id} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', padding: '0.15rem 0.55rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600 }}>
                              {idx + 1}. {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* right: absence stats */}
      <div style={{ position: 'sticky', top: '6rem' }}>
        <div style={{ color: '#cbd5e1', fontWeight: 800, fontSize: '1rem', marginBottom: '1rem', letterSpacing: '0.03em' }}>
          📊 缺勤汇总（共 {records.length} 次课）
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
          {absentStudents.length === 0 ? (
            <div style={{ color: '#475569', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>
              🎉 全勤！暂无缺勤记录
            </div>
          ) : (
            <>
              {/* table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5rem 1fr auto auto', gap: '0.5rem 0.75rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
                <span>#</span><span>姓名</span><span>缺勤次数</span><span>比率</span>
              </div>
              {absentStudents.map((s, i) => {
                const rate = records.length > 0 ? Math.round(s.absences / records.length * 100) : 0;
                const color = s.absences >= 3 ? '#ef4444' : s.absences === 2 ? '#f59e0b' : '#94a3b8';
                return (
                  <div key={s.id} style={{
                    display: 'grid', gridTemplateColumns: '1.5rem 1fr auto auto', gap: '0.5rem 0.75rem',
                    padding: '0.65rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    alignItems: 'center', transition: 'background 0.15s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.88rem' }}>{s.name}</span>
                    <span style={{
                      background: `${color}22`, border: `1px solid ${color}44`,
                      color, fontWeight: 800, fontSize: '0.82rem',
                      padding: '0.15rem 0.6rem', borderRadius: '999px', textAlign: 'center'
                    }}>{s.absences}次</span>
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{rate}%</span>
                  </div>
                );
              })}
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(79,70,229,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>共 {absentStudents.length} 人有缺勤</span>
                <span style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 700 }}>满勤：{classStudents.length - absentStudents.length} 人</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* delete confirm */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '1rem', padding: '2rem', maxWidth: '320px', width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
            <div style={{ color: '#f1f5f9', fontWeight: 800, marginBottom: '0.5rem' }}>确认删除此条签到记录？</div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>此操作不可撤销</div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: '0.7rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>取消</button>
              <button onClick={() => { onDelete(confirmDel); setConfirmDel(null); if (selected === confirmDel) setSelected(null); }}
                style={{ flex: 1, padding: '0.7rem', borderRadius: '0.6rem', background: '#ef4444', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Attendance() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState('checkin'); // 'checkin' | 'history'
  const [statuses, setStatuses] = useState({}); // id -> 'present'|'absent'|'none'
  const [date, setDate] = useState(today());
  const [session, setSession] = useState('第1次课');
  const [preview, setPreview] = useState(false);
  const [records, setRecords] = useState(loadRecords());
  const [saved, setSaved] = useState(false);

  const totalPresent = classStudents.filter(s => statuses[s.id] === 'present').length;
  const totalAbsent  = classStudents.filter(s => statuses[s.id] === 'absent').length;
  const totalUnmarked = classStudents.length - totalPresent - totalAbsent;

  const toggleStatus = (id) => {
    setStatuses(prev => {
      const cur = prev[id] || 'none';
      const next = cur === 'none' ? 'present' : cur === 'present' ? 'absent' : 'none';
      return { ...prev, [id]: next };
    });
    setSaved(false);
  };

  const markAll = (val) => {
    const all = {};
    classStudents.forEach(s => { all[s.id] = val; });
    setStatuses(all);
    setSaved(false);
  };

  const reset = () => { setStatuses({}); setSaved(false); };

  const handleSave = () => {
    const finalStatuses = { ...statuses };
    classStudents.forEach(s => {
      if (!finalStatuses[s.id] || finalStatuses[s.id] === 'none') finalStatuses[s.id] = 'absent';
    });
    const newRecord = {
      id: Date.now(),
      no: records.length + 1,
      date,
      session,
      statuses: finalStatuses,
      savedAt: new Date().toLocaleString('zh-CN'),
    };
    const updated = [...records, newRecord];
    setRecords(updated);
    saveRecords(updated);
    setPreview(false);
    setSaved(true);
    setStatuses({});
    setTab('history');
  };

  const handleDelete = (id) => {
    const updated = records.filter(r => r.id !== id).map((r, i) => ({ ...r, no: i + 1 }));
    setRecords(updated);
    saveRecords(updated);
  };

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1a1340 60%, #0f172a 100%)', paddingBottom: '4rem' }}>
      {/* bg dots */}
      <div style={{ position: 'fixed', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#818cf8 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* page header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ color: '#818cf8', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>24通信 · 计算机网络</div>
          <h1 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: '2.2rem', margin: 0, letterSpacing: '-0.03em' }}>📋 签到管理</h1>
          <p style={{ color: '#475569', marginTop: '0.4rem', fontSize: '0.9rem' }}>点击学生卡片可切换状态：未标记 → 出勤 → 缺勤 → 循环</p>
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '0.35rem', borderRadius: '0.875rem', width: 'fit-content', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[['checkin', '✏️ 新建签到'], ['history', `📅 历史记录 (${records.length})`]].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setSaved(false); }}
              style={{
                padding: '0.6rem 1.4rem', borderRadius: '0.6rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
                background: tab === key ? 'linear-gradient(135deg, #4f46e5, #0ea5e9)' : 'transparent',
                color: tab === key ? '#fff' : '#64748b',
                boxShadow: tab === key ? '0 4px 12px rgba(79,70,229,0.35)' : 'none'
              }}>{label}</button>
          ))}
        </div>

        {saved && (
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.875rem', padding: '0.9rem 1.25rem', marginBottom: '1.5rem', color: '#6ee7b7', fontWeight: 700 }}>
            ✅ 签到名单已成功保存！已自动跳转至历史记录。
          </div>
        )}

        {/* ── CHECK-IN TAB ── */}
        {tab === 'checkin' && (
          <>
            {/* controls row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>日期</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', padding: '0.45rem 0.75rem', borderRadius: '0.6rem', fontSize: '0.85rem', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>课次</label>
                <select value={session} onChange={e => setSession(e.target.value)}
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9', padding: '0.45rem 0.75rem', borderRadius: '0.6rem', fontSize: '0.85rem', outline: 'none' }}>
                  {Array.from({ length: 20 }, (_, i) => `第${i + 1}次课`).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                <button onClick={() => markAll('present')} style={{ padding: '0.45rem 0.9rem', borderRadius: '0.6rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>全部出勤</button>
                <button onClick={() => markAll('absent')} style={{ padding: '0.45rem 0.9rem', borderRadius: '0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>全部缺勤</button>
                <button onClick={reset} style={{ padding: '0.45rem 0.9rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>重置</button>
              </div>
            </div>

            {/* stats bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: '出勤', val: totalPresent, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                { label: '缺勤', val: totalAbsent,  color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                { label: '未标记', val: totalUnmarked, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                { label: '总人数', val: classStudents.length, color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
              ].map(item => (
                <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.color}33`, borderRadius: '0.75rem', padding: '0.6rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: item.color, fontWeight: 900, fontSize: '1.3rem' }}>{item.val}</span>
                  <span style={{ color: item.color, fontSize: '0.8rem', fontWeight: 600 }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* student grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {classStudents.map((s, i) => (
                <StudentCard
                  key={s.id}
                  student={s}
                  no={i + 1}
                  status={statuses[s.id] || 'none'}
                  onClick={() => toggleStatus(s.id)}
                />
              ))}
            </div>

            {/* action buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setPreview(true)} style={{
                padding: '0.85rem 2.5rem', borderRadius: '0.875rem',
                background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                border: 'none', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(79,70,229,0.4)', transition: 'transform 0.15s, box-shadow 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(79,70,229,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.4)'; }}
              >
                查看并确认签到名单 →
              </button>
            </div>
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <HistoryView records={[...records].reverse()} onDelete={handleDelete} />
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <PreviewModal
          date={date}
          session={session}
          statuses={statuses}
          onConfirm={handleSave}
          onCancel={() => setPreview(false)}
        />
      )}
    </div>
  );
}
