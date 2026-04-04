<?php
/* ============================================================
   api/save_edited_image.php — Bali Sadhu Photo
   Upload hasil edit dari canvas (blob PNG/JPG) ke server

   Method: POST (multipart/form-data)
   Field : edited_image (file blob)
           photo_id     (int, optional)
           format       ('png'|'jpeg', default 'jpeg')
   Return: JSON { success, path, url }
   ============================================================ */

header('Content-Type: application/json');
// Tidak perlu CORS header lebar karena same-origin
// Tapi kalau ada kebutuhan:
// header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

// ─── Cek file ─────────────────────────────────────────────
if (!isset($_FILES['edited_image']) || $_FILES['edited_image']['error'] !== UPLOAD_ERR_OK) {
    $errMap = [
        UPLOAD_ERR_INI_SIZE   => 'File terlalu besar (server limit php.ini)',
        UPLOAD_ERR_FORM_SIZE  => 'File terlalu besar (form limit)',
        UPLOAD_ERR_PARTIAL    => 'Upload tidak lengkap',
        UPLOAD_ERR_NO_FILE    => 'Tidak ada file',
        UPLOAD_ERR_NO_TMP_DIR => 'Folder temporary tidak ada',
        UPLOAD_ERR_CANT_WRITE => 'Gagal tulis ke disk',
    ];
    $code = $_FILES['edited_image']['error'] ?? UPLOAD_ERR_NO_FILE;
    jsonResponse(['success' => false, 'error' => $errMap[$code] ?? 'Upload error ' . $code], 400);
}

$file     = $_FILES['edited_image'];
$tmpPath  = $file['tmp_name'];
$fileSize = $file['size'];
$photoId  = isset($_POST['photo_id']) ? (int)$_POST['photo_id'] : null;
$format   = in_array($_POST['format'] ?? '', ['png','jpeg']) ? $_POST['format'] : 'jpeg';

// ─── Validasi ukuran (50MB untuk hasil edit resolusi tinggi) ─
$maxSize = 50 * 1024 * 1024;
if ($fileSize > $maxSize) {
    jsonResponse(['success' => false, 'error' => 'File hasil edit terlalu besar (maks 50MB)'], 400);
}

// ─── Validasi MIME ────────────────────────────────────────
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($tmpPath);
$allowed  = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($mimeType, $allowed, true)) {
    jsonResponse(['success' => false, 'error' => "Tipe file tidak valid: $mimeType"], 400);
}

// ─── Buat nama file ───────────────────────────────────────
$ext        = $format === 'png' ? 'png' : 'jpg';
$prefix     = $photoId ? "edited_{$photoId}_" : 'edited_';
$storedName = $prefix . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

// ─── Pastikan folder edited/ ada ─────────────────────────
ensureUploadDirs();
$destPath = UPLOAD_DIR_EDIT . $storedName;

// ─── Pindahkan file ───────────────────────────────────────
if (!move_uploaded_file($tmpPath, $destPath)) {
    jsonResponse(['success' => false, 'error' => 'Gagal menyimpan file ke server'], 500);
}

// ─── Path yang akan disimpan / dikembalikan ───────────────
$relativePath = 'uploads/edited/' . $storedName;

// ─── Update database jika ada photo_id ───────────────────
if ($photoId && $photoId > 0) {
    try {
        $db   = getDB();
        $stmt = $db->prepare("
            UPDATE edit_sessions
            SET edited_path = :path, updated_at = NOW()
            WHERE photo_id = :pid AND status = 'editing'
            ORDER BY updated_at DESC
            LIMIT 1
        ");
        $stmt->execute([':path' => $relativePath, ':pid' => $photoId]);
    } catch (Exception $e) {
        // DB update gagal tidak berarti upload gagal — tetap lanjut
        error_log('[save_edited_image] DB update gagal: ' . $e->getMessage());
    }
}

// ─── Response ─────────────────────────────────────────────
jsonResponse([
    'success' => true,
    'path'    => $relativePath,
    // URL relatif — bisa diakses via <img src="uploads/edited/...">
    // atau dibangun penuh di client dengan window.location.origin
]);