<?php
/* ============================================================
   api/frames.php — Bali Sadhu Photo
   GET  : list semua custom frames
   DELETE: hapus frame by id
   ============================================================ */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $db   = getDB();
    $stmt = $db->prepare("
        SELECT id, name, group_name, file_path, thumbnail, sort_order
        FROM frames
        WHERE is_active = 1
        ORDER BY sort_order ASC, created_at DESC
    ");
    $stmt->execute();
    $frames = $stmt->fetchAll();
    jsonResponse(['success' => true, 'frames' => $frames, 'count' => count($frames)]);
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($id <= 0) jsonResponse(['success' => false, 'error' => 'ID tidak valid'], 400);

    $db   = getDB();
    // Cek frame ada dan ambil path filenya
    $stmt = $db->prepare("SELECT file_path, thumbnail FROM frames WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) jsonResponse(['success' => false, 'error' => 'Frame tidak ditemukan'], 404);

    // Hapus file dari disk
    $root = __DIR__ . '/../';
    if ($row['file_path'] && file_exists($root . $row['file_path'])) {
        @unlink($root . $row['file_path']);
    }
    if ($row['thumbnail'] && file_exists($root . $row['thumbnail'])) {
        @unlink($root . $row['thumbnail']);
    }

    // Hapus dari DB
    $del = $db->prepare("DELETE FROM frames WHERE id = :id");
    $del->execute([':id' => $id]);

    jsonResponse(['success' => true, 'deleted_id' => $id]);
}

jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);