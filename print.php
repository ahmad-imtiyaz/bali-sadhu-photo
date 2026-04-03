<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print & Share — Bali Sadhu Photo</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/print.css">
</head>
<body>

<header class="topbar">
  <button class="btn-back" onclick="window.location.href='frame.php'" title="Kembali ke Frame">
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

  <button class="btn-new" onclick="window.location.href='index.php'">
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

    <div class="panel-header">
      <h2 class="panel-title">Selesai! 🎉</h2>
      <p class="panel-subtitle">Pilih cara menggunakan foto kamu</p>
    </div>

    <!-- ── Print ── -->
    <div class="action-card" id="cardPrint">
      <div class="action-card-header" onclick="toggleCard('Print')">
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
              <button class="qty-btn" onclick="changeCopy(-1)">−</button>
              <span id="copyCount">1</span>
              <button class="qty-btn" onclick="changeCopy(1)">+</button>
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
        <button class="btn-action btn-print" onclick="doPrint()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5V2h8v3M1 5h12v6H1z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          Cetak Sekarang
        </button>
      </div>
    </div>

    <!-- ── Download ── -->
    <div class="action-card" id="cardDownload">
      <div class="action-card-header" onclick="toggleCard('Download')">
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
          <button class="fmt-btn active" data-fmt="png" onclick="selectFmt(this,'png')">PNG</button>
          <button class="fmt-btn" data-fmt="jpg" onclick="selectFmt(this,'jpg')">JPEG</button>
          <button class="fmt-btn" data-fmt="webp" onclick="selectFmt(this,'webp')">WebP</button>
        </div>
        <div class="quality-row" id="qualityRow" style="display:none;">
          <span class="print-opt-label">Kualitas</span>
          <input type="range" id="slQuality" min="60" max="100" value="92"
                 oninput="document.getElementById('valQuality').textContent=this.value+'%'">
          <span id="valQuality" class="slider-val-sm">92%</span>
        </div>
        <button class="btn-action btn-download" onclick="doDownload()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v8M4 7l3 3 3-3M2 12h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          Download Foto
        </button>
      </div>
    </div>

    <!-- ── WhatsApp ── -->
    <div class="action-card" id="cardWa">
      <div class="action-card-header" onclick="toggleCard('Wa')">
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
          <button class="wa-tab active" data-watab="contacts" onclick="switchWaTab('contacts')">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="4" r="2.2" stroke="currentColor" stroke-width="1.1"/>
              <path d="M1.5 11c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
            </svg>
            Kontak
          </button>
          <button class="wa-tab" data-watab="add" onclick="switchWaTab('add')">
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
            <input type="text" id="waSearch" class="wa-search-input" placeholder="Cari nama atau nomor…"
                   oninput="filterContacts()">
          </div>

          <div class="wa-contacts-list" id="waContactsList">
            <div class="wa-empty" id="waContactsEmpty">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="opacity:.3">
                <circle cx="14" cy="9" r="5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M4 26c0-5.5 4.5-9 10-9s10 3.5 10 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Belum ada kontak tersimpan</span>
              <button class="wa-add-btn-inline" onclick="switchWaTab('add')">+ Tambah kontak baru</button>
            </div>
          </div>

          <!-- Panel kirim — muncul saat kontak dipilih -->
          <div class="wa-send-panel" id="waSendPanel" style="display:none;">
            <div class="wa-selected-badge" id="waSelectedBadge">
              <!-- diisi JS -->
            </div>
            <div class="wa-format-row">
              <span class="wa-format-label">Format gambar</span>
              <div class="wa-format-btns">
                <button class="wa-fmt-btn active" data-wafmt="png" onclick="selectWaFmt(this,'png')">PNG</button>
                <button class="wa-fmt-btn" data-wafmt="jpg" onclick="selectWaFmt(this,'jpg')">JPEG</button>
                <button class="wa-fmt-btn" data-wafmt="webp" onclick="selectWaFmt(this,'webp')">WebP</button>
              </div>
            </div>
            <button class="btn-action btn-wa" id="btnSendWa" onclick="doSendWa()">
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
                <input type="tel" id="addPhone" class="wa-input wa-phone-input"
                       placeholder="812 3456 7890"
                       onkeydown="if(event.key==='Enter') doAddContact()">
              </div>
            </div>
            <button class="btn-action btn-add-contact" onclick="doAddContact()">
              Simpan Kontak
            </button>
          </div>
        </div>

      </div><!-- /bodyWa -->
    </div><!-- /cardWa -->

  </div><!-- /actions-panel -->
</div><!-- /print-layout -->

<!-- Print frame — hanya tampil saat @media print -->
<div id="printFrame" class="print-only"></div>

<div id="toast"></div>
<script src="js/print.js"></script>
</body>
</html>