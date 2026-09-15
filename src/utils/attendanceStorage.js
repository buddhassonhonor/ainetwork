// Utilities for tracking real-time student logins and managing class attendance records
// Now powered by unified syncStorage (bi-directional server sync + localStorage fallback)

import {
  recordStudentLogin as syncRecordLogin,
  fetchStudentLogins as syncFetchLogins,
  clearStudentLogins as syncClearLogins,
  fetchAttendanceRecords as syncFetchAttendance,
  saveAttendanceRecords as syncSaveAttendance
} from './syncStorage';

const LOGIN_LOG_PREFIX = 'ainetwork_class_logins_';
const ATTENDANCE_RECORDS_PREFIX = 'ainetwork_attendance_records_';

/**
 * Record a student's login event with timestamp (syncs to server + localStorage)
 */
export const recordStudentLoginEvent = (classId, student) => {
  if (!classId || !student) return;
  syncRecordLogin(classId, student);
};

/**
 * Retrieve list of all logged-in students for a class (syncs with server)
 */
export const getStudentLogins = (classId) => {
  // Return local immediately for synchronous rendering
  try {
    const key = `${LOGIN_LOG_PREFIX}${classId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Async fetch of real-time student logins directly from server API
 */
export const fetchServerStudentLogins = async (classId) => {
  return await syncFetchLogins(classId);
};

/**
 * Clear today's login session if teacher wants to restart checkin
 */
export const clearStudentLogins = (classId) => {
  syncClearLogins(classId);
};

/**
 * Load attendance records for a specific class (local synchronous read)
 */
export const loadAttendanceRecords = (classId) => {
  try {
    const key = `${ATTENDANCE_RECORDS_PREFIX}${classId}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    if (classId === '24-1') {
      const legacy = localStorage.getItem('attendance_records');
      if (legacy) return JSON.parse(legacy);
    }
  } catch {}
  return [];
};

/**
 * Async fetch of attendance records from server
 */
export const fetchServerAttendanceRecords = async (classId) => {
  return await syncFetchAttendance(classId);
};

/**
 * Save attendance records for a specific class (syncs to server + localStorage)
 */
export const saveAttendanceRecords = (classId, records) => {
  syncSaveAttendance(classId, records);
};
