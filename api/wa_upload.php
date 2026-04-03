<?php
/* ============================================================
   api/wa_upload.php — Bali Sadhu Photo
   Upload foto hasil edit ke uploads/share/ agar bisa di-share
   via WhatsApp sebagai URL publik.

   Method: POST (multipart/form-data)
   Fields: photo (file PNG/JPEG)
   Return: JSON { success, url, path }
   ============================================================ */

ini_set('display_errors', 0);
error_reporting(0);
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

// ─── Cek file ─────────────────────────────────────────────
if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['success' => false, 'error' => 'File foto tidak diterima'], 400);
}

$file    = $_FILES['photo'];
$tmpPath = $file['tmp_name'];

// ─── Validasi MIME ────────────────────────────────────────
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($tmpPath);
$allowed  = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp'];

if (!isset($allowed[$mimeType])) {
    jsonResponse(['success' => false, 'error' => 'Format tidak didukung: ' . $mimeType], 400);
}

$ext = $allowed[$mimeType];

// ─── Buat folder share/ ───────────────────────────────────
$shareDir = __DIR__ . '/../uploads/share/';
if (!is_dir($shareDir)) {
    if (!mkdir($shareDir, 0755, true)) {
        jsonResponse(['success' => false, 'error' => 'Gagal membuat folder uploads/share/'], 500);
    }
}

// ─── Simpan file ──────────────────────────────────────────
$suffix   = date('Ymd_His') . '_' . bin2hex(random_bytes(6));
$fileName = 'share_' . $suffix . '.' . $ext;
$destPath = $shareDir . $fileName;
$relPath  = 'uploads/share/' . $fileName;

if (!move_uploaded_file($tmpPath, $destPath)) {
    jsonResponse(['success' => false, 'error' => 'Gagal menyimpan file'], 500);
}

// ─── Bangun URL publik ────────────────────────────────────
$scheme   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
$basePath = dirname(dirname($_SERVER['SCRIPT_NAME']));
$basePath = rtrim($basePath, '/');
$publicUrl = $scheme . '://' . $host . $basePath . '/' . $relPath;

ob_end_clean();
jsonResponse([
    'success' => true,
    'url'     => $publicUrl,
    'path'    => $relPath,
    'filename'=> $fileName,
]);