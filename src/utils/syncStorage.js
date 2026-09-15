/**
 * AINetwork Unified Sync Storage Engine
 * Handles bidirectional synchronization between browser localStorage and the central server API
 * Supports PHP (/api/index.php), ASP.NET (/api/records.ashx), and local Vite dev middleware.
 */

const STORAGE_KEYS = {
  quizRecords: (classId) => `ainetwork_quiz_records_${classId}_v2`,
  studentLogins: (classId) => `ainetwork_class_logins_${classId}`,
  attendance: (classId) => `ainetwork_attendance_records_${classId}`,
  deviceLocks: (classId) => `ainetwork_device_locks_${classId}`,
};

let detectedApiEndpoint = null; // null | '/api/index.php' | '/api/records.ashx'
let lastServerStatus = { online: false, engine: 'detecting', lastChecked: 0 };

/**
 * Detect available API endpoint on current host
 */
export async function detectApiEndpoint(force = false) {
  if (detectedApiEndpoint && !force && Date.now() - lastServerStatus.lastChecked < 60000) {
    return detectedApiEndpoint;
  }

  const candidates = ['/api/index.php', '/api/records.ashx'];

  for (const endpoint of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${endpoint}?action=ping`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 'ok') {
          detectedApiEndpoint = endpoint;
          lastServerStatus = {
            online: true,
            engine: data.engine || 'server',
            lastChecked: Date.now(),
          };
          return endpoint;
        }
      }
    } catch {
      // Continue trying next candidate
    }
  }

  // If both direct scripts failed, try generic /api/ping
  try {
    const res = await fetch('/api/ping?action=ping');
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'ok') {
        detectedApiEndpoint = '/api/index.php';
        lastServerStatus = { online: true, engine: data.engine || 'server', lastChecked: Date.now() };
        return detectedApiEndpoint;
      }
    }
  } catch {}

  lastServerStatus = { online: false, engine: 'offline', lastChecked: Date.now() };
  return null;
}

/**
 * Get current server connection status
 */
export function getServerStatus() {
  return { ...lastServerStatus };
}

/**
 * Generic helper to make API requests with graceful local fallback
 */
async function apiRequest(action, classId, method = 'GET', body = null) {
  const endpoint = await detectApiEndpoint();
  if (!endpoint) {
    return { ok: false, offline: true };
  }

  try {
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set('action', action);
    if (classId) url.searchParams.set('class', classId);

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    if (method === 'POST' && body) {
      options.body = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    options.signal = controller.signal;

    const res = await fetch(url.toString(), options);
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }
    return { ok: false, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ==========================================
// 1. QUIZ RECORDS SYNC
// ==========================================

export async function fetchQuizRecords(classId) {
  const localKey = STORAGE_KEYS.quizRecords(classId);
  let localRecords = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localRecords = JSON.parse(raw);
    else if (classId === '24-1') {
      const legacy = localStorage.getItem('ainetwork_quiz_records_v2');
      if (legacy) localRecords = JSON.parse(legacy);
    }
  } catch {}

  const res = await apiRequest('get_records', classId, 'GET');
  if (res.ok && res.data && Array.isArray(res.data.records)) {
    const serverRecords = res.data.records;

    // Merge strategy:
    // Create map of server records by unique studentId + quizId + attempt (or submittedAt)
    const recordMap = new Map();
    serverRecords.forEach((r) => {
      const key = `${r.studentId}_${r.quizId || 'quiz_ch1_ch2'}_${r.attempt || 1}_${r.submittedAt || ''}`;
      recordMap.set(key, r);
    });

    // If local has records not yet on server, keep them and push to server in background
    const unpushed = [];
    localRecords.forEach((r) => {
      const key = `${r.studentId}_${r.quizId || 'quiz_ch1_ch2'}_${r.attempt || 1}_${r.submittedAt || ''}`;
      if (!recordMap.has(key)) {
        recordMap.set(key, r);
        unpushed.push(r);
      }
    });

    const merged = Array.from(recordMap.values());
    // Sort chronologically or by submittedAt descending
    merged.sort((a, b) => new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0));

    try {
      localStorage.setItem(localKey, JSON.stringify(merged));
      if (classId === '24-1') {
        localStorage.setItem('ainetwork_quiz_records_v2', JSON.stringify(merged));
      }
    } catch {}

    // Asynchronously push unpushed local records to server
    if (unpushed.length > 0) {
      apiRequest('batch_save_records', classId, 'POST', { records: merged });
    }

    return merged;
  }

  return localRecords;
}

export async function saveSingleQuizRecord(classId, record) {
  const localKey = STORAGE_KEYS.quizRecords(classId);
  let currentRecords = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) currentRecords = JSON.parse(raw);
  } catch {}

  const updated = [...currentRecords, record];
  try {
    localStorage.setItem(localKey, JSON.stringify(updated));
    if (classId === '24-1') {
      localStorage.setItem('ainetwork_quiz_records_v2', JSON.stringify(updated));
    }
  } catch {}

  // Sync to server
  try {
    apiRequest('save_record', classId, 'POST', { record });
  } catch {}

  return updated;
}

// ==========================================
// 2. STUDENT REAL-TIME LOGINS (for Attendance)
// ==========================================

export async function recordStudentLogin(classId, student) {
  if (!classId || !student) return;

  const localKey = STORAGE_KEYS.studentLogins(classId);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('zh-CN');

  const loginItem = {
    id: student.id,
    name: student.name,
    loginTime: now.toISOString(),
    timeStr,
    dateStr,
  };

  // 1. Local update
  try {
    const raw = localStorage.getItem(localKey);
    const list = raw ? JSON.parse(raw) : [];
    const existingIdx = list.findIndex((x) => x.id === student.id);
    if (existingIdx >= 0) {
      list[existingIdx] = loginItem;
    } else {
      list.push(loginItem);
    }
    localStorage.setItem(localKey, JSON.stringify(list));
  } catch {}

  // 2. Server update
  try {
    apiRequest('record_login', classId, 'POST', { student: loginItem });
  } catch {}
}

export async function fetchStudentLogins(classId) {
  const localKey = STORAGE_KEYS.studentLogins(classId);
  let localList = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localList = JSON.parse(raw);
  } catch {}

  const res = await apiRequest('get_logins', classId, 'GET');
  if (res.ok && res.data && Array.isArray(res.data.logins)) {
    const serverLogins = res.data.logins;
    const loginMap = new Map();
    serverLogins.forEach((l) => loginMap.set(l.id, l));
    localList.forEach((l) => {
      if (!loginMap.has(l.id)) loginMap.set(l.id, l);
    });
    const merged = Array.from(loginMap.values());
    try {
      localStorage.setItem(localKey, JSON.stringify(merged));
    } catch {}
    return merged;
  }

  return localList;
}

export async function clearStudentLogins(classId, password = '5163') {
  const localKey = STORAGE_KEYS.studentLogins(classId);
  try {
    localStorage.removeItem(localKey);
  } catch {}
  await apiRequest('clear_logins', classId, 'POST', { password });
}

// ==========================================
// 3. ATTENDANCE RECORDS SYNC
// ==========================================

export async function fetchAttendanceRecords(classId) {
  const localKey = STORAGE_KEYS.attendance(classId);
  let localRecords = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localRecords = JSON.parse(raw);
    else if (classId === '24-1') {
      const legacy = localStorage.getItem('attendance_records');
      if (legacy) localRecords = JSON.parse(legacy);
    }
  } catch {}

  const res = await apiRequest('get_attendance', classId, 'GET');
  if (res.ok && res.data && Array.isArray(res.data.records)) {
    const serverRecords = res.data.records;
    const recordMap = new Map();
    serverRecords.forEach((r) => recordMap.set(r.id, r));
    localRecords.forEach((r) => {
      if (!recordMap.has(r.id)) recordMap.set(r.id, r);
    });
    const merged = Array.from(recordMap.values());
    try {
      localStorage.setItem(localKey, JSON.stringify(merged));
      if (classId === '24-1') {
        localStorage.setItem('attendance_records', JSON.stringify(merged));
      }
    } catch {}
    return merged;
  }

  return localRecords;
}

export async function saveAttendanceRecords(classId, records) {
  const localKey = STORAGE_KEYS.attendance(classId);
  try {
    localStorage.setItem(localKey, JSON.stringify(records));
    if (classId === '24-1') {
      localStorage.setItem('attendance_records', JSON.stringify(records));
    }
  } catch {}

  await apiRequest('save_attendance', classId, 'POST', { records });
}

// ==========================================
// 4. DEVICE LOCKS SYNC
// ==========================================

export async function fetchDeviceLocks(classId) {
  const localKey = STORAGE_KEYS.deviceLocks(classId);
  let localLocks = {};
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localLocks = JSON.parse(raw);
  } catch {}

  const res = await apiRequest('get_device_locks', classId, 'GET');
  if (res.ok && res.data && res.data.locks) {
    const merged = { ...localLocks, ...res.data.locks };
    try {
      localStorage.setItem(localKey, JSON.stringify(merged));
    } catch {}
    return merged;
  }

  return localLocks;
}

export async function saveDeviceLock(classId, quizId, lockData) {
  const localKey = STORAGE_KEYS.deviceLocks(classId);
  let localLocks = {};
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localLocks = JSON.parse(raw);
  } catch {}

  localLocks[quizId] = lockData;
  try {
    localStorage.setItem(localKey, JSON.stringify(localLocks));
  } catch {}

  apiRequest('save_device_lock', classId, 'POST', { quizId, lockData });
}
