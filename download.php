<?php
/* ============================================================
   download.php — Bali Sadhu Photo
   Public page: customer scan QR → buka halaman ini → download foto
   
   URL: /download.php?token=abc123...
   ============================================================ */

declare(strict_types=1);

// ── Koneksi DB ───────────────────────────────────────────────
// Sesuaikan dengan file config DB project kamu
require_once __DIR__ . '/config/db.php';
$pdo = getDB();

// ── Ambil & validasi token ───────────────────────────────────
$token = trim($_GET['token'] ?? '');

$error = null; // null = tidak ada error
$row   = null;

if (!$token || strlen($token) !== 48 || !ctype_xdigit($token)) {
    $error = 'invalid';
} else {
    try {
        $stmt = $pdo->prepare("SELECT * FROM download_tokens WHERE token = :token LIMIT 1");
        $stmt->execute([':token' => $token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            $error = 'invalid';
        } elseif ($row['expires_at'] && strtotime($row['expires_at']) < time()) {
            $error = 'expired';
        } elseif ($row['max_downloads'] > 0 && $row['download_count'] >= $row['max_downloads']) {
            $error = 'limit';
        }
    } catch (PDOException $e) {
        error_log('[download.php] DB error: ' . $e->getMessage());
        $error = 'server';
    }
}

// ── Jika ?dl=1 → serve file langsung ────────────────────────
if (!$error && isset($_GET['dl']) && $_GET['dl'] === '1') {
    $filePath = $row['file_path'];
    $fileName = $row['file_name'];
    $mime     = $row['mime_type'];

    if (!is_file($filePath)) {
        $error = 'file_missing';
    } else {
        // Update download count & last_downloaded
        try {
            $upd = $pdo->prepare("
                UPDATE download_tokens
                SET download_count = download_count + 1, last_downloaded = NOW()
                WHERE token = :token
            ");
            $upd->execute([':token' => $token]);
        } catch (PDOException $e) {
            error_log('[download.php] Update count error: ' . $e->getMessage());
        }

        // Serve file
        header('Content-Type: ' . $mime);
        header('Content-Disposition: attachment; filename="' . addslashes($fileName) . '"');
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: no-store, no-cache');
        header('Pragma: no-cache');
        ob_end_clean();
        readfile($filePath);
        exit;
    }
}

// ── Hitung sisa download ─────────────────────────────────────
$sisaDownload = null;
$expiresLabel = null;
if (!$error && $row) {
    if ($row['max_downloads'] > 0) {
        $sisaDownload = $row['max_downloads'] - $row['download_count'];
    }
    if ($row['expires_at']) {
        $diff = strtotime($row['expires_at']) - time();
        if ($diff > 3600) {
            $expiresLabel = floor($diff / 3600) . ' jam lagi';
        } elseif ($diff > 60) {
            $expiresLabel = floor($diff / 60) . ' menit lagi';
        } else {
            $expiresLabel = 'Segera berakhir';
        }
    }
}

// ── Pesan error ──────────────────────────────────────────────
$errorMessages = [
    'invalid'      => ['icon' => '🔗', 'title' => 'Link Tidak Valid',     'desc' => 'QR code atau link ini tidak valid. Minta foto baru ke operator.'],
    'expired'      => ['icon' => '⏰', 'title' => 'Link Sudah Expired',   'desc' => 'Link download ini sudah kadaluarsa. Minta link baru ke operator.'],
    'limit'        => ['icon' => '🔒', 'title' => 'Batas Download Tercapai','desc' => 'Foto ini sudah didownload maksimum kali. Hubungi operator jika perlu.'],
    'file_missing' => ['icon' => '❌', 'title' => 'File Tidak Ditemukan', 'desc' => 'File foto tidak ditemukan di server. Hubungi operator.'],
    'server'       => ['icon' => '⚠️', 'title' => 'Server Error',         'desc' => 'Terjadi kesalahan server. Coba beberapa saat lagi.'],
];
$errInfo = $error ? ($errorMessages[$error] ?? $errorMessages['server']) : null;

// Download URL
$downloadLink = '?token=' . urlencode($token) . '&dl=1';
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download Foto — Bali Sadhu Photo</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --gold:       #C9A84C;
      --gold-light: #E2C97E;
      --gold-glow:  rgba(201,168,76,0.14);
      --bg:         #111111;
      --bg2:        #191919;
      --bg3:        #222222;
      --border:     rgba(255,255,255,0.07);
      --border-gold:rgba(201,168,76,0.35);
      --text:       #E8E0D0;
      --text-muted: #888880;
      --text-dim:   #505048;
      --green:      #25D366;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      min-height: 100vh;
      font-family: 'DM Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex; align-items: center; justify-content: center;
      padding: 24px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 12px;
      width: 100%; max-width: 400px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    }
    .card-header {
      background: linear-gradient(135deg, #1a1a1a 0%, #1f1a0e 100%);
      border-bottom: 1px solid var(--border-gold);
      padding: 24px 24px 20px;
      text-align: center;
    }
    .brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: 13px; color: var(--gold);
      letter-spacing: 0.15em; text-transform: uppercase;
      display: block; margin-bottom: 4px;
    }
    .card-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 26px; color: var(--gold-light);
      font-weight: 600; line-height: 1.2;
    }
    .card-body { padding: 28px 24px; display: flex; flex-direction: column; gap: 20px; }

    /* ── Preview thumbnail ── */
    .photo-preview {
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 8px; overflow: hidden;
      aspect-ratio: 4/3;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .photo-preview img {
      width: 100%; height: 100%; object-fit: cover;
    }
    .photo-preview .preview-placeholder {
      color: var(--text-dim); font-size: 12px; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
    }

    /* ── Info badges ── */
    .info-row {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .badge {
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: 5px; padding: 5px 10px;
      font-size: 11px; color: var(--text-muted);
      display: flex; align-items: center; gap: 5px;
    }
    .badge.gold { border-color: var(--border-gold); color: var(--gold); }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

    /* ── Download button ── */
    .btn-download-main {
      width: 100%; padding: 16px;
      background: var(--gold); color: #000;
      border: none; border-radius: 10px;
      font-family: 'DM Sans', sans-serif;
      font-size: 16px; font-weight: 700;
      cursor: pointer; text-decoration: none;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    .btn-download-main:hover { background: var(--gold-light); transform: translateY(-1px); }
    .btn-download-main:active { transform: translateY(0); }

    .download-hint {
      text-align: center; font-size: 11px; color: var(--text-dim);
      line-height: 1.6;
    }

    /* ── Error state ── */
    .error-box {
      text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 8px 0;
    }
    .error-icon { font-size: 48px; line-height: 1; }
    .error-title { font-size: 18px; color: var(--text); font-weight: 600; }
    .error-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

    /* ── Footer ── */
    .card-footer {
      border-top: 1px solid var(--border);
      padding: 14px 24px;
      text-align: center;
      font-size: 11px; color: var(--text-dim);
    }
    .card-footer a { color: var(--gold); text-decoration: none; }

    @media (max-width: 440px) {
      .card-body { padding: 20px 16px; gap: 16px; }
      .card-header { padding: 20px 16px 16px; }
      .card-title { font-size: 22px; }
      .btn-download-main { font-size: 15px; padding: 14px; }
    }
  </style>
</head>
<body>

<div class="card">
  <div class="card-header">
    <span class="brand">Bali Sadhu Photo</span>
    <div class="card-title">
      <?= $error ? ($errInfo['icon'] . ' ' . $errInfo['title']) : '📸 Foto Siap Download' ?>
    </div>
  </div>

  <div class="card-body">

    <?php if ($error): ?>
      <!-- ── ERROR STATE ── -->
      <div class="error-box">
        <div class="error-icon"><?= $errInfo['icon'] ?></div>
        <div class="error-title"><?= htmlspecialchars($errInfo['title']) ?></div>
        <div class="error-desc"><?= htmlspecialchars($errInfo['desc']) ?></div>
      </div>

    <?php else: ?>
      <!-- ── SUCCESS STATE ── -->

      <!-- Preview placeholder (foto tidak di-expose sebelum download) -->
      <div class="photo-preview">
        <div class="preview-placeholder">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style="opacity:.3">
            <rect x="3" y="7" width="34" height="26" rx="3" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="14" cy="17" r="3" stroke="currentColor" stroke-width="1.5"/>
            <path d="M3 28l9-7 7 5 5-4 13 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Klik tombol di bawah<br>untuk download foto kamu</span>
        </div>
      </div>

      <!-- Info badges -->
      <div class="info-row">
        <div class="badge">
          <div class="badge-dot"></div>
          Kualitas HD
        </div>
        <?php if ($row['file_size']): ?>
        <div class="badge">
          📦 <?= number_format($row['file_size'] / (1024*1024), 1) ?> MB
        </div>
        <?php endif; ?>
        <?php if ($sisaDownload !== null): ?>
        <div class="badge gold">
          ⬇️ Sisa <?= $sisaDownload ?>x download
        </div>
        <?php endif; ?>
        <?php if ($expiresLabel): ?>
        <div class="badge">
          ⏳ <?= htmlspecialchars($expiresLabel) ?>
        </div>
        <?php endif; ?>
      </div>

      <!-- Download button -->
      <a href="<?= htmlspecialchars($downloadLink) ?>" class="btn-download-main">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3v10M6 9l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 15h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Download Foto Sekarang
      </a>

      <p class="download-hint">
        File akan terdownload otomatis ke galeri HP kamu.<br>
        Foto tanpa watermark, kualitas penuh.
      </p>

    <?php endif; ?>

  </div>

  <div class="card-footer">
    Dibuat dengan ❤️ oleh <a href="/">Bali Sadhu Photo</a>
  </div>
</div>

</body>
</html>