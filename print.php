<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print & Share — Bali Sadhu Photo</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/print.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>

<header class="topbar">
  <button class="btn-back" id="btnBack" title="Kembali ke Frame">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  <div class="topbar-title">
    <span class="brand">Bali Sadhu Photo</span>
    <span class="page-name" id="imageFileName">—</span>
  </div>

  <div class="steps">
    <a href="index.php" class="step done"><div class="step-num">✓</div><span class="step-label">Pick Image</span></a>
    <div class="step-line done"></div>
    <a href="edit.php" class="step done"><div class="step-num">✓</div><span class="step-label">Edit</span></a>
    <div class="step-line done"></div>
    <a href="frame.php" class="step done"><div class="step-num">✓</div><span class="step-label">Frame</span></a>
    <div class="step-line done"></div>
    <div class="step active"><div class="step-num">4</div><span class="step-label">Print & Share</span></div>
  </div>

  <button class="btn-new" id="btnNew">
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    Foto Baru
  </button>
</header>

<div class="print-layout">

  <!-- LEFT: Preview -->
  <div class="preview-area">
    <div class="preview-stage">
      <div class="preview-loading" id="previewLoading">
        <div class="spinner"></div>
        <span>Memuat foto…</span>
      </div>
      <img id="finalPreview" class="final-img" style="display:none;" alt="Final Photo">
    </div>
    <div class="preview-meta" id="previewMeta" style="display:none;">
      <span class="meta-size" id="metaSize">—</span>
      <span class="meta-dot">·</span>
      <span class="meta-format">PNG</span>
    </div>
  </div>

  <!-- RIGHT: Actions Panel -->
  <div class="actions-panel">
      <div class="actions-scroll"> 
    <div class="panel-header">
      <h2 class="panel-title">Selesai! 🎉</h2>
      <p class="panel-subtitle">Pilih cara menggunakan foto kamu</p>
    </div>

    <!-- ── Print ── -->
    <div class="action-card" id="cardPrint">
      <div class="action-card-header">
        <div class="action-icon print-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7V3h10v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="2" y="7" width="16" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="15" cy="10.5" r="1" fill="currentColor" opacity=".7"/>
          </svg>
        </div>
        <div class="action-info">
          <div class="action-title">Print Langsung</div>
          <div class="action-desc">Cetak via printer yang terhubung</div>
        </div>
        <svg class="chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4 6l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="action-body" id="bodyPrint">
        <div class="print-options">
          <div class="print-opt-row">
            <span class="print-opt-label">Jumlah kopian</span>
            <div class="qty-ctrl">
              <button class="qty-btn" id="btnMinus">−</button>
              <span id="copyCount">1</span>
              <button class="qty-btn" id="btnPlus">+</button>
            </div>
          </div>
          <div class="print-opt-row">
            <span class="print-opt-label">Orientasi</span>
            <select id="printOrient" class="print-select">
              <option value="auto">Auto</option>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>
        <button class="btn-action btn-print" id="btnPrint">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5V2h8v3M1 5h12v6H1z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          Cetak Sekarang
        </button>
      </div>
    </div>

    <!-- ── Download ── -->
    <div class="action-card" id="cardDownload">
      <div class="action-card-header">
        <div class="action-icon download-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v10M6 9l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="action-info">
          <div class="action-title">Download HD</div>
          <div class="action-desc">Simpan foto resolusi penuh</div>
        </div>
        <svg class="chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4 6l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="action-body" id="bodyDownload">
        <div class="format-btns">
          <button class="fmt-btn active" data-fmt="png">PNG</button>
          <button class="fmt-btn" data-fmt="jpg">JPEG</button>
          <button class="fmt-btn" data-fmt="webp">WebP</button>
        </div>
        <div class="quality-row" id="qualityRow" style="display:none;">
          <span class="print-opt-label">Kualitas</span>
          <input type="range" id="slQuality" min="60" max="100" value="92">
          <span id="valQuality" class="slider-val-sm">92%</span>
        </div>
        <button class="btn-action btn-download" id="btnDownload">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v8M4 7l3 3 3-3M2 12h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          Download Foto
        </button>
      </div>
    </div>

    <!-- ── WhatsApp ── -->
    <div class="action-card" id="cardWa">
      <div class="action-card-header">
        <div class="action-icon wa-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C5.58 2 2 5.58 2 10c0 1.56.44 3.01 1.2 4.25L2 18l3.88-1.17A7.94 7.94 0 0010 18c4.42 0 8-3.58 8-8s-3.58-8-8-8z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M7 8.5c.3.8.9 1.6 1.6 2.2.6.5 1.3.9 2 1.1l1.1-1.1c.2-.2.4-.2.6-.1.7.3 1.4.5 2.1.6.3 0 .5.2.5.5v2c0 .3-.2.5-.5.5C8.4 14.2 6 11.8 5.5 8.5 5.5 8.2 5.7 8 6 8h2c.3 0 .5.2.5.5z" fill="currentColor" opacity=".7"/>
          </svg>
        </div>
        <div class="action-info">
          <div class="action-title">Kirim via WhatsApp</div>
          <div class="action-desc">Share foto ke kontak WA</div>
        </div>
        <svg class="chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4 6l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>

      <div class="action-body" id="bodyWa">

        <!-- Sub-tabs -->
        <div class="wa-tabs">
          <button class="wa-tab active" data-watab="contacts">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="4" r="2.2" stroke="currentColor" stroke-width="1.1"/>
              <path d="M1.5 11c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
            </svg>
            Kontak
          </button>
          <button class="wa-tab" data-watab="add">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            Tambah Kontak
          </button>
        </div>

        <!-- ── Tab: Kontak ── -->
        <div class="wa-tab-panel active" id="watab-contacts">

          <div class="wa-search-wrap">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="color:var(--text-dim);flex-shrink:0">
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" stroke-width="1.2"/>
              <path d="M8 8l2.5 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
            <input type="text" id="waSearch" class="wa-search-input" placeholder="Cari nama atau nomor…">
          </div>

          <div class="wa-contacts-list" id="waContactsList">
            <div class="wa-empty" id="waContactsEmpty">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="opacity:.3">
                <circle cx="14" cy="9" r="5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M4 26c0-5.5 4.5-9 10-9s10 3.5 10 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Belum ada kontak tersimpan</span>
              <button class="wa-add-btn-inline" id="btnAddTabInline">+ Tambah kontak baru</button>
            </div>
          </div>

          <!-- Panel kirim -->
          <div class="wa-send-panel" id="waSendPanel" style="display:none;">
            <div class="wa-selected-badge" id="waSelectedBadge"></div>
            <div class="wa-format-row">
              <span class="wa-format-label">Format gambar</span>
              <div class="wa-format-btns">
                <button class="wa-fmt-btn active" data-wafmt="png">PNG</button>
                <button class="wa-fmt-btn" data-wafmt="jpg">JPEG</button>
                <button class="wa-fmt-btn" data-wafmt="webp">WebP</button>
              </div>
            </div>
            <button class="btn-action btn-wa" id="btnSendWa">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C5.58 2 2 5.58 2 10c0 1.56.44 3.01 1.2 4.25L2 18l3.88-1.17A7.94 7.94 0 0010 18c4.42 0 8-3.58 8-8s-3.58-8-8-8z" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              Kirim ke WhatsApp
            </button>
          </div>

        </div>

        <!-- ── Tab: Tambah Kontak ── -->
        <div class="wa-tab-panel" id="watab-add">
          <div class="wa-add-form">
            <div class="wa-field">
              <label class="wa-field-label">Nama <span class="wa-optional">(opsional)</span></label>
              <input type="text" id="addName" class="wa-input" placeholder="Contoh: Pak Budi, Studio Bali…">
            </div>
            <div class="wa-field">
              <label class="wa-field-label">Nomor WhatsApp <span style="color:var(--gold)">*</span></label>
              <div class="wa-phone-wrap">
                <span class="wa-prefix">+62</span>
                <input type="tel" id="addPhone" class="wa-input wa-phone-input" placeholder="812 3456 7890">
              </div>
            </div>
            <button class="btn-action btn-add-contact" id="btnAddContact">
              Simpan Kontak
            </button>
          </div>
        </div>

      </div><!-- /bodyWa -->
    </div><!-- /cardWa -->

    <div class="action-card" id="cardQR">
  <div class="action-card-header">
    <div class="action-icon qr-icon">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
        <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
        <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
        <rect x="4" y="4" width="3" height="3" fill="currentColor"/>
        <rect x="13" y="4" width="3" height="3" fill="currentColor"/>
        <rect x="4" y="13" width="3" height="3" fill="currentColor"/>
        <path d="M11 11h2v2h-2zM13 13h2v2h-2zM15 11h2v2h-2zM11 15h2v2h-2zM15 15h2v2h-2z" fill="currentColor"/>
      </svg>
    </div>
    <div class="action-info">
      <div class="action-title">QR Code Download</div>
      <div class="action-desc">Customer scan → download otomatis</div>
    </div>
    <svg class="chevron" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4 6l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </div>
 
  <div class="action-body" id="bodyQR">
 
    <!-- QR Canvas area -->
    <div class="qr-stage">
      <div id="qrCodeWrap" class="qr-canvas-wrap" style="display:none;"></div>
      <div id="qrStatus" class="qr-status" style="display:none;">
        <div class="spinner"></div>
        <span>Membuat link…</span>
      </div>
      <div class="qr-placeholder" id="qrPlaceholder">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="opacity:.2">
          <rect x="4" y="4" width="17" height="17" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <rect x="27" y="4" width="17" height="17" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <rect x="4" y="27" width="17" height="17" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <rect x="8" y="8" width="9" height="9" fill="currentColor" opacity=".5"/>
          <rect x="31" y="8" width="9" height="9" fill="currentColor" opacity=".5"/>
          <rect x="8" y="31" width="9" height="9" fill="currentColor" opacity=".5"/>
          <path d="M27 27h5v5h-5zM32 32h5v5h-5zM38 27h5v5h-5zM27 38h5v5h-5zM38 38h5v5h-5z" fill="currentColor" opacity=".5"/>
        </svg>
        <span>Klik Generate untuk<br>buat QR Code</span>
      </div>
    </div>
 
    <!-- Info row (muncul setelah generate) -->
    <div class="qr-info-row" id="qrInfo" style="display:none;"></div>
 
    <!-- Generate button -->
    <button class="btn-action btn-qr-generate" id="btnGenerateQR">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx=".8" stroke="currentColor" stroke-width="1.2"/>
        <rect x="8" y="1" width="5" height="5" rx=".8" stroke="currentColor" stroke-width="1.2"/>
        <rect x="1" y="8" width="5" height="5" rx=".8" stroke="currentColor" stroke-width="1.2"/>
        <rect x="2.5" y="2.5" width="2" height="2" fill="currentColor"/>
        <rect x="9.5" y="2.5" width="2" height="2" fill="currentColor"/>
        <rect x="2.5" y="9.5" width="2" height="2" fill="currentColor"/>
        <path d="M8 8h1.5v1.5H8zM9.5 9.5H11V11H9.5zM11 8h1.5v1.5H11zM8 11h1.5v1.5H8zM11 11h1.5v1.5H11z" fill="currentColor"/>
      </svg>
      Generate QR Code
    </button>
 
    <!-- Action buttons (muncul setelah generate) -->
    <div class="qr-action-btns" id="qrActions" style="display:none;">
      <button class="btn-qr-secondary" id="btnCopyQRLink">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="4" y="1" width="8" height="8" rx="1.2" stroke="currentColor" stroke-width="1.2"/>
          <path d="M9 4H2a1 1 0 00-1 1v6a1 1 0 001 1h7a1 1 0 001-1V9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        Copy Link
      </button>
      <button class="btn-qr-secondary" id="btnPrintQR">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M3.5 5V2h6v3M1 5h11v6H1z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M3.5 8.5h6M3.5 10.5h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        Print QR
      </button>
    </div>
 
    <p class="qr-hint">
      Tunjukkan QR ini ke customer atau print bersama foto.
      Link aktif <strong>24 jam</strong>, maks <strong>5x download</strong>.
    </p>
 
  </div>
</div><!-- /cardQR -->
  </div>

  </div><!-- /actions-panel -->
</div><!-- /print-layout -->

<!-- Print frame -->
<div id="printFrame" class="print-only"></div>

<div id="toast"></div>
<script src="js/print.js"></script>
<script src="js/qr.js"></script>
<script>
  // Navigation — tidak bisa pakai onclick karena CSP
  document.getElementById('btnBack')?.addEventListener('click', () => { window.location.href = 'frame.php'; });
  document.getElementById('btnNew')?.addEventListener('click',  () => { window.location.href = 'index.php'; });
</script>
</body>
</html>