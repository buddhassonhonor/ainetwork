<?php
/**
 * AINetwork Classroom Quiz & Attendance Backend API
 * Supports PHP 5.6+ / 7.x / 8.x
 * Atomic file-based JSON storage for multi-student quiz submissions, logins, and attendance.
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0777, true);
}

// Helpers for reading and writing JSON with file locking
function readJsonFile($filePath, $default = []) {
    if (!file_exists($filePath)) {
        return $default;
    }
    $content = @file_get_contents($filePath);
    if ($content === false || trim($content) === '') {
        return $default;
    }
    $data = @json_decode($content, true);
    return is_array($data) ? $data : $default;
}

function writeJsonFile($filePath, $data) {
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    $fp = @fopen($filePath, 'c+');
    if (!$fp) {
        return @file_put_contents($filePath, $json) !== false;
    }
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, $json);
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return true;
    }
    fclose($fp);
    return @file_put_contents($filePath, $json) !== false;
}

// Sanitize class ID (only alphanumeric and hyphen, e.g. 24-1, 24-2, 25-1, 25-2)
$rawClass = isset($_GET['class']) ? $_GET['class'] : (isset($_POST['class']) ? $_POST['class'] : '24-1');
$classId = preg_replace('/[^a-zA-Z0-9_-]/', '', $rawClass);
if (empty($classId)) $classId = '24-1';

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Parse POST JSON body if available
$inputBody = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $parsed = json_decode($rawInput, true);
        if (is_array($parsed)) {
            $inputBody = $parsed;
        }
    }
    if (empty($action) && isset($inputBody['action'])) {
        $action = $inputBody['action'];
    }
    if (isset($inputBody['class']) && !empty($inputBody['class'])) {
        $classId = preg_replace('/[^a-zA-Z0-9_-]/', '', $inputBody['class']);
    }
}

$recordsFile = $dataDir . DIRECTORY_SEPARATOR . "quiz_records_{$classId}.json";
$loginsFile = $dataDir . DIRECTORY_SEPARATOR . "logins_{$classId}.json";
$attendanceFile = $dataDir . DIRECTORY_SEPARATOR . "attendance_{$classId}.json";
$locksFile = $dataDir . DIRECTORY_SEPARATOR . "device_locks_{$classId}.json";

switch ($action) {
    case 'ping':
        echo json_encode([
            'status' => 'ok',
            'engine' => 'php',
            'version' => PHP_VERSION,
            'serverTime' => date('Y-m-d H:i:s'),
            'writable' => is_writable($dataDir)
        ]);
        break;

    // --- QUIZ RECORDS ---
    case 'get_records':
        $records = readJsonFile($recordsFile, []);
        $resetFile = $dataDir . DIRECTORY_SEPARATOR . "reset_{$classId}.json";
        $resetData = readJsonFile($resetFile, ['resetAt' => 0]);
        echo json_encode([
            'success' => true,
            'class' => $classId,
            'resetAt' => isset($resetData['resetAt']) ? (int)$resetData['resetAt'] : 0,
            'count' => count($records),
            'records' => $records
        ]);
        break;

    case 'get_official_scores':
        $rawQid = isset($_GET['quizId']) ? $_GET['quizId'] : (isset($inputBody['quizId']) ? $inputBody['quizId'] : 'quiz_ch1_ch2');
        $quizId = preg_replace('/[^a-zA-Z0-9_-]/', '', $rawQid);
        $officialFile = $dataDir . DIRECTORY_SEPARATOR . "official_scores_{$classId}_{$quizId}.json";
        $official = readJsonFile($officialFile, null);
        echo json_encode(['success' => true, 'class' => $classId, 'quizId' => $quizId, 'official' => $official]);
        break;

    case 'save_official_scores':
        $pwd = isset($inputBody['password']) ? $inputBody['password'] : '';
        if ($pwd !== '5163') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => '密码错误，请输入正确的教师管理密码']);
            break;
        }
        $rawQid = isset($_GET['quizId']) ? $_GET['quizId'] : (isset($inputBody['quizId']) ? $inputBody['quizId'] : 'quiz_ch1_ch2');
        $quizId = preg_replace('/[^a-zA-Z0-9_-]/', '', $rawQid);
        $officialFile = $dataDir . DIRECTORY_SEPARATOR . "official_scores_{$classId}_{$quizId}.json";
        $sheet = [
            'classId' => $classId,
            'quizId' => $quizId,
            'savedAt' => date('Y-m-d H:i:s'),
            'teacherConfirmed' => true,
            'count' => isset($inputBody['records']) && is_array($inputBody['records']) ? count($inputBody['records']) : 0,
            'records' => isset($inputBody['records']) && is_array($inputBody['records']) ? $inputBody['records'] : []
        ];
        $saved = writeJsonFile($officialFile, $sheet);

        // Also merge into master records file
        if (!empty($sheet['records'])) {
            $allRecords = readJsonFile($recordsFile, []);
            $keyMap = [];
            foreach ($allRecords as $r) {
                $k = $r['studentId'] . '_' . (isset($r['quizId']) ? $r['quizId'] : '') . '_' . (isset($r['attempt']) ? $r['attempt'] : 1);
                $keyMap[$k] = true;
            }
            foreach ($sheet['records'] as $r) {
                $k = $r['studentId'] . '_' . (isset($r['quizId']) ? $r['quizId'] : '') . '_' . (isset($r['attempt']) ? $r['attempt'] : 1);
                if (!isset($keyMap[$k])) {
                    $allRecords[] = $r;
                }
            }
            writeJsonFile($recordsFile, $allRecords);
        }
        echo json_encode(['success' => $saved, 'official' => $sheet]);
        break;

    case 'save_record':
        $newRecord = isset($inputBody['record']) ? $inputBody['record'] : null;
        if (!$newRecord || !is_array($newRecord) || empty($newRecord['studentId'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing valid record payload']);
            break;
        }
        $records = readJsonFile($recordsFile, []);
        $foundIdx = -1;
        foreach ($records as $i => $r) {
            if ($r['studentId'] === $newRecord['studentId'] && 
                (isset($r['quizId']) ? $r['quizId'] : '') === (isset($newRecord['quizId']) ? $newRecord['quizId'] : '') &&
                (isset($r['attempt']) ? $r['attempt'] : 1) === (isset($newRecord['attempt']) ? $newRecord['attempt'] : 1)) {
                $foundIdx = $i;
                break;
            }
        }
        if ($foundIdx >= 0) {
            $records[$foundIdx] = $newRecord;
        } else {
            $records[] = $newRecord;
        }
        $saved = writeJsonFile($recordsFile, $records);
        echo json_encode(['success' => $saved, 'count' => count($records), 'records' => $records]);
        break;

    case 'batch_save_records':
        $recordsToSave = isset($inputBody['records']) ? $inputBody['records'] : null;
        if (!is_array($recordsToSave)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Expected records array']);
            break;
        }
        $saved = writeJsonFile($recordsFile, $recordsToSave);
        echo json_encode(['success' => $saved, 'count' => count($recordsToSave)]);
        break;

    case 'clear_records':
        $pwd = isset($inputBody['password']) ? $inputBody['password'] : '';
        if ($pwd !== '5163') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => '密码错误，请输入正确的教师管理密码']);
            break;
        }
        $nowEpoch = round(microtime(true) * 1000);
        $resetFile = $dataDir . DIRECTORY_SEPARATOR . "reset_{$classId}.json";
        writeJsonFile($resetFile, ['classId' => $classId, 'resetAt' => $nowEpoch]);
        writeJsonFile($recordsFile, []);
        // Also remove official scores for this class
        $officialFiles = glob($dataDir . DIRECTORY_SEPARATOR . "official_scores_{$classId}_*.json");
        if ($officialFiles) {
            foreach ($officialFiles as $f) { @unlink($f); }
        }
        // Also clear device locks
        writeJsonFile($locksFile, new stdClass());
        echo json_encode(['success' => true, 'class' => $classId, 'resetAt' => $nowEpoch, 'count' => 0]);
        break;

    // --- STUDENT LOGINS (for Attendance) ---
    case 'get_logins':
        $logins = readJsonFile($loginsFile, []);
        echo json_encode(['success' => true, 'class' => $classId, 'logins' => $logins]);
        break;

    case 'record_login':
        $student = isset($inputBody['student']) ? $inputBody['student'] : null;
        if (!$student || !isset($student['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing student info']);
            break;
        }
        $logins = readJsonFile($loginsFile, []);
        $now = date('Y-m-d H:i:s');
        $timeStr = date('H:i');
        $dateStr = date('Y-m-d');
        
        $found = false;
        foreach ($logins as &$item) {
            if ($item['id'] === $student['id']) {
                $item['name'] = isset($student['name']) ? $student['name'] : $item['name'];
                $item['loginTime'] = $now;
                $item['timeStr'] = $timeStr;
                $item['dateStr'] = $dateStr;
                $found = true;
                break;
            }
        }
        unset($item);

        if (!$found) {
            $logins[] = [
                'id' => $student['id'],
                'name' => isset($student['name']) ? $student['name'] : '',
                'loginTime' => $now,
                'timeStr' => $timeStr,
                'dateStr' => $dateStr
            ];
        }
        $saved = writeJsonFile($loginsFile, $logins);
        echo json_encode(['success' => $saved, 'logins' => $logins]);
        break;

    case 'clear_logins':
        $pwd = isset($inputBody['password']) ? $inputBody['password'] : '';
        if ($pwd !== '5163') {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            break;
        }
        writeJsonFile($loginsFile, []);
        echo json_encode(['success' => true]);
        break;

    // --- ATTENDANCE RECORDS ---
    case 'get_attendance':
        $attendance = readJsonFile($attendanceFile, []);
        echo json_encode(['success' => true, 'class' => $classId, 'records' => $attendance]);
        break;

    case 'save_attendance':
        $attendanceList = isset($inputBody['records']) ? $inputBody['records'] : null;
        if (!is_array($attendanceList)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Expected records array']);
            break;
        }
        $saved = writeJsonFile($attendanceFile, $attendanceList);
        echo json_encode(['success' => $saved, 'count' => count($attendanceList)]);
        break;

    // --- DEVICE LOCKS ---
    case 'get_device_locks':
        $locks = readJsonFile($locksFile, []);
        echo json_encode(['success' => true, 'class' => $classId, 'locks' => $locks]);
        break;

    case 'save_device_lock':
        $quizId = isset($inputBody['quizId']) ? $inputBody['quizId'] : '';
        $lockData = isset($inputBody['lockData']) ? $inputBody['lockData'] : null;
        if (!$quizId || !$lockData) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing lock data']);
            break;
        }
        $locks = readJsonFile($locksFile, []);
        $locks[$quizId] = $lockData;
        $saved = writeJsonFile($locksFile, $locks);
        echo json_encode(['success' => $saved, 'locks' => $locks]);
        break;

    default:
        echo json_encode([
            'success' => false,
            'error' => 'Unknown action: ' . htmlspecialchars($action),
            'availableActions' => [
                'ping', 'get_records', 'save_record', 'batch_save_records',
                'get_logins', 'record_login', 'clear_logins',
                'get_attendance', 'save_attendance',
                'get_device_locks', 'save_device_lock'
            ]
        ]);
        break;
}
