<?php
/* ============================================================
   api/upload_frame.php — Bali Sadhu Photo
   Upload custom frame PNG dari browser ke server

   Method: POST (multipart/form-data)
   Fields: frame (file PNG), name (string)
   Return: JSON { success, frame_id, name, path, thumbnail }
   ============================================================ */

ini_set('display_errors', 0);
error_reporting(0);
ob_start(); // buffer output supaya HTML error tidak bocor


header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

// ─── Cek file ada ─────────────────────────────────────────
if (!isset($_FILES['frame']) || $_FILES['frame']['error'] !== UPLOAD_ERR_OK) {
    $errCode = $_FILES['frame']['error'] ?? -1;
    $errMap  = [
        UPLOAD_ERR_INI_SIZE   => 'File melebihi upload_max_filesize di php.ini',
        UPLOAD_ERR_FORM_SIZE  => 'File melebihi MAX_FILE_SIZE di form',
        UPLOAD_ERR_PARTIAL    => 'File hanya terupload sebagian',
        UPLOAD_ERR_NO_FILE    => 'Tidak ada file yang diupload',
        UPLOAD_ERR_NO_TMP_DIR => 'Folder temporary tidak ditemukan',
        UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file ke disk',
    ];
    $errMsg = $errMap[$errCode] ?? 'File frame tidak diterima (error ' . $errCode . ')';
    jsonResponse(['success' => false, 'error' => $errMsg], 400);
}

$file     = $_FILES['frame'];
$tmpPath  = $file['tmp_name'];
$fileSize = $file['size'];
$name     = trim($_POST['name'] ?? '');
if (!$name) {
    // Fallback ke nama file tanpa ekstensi
    $name = pathinfo($file['name'], PATHINFO_FILENAME);
    $name = preg_replace('/[-_]+/', ' ', $name);
    $name = ucwords(strtolower($name));
}
if (!$name) $name = 'Frame ' . date('d M Y');

// ─── Validasi ukuran: max 8MB ─────────────────────────────
if ($fileSize > 8 * 1024 * 1024) {
    jsonResponse(['success' => false, 'error' => 'File terlalu besar. Maksimal 8MB.'], 400);
}

// ─── Validasi MIME: harus PNG ─────────────────────────────
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($tmpPath);

if ($mimeType !== 'image/png') {
    jsonResponse(['success' => false, 'error' => 'Hanya file PNG yang diterima untuk frame. File kamu: ' . $mimeType], 400);
}

// ─── Buat folder frames/ (auto-create) ───────────────────
$framesDir = __DIR__ . '/../uploads/frames/';
if (!is_dir($framesDir)) {
    if (!mkdir($framesDir, 0755, true)) {
        jsonResponse(['success' => false, 'error' => 'Gagal membuat folder uploads/frames/. Cek permission server.'], 500);
    }
}

// Pastikan writable
if (!is_writable($framesDir)) {
    jsonResponse(['success' => false, 'error' => 'Folder uploads/frames/ tidak bisa ditulis. Jalankan: chmod 755 uploads/frames/'], 500);
}

// ─── Deteksi orientasi dari dimensi PNG ───────────────────
[$imgW, $imgH] = getimagesize($tmpPath);
$orient = ($imgW >= $imgH) ? 'landscape' : 'portrait';

// ─── Nama file unik ───────────────────────────────────────
$suffix     = date('Ymd_His') . '_' . bin2hex(random_bytes(4));
$storedName = 'frame_' . $suffix . '.png';
$destPath   = $framesDir . $storedName;
$relPath    = 'uploads/frames/' . $storedName;

if (!move_uploaded_file($tmpPath, $destPath)) {
    jsonResponse(['success' => false, 'error' => 'Gagal memindahkan file ke server. Cek permission folder.'], 500);
}

// ─── Buat thumbnail kecil ────────────────────────────────
$thumbName = 'thumb_' . $storedName;
$thumbPath = $framesDir . $thumbName;
$thumbRel  = 'uploads/frames/' . $thumbName;

try {
    createThumbnail($destPath, $thumbPath, 160, 200);
} catch (Exception $e) {
    // Fallback: thumbnail = original
    $thumbRel = $relPath;
}

// ─── Simpan ke database ───────────────────────────────────
try {
    $db   = getDB();
    $stmt = $db->prepare("
    INSERT INTO frames (name, group_name, orient, file_path, thumbnail, sort_order, is_active)
    VALUES (:name, 'custom', :orient, :path, :thumb, 0, 1)
");
$stmt->execute([
    ':name'   => $name,
    ':orient' => $orient,
    ':path'   => $relPath,
    ':thumb'  => $thumbRel,
]);
    $frameId = (int) $db->lastInsertId();
} catch (Exception $e) {
    // Kalau DB gagal, hapus file yang sudah di-upload
    @unlink($destPath);
    @unlink($thumbPath);
    jsonResponse(['success' => false, 'error' => 'Gagal simpan ke database: ' . $e->getMessage()], 500);
}
ob_end_clean();
jsonResponse([
    'success'   => true,
    'frame_id'  => $frameId,
    'name'      => $name,
    'path'      => $relPath,
    'thumbnail' => $thumbRel,
    'orient'    => $orient,
    'width'     => $imgW,
    'height'    => $imgH,
]);

// ─── Helper: Create thumbnail ─────────────────────────────
function createThumbnail(string $src, string $dest, int $tw, int $th): void {
    [$sw, $sh, $type] = getimagesize($src);
    if (!$sw || !$sh) throw new Exception('Cannot read image dimensions');

    $srcImg = match ($type) {
        IMAGETYPE_PNG  => imagecreatefrompng($src),
        IMAGETYPE_JPEG => imagecreatefromjpeg($src),
        IMAGETYPE_WEBP => imagecreatefromwebp($src),
        default        => throw new Exception('Unsupported image type'),
    };

    // Preserve alpha channel
    imagealphablending($srcImg, false);
    imagesavealpha($srcImg, true);

    // Hitung ukuran thumbnail dengan aspect ratio terjaga
    $ratio   = min($tw / $sw, $th / $sh);
    $newW    = (int) round($sw * $ratio);
    $newH    = (int) round($sh * $ratio);

    $dstImg = imagecreatetruecolor($newW, $newH);
    imagealphablending($dstImg, false);
    imagesavealpha($dstImg, true);
    $transparent = imagecolorallocatealpha($dstImg, 0, 0, 0, 127);
    imagefilledrectangle($dstImg, 0, 0, $newW, $newH, $transparent);

    imagecopyresampled($dstImg, $srcImg, 0, 0, 0, 0, $newW, $newH, $sw, $sh);
    imagepng($dstImg, $dest, 6);

   unset($srcImg, $dstImg);
}