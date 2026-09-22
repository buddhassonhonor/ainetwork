<%@ WebHandler Language="C#" Class="QuizApiHandler" %>
using System;
using System.Web;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public class QuizApiHandler : IHttpHandler {
    private static readonly object _lockObj = new object();

    private static string GetJsonStringProp(string json, string propName, string defaultValue = "") {
        Match m = Regex.Match(json, "\"" + propName + "\"\\s*:\\s*\"([^\"]+)\"");
        return m.Success ? m.Groups[1].Value : defaultValue;
    }

    private static int GetJsonIntProp(string json, string propName, int defaultValue = 1) {
        Match m = Regex.Match(json, "\"" + propName + "\"\\s*:\\s*(\\d+)");
        if (m.Success) {
            int v;
            if (int.TryParse(m.Groups[1].Value, out v)) return v;
        }
        return defaultValue;
    }

    private static List<string> ParseJsonArrayObjects(string json) {
        var result = new List<string>();
        if (string.IsNullOrEmpty(json)) return result;

        int firstBracket = json.IndexOf('[');
        int lastBracket = json.LastIndexOf(']');
        if (firstBracket < 0 || lastBracket <= firstBracket) return result;

        int i = firstBracket + 1;
        while (i < lastBracket) {
            while (i < lastBracket && (json[i] == ' ' || json[i] == '\r' || json[i] == '\n' || json[i] == '\t' || json[i] == ',')) {
                i++;
            }
            if (i >= lastBracket) break;

            if (json[i] == '{') {
                int start = i;
                int depth = 0;
                bool inString = false;
                bool escape = false;
                int end = -1;

                for (int j = start; j < lastBracket; j++) {
                    char c = json[j];
                    if (escape) {
                        escape = false;
                        continue;
                    }
                    if (c == '\\') {
                        escape = true;
                        continue;
                    }
                    if (c == '"') {
                        inString = !inString;
                        continue;
                    }
                    if (!inString) {
                        if (c == '{') depth++;
                        else if (c == '}') {
                            depth--;
                            if (depth == 0) {
                                end = j;
                                break;
                            }
                        }
                    }
                }

                if (end > start) {
                    string objStr = json.Substring(start, end - start + 1);
                    if (objStr.Contains("\"studentId\"")) {
                        result.Add(objStr);
                    }
                    i = end + 1;
                } else {
                    i++;
                }
            } else {
                i++;
            }
        }
        return result;
    }

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

            // Safe CORS and Cache-Control headers for all IIS pipeline modes (Classic & Integrated)
            try {
                res.AppendHeader("Access-Control-Allow-Origin", "*");
                res.AppendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.AppendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
                res.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.AppendHeader("Pragma", "no-cache");
                res.AppendHeader("Expires", "0");
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
            string resetFile = Path.Combine(dataDir, "reset_" + classId + ".json");
            long resetEpoch = 0;
            try {
                if (File.Exists(resetFile)) {
                    string rText = File.ReadAllText(resetFile, Encoding.UTF8);
                    Match rm = Regex.Match(rText, "\"resetAt\"\\s*:\\s*(\\d+)");
                    if (rm.Success) long.TryParse(rm.Groups[1].Value, out resetEpoch);
                }
            } catch { }

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
                        string content = "[]";
                        if (File.Exists(recordsFile)) {
                            content = File.ReadAllText(recordsFile, Encoding.UTF8);
                            var objects = ParseJsonArrayObjects(content);
                            if (objects.Count > 0) {
                                content = "[" + string.Join(",", objects.ToArray()) + "]";
                            } else if (string.IsNullOrWhiteSpace(content)) {
                                content = "[]";
                            }
                        }
                        res.Write("{\"success\":true,\"class\":\"" + classId + "\",\"resetAt\":" + resetEpoch + ",\"records\":" + content + "}");
                        break;

                    case "clear_records":
                        if (!body.Contains("\"password\":\"5163\"") && !body.Contains("\"password\": \"5163\"")) {
                            res.Write("{\"success\":false,\"error\":\"\\u5bc6\\u7801\\u9519\\u8bef\\uff0c\\u8bf7\\u8f93\\u5165\\u6b63\\u786e\\u7684\\u6559\\u5e08\\u7ba1\\u7406\\u5bc6\\u7801\"}");
                            break;
                        }
                        long nowReset = (long)(DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
                        SafeWriteFile(resetFile, "{\"classId\":\"" + classId + "\",\"resetAt\":" + nowReset + "}");
                        SafeWriteFile(recordsFile, "[]");
                        try {
                            if (Directory.Exists(dataDir)) {
                                string[] offFiles = Directory.GetFiles(dataDir, "official_scores_" + classId + "_*.json");
                                foreach (string of in offFiles) {
                                    try { File.Delete(of); } catch { }
                                }
                            }
                        } catch { }
                        try {
                            if (File.Exists(locksFile)) SafeWriteFile(locksFile, "{}");
                        } catch { }
                        res.Write("{\"success\":true,\"class\":\"" + classId + "\",\"resetAt\":" + nowReset + ",\"count\":0}");
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
                                if (resetEpoch > 0) {
                                    Match sm = Regex.Match(recordJson, "\"submittedAt\"\\s*:\\s*\"([^\"]+)\"");
                                    if (sm.Success) {
                                        DateTime sdt;
                                        if (DateTime.TryParse(sm.Groups[1].Value, out sdt)) {
                                            long sEpoch = (long)(sdt.ToUniversalTime() - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
                                            if (sEpoch < resetEpoch) {
                                                res.Write("{\"success\":true,\"rejectedStale\":true,\"records\":" + existing + "}");
                                                break;
                                            }
                                        }
                                    }
                                }

                                string newSid = GetJsonStringProp(recordJson, "studentId");
                                string newQid = GetJsonStringProp(recordJson, "quizId", "quiz_ch1_ch2");
                                int newAttempt = GetJsonIntProp(recordJson, "attempt", 1);

                                List<string> recordList = ParseJsonArrayObjects(existing);
                                int matchIdx = -1;
                                for (int i = 0; i < recordList.Count; i++) {
                                    string item = recordList[i];
                                    string itemSid = GetJsonStringProp(item, "studentId");
                                    string itemQid = GetJsonStringProp(item, "quizId", "quiz_ch1_ch2");
                                    int itemAttempt = GetJsonIntProp(item, "attempt", 1);

                                    if (itemSid == newSid && itemQid == newQid && itemAttempt == newAttempt) {
                                        matchIdx = i;
                                        break;
                                    }
                                }

                                if (matchIdx >= 0) {
                                    recordList[matchIdx] = recordJson;
                                } else {
                                    recordList.Add(recordJson);
                                }

                                string updated = "[" + string.Join(",", recordList.ToArray()) + "]";
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
                            var objects = ParseJsonArrayObjects(batchRecords);
                            if (resetEpoch > 0) {
                                bool hasNewRecord = false;
                                foreach (string obj in objects) {
                                    string subTime = GetJsonStringProp(obj, "submittedAt");
                                    DateTime sdt;
                                    if (DateTime.TryParse(subTime, out sdt)) {
                                        long sEpoch = (long)(sdt.ToUniversalTime() - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
                                        if (sEpoch >= resetEpoch) {
                                            hasNewRecord = true;
                                            break;
                                        }
                                    }
                                }
                                if (!hasNewRecord && objects.Count > 0) {
                                    res.Write("{\"success\":true,\"rejectedStale\":true,\"count\":0}");
                                    break;
                                }
                            }
                            string cleanBatch = "[" + string.Join(",", objects.ToArray()) + "]";
                            SafeWriteFile(recordsFile, cleanBatch);
                            res.Write("{\"success\":true,\"count\":" + objects.Count + "}");
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
