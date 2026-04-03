<?php
/* ============================================================
   config/db.php — Bali Sadhu Photo
   Koneksi MySQL — sesuaikan nilai di bawah dengan hosting kamu
   ============================================================ */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');          // ganti dengan user MySQL kamu
define('DB_PASS', '');              // ganti dengan password MySQL kamu
define('DB_NAME', 'bali_sadhu');    // nama database

// Upload settings
define('UPLOAD_DIR',      __DIR__ . '/../uploads/');
define('UPLOAD_DIR_EDIT', __DIR__ . '/../uploads/edited/');
define('MAX_FILE_SIZE',   20 * 1024 * 1024); // 20 MB
define('ALLOWED_TYPES',   ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']);

// ─── Buat koneksi ─────────────────────────────────────────
function getDB(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
        exit;
    }

    return $pdo;
}

// ─── Helper: JSON response ────────────────────────────────
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// ─── Helper: buat folder upload jika belum ada ────────────
function ensureUploadDirs(): void {
    foreach ([UPLOAD_DIR, UPLOAD_DIR_EDIT] as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}