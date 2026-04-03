<?php
/* ============================================================
   api/upload.php — Bali Sadhu Photo
   Handle upload foto original dari browser ke server
   
   Method: POST (multipart/form-data)
   Field : photo (file)
   Return: JSON { success, photo_id, path, width, height }
   ============================================================ */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/db.php';

// ─── Hanya terima POST ────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

// ─── Cek ada file ─────────────────────────────────────────
if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    $errMap = [
        UPLOAD_ERR_INI_SIZE   => 'File terlalu besar (server limit)',
        UPLOAD_ERR_FORM_SIZE  => 'File terlalu besar (form limit)',
        UPLOAD_ERR_PARTIAL    => 'Upload tidak lengkap',
        UPLOAD_ERR_NO_FILE    => 'Tidak ada file',
        UPLOAD_ERR_NO_TMP_DIR => 'Folder temporary tidak ada',
        UPLOAD_ERR_CANT_WRITE => 'Gagal tulis ke disk',
    ];
    $code = $_FILES['photo']['error'] ?? UPLOAD_ERR_NO_FILE;
    jsonResponse(['success' => false, 'error' => $errMap[$code] ?? 'Upload error ' . $code], 400);
}

$file     = $_FILES['photo'];
$tmpPath  = $file['tmp_name'];
$origName = basename($file['name']);
$fileSize = $file['size'];

// ─── Validasi ukuran ──────────────────────────────────────
if ($fileSize > MAX_FILE_SIZE) {
    jsonResponse(['success' => false, 'error' => 'File terlalu besar. Maksimal 20MB.'], 400);
}

// ─── Validasi MIME (double check dengan finfo) ────────────
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($tmpPath);

if (!in_array($mimeType, ALLOWED_TYPES, true)) {
    jsonResponse(['success' => false, 'error' => "Tipe file tidak didukung: $mimeType"], 400);
}

// ─── Buat nama file unik ──────────────────────────────────
$ext        = match($mimeType) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/bmp'  => 'bmp',
    default      => 'jpg',
};
$storedName = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

// ─── Pastikan folder upload ada ───────────────────────────
ensureUploadDirs();
$destPath = UPLOAD_DIR . $storedName;

// ─── Pindahkan file ───────────────────────────────────────
if (!move_uploaded_file($tmpPath, $destPath)) {
    jsonResponse(['success' => false, 'error' => 'Gagal menyimpan file ke server.'], 500);
}

// ─── Ambil dimensi gambar ─────────────────────────────────
[$imgW, $imgH] = @getimagesize($destPath) ?: [0, 0];

// ─── Simpan ke database ───────────────────────────────────
$db   = getDB();
$stmt = $db->prepare("
    INSERT INTO photos (original_name, stored_name, original_path, file_size, mime_type, width, height)
    VALUES (:orig, :stored, :path, :size, :mime, :w, :h)
");
$stmt->execute([
    ':orig'   => $origName,
    ':stored' => $storedName,
    ':path'   => 'uploads/' . $storedName,
    ':size'   => $fileSize,
    ':mime'   => $mimeType,
    ':w'      => $imgW,
    ':h'      => $imgH,
]);
$photoId = (int) $db->lastInsertId();

// ─── Response ─────────────────────────────────────────────
jsonResponse([
    'success'  => true,
    'photo_id' => $photoId,
    'path'     => 'uploads/' . $storedName,
    'width'    => $imgW,
    'height'   => $imgH,
    'name'     => $origName,
]);