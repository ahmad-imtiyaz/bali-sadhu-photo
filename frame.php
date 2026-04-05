<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Frame — Bali Sadhu Photo</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/frame.css">
</head>
<body>

<!-- ══════════════════════════════════════
     TOPBAR
══════════════════════════════════════ -->
<header class="topbar">
  <button class="btn-back" onclick="window.location.href='edit.php'" title="Kembali ke Edit">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>

  <div class="topbar-title">
    <span class="brand">Bali Sadhu Photo</span>
    <span class="page-name" id="imageFileName">—</span>
  </div>

  <div class="steps">
    <a href="index.php" class="step done">
      <div class="step-num">✓</div>
      <span class="step-label">Pick Image</span>
    </a>
    <div class="step-line done"></div>
    <a href="edit.php" class="step done">
      <div class="step-num">✓</div>
      <span class="step-label">Edit</span>
    </a>
    <div class="step-line done"></div>
    <div class="step active">
      <div class="step-num">3</div>
      <span class="step-label">Frame</span>
    </div>
    <div class="step-line"></div>
    <div class="step">
      <div class="step-num">4</div>
      <span class="step-label">Print &amp; Share</span>
    </div>
  </div>

  <button class="btn-next" onclick="goToPrint()">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h8M7 4l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Next: Print
  </button>
</header>

<!-- ══════════════════════════════════════
     MAIN LAYOUT
══════════════════════════════════════ -->
<div class="frame-layout">

  <!-- LEFT: Canvas Stage -->
  <div class="canvas-area">
    <div class="canvas-stage" id="canvasStage">
      <div class="loading-overlay" id="loadingOverlay">
        <div class="spinner"></div>
      </div>
      <div class="composite-wrap" id="compositeWrap" style="display:none;">
        <canvas id="photoCanvas"></canvas>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" id="btnZoomOut" title="Perkecil">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <span class="zoom-display" id="zoomDisplay">100%</span>
        <button class="tool-btn" id="btnZoomIn" title="Perbesar">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5v10M1.5 6.5h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <button class="tool-btn" id="btnZoomFit">Fit</button>
        <button class="tool-btn" id="btnZoom100">100%</button>
      </div>
      <div class="toolbar-right">
        <button class="tool-btn" id="btnDownload">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3.5 7l3 3 3-3M1 11.5h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Download Preview
        </button>
      </div>
    </div>
  </div>

  <!-- RIGHT: Single Scroll Panel -->
  <div class="right-panel">

    <div class="panel-header">
      <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
        <rect x="3" y="3" width="6" height="6" rx="0.5" stroke="currentColor" stroke-width="0.9"/>
      </svg>
      Frames
    </div>

    <div class="panel-scroll">

      <!-- ① UPLOAD FRAME -->
      <div class="upload-zone" id="uploadZone">
        <div class="upload-zone-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 4v12M7 9l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="upload-zone-title">Upload Frame PNG</span>
        <span class="upload-zone-sub">Seret &amp; lepas, atau klik tombol di bawah</span>
        <span class="upload-zone-hint">PNG transparan · Maks 8MB · Multi-file</span>
        <span class="upload-zone-btn">Pilih File</span>
        <input type="file" id="frameFileInput" accept="image/png" hidden multiple>
      </div>

      <!-- ② FILTER ORIENTASI -->
      <div class="orient-filter">
        <button class="orient-btn active" data-orient="all">Semua</button>
        <button class="orient-btn" data-orient="portrait">Portrait</button>
        <button class="orient-btn" data-orient="landscape">Landscape</button>
      </div>

      <!-- Info frame aktif -->
      <div class="active-frame-info" id="activeFrameInfo" style="display:none;">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="color:var(--gold);flex-shrink:0">
          <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        <span class="active-frame-info-name" id="activeFrameInfoName">—</span>
        <button class="btn-remove-frame" onclick="removeActiveFrame()">Hapus</button>
      </div>

      <!-- ③ GALERI FRAME -->
      <div class="section-label" style="margin-bottom:8px;">Galeri Frame</div>
      <div class="frames-grid" id="framesGrid"></div>

      <!-- ④ PENGATURAN FRAME (muncul setelah frame dipilih) -->
      <div id="adjustSection" class="adjust-section">

        <div class="section-divider">Pengaturan Frame</div>

        <!-- Opasitas -->
        <div class="adjust-block">
          <div class="adjust-block-title">Opasitas Frame</div>
          <div class="slider-label-row">
            <span class="slider-label">Transparency</span>
            <span class="slider-val" id="valOpacity">100%</span>
          </div>
          <input type="range" id="slOpacity" min="10" max="100" value="100">
        </div>

        <!-- Scale -->
        <div class="adjust-block">
          <div class="adjust-block-title">Ukuran Frame</div>
          <div class="slider-label-row">
            <span class="slider-label">Scale</span>
            <span class="slider-val" id="valScale">100%</span>
          </div>
          <input type="range" id="slScale" min="50" max="200" value="100">
        </div>

        <!-- Rotasi -->
        <div class="adjust-block">
          <div class="adjust-block-title">Rotasi Frame</div>
          <div class="slider-label-row">
            <span class="slider-label">Sudut</span>
            <span class="slider-val" id="valRotate">0°</span>
          </div>
          <input type="range" id="slRotate" min="-180" max="180" value="0">
          <div class="btn-row" style="margin-top:10px;">
            <button class="tool-btn flex-btn" id="btnRotL" title="Putar kiri -90°">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8a5 5 0 1 0 1-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M4 2v4H0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              -90°
            </button>
            <button class="tool-btn flex-btn" id="btnRotR" title="Putar kanan +90°">
              +90°
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 8a5 5 0 1 1-1-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 2v4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="tool-btn flex-btn" id="btnRotReset">Reset</button>
          </div>
        </div>

        <!-- Flip -->
        <div class="adjust-block">
          <div class="adjust-block-title">Cermin (Flip)</div>
          <div class="btn-row" style="margin-top:6px;">
            <button class="tool-btn flex-btn" id="btnFlipH">⇔ Flip Horizontal</button>
            <button class="tool-btn flex-btn" id="btnFlipV">⇕ Flip Vertikal</button>
          </div>
        </div>

        <!-- Posisi Frame -->
        <div class="adjust-block">
          <div class="adjust-block-title" style="margin-bottom:10px;">Posisi Frame</div>
          <div class="pos-grid">
            <button class="pos-btn" data-pos="top-left">↖</button>
            <button class="pos-btn" data-pos="top-center">↑</button>
            <button class="pos-btn" data-pos="top-right">↗</button>
            <button class="pos-btn" data-pos="left-center">←</button>
            <button class="pos-btn active" data-pos="center">✛</button>
            <button class="pos-btn" data-pos="right-center">→</button>
            <button class="pos-btn" data-pos="bottom-left">↙</button>
            <button class="pos-btn" data-pos="bottom-center">↓</button>
            <button class="pos-btn" data-pos="bottom-right">↘</button>
          </div>
          <p class="hint-text">💡 Atau drag frame langsung di canvas</p>
        </div>

        <!-- Reset semua -->
        <button class="btn-reset-full" onclick="resetFrameTransform()">Reset Semua Pengaturan Frame</button>

      </div><!-- /adjustSection -->

      <!-- ⑤ BACKGROUND FOTO (selalu tampil) -->
      <div class="section-divider">Background Foto</div>

      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:12px;">Warna Background</div>
        <div class="bg-swatches" id="bgSwatches"></div>
      </div>

      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:10px;">Warna Kustom</div>
        <div class="bg-custom-row">
          <span class="bg-custom-label">Pilih warna bebas</span>
          <input type="color" id="bgColorPicker" value="#ffffff">
        </div>
      </div>

      <div class="adjust-block" style="margin-bottom:24px;">
        <div class="adjust-block-title" style="margin-bottom:10px;">Padding Canvas</div>
        <div class="slider-label-row">
          <span class="slider-label">Jarak tepi foto</span>
          <span class="slider-val" id="valPadding">0px</span>
        </div>
        <input type="range" id="slPadding" min="0" max="80" value="0">
      </div>

    </div><!-- /panel-scroll -->
  </div><!-- /right-panel -->

</div><!-- /frame-layout -->

<div id="toast"></div>

<!-- ══════════════════════════════════════
     BOTTOM SHEET — Mobile only
     (satu panel, semua fitur, scroll ke bawah)
══════════════════════════════════════ -->
<div class="frame-bottom-sheet" id="frameBottomSheet" style="display:none;">
  <div class="fbs-handle" id="fbsHandle">
    <div class="fbs-pill"></div>
    <div class="fbs-tab-row">
      <button class="fbs-tab-btn active" id="fbsMainBtn">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
          <rect x="3" y="3" width="6" height="6" rx="0.5" stroke="currentColor" stroke-width="0.9"/>
        </svg>
        Frames
      </button>
    </div>
  </div>

  <div class="fbs-content">
    <div class="fbs-panel active" id="fbs-frames">

      <!-- Upload -->
      <div class="upload-zone" id="fbsUploadZone">
        <div class="upload-zone-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 4v10M7 8l4-4 4 4M4 17h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="upload-zone-title">Upload Frame PNG</span>
        <span class="upload-zone-hint">PNG transparan · Maks 8MB · Multi-file</span>
        <span class="upload-zone-btn">Pilih File</span>
        <input type="file" id="fbsFrameFileInput" accept="image/png" hidden multiple>
      </div>

      <!-- Filter orientasi -->
      <div class="orient-filter">
        <button class="orient-btn active" data-orient="all">Semua</button>
        <button class="orient-btn" data-orient="portrait">Portrait</button>
        <button class="orient-btn" data-orient="landscape">Landscape</button>
      </div>

      <!-- Info frame aktif -->
      <div class="active-frame-info" id="fbsActiveFrameInfo" style="display:none;">
        <span class="active-frame-info-name" id="fbsActiveFrameInfoName">—</span>
        <button class="btn-remove-frame" onclick="removeActiveFrame()">Hapus</button>
      </div>

      <!-- Galeri -->
      <div class="section-label">Galeri Frame</div>
      <div class="frames-grid" id="fbsFramesGrid"></div>

      <!-- Adjust mobile (muncul setelah frame dipilih) -->
      <div id="fbsAdjustSection" class="adjust-section">

        <div class="section-divider">Pengaturan Frame</div>

        <div class="adjust-block">
          <div class="adjust-block-title">Opasitas Frame</div>
          <div class="slider-label-row">
            <span class="slider-label">Transparency</span>
            <span class="slider-val" id="fbsValOpacity">100%</span>
          </div>
          <input type="range" id="fbsSlOpacity" min="10" max="100" value="100">
        </div>

        <div class="adjust-block">
          <div class="adjust-block-title">Ukuran Frame</div>
          <div class="slider-label-row">
            <span class="slider-label">Scale</span>
            <span class="slider-val" id="fbsValScale">100%</span>
          </div>
          <input type="range" id="fbsSlScale" min="50" max="200" value="100">
        </div>

        <div class="adjust-block">
          <div class="adjust-block-title">Rotasi Frame</div>
          <div class="slider-label-row">
            <span class="slider-label">Sudut</span>
            <span class="slider-val" id="fbsValRotate">0°</span>
          </div>
          <input type="range" id="fbsSlRotate" min="-180" max="180" value="0">
          <div class="btn-row" style="margin-top:8px;">
            <button class="tool-btn flex-btn" id="fbsBtnRotL">↺ -90°</button>
            <button class="tool-btn flex-btn" id="fbsBtnRotR">+90° ↻</button>
            <button class="tool-btn flex-btn" id="fbsBtnRotReset">Reset</button>
          </div>
        </div>

        <div class="adjust-block">
          <div class="adjust-block-title">Cermin (Flip)</div>
          <div class="btn-row" style="margin-top:6px;">
            <button class="tool-btn flex-btn" id="fbsBtnFlipH">⇔ Flip H</button>
            <button class="tool-btn flex-btn" id="fbsBtnFlipV">⇕ Flip V</button>
          </div>
        </div>

        <div class="adjust-block">
          <div class="adjust-block-title" style="margin-bottom:10px;">Posisi Frame</div>
          <div class="pos-grid">
            <button class="pos-btn" data-pos="top-left">↖</button>
            <button class="pos-btn" data-pos="top-center">↑</button>
            <button class="pos-btn" data-pos="top-right">↗</button>
            <button class="pos-btn" data-pos="left-center">←</button>
            <button class="pos-btn active" data-pos="center">✛</button>
            <button class="pos-btn" data-pos="right-center">→</button>
            <button class="pos-btn" data-pos="bottom-left">↙</button>
            <button class="pos-btn" data-pos="bottom-center">↓</button>
            <button class="pos-btn" data-pos="bottom-right">↘</button>
          </div>
          <p class="hint-text">💡 Drag frame langsung di canvas</p>
        </div>

        <button class="btn-reset-full" onclick="resetFrameTransform()">Reset Semua Pengaturan Frame</button>

      </div><!-- /fbsAdjustSection -->

      <!-- Background (selalu tampil) -->
      <div class="section-divider">Background Foto</div>

      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:12px;">Warna Background</div>
        <div class="bg-swatches" id="fbsBgSwatches"></div>
      </div>

      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:10px;">Warna Kustom</div>
        <div class="bg-custom-row">
          <span class="bg-custom-label">Pilih warna bebas</span>
          <input type="color" id="fbsBgColorPicker" value="#ffffff">
        </div>
      </div>

      <div class="adjust-block" style="margin-bottom:20px;">
        <div class="adjust-block-title" style="margin-bottom:10px;">Padding Canvas</div>
        <div class="slider-label-row">
          <span class="slider-label">Jarak tepi</span>
          <span class="slider-val" id="fbsValPadding">0px</span>
        </div>
        <input type="range" id="fbsSlPadding" min="0" max="80" value="0">
      </div>

    </div><!-- /fbs-frames -->
  </div><!-- /fbs-content -->
</div><!-- /frame-bottom-sheet -->

<script src="js/frame.js"></script>
</body>
</html>