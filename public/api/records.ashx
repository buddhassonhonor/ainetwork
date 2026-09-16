<%@ WebHandler Language="C#" Class="QuizApiHandler" %>
using System;
using System.Web;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

public class QuizApiHandler : IHttpHandler {
    private static readonly object _lockObj = new object();

    private static void SafeWriteFile(string filePath, string content) {
        try {
            if (File.Exists(filePath)) {
                try { File.SetAttributes(filePath, FileAttributes.Normal); } catch { }
            }
            File.WriteAllText(filePath, content, Encoding.UTF8);
            return;
        } catch { }

        // Fallback: write to temp file in same directory and swap
        try {
            string dir = Path.GetDirectoryName(filePath);
            string tempFile = Path.Combine(dir, "_" + Path.GetFileName(filePath) + "." + Guid.NewGuid().ToString("N") + ".tmp");
            File.WriteAllText(tempFile, content, Encoding.UTF8);

            try {
                if (File.Exists(filePath)) {
                    try { File.SetAttributes(filePath, FileAttributes.Normal); } catch { }
                    try { File.Delete(filePath); } catch { }
                }
                File.Move(tempFile, filePath);
                return;
            } catch { }

            try {
                File.Copy(tempFile, filePath, true);
                try { File.Delete(tempFile); } catch { }
                return;
            } catch { }
        } catch { }

        // Final attempt
        File.WriteAllText(filePath, content, Encoding.UTF8);
    }

    public void ProcessRequest(HttpContext context) {
        HttpRequest req = context.Request;
        HttpResponse res = context.Response;

        try {
            res.ContentType = "application/json; charset=utf-8";

            try { res.TrySkipIisCustomErrors = true; } catch { }

            // Safe CORS headers for all IIS pipeline modes (Classic & Integrated)
            try {
                res.AppendHeader("Access-Control-Allow-Origin", "*");
                res.AppendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.AppendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            } catch { }

            if (req.HttpMethod == "OPTIONS") {
                res.StatusCode = 200;
                return;
            }

            string appPath = "";
            try { appPath = req.PhysicalApplicationPath; } catch { }
            if (string.IsNullOrEmpty(appPath)) {
                try { appPath = HttpRuntime.AppDomainAppPath; } catch { }
            }
            if (string.IsNullOrEmpty(appPath)) {
                try { appPath = AppDomain.CurrentDomain.BaseDirectory; } catch { }
            }
            if (string.IsNullOrEmpty(appPath)) {
                appPath = @"C:\wwwroot\ainet\";
            }

            string dataDir = Path.Combine(appPath, "api", "data");
            if (!Directory.Exists(dataDir)) {
                try { Directory.CreateDirectory(dataDir); } catch { }
            }

            string rawClass = req.QueryString["class"] ?? "24-1";
            string classId = Regex.Replace(rawClass, @"[^a-zA-Z0-9_-]", "");
            if (string.IsNullOrEmpty(classId)) classId = "24-1";

            string action = req.QueryString["action"] ?? "";

            string body = "";
            if (req.HttpMethod == "POST") {
                using (var reader = new StreamReader(req.InputStream, Encoding.UTF8)) {
                    body = reader.ReadToEnd();
                }
            }

            string recordsFile = Path.Combine(dataDir, "quiz_records_" + classId + ".json");
            string loginsFile = Path.Combine(dataDir, "logins_" + classId + ".json");
            string attendanceFile = Path.Combine(dataDir, "attendance_" + classId + ".json");
            string locksFile = Path.Combine(dataDir, "device_locks_" + classId + ".json");

            lock (_lockObj) {
                switch (action) {
                    case "ping":
                        res.Write("{\"status\":\"ok\",\"engine\":\"aspnet\",\"serverTime\":\"" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "\"}");
                        break;

                    case "debug":
                        bool canWrite = false;
                        string writeErr = "";
                        string fileAttrs = "";
                        try {
                            if (File.Exists(recordsFile)) {
                                fileAttrs = File.GetAttributes(recordsFile).ToString();
                            } else {
                                fileAttrs = "not_found";
                            }
                            string testFile = Path.Combine(dataDir, "_test_write.tmp");
                            SafeWriteFile(testFile, "test");
                            if (File.Exists(testFile)) {
                                File.Delete(testFile);
                                canWrite = true;
                            }
                        } catch (Exception wex) {
                            writeErr = wex.Message;
                        }
                        res.Write("{\"status\":\"debug\",\"appPath\":\"" + appPath.Replace("\\", "\\\\") + "\",\"dataDir\":\"" + dataDir.Replace("\\", "\\\\") + "\",\"dataDirExists\":" + (Directory.Exists(dataDir) ? "true" : "false") + ",\"canWrite\":" + (canWrite ? "true" : "false") + ",\"fileAttrs\":\"" + fileAttrs + "\",\"writeErr\":\"" + writeErr.Replace("\\", "\\\\").Replace("\"", "'") + "\"}");
                        break;

                    case "unlock_data":
                        int unlockedCount = 0;
                        string unlockLog = "";
                        try {
                            if (Directory.Exists(dataDir)) {
                                string[] files = Directory.GetFiles(dataDir);
                                foreach (string f in files) {
                                    try {
                                        File.SetAttributes(f, FileAttributes.Normal);
                                        unlockedCount++;
                                    } catch (Exception uex) {
                                        unlockLog += Path.GetFileName(f) + ": " + uex.Message + "; ";
                                    }
                                }
                            }
                        } catch (Exception dex) {
                            unlockLog = dex.Message;
                        }
                        res.Write("{\"success\":true,\"unlockedCount\":" + unlockedCount + ",\"errors\":\"" + unlockLog.Replace("\\", "\\\\").Replace("\"", "'") + "\"}");
                        break;

                    case "get_records":
                        string content = File.Exists(recordsFile) ? File.ReadAllText(recordsFile, Encoding.UTF8) : "[]";
                        res.Write("{\"success\":true,\"class\":\"" + classId + "\",\"records\":" + content + "}");
                        break;

                    case "get_official_scores":
                        string qId = req.QueryString["quizId"] ?? "quiz_ch1_ch2";
                        string officialFile = Path.Combine(dataDir, "official_scores_" + classId + "_" + qId + ".json");
                        string offContent = File.Exists(officialFile) ? File.ReadAllText(officialFile, Encoding.UTF8) : "null";
                        res.Write("{\"success\":true,\"class\":\"" + classId + "\",\"quizId\":\"" + qId + "\",\"official\":" + offContent + "}");
                        break;

                    case "save_official_scores":
                        if (!body.Contains("\"password\":\"5163\"") && !body.Contains("\"password\": \"5163\"")) {
                            res.Write("{\"success\":false,\"error\":\"\\u5bc6\\u7801\\u9519\\u8bef\\uff0c\\u8bf7\\u8f93\\u5165\\u6b63\\u786e\\u7684\\u6559\\u5e08\\u7ba1\\u7406\\u5bc6\\u7801\"}");
                            break;
                        }
                        string saveQid = req.QueryString["quizId"] ?? "quiz_ch1_ch2";
                        int qIdx = body.IndexOf("\"quizId\":");
                        if (qIdx >= 0) {
                            int qValStart = body.IndexOf("\"", qIdx + 9) + 1;
                            int qValEnd = body.IndexOf("\"", qValStart);
                            if (qValStart > 0 && qValEnd > qValStart) {
                                saveQid = body.Substring(qValStart, qValEnd - qValStart);
                            }
                        }
                        string targetOfficial = Path.Combine(dataDir, "official_scores_" + classId + "_" + saveQid + ".json");
                        try {
                            int rIdx = body.IndexOf("\"records\":");
                            string recordsArr = "[]";
                            if (rIdx >= 0) {
                                int start = body.IndexOf("[", rIdx);
                                int end = body.LastIndexOf("]");
                                int count = 0;
                                if (start >= 0 && end > start) {
                                    recordsArr = body.Substring(start, end - start + 1);
                                    count = Regex.Matches(recordsArr, "\"studentId\"").Count;
                                }
                                string sheetJson = "{\"classId\":\"" + classId + "\",\"quizId\":\"" + saveQid + "\",\"savedAt\":\"" + DateTime.Now.ToString("yyyy/M/d HH:mm:ss") + "\",\"teacherConfirmed\":true,\"count\":" + count + ",\"records\":" + recordsArr + "}";
                                SafeWriteFile(targetOfficial, sheetJson);
                                res.Write("{\"success\":true,\"official\":" + sheetJson + "}");
                            } else {
                                res.Write("{\"success\":false,\"error\":\"Missing records in payload\"}");
                            }
                        } catch (Exception ex) {
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\\", "\\\\").Replace("\"", "'") + "\"}");
                        }
                        break;

                    case "save_record":
                        try {
                            string existing = File.Exists(recordsFile) ? File.ReadAllText(recordsFile, Encoding.UTF8) : "[]";
                            string recordJson = "";
                            int recIdx = body.IndexOf("\"record\":");
                            if (recIdx >= 0) {
                                int s = body.IndexOf("{", recIdx);
                                if (s >= 0) {
                                    int depth = 0;
                                    for (int i = s; i < body.Length; i++) {
                                        if (body[i] == '{') depth++;
                                        else if (body[i] == '}') {
                                            depth--;
                                            if (depth == 0) {
                                                recordJson = body.Substring(s, i - s + 1);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (!string.IsNullOrEmpty(recordJson)) {
                                string updated = existing.Trim();
                                if (updated.Length <= 2) {
                                    updated = "[" + recordJson + "]";
                                } else {
                                    string sId = "";
                                    int idPos = recordJson.IndexOf("\"studentId\":");
                                    if (idPos >= 0) {
                                        int vStart = recordJson.IndexOf("\"", idPos + 12) + 1;
                                        int vEnd = recordJson.IndexOf("\"", vStart);
                                        if (vStart > 0 && vEnd > vStart) sId = recordJson.Substring(vStart, vEnd - vStart);
                                    }
                                    if (!string.IsNullOrEmpty(sId) && updated.Contains("\"studentId\":\"" + sId + "\"")) {
                                        int itemPos = updated.IndexOf("\"studentId\":\"" + sId + "\"");
                                        int objStart = updated.LastIndexOf("{", itemPos);
                                        int objEnd = updated.IndexOf("}", itemPos);
                                        if (objStart >= 0 && objEnd > objStart) {
                                            updated = updated.Substring(0, objStart) + recordJson + updated.Substring(objEnd + 1);
                                        }
                                    } else {
                                        updated = updated.Substring(0, updated.Length - 1) + "," + recordJson + "]";
                                    }
                                }
                                SafeWriteFile(recordsFile, updated);
                                res.Write("{\"success\":true,\"records\":" + updated + "}");
                            } else {
                                res.Write("{\"success\":false,\"error\":\"Empty record\"}");
                            }
                        } catch (Exception ex) {
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\\", "\\\\").Replace("\"", "'") + "\"}");
                        }
                        break;

                    case "batch_save_records":
                        try {
                            string batchRecords = "[]";
                            int rIdx = body.IndexOf("\"records\":");
                            if (rIdx >= 0) {
                                int start = body.IndexOf("[", rIdx);
                                int end = body.LastIndexOf("]");
                                if (start >= 0 && end > start) {
                                    batchRecords = body.Substring(start, end - start + 1);
                                }
                            }
                            SafeWriteFile(recordsFile, batchRecords);
                            res.Write("{\"success\":true,\"count\":" + Regex.Matches(batchRecords, "\"studentId\"").Count + "}");
                        } catch (Exception ex) {
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\\", "\\\\").Replace("\"", "'") + "\"}");
                        }
                        break;

                    case "get_logins":
                        string loginContent = File.Exists(loginsFile) ? File.ReadAllText(loginsFile, Encoding.UTF8) : "[]";
                        res.Write("{\"success\":true,\"class\":\"" + classId + "\",\"logins\":" + loginContent + "}");
                        break;

                    case "record_login":
                        try {
                            string curLogins = File.Exists(loginsFile) ? File.ReadAllText(loginsFile, Encoding.UTF8) : "[]";
                            int sPos = body.IndexOf("\"student\":");
                            string itemJson = "";
                            if (sPos >= 0) {
                                int start = body.IndexOf("{", sPos);
                                if (start >= 0) {
                                    int depth = 0;
                                    for (int i = start; i < body.Length; i++) {
                                        if (body[i] == '{') depth++;
                                        else if (body[i] == '}') {
                                            depth--;
                                            if (depth == 0) {
                                                itemJson = body.Substring(start, i - start + 1);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            if (!string.IsNullOrEmpty(itemJson)) {
                                string updated = curLogins.Trim();
                                if (updated.Length <= 2) {
                                    updated = "[" + itemJson + "]";
                                } else {
                                    updated = updated.Substring(0, updated.Length - 1) + "," + itemJson + "]";
                                }
                                SafeWriteFile(loginsFile, updated);
                            }
                            res.Write("{\"success\":true}");
                        } catch (Exception ex) {
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\\", "\\\\").Replace("\"", "'") + "\"}");
                        }
                        break;

                    case "clear_logins":
                        if (!body.Contains("\"password\":\"5163\"") && !body.Contains("\"password\": \"5163\"")) {
                            res.Write("{\"success\":false,\"error\":\"\\u5bc6\\u7801\\u9519\\u8bef\"}");
                            break;
                        }
                        if (File.Exists(loginsFile)) {
                            SafeWriteFile(loginsFile, "[]");
                        }
                        res.Write("{\"success\":true}");
                        break;

                    case "get_attendance":
                        string attContent = File.Exists(attendanceFile) ? File.ReadAllText(attendanceFile, Encoding.UTF8) : "[]";
                        res.Write("{\"success\":true,\"class\":\"" + classId + "\",\"records\":" + attContent + "}");
                        break;

                    case "save_attendance":
                        try {
                            string attToSave = "[]";
                            int aIdx = body.IndexOf("\"records\":");
                            if (aIdx >= 0) {
                                int start = body.IndexOf("[", aIdx);
                                int end = body.LastIndexOf("]");
                                if (start >= 0 && end > start) {
                                    attToSave = body.Substring(start, end - start + 1);
                                }
                            }
                            SafeWriteFile(attendanceFile, attToSave);
                            res.Write("{\"success\":true}");
                        } catch (Exception ex) {
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\\", "\\\\").Replace("\"", "'") + "\"}");
                        }
                        break;

                    case "get_device_locks":
                        string locksContent = File.Exists(locksFile) ? File.ReadAllText(locksFile, Encoding.UTF8) : "{}";
                        res.Write("{\"success\":true,\"class\":\"" + classId + "\",\"locks\":" + locksContent + "}");
                        break;

                    case "save_device_lock":
                        try {
                            string curLocks = File.Exists(locksFile) ? File.ReadAllText(locksFile, Encoding.UTF8) : "{}";
                            string qIdKey = req.QueryString["quizId"] ?? "quiz_ch1_ch2";
                            int lIdx = body.IndexOf("\"lockData\":");
                            string lockJson = "";
                            if (lIdx >= 0) {
                                int start = body.IndexOf("{", lIdx);
                                int end = body.LastIndexOf("}");
                                if (start >= 0 && end > start) lockJson = body.Substring(start, end - start + 1);
                            }
                            if (!string.IsNullOrEmpty(lockJson)) {
                                string updatedLocks = curLocks.Trim();
                                if (updatedLocks.Length <= 2) {
                                    updatedLocks = "{\"" + qIdKey + "\":" + lockJson + "}";
                                } else {
                                    updatedLocks = updatedLocks.Substring(0, updatedLocks.Length - 1) + ",\"" + qIdKey + "\":" + lockJson + "}";
                                }
                                SafeWriteFile(locksFile, updatedLocks);
                            }
                            res.Write("{\"success\":true}");
                        } catch (Exception ex) {
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\\", "\\\\").Replace("\"", "'") + "\"}");
                        }
                        break;

                    default:
                        res.Write("{\"success\":false,\"error\":\"Unknown action: " + action + "\"}");
                        break;
                }
            }
        } catch (Exception topEx) {
            try {
                res.Write("{\"success\":false,\"error\":\"" + topEx.Message.Replace("\\", "\\\\").Replace("\"", "'") + "\"}");
            } catch { }
        }
    }

    public bool IsReusable { get { return true; } }
}
