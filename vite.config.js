import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

function exportDownloadPlugin() {
  return {
    name: 'export-download-server',
    configureServer(server) {
      server.middlewares.use('/api/export-download', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              let filename = 'score_report.xlsx';
              let base64 = '';
              let mimeType = 'application/octet-stream';

              if (req.headers['content-type']?.includes('application/json')) {
                const parsed = JSON.parse(body);
                filename = parsed.filename;
                base64 = parsed.base64;
                mimeType = parsed.mimeType || mimeType;
              } else {
                const params = new URLSearchParams(body);
                filename = params.get('filename') || filename;
                base64 = params.get('base64') || '';
                mimeType = params.get('mimeType') || mimeType;
              }

              const buffer = Buffer.from(base64, 'base64');
              const encodedFilename = encodeURIComponent(filename);

              res.setHeader('Content-Type', mimeType);
              res.setHeader(
                'Content-Disposition',
                `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`
              );
              res.setHeader('Content-Length', buffer.length);
              res.end(buffer);
            } catch (err) {
              res.statusCode = 500;
              res.end('Export error: ' + err.message);
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

import fs from 'node:fs';

function quizDataApiPlugin() {
  const dataDir = resolve(__dirname, 'public', 'api', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const readJson = (file, fallback = []) => {
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf-8');
        return raw ? JSON.parse(raw) : fallback;
      }
    } catch {}
    return fallback;
  };

  const writeJson = (file, data) => {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch {
      return false;
    }
  };

  return {
    name: 'quiz-data-api-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;

        if (
          pathname === '/api/index.php' ||
          pathname === '/api/records.ashx' ||
          pathname.startsWith('/api/') && !pathname.includes('export-download')
        ) {
          const params = urlObj.searchParams;
          const rawClass = params.get('class') || '24-1';
          const classId = rawClass.replace(/[^a-zA-Z0-9_-]/g, '') || '24-1';
          let action = params.get('action') || '';

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          const recordsFile = resolve(dataDir, `quiz_records_${classId}.json`);
          const loginsFile = resolve(dataDir, `logins_${classId}.json`);
          const attendanceFile = resolve(dataDir, `attendance_${classId}.json`);
          const locksFile = resolve(dataDir, `device_locks_${classId}.json`);

          const handleAction = (body) => {
            if (!action && body && body.action) {
              action = body.action;
            }

            switch (action) {
              case 'ping':
                res.end(JSON.stringify({ status: 'ok', engine: 'vite-dev', serverTime: new Date().toISOString() }));
                break;

              case 'get_records': {
                const recs = readJson(recordsFile, []);
                res.end(JSON.stringify({ success: true, class: classId, count: recs.length, records: recs }));
                break;
              }

              case 'get_official_scores': {
                const quizId = (params.get('quizId') || body?.quizId || 'quiz_ch1_ch2').replace(/[^a-zA-Z0-9_-]/g, '');
                const officialFile = resolve(dataDir, `official_scores_${classId}_${quizId}.json`);
                const official = readJson(officialFile, null);
                res.end(JSON.stringify({ success: true, class: classId, quizId, official }));
                break;
              }

              case 'save_official_scores': {
                const pwd = body?.password;
                if (pwd !== '5163') {
                  res.statusCode = 403;
                  res.end(JSON.stringify({ success: false, error: '密码错误，请输入教师授权密码 5163' }));
                  return;
                }
                const quizId = (params.get('quizId') || body?.quizId || 'quiz_ch1_ch2').replace(/[^a-zA-Z0-9_-]/g, '');
                const officialFile = resolve(dataDir, `official_scores_${classId}_${quizId}.json`);
                const sheet = {
                  classId,
                  quizId,
                  savedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
                  teacherConfirmed: true,
                  count: body?.records?.length || 0,
                  records: body?.records || []
                };
                writeJson(officialFile, sheet);

                // Also update master records
                const recs = readJson(recordsFile, []);
                const keyMap = new Set(recs.map(r => `${r.studentId}_${r.quizId || 'quiz_ch1_ch2'}_${r.attempt || 1}`));
                (sheet.records || []).forEach(r => {
                  const k = `${r.studentId}_${r.quizId || 'quiz_ch1_ch2'}_${r.attempt || 1}`;
                  if (!keyMap.has(k)) {
                    recs.push(r);
                    keyMap.add(k);
                  }
                });
                writeJson(recordsFile, recs);

                res.end(JSON.stringify({ success: true, official: sheet }));
                break;
              }

              case 'save_record': {
                const newRecord = body?.record;
                if (!newRecord || !newRecord.studentId) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: 'Invalid record' }));
                  return;
                }
                const recs = readJson(recordsFile, []);
                const matchIdx = recs.findIndex(
                  (r) =>
                    r.studentId === newRecord.studentId &&
                    (r.quizId || 'quiz_ch1_ch2') === (newRecord.quizId || 'quiz_ch1_ch2') &&
                    (r.attempt || 1) === (newRecord.attempt || 1)
                );
                if (matchIdx >= 0) {
                  recs[matchIdx] = newRecord;
                } else {
                  recs.push(newRecord);
                }
                writeJson(recordsFile, recs);
                res.end(JSON.stringify({ success: true, count: recs.length, records: recs }));
                break;
              }

              case 'batch_save_records': {
                const recs = body?.records || [];
                writeJson(recordsFile, recs);
                res.end(JSON.stringify({ success: true, count: recs.length }));
                break;
              }

              case 'get_logins': {
                const logs = readJson(loginsFile, []);
                res.end(JSON.stringify({ success: true, class: classId, logins: logs }));
                break;
              }

              case 'record_login': {
                const student = body?.student;
                if (!student || !student.id) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: 'Invalid student' }));
                  return;
                }
                const logs = readJson(loginsFile, []);
                const now = new Date();
                const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
                const dateStr = now.toLocaleDateString('zh-CN');
                const idx = logs.findIndex((x) => x.id === student.id);
                const item = {
                  id: student.id,
                  name: student.name || '',
                  loginTime: now.toISOString(),
                  timeStr,
                  dateStr,
                };
                if (idx >= 0) {
                  logs[idx] = item;
                } else {
                  logs.push(item);
                }
                writeJson(loginsFile, logs);
                res.end(JSON.stringify({ success: true, logins: logs }));
                break;
              }

              case 'clear_logins': {
                writeJson(loginsFile, []);
                res.end(JSON.stringify({ success: true }));
                break;
              }

              case 'get_attendance': {
                const att = readJson(attendanceFile, []);
                res.end(JSON.stringify({ success: true, class: classId, records: att }));
                break;
              }

              case 'save_attendance': {
                const att = body?.records || [];
                writeJson(attendanceFile, att);
                res.end(JSON.stringify({ success: true, count: att.length }));
                break;
              }

              case 'get_device_locks': {
                const locks = readJson(locksFile, {});
                res.end(JSON.stringify({ success: true, class: classId, locks }));
                break;
              }

              case 'save_device_lock': {
                const quizId = body?.quizId;
                const lockData = body?.lockData;
                const locks = readJson(locksFile, {});
                if (quizId && lockData) {
                  locks[quizId] = lockData;
                  writeJson(locksFile, locks);
                }
                res.end(JSON.stringify({ success: true, locks }));
                break;
              }

              default:
                res.end(JSON.stringify({ success: false, error: 'Unknown action: ' + action }));
                break;
            }
          };

          if (req.method === 'POST') {
            let rawBody = '';
            req.on('data', (chunk) => {
              rawBody += chunk;
            });
            req.on('end', () => {
              try {
                const body = rawBody ? JSON.parse(rawBody) : {};
                handleAction(body);
              } catch {
                handleAction({});
              }
            });
          } else {
            handleAction({});
          }
        } else {
          next();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), exportDownloadPlugin(), quizDataApiPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        question: resolve(__dirname, 'question.html'),
      },
    },
  },
})

