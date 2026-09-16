<%@ WebHandler Language="C#" Class="QuizApiHandler" %>
using System;
using System.Web;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

public class QuizApiHandler : IHttpHandler {
    private static readonly object _lockObj = new object();

    public void ProcessRequest(HttpContext context) {
        HttpRequest req = context.Request;
        HttpResponse res = context.Response;

        try {
            res.ContentType = "application/json; charset=utf-8";

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
                            res.StatusCode = 403;
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
                                if (start >= 0 && end > start) {
                                    recordsArr = body.Substring(start, end - start + 1);
                                }
                            }
                            string sheetJson = "{\"classId\":\"" + classId + "\",\"quizId\":\"" + saveQid + "\",\"savedAt\":\"" + DateTime.Now.ToString("yyyy/M/d HH:mm:ss") + "\",\"teacherConfirmed\":true,\"count\":" + Regex.Matches(recordsArr, "\"studentId\"").Count + ",\"records\":" + recordsArr + "}";
                            File.WriteAllText(targetOfficial, sheetJson, Encoding.UTF8);
                            res.Write("{\"success\":true,\"official\":" + sheetJson + "}");
                        } catch (Exception ex) {
                            res.StatusCode = 500;
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
                        }
                        break;

                    case "save_record":
                        try {
                            string existing = File.Exists(recordsFile) ? File.ReadAllText(recordsFile, Encoding.UTF8) : "[]";
                            string recordJson = "";
                            int recIdx = body.IndexOf("\"record\":");
                            if (recIdx >= 0) {
                                int s = body.IndexOf("{", recIdx);
                                int e = body.LastIndexOf("}");
                                if (s >= 0 && e > s) recordJson = body.Substring(s, e - s + 1);
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
                                File.WriteAllText(recordsFile, updated, Encoding.UTF8);
                                res.Write("{\"success\":true,\"records\":" + updated + "}");
                            } else {
                                res.Write("{\"success\":false,\"error\":\"Empty record\"}");
                            }
                        } catch (Exception ex) {
                            res.StatusCode = 500;
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
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
                            File.WriteAllText(recordsFile, batchRecords, Encoding.UTF8);
                            res.Write("{\"success\":true,\"count\":" + Regex.Matches(batchRecords, "\"studentId\"").Count + "}");
                        } catch (Exception ex) {
                            res.StatusCode = 500;
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
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
                                int end = body.LastIndexOf("}");
                                if (start >= 0 && end > start) itemJson = body.Substring(start, end - start + 1);
                            }
                            if (!string.IsNullOrEmpty(itemJson)) {
                                string updated = curLogins.Trim();
                                if (updated.Length <= 2) {
                                    updated = "[" + itemJson + "]";
                                } else {
                                    updated = updated.Substring(0, updated.Length - 1) + "," + itemJson + "]";
                                }
                                File.WriteAllText(loginsFile, updated, Encoding.UTF8);
                            }
                            res.Write("{\"success\":true}");
                        } catch (Exception ex) {
                            res.StatusCode = 500;
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
                        }
                        break;

                    case "clear_logins":
                        if (!body.Contains("\"password\":\"5163\"") && !body.Contains("\"password\": \"5163\"")) {
                            res.StatusCode = 403;
                            res.Write("{\"success\":false,\"error\":\"\\u5bc6\\u7801\\u9519\\u8bef\"}");
                            break;
                        }
                        if (File.Exists(loginsFile)) {
                            File.WriteAllText(loginsFile, "[]", Encoding.UTF8);
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
                            File.WriteAllText(attendanceFile, attToSave, Encoding.UTF8);
                            res.Write("{\"success\":true}");
                        } catch (Exception ex) {
                            res.StatusCode = 500;
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
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
                                File.WriteAllText(locksFile, updatedLocks, Encoding.UTF8);
                            }
                            res.Write("{\"success\":true}");
                        } catch (Exception ex) {
                            res.StatusCode = 500;
                            res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
                        }
                        break;

                    default:
                        res.Write("{\"success\":false,\"error\":\"Unknown action: " + action + "\"}");
                        break;
                }
            }
        } catch (Exception topEx) {
            try {
                res.StatusCode = 500;
                res.Write("{\"success\":false,\"error\":\"" + topEx.Message.Replace("\\", "\\\\").Replace("\"", "'") + "\"}");
            } catch { }
        }
    }

    public bool IsReusable { get { return true; } }
}
