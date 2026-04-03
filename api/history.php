<?php
/* ============================================================
   api/history.php — Bali Sadhu Photo
   Ambil history sesi edit untuk satu foto

   Method: GET
   Params: photo_id (required), latest=1 (optional — hanya ambil terbaru)
   Return: JSON { success, sessions[] } atau { success, session }
   ============================================================ */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$photoId = isset($_GET['photo_id']) ? (int) $_GET['photo_id'] : 0;
$latest  = isset($_GET['latest']) && $_GET['latest'] === '1';

if ($photoId <= 0) {
    jsonResponse(['success' => false, 'error' => 'photo_id tidak valid'], 400);
}

$db = getDB();

if ($latest) {
    // Ambil sesi editing terbaru saja
    $stmt = $db->prepare("
        SELECT id, photo_id, edit_data, status, created_at, updated_at
        FROM edit_sessions
        WHERE photo_id = :pid
        ORDER BY updated_at DESC
        LIMIT 1
    ");
    $stmt->execute([':pid' => $photoId]);
    $row = $stmt->fetch();

    if (!$row) {
        jsonResponse(['success' => true, 'session' => null]);
    }

    // Decode JSON edit_data
    $row['edit_data'] = json_decode($row['edit_data'], true);
    jsonResponse(['success' => true, 'session' => $row]);

} else {
    // Ambil semua history (untuk fitur history lengkap nanti)
    $stmt = $db->prepare("
        SELECT id, photo_id, edit_data, status, created_at, updated_at
        FROM edit_sessions
        WHERE photo_id = :pid
        ORDER BY updated_at DESC
        LIMIT 50
    ");
    $stmt->execute([':pid' => $photoId]);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['edit_data'] = json_decode($row['edit_data'], true);
    }

    jsonResponse(['success' => true, 'sessions' => $rows, 'count' => count($rows)]);
}