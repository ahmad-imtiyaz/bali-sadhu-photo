<?php
/* ============================================================
   api/wa_contacts.php — Bali Sadhu Photo
   FIXED v3: resolve ob_start conflict dengan db.php,
             jsonResponse pakai ob_get_clean() agar aman.

   GET    /api/wa_contacts.php          → list semua kontak
   POST   /api/wa_contacts.php          → tambah / update kontak
   PATCH  /api/wa_contacts.php?id=N     → toggle favorite
   DELETE /api/wa_contacts.php?id=N     → hapus kontak
   ============================================================ */

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// ─── JANGAN ob_start() di sini — cukup set header ──────────
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Override jsonResponse agar tidak conflict dengan db.php ─
// Definisikan DULU sebelum require db.php supaya jika db.php
// define ulang tidak overwrite, atau kita skip fungsi db.php.
// Solusi: include db.php HANYA untuk getDB(), bukan jsonResponse.

$dbFile = __DIR__ . '/../config/db.php';

// Kita butuh getDB() dari db.php, tapi override jsonResponse()-nya
// Caranya: require db.php, lalu redefine jsonResponse di bawah
// (PHP tidak bisa redefine function, jadi kita buat nama lain)

if (file_exists($dbFile)) {
    require_once $dbFile;
}

// ─── jsonResponse lokal (pakai nama berbeda agar tidak conflict) ─
function waJson(array $data, int $code = 200): void {
    // Flush semua output buffer yang mungkin terbuka
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// ─── Koneksi DB ───────────────────────────────────────────────
function getWaDB(): PDO {
    if (function_exists('getDB')) {
        try {
            return getDB();
        } catch (Throwable $e) {
            waJson([
                'success' => false,
                'error'   => 'Koneksi database gagal: ' . $e->getMessage(),
                'hint'    => 'Cek DB_HOST/DB_USER/DB_PASS/DB_NAME di config/db.php',
            ], 500);
        }
    }

    // Fallback manual — sesuaikan jika db.php tidak ada
    try {
        return new PDO(
            'mysql:host=localhost;dbname=bali_sadhu;charset=utf8mb4',
            'root', '',
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    } catch (PDOException $e) {
        waJson([
            'success' => false,
            'error'   => 'Koneksi DB fallback gagal: ' . $e->getMessage(),
        ], 500);
    }

    // Unreachable — waJson() selalu exit(), tapi dibutuhkan agar
    // static analyzer (Intelephense P1075) tidak complain.
    throw new \RuntimeException('Unreachable');
}

// ─── Normalisasi nomor ────────────────────────────────────────
function normalizePhone(string $raw): string {
    $clean = preg_replace('/[^0-9]/', '', $raw);
    if (!$clean) return '';
    if (str_starts_with($clean, '08'))  $clean = '62' . substr($clean, 1);
    if (str_starts_with($clean, '628')) $clean = $clean; // sudah benar
    elseif (str_starts_with($clean, '8') && !str_starts_with($clean, '62')) $clean = '62' . $clean;
    if (strlen($clean) < 10) return '';
    return $clean;
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET ──────────────────────────────────────────────────────
if ($method === 'GET') {
    try {
        $db   = getWaDB();
        $stmt = $db->query("
            SELECT id, name, phone, is_favorite, last_used_at, use_count
            FROM wa_contacts
            ORDER BY is_favorite DESC, last_used_at DESC, use_count DESC
        ");
        waJson(['success' => true, 'contacts' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        waJson(['success' => false, 'error' => 'Gagal ambil kontak: ' . $e->getMessage()], 500);
    }
}

// ── POST ─────────────────────────────────────────────────────
if ($method === 'POST') {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (!is_array($body)) {
        waJson(['success' => false, 'error' => 'Body JSON tidak valid'], 400);
    }

    $phone = normalizePhone($body['phone'] ?? '');
    $name  = trim($body['name'] ?? '');

    if (!$phone) {
        waJson(['success' => false, 'error' => 'Nomor WA tidak valid (diterima: ' . ($body['phone'] ?? '') . ')'], 400);
    }

    try {
        $db = getWaDB();

        $check = $db->prepare("SELECT id FROM wa_contacts WHERE phone = :phone LIMIT 1");
        $check->execute([':phone' => $phone]);
        $existingId = $check->fetchColumn();

        if ($existingId) {
            $upd = $db->prepare("
                UPDATE wa_contacts
                SET
                    name         = CASE WHEN :name != '' THEN :name ELSE name END,
                    last_used_at = NOW(),
                    use_count    = use_count + 1
                WHERE phone = :phone
            ");
            $upd->execute([':name' => $name, ':phone' => $phone]);
            waJson(['success' => true, 'id' => (int)$existingId, 'phone' => $phone, 'name' => $name, 'updated' => true]);
        } else {
            $ins = $db->prepare("
                INSERT INTO wa_contacts (name, phone, is_favorite, last_used_at, use_count, created_at)
                VALUES (:name, :phone, 0, NOW(), 1, NOW())
            ");
            $ins->execute([':name' => $name, ':phone' => $phone]);
            waJson(['success' => true, 'id' => (int)$db->lastInsertId(), 'phone' => $phone, 'name' => $name, 'updated' => false]);
        }

    } catch (PDOException $e) {
        waJson(['success' => false, 'error' => 'Gagal simpan kontak: ' . $e->getMessage()], 500);
    }
}

// ── PATCH: toggle favorite ────────────────────────────────────
if ($method === 'PATCH') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) waJson(['success' => false, 'error' => 'ID tidak valid'], 400);

    try {
        $db = getWaDB();
        $db->prepare("UPDATE wa_contacts SET is_favorite = IF(is_favorite = 1, 0, 1) WHERE id = :id")
           ->execute([':id' => $id]);
        $row = $db->prepare("SELECT is_favorite FROM wa_contacts WHERE id = :id");
        $row->execute([':id' => $id]);
        waJson(['success' => true, 'id' => $id, 'is_favorite' => (bool)$row->fetchColumn()]);
    } catch (PDOException $e) {
        waJson(['success' => false, 'error' => 'Gagal update favorit: ' . $e->getMessage()], 500);
    }
}

// ── DELETE ───────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) waJson(['success' => false, 'error' => 'ID tidak valid'], 400);

    try {
        $db = getWaDB();
        $db->prepare("DELETE FROM wa_contacts WHERE id = :id")->execute([':id' => $id]);
        waJson(['success' => true, 'deleted_id' => $id]);
    } catch (PDOException $e) {
        waJson(['success' => false, 'error' => 'Gagal hapus kontak: ' . $e->getMessage()], 500);
    }
}

waJson(['success' => false, 'error' => 'Method not allowed'], 405);