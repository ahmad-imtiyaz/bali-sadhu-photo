<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bali Sadhu Photo</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/index.css">
</head>
<body>

  <!-- Ornamen Bali dekoratif -->
  <svg class="bali-ornament top-right" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M100,10 C120,10 140,20 155,35 C170,50 180,70 180,90 C180,130 155,165 120,178 C110,182 100,184 90,182 C70,178 50,165 35,148 C20,131 12,108 14,85 C16,62 28,40 46,26 C62,13 81,10 100,10Z" fill="none" stroke="#C8922A" stroke-width="1.5"/>
    <path d="M100,30 C115,30 130,38 142,50 C154,62 162,78 162,95 C162,125 143,152 116,162 C110,165 105,166 100,165 C85,163 70,154 58,141 C46,128 40,110 41,93 C43,75 52,58 66,47 C78,37 89,30 100,30Z" fill="none" stroke="#C8922A" stroke-width="1"/>
    <path d="M100,50 C110,50 120,56 128,65 C136,74 141,86 141,98 C141,120 128,140 109,147 C106,148 103,149 100,148 C90,146 80,139 73,129 C66,119 62,106 63,94 C64,81 70,69 79,61 C87,54 93,50 100,50Z" fill="#C8922A" opacity="0.5"/>
    <line x1="100" y1="10" x2="100" y2="184" stroke="#C8922A" stroke-width="0.5" opacity="0.4"/>
    <line x1="14" y1="97" x2="186" y2="97" stroke="#C8922A" stroke-width="0.5" opacity="0.4"/>
    <line x1="32" y1="32" x2="168" y2="162" stroke="#C8922A" stroke-width="0.5" opacity="0.3"/>
    <line x1="168" y1="32" x2="32" y2="162" stroke="#C8922A" stroke-width="0.5" opacity="0.3"/>
    <circle cx="100" cy="97" r="6" fill="#C8922A" opacity="0.6"/>
  </svg>

  <svg class="bali-ornament bottom-left" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M100,5 L120,40 L160,40 L128,63 L140,100 L100,78 L60,100 L72,63 L40,40 L80,40Z" fill="none" stroke="#2D6A4F" stroke-width="1.5"/>
    <path d="M100,25 L112,50 L140,50 L118,67 L127,93 L100,77 L73,93 L82,67 L60,50 L88,50Z" fill="none" stroke="#2D6A4F" stroke-width="1"/>
    <circle cx="100" cy="100" r="40" fill="none" stroke="#2D6A4F" stroke-width="1"/>
    <circle cx="100" cy="100" r="25" fill="#2D6A4F" opacity="0.3"/>
    <circle cx="100" cy="100" r="10" fill="#2D6A4F" opacity="0.5"/>
  </svg>

  <!-- TOPBAR -->
  <header class="topbar">
    <div class="logo">
      <svg class="logo-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#FDF3DC"/>
        <path d="M20,6 L24,14 L33,14 L26,19 L29,27 L20,22 L11,27 L14,19 L7,14 L16,14Z" fill="#C8922A"/>
        <circle cx="20" cy="18" r="4" fill="#8B6318"/>
        <path d="M8,30 Q20,36 32,30" fill="none" stroke="#2D6A4F" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <div class="logo-text">
        <span class="logo-main">Bali Sadhu Photo</span>
        <span class="logo-sub">Professional Photo Editor</span>
      </div>
    </div>
    <span class="topbar-badge">Fase 1 — Pick Image</span>
  </header>

  <!-- STEP NAVIGATION -->
  <nav class="step-nav">
    <div class="step-item active" data-step="1">
      <div class="step-num"><span class="step-num-inner">1</span></div>
      <span class="step-label">Pick Image</span>
    </div>
    <div class="step-divider"></div>
    <div class="step-item" data-step="2">
      <div class="step-num"><span class="step-num-inner">2</span></div>
      <span class="step-label">Edit</span>
    </div>
    <div class="step-divider"></div>
    <div class="step-item" data-step="3">
      <div class="step-num"><span class="step-num-inner">3</span></div>
      <span class="step-label">Frame</span>
    </div>
    <div class="step-divider"></div>
    <div class="step-item" data-step="4">
      <div class="step-num"><span class="step-num-inner">4</span></div>
      <span class="step-label">Print & Share</span>
    </div>
  </nav>

  <!-- MAIN CONTENT -->
  <main class="main">

    <!-- LEFT: Upload Zone OR Preview -->
    <div class="left-panel">

      <!-- Upload Zone -->
      <div class="upload-zone" id="uploadZone">
        <div class="upload-icon-wrap">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" rx="12" fill="#FDF3DC"/>
            <path d="M22 14C22 14 15 20 15 26C15 29.866 18.134 33 22 33C25.866 33 29 29.866 29 26C29 20 22 14 22 14Z" fill="none" stroke="#C8922A" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M17 29C17 29 14 27 14 24" stroke="#2D6A4F" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="22" cy="26" r="3" fill="#C8922A" opacity="0.4"/>
            <path d="M22 11V20M19 14L22 11L25 14" stroke="#C8922A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div>
          <div class="upload-title">Pilih atau Seret Foto</div>
          <p class="upload-desc">Mulai perjalanan editmu di sini<br>Foto akan diproses langsung di browser</p>
        </div>

        <div class="upload-formats">
          <span class="format-tag">JPG</span>
          <span class="format-tag">PNG</span>
          <span class="format-tag">WEBP</span>
          <span class="format-tag">BMP</span>
          <span class="format-tag">GIF</span>
        </div>

        <button class="btn-browse" id="btnBrowse">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 10V11.5C2 11.776 2.224 12 2.5 12H11.5C11.776 12 12 11.776 12 11.5V10M7 2V9M4 5L7 2L10 5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Pilih File
        </button>

        <p class="upload-hint">atau seret file ke sini</p>
      </div>

      <!-- Preview Panel -->
      <div class="preview-panel" id="previewPanel">
        <img id="previewImg" class="preview-img" src="" alt="Preview"/>
        <p class="preview-name" id="previewName">—</p>
        <button class="btn-next" id="btnNext">
          Lanjut ke Edit
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7H11M8 4L11 7L8 10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="btn-reupload" id="btnReupload">Ganti foto</button>
      </div>

    </div>

    <!-- RIGHT: Sidebar -->
    <aside class="sidebar">

      <!-- Recent Photos -->
      <div class="sidebar-card">
        <div class="sidebar-title">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#C8922A" stroke-width="1.2"/>
            <path d="M7 4.5V7L8.5 8.5" stroke="#C8922A" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          Foto Terakhir
        </div>
        <div id="recentEmpty" class="recent-empty">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="6" width="24" height="20" rx="3" stroke="#C8922A" stroke-width="1.2" opacity="0.4"/>
            <circle cx="11" cy="13" r="2.5" stroke="#C8922A" stroke-width="1.2" opacity="0.4"/>
            <path d="M4 22L10 16L14 20L19 15L28 22" stroke="#C8922A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
          </svg>
          <span>Belum ada foto tersimpan</span>
        </div>
        <div id="recentGrid" class="recent-grid"></div>
      </div>

      <!-- Info Steps -->
      <div class="info-card">
        <div class="info-card-title">Alur Kerja</div>
        <ul class="info-card-steps">
          <li>Pilih foto dari perangkat</li>
          <li>Sesuaikan dengan editor pro</li>
          <li>Tambahkan frame khas Bali</li>
          <li>Print, PDF, atau kirim via WA</li>
        </ul>
      </div>

      <!-- Tips Card -->
      <div class="tips-card">
        <div class="tips-card-title">Tips</div>
        <p class="tips-card-body">Gunakan foto resolusi tinggi (min. 1200px) untuk hasil cetak terbaik. Format PNG mendukung transparansi untuk frame overlay.</p>
      </div>

    </aside>
  </main>

  <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp,image/bmp,image/gif">

  <script src="js/index.js"></script>
</body>
</html>
