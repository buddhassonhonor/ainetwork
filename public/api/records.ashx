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

        // CORS headers
        res.Headers["Access-Control-Allow-Origin"] = "*";
        res.Headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
        res.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
        res.ContentType = "application/json; charset=utf-8";

        if (req.HttpMethod == "OPTIONS") {
            res.StatusCode = 200;
            return;
        }

        string appPath = req.PhysicalApplicationPath ?? HttpRuntime.AppDomainAppPath;
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
                        res.Write("{\"success\":false,\"error\":\"密码错误，请输入教师授权密码 5163\"}");
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
                    string saveOffFile = Path.Combine(dataDir, "official_scores_" + classId + "_" + saveQid + ".json");
                    string recListJson = "[]";
                    int rIdx = body.IndexOf("\"records\":");
                    if (rIdx >= 0) {
                        int bStart = body.IndexOf("[", rIdx);
                        int bEnd = body.LastIndexOf("]");
                        if (bStart >= 0 && bEnd > bStart) {
                            recListJson = body.Substring(bStart, bEnd - bStart + 1);
                        }
                    }
                    string fullSheet = "{\"classId\":\"" + classId + "\",\"quizId\":\"" + saveQid + "\",\"savedAt\":\"" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "\",\"teacherConfirmed\":true,\"records\":" + recListJson + "}";
                    File.WriteAllText(saveOffFile, fullSheet, Encoding.UTF8);
                    res.Write("{\"success\":true,\"official\":" + fullSheet + "}");
                    break;

                case "save_record":
                    // Parse single record from body and append
                    try {
                        string existing = File.Exists(recordsFile) ? File.ReadAllText(recordsFile, Encoding.UTF8) : "[]";
                        if (string.IsNullOrWhiteSpace(existing)) existing = "[]";
                        existing = existing.Trim();
                        
                        string newRecordJson = body;
                        // If body is wrapped in {"record": ...}, extract or save directly
                        int recIdx = body.IndexOf("\"record\":");
                        if (recIdx >= 0) {
                            int start = body.IndexOf("{", recIdx);
                            int end = body.LastIndexOf("}");
                            if (start >= 0 && end > start) {
                                newRecordJson = body.Substring(start, end - start + 1);
                            }
                        }

                        if (existing == "[]") {
                            existing = "[" + newRecordJson + "]";
                        } else if (existing.EndsWith("]")) {
                            existing = existing.Substring(0, existing.Length - 1) + "," + newRecordJson + "]";
                        }
                        File.WriteAllText(recordsFile, existing, Encoding.UTF8);
                        res.Write("{\"success\":true,\"records\":" + existing + "}");
                    } catch (Exception ex) {
                        res.StatusCode = 500;
                        res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
                    }
                    break;

                case "batch_save_records":
                    try {
                        string recordsToSave = body;
                        int recIdx = body.IndexOf("\"records\":");
                        if (recIdx >= 0) {
                            int start = body.IndexOf("[", recIdx);
                            int end = body.LastIndexOf("]");
                            if (start >= 0 && end > start) {
                                recordsToSave = body.Substring(start, end - start + 1);
                            }
                        }
                        File.WriteAllText(recordsFile, recordsToSave, Encoding.UTF8);
                        res.Write("{\"success\":true}");
                    } catch (Exception ex) {
                        res.StatusCode = 500;
                        res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
                    }
                    break;

                case "get_logins":
                    string loginsContent = File.Exists(loginsFile) ? File.ReadAllText(loginsFile, Encoding.UTF8) : "[]";
                    res.Write("{\"success\":true,\"class\":\"" + classId + "\",\"logins\":" + loginsContent + "}");
                    break;

                case "record_login":
                    try {
                        string loginsJson = File.Exists(loginsFile) ? File.ReadAllText(loginsFile, Encoding.UTF8) : "[]";
                        if (string.IsNullOrWhiteSpace(loginsJson)) loginsJson = "[]";
                        loginsJson = loginsJson.Trim();

                        string studentJson = body;
                        int sIdx = body.IndexOf("\"student\":");
                        if (sIdx >= 0) {
                            int start = body.IndexOf("{", sIdx);
                            int end = body.LastIndexOf("}");
                            if (start >= 0 && end > start) {
                                studentJson = body.Substring(start, end - start + 1);
                            }
                        }

                        if (loginsJson == "[]") {
                            loginsJson = "[" + studentJson + "]";
                        } else if (loginsJson.EndsWith("]")) {
                            loginsJson = loginsJson.Substring(0, loginsJson.Length - 1) + "," + studentJson + "]";
                        }
                        File.WriteAllText(loginsFile, loginsJson, Encoding.UTF8);
                        res.Write("{\"success\":true,\"logins\":" + loginsJson + "}");
                    } catch (Exception ex) {
                        res.StatusCode = 500;
                        res.Write("{\"success\":false,\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
                    }
                    break;

                case "get_attendance":
                    string attContent = File.Exists(attendanceFile) ? File.ReadAllText(attendanceFile, Encoding.UTF8) : "[]";
                    res.Write("{\"success\":true,\"class\":\"" + classId + "\",\"records\":" + attContent + "}");
                    break;

                case "save_attendance":
                    try {
                        string attToSave = body;
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

                default:
                    res.Write("{\"success\":false,\"error\":\"Unknown action: " + action + "\"}");
                    break;
            }
        }
    }

    public bool IsReusable { get { return true; } }
}
