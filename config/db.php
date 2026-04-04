<?php
/* ============================================================
   config/db.php — Bali Sadhu Photo
   ============================================================ */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'bali_sadhu');

// Upload settings
define('UPLOAD_DIR',      __DIR__ . '/../uploads/');
define('UPLOAD_DIR_EDIT', __DIR__ . '/../uploads/edited/');  // ← pastikan ini ada
define('MAX_FILE_SIZE',   50 * 1024 * 1024); // naikkan ke 50MB
define('ALLOWED_TYPES',   ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']);

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
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
        exit;
    }
    return $pdo;
}

function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function ensureUploadDirs(): void {
    $dirs = [
        UPLOAD_DIR,
        UPLOAD_DIR_EDIT,
        __DIR__ . '/../uploads/frames/',
        __DIR__ . '/../uploads/share/',
    ];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}