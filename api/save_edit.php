<?php
/* ============================================================
   api/save_edit.php — Bali Sadhu Photo
   Simpan / update state edit ke database (history + temporary)

   Method: POST (application/json)
   Body  : { photo_id, edit_data, status? }
   Return: JSON { success, session_id }
   ============================================================ */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

// ─── Parse body ───────────────────────────────────────────
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!$body || !isset($body['photo_id'], $body['edit_data'])) {
    jsonResponse(['success' => false, 'error' => 'Data tidak lengkap (photo_id + edit_data wajib)'], 400);
}

$photoId  = (int)   $body['photo_id'];
$editData = $body['edit_data'];  // array/object dari JS
$status   = in_array($body['status'] ?? '', ['editing','ready_for_frame','completed'])
            ? $body['status'] : 'editing';

if ($photoId <= 0) {
    jsonResponse(['success' => false, 'error' => 'photo_id tidak valid'], 400);
}

// ─── Cek photo ada ────────────────────────────────────────
$db   = getDB();
$chk  = $db->prepare("SELECT id FROM photos WHERE id = :id LIMIT 1");
$chk->execute([':id' => $photoId]);
if (!$chk->fetch()) {
    jsonResponse(['success' => false, 'error' => "Photo ID $photoId tidak ditemukan"], 404);
}

// ─── Cek apakah sudah ada session 'editing' untuk foto ini ──
// Kalau sudah ada, UPDATE supaya tidak boros baris (history tetap)
// Strategy: 1 baris per foto per status 'editing', buat baris baru untuk status lain
$existing = $db->prepare("
    SELECT id FROM edit_sessions
    WHERE photo_id = :pid AND status = 'editing'
    ORDER BY updated_at DESC
    LIMIT 1
");
$existing->execute([':pid' => $photoId]);
$existingRow = $existing->fetch();

$editJson = json_encode($editData, JSON_UNESCAPED_UNICODE);

if ($existingRow && $status === 'editing') {
    // Update session editing yang sudah ada
    $stmt = $db->prepare("
        UPDATE edit_sessions
        SET edit_data = :data, updated_at = NOW()
        WHERE id = :id
    ");
    $stmt->execute([':data' => $editJson, ':id' => $existingRow['id']]);
    $sessionId = $existingRow['id'];
} else {
    // Insert baris baru (baik untuk status lain atau pertama kali)
    $stmt = $db->prepare("
        INSERT INTO edit_sessions (photo_id, edit_data, status)
        VALUES (:pid, :data, :status)
    ");
    $stmt->execute([
        ':pid'    => $photoId,
        ':data'   => $editJson,
        ':status' => $status,
    ]);
    $sessionId = (int) $db->lastInsertId();
}

jsonResponse(['success' => true, 'session_id' => $sessionId]);