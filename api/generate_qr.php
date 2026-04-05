<?php
/* ============================================================
   api/generate_qr.php — Bali Sadhu Photo
   Generate token unik untuk QR Code download
   
   Method : POST
   Body   : JSON { "file_path": "...", "file_name": "...", "expires_hours": 24 }
   Return : JSON { success, token, download_url, expires_at, qr_data }
   ============================================================ */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// ── Sesuaikan path config DB kamu ──────────────────────────
// Ganti require ini dengan file koneksi DB project kamu
// Contoh: require_once __DIR__ . '/../config/db.php';
// Variabel yang diharapkan: $pdo (PDO instance)
require_once __DIR__ . '/../config/db.php';
$pdo = getDB();

// ── Helper response ─────────────────────────────────────────
function jsonError(string $msg, int $code = 400): never {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

// ── Hanya terima POST ────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

// ── Parse body JSON ──────────────────────────────────────────
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!$body || !isset($body['file_path'])) {
    jsonError('file_path wajib diisi');
}

$filePath    = trim($body['file_path']);
$fileName    = trim($body['file_name']   ?? 'balisadhu_photo.png');
$expiresHrs  = isset($body['expires_hours']) ? (int)$body['expires_hours'] : 24;
$maxDownload = isset($body['max_downloads']) ? (int)$body['max_downloads'] : 5;

// ── Validasi file path ───────────────────────────────────────
// Cegah path traversal
$realPath = realpath($filePath);
if (!$realPath) {
    // Coba dari root project
    $realPath = realpath(__DIR__ . '/../' . ltrim($filePath, '/'));
}

if (!$realPath || !is_file($realPath)) {
    jsonError('File tidak ditemukan: ' . htmlspecialchars($filePath));
}

// Pastikan file ada di dalam folder project (keamanan)
$projectRoot = realpath(__DIR__ . '/../');
if (!str_starts_with($realPath, $projectRoot)) {
    jsonError('Akses file tidak diizinkan', 403);
}

// ── Deteksi MIME type ────────────────────────────────────────
$ext      = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
$mimeMap  = [
    'png'  => 'image/png',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'webp' => 'image/webp',
];
$mime     = $mimeMap[$ext] ?? mime_content_type($realPath) ?: 'application/octet-stream';
$fileSize = filesize($realPath);

// ── Generate token unik ──────────────────────────────────────
$token = bin2hex(random_bytes(24)); // 48 karakter hex, sangat aman

// ── Hitung expires_at ────────────────────────────────────────
$expiresAt = null;
if ($expiresHrs > 0) {
    $expiresAt = date('Y-m-d H:i:s', time() + ($expiresHrs * 3600));
}

// ── Simpan ke database ───────────────────────────────────────
try {
    $stmt = $pdo->prepare("
        INSERT INTO download_tokens
            (token, file_path, file_name, mime_type, file_size, max_downloads, expires_at)
        VALUES
            (:token, :file_path, :file_name, :mime_type, :file_size, :max_downloads, :expires_at)
    ");
    $stmt->execute([
        ':token'         => $token,
        ':file_path'     => $realPath,
        ':file_name'     => $fileName,
        ':mime_type'     => $mime,
        ':file_size'     => $fileSize,
        ':max_downloads' => $maxDownload,
        ':expires_at'    => $expiresAt,
    ]);
} catch (PDOException $e) {
    error_log('[generate_qr] DB error: ' . $e->getMessage());
    jsonError('Database error', 500);
}

// ── Build download URL ───────────────────────────────────────
$scheme      = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host        = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir   = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/api');
$downloadUrl = "{$scheme}://{$host}{$scriptDir}/download.php?token={$token}";


// ── Response ─────────────────────────────────────────────────
echo json_encode([
    'success'      => true,
    'token'        => $token,
    'download_url' => $downloadUrl,
    'expires_at'   => $expiresAt,
    'expires_hrs'  => $expiresHrs,
    'max_downloads'=> $maxDownload,
    'file_size'    => $fileSize,
    'file_name'    => $fileName,
]);