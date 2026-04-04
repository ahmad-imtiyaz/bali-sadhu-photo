<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
      <span class="step-label">Print & Share</span>
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

      <!-- Loading -->
      <div class="loading-overlay" id="loadingOverlay">
        <div class="spinner"></div>
      </div>

      <!-- The composited result -->
      <div class="composite-wrap" id="compositeWrap" style="display:none;">
        <!-- Photo base canvas -->
        <canvas id="photoCanvas"></canvas>

        <!-- Frame overlays injected here by JS -->
        <!-- Each frame = absolutely positioned img -->
      </div>

    </div>

    <!-- Toolbar -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" id="btnZoomOut" title="Zoom Out">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <span class="zoom-display" id="zoomDisplay">100%</span>
        <button class="tool-btn" id="btnZoomIn" title="Zoom In">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1.5v8M1.5 5.5h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <button class="tool-btn" id="btnZoomFit">Fit</button>
      </div>

      <div class="toolbar-center" id="canvasSizeLabel">— × — px</div>

      <div class="toolbar-right">
        <button class="tool-btn" id="btnDownload">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v6M2.5 5l3 3 3-3M1 9.5h9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Download Preview
        </button>
      </div>
    </div>
  </div>

  <!-- RIGHT: Panel -->
  <div class="right-panel">

    <div class="panel-tabs">
      <button class="panel-tab active" data-tab="frames">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/><rect x="3" y="3" width="6" height="6" rx="0.5" stroke="currentColor" stroke-width="0.9"/></svg>
        Frames
      </button>
      <button class="panel-tab" data-tab="adjust">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="3.5" cy="4" r="1.2" stroke="currentColor" stroke-width="1"/><circle cx="8.5" cy="8" r="1.2" stroke="currentColor" stroke-width="1"/><path d="M3.5 4h7M1 8h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        Adjust
      </button>
      <button class="panel-tab" data-tab="background">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1.5" fill="currentColor" opacity=".3"/><circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1"/></svg>
        Background
      </button>
    </div>

    <!-- ── TAB: FRAMES ── -->
    <div class="tab-content active" id="tab-frames">

      <!-- Orientation filter -->
      <div class="orient-filter">
        <button class="orient-btn active" data-orient="all">Semua</button>
        <button class="orient-btn" data-orient="portrait">Portrait</button>
        <button class="orient-btn" data-orient="landscape">Landscape</button>
      </div>

      <!-- Currently applied frame info -->
      <div class="active-frame-info" id="activeFrameInfo" style="display:none;">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="color:var(--gold);flex-shrink:0"><rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/></svg>
        <span class="active-frame-info-name" id="activeFrameInfoName">—</span>
        <button class="btn-remove-frame" onclick="removeActiveFrame()">Hapus</button>
      </div>

      <!-- Gallery -->
      <div>
        <div class="section-label" style="margin-bottom:8px;">Galeri Frame</div>
        <div class="frames-grid" id="framesGrid">
          <!-- populated by JS -->
        </div>
      </div>

      <!-- Upload -->
      <div class="upload-zone" id="uploadZone">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 4v10M7 8l4-4 4 4M4 17h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Upload Frame PNG</span>
        <span class="upload-zone-hint">PNG transparan · max 5MB · portrait atau landscape</span>
        <input type="file" id="frameFileInput" accept="image/png" hidden multiple>
      </div>

    </div>

    <!-- ── TAB: ADJUST ── -->
    <div class="tab-content" id="tab-adjust">

      <div id="adjustNoFrame" class="no-frame-state">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style="opacity:.4"><rect x="3" y="3" width="22" height="22" rx="3" stroke="currentColor" stroke-width="1.5"/><rect x="7" y="7" width="14" height="14" rx="1" stroke="currentColor" stroke-width="1"/></svg>
        <span>Pilih frame dulu dari tab Frames</span>
      </div>

      <div id="adjustPanel" style="display:none; flex-direction:column; gap:14px;">

        <!-- Opacity -->
        <div class="adjust-block">
          <div class="adjust-block-title">Opasitas Frame</div>
          <div class="slider-group">
            <div class="slider-label-row">
              <span class="slider-label">Transparency</span>
              <span class="slider-val" id="valOpacity">100%</span>
            </div>
            <input type="range" id="slOpacity" min="10" max="100" value="100">
          </div>
        </div>

        <!-- Scale -->
        <div class="adjust-block">
          <div class="adjust-block-title">Ukuran Frame</div>
          <div class="slider-group">
            <div class="slider-label-row">
              <span class="slider-label">Scale</span>
              <span class="slider-val" id="valScale">100%</span>
            </div>
            <input type="range" id="slScale" min="50" max="200" value="100">
          </div>
        </div>

        <!-- Position presets -->
        <div class="adjust-block">
          <div class="adjust-block-title" style="margin-bottom:8px;">Posisi Frame</div>
          <div class="pos-grid">
            <button class="pos-btn" data-pos="top-left" title="Kiri Atas">↖</button>
            <button class="pos-btn" data-pos="top-center" title="Tengah Atas">↑</button>
            <button class="pos-btn" data-pos="top-right" title="Kanan Atas">↗</button>
            <button class="pos-btn active" data-pos="center" title="Tengah">✛</button>
            <button class="pos-btn" data-pos="bottom-left" title="Kiri Bawah">↙</button>
            <button class="pos-btn" data-pos="bottom-center" title="Tengah Bawah">↓</button>
            <button class="pos-btn" data-pos="bottom-right" title="Kanan Bawah">↘</button>
            <button class="pos-btn" data-pos="left-center" title="Kiri Tengah">←</button>
            <button class="pos-btn" data-pos="right-center" title="Kanan Tengah">→</button>
          </div>
          <div style="font-size:10px;color:var(--text-dim);margin-top:8px;">
            💡 Atau drag frame langsung di canvas
          </div>
        </div>

        <!-- Reset -->
        <button class="btn-reset" onclick="resetFrameTransform()">Reset Posisi & Ukuran</button>

      </div>
    </div>

    <!-- ── TAB: BACKGROUND ── -->
    <div class="tab-content" id="tab-background">

      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:10px;">Warna Background Foto</div>
        <div class="bg-swatches" id="bgSwatches">
          <!-- populated by JS -->
        </div>
      </div>

      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:10px;">Warna Kustom</div>
        <div class="bg-custom-row">
          <span class="bg-custom-label">Pilih warna bebas</span>
          <input type="color" id="bgColorPicker" value="#ffffff">
        </div>
      </div>

      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:8px;">Padding Canvas</div>
        <div class="slider-group">
          <div class="slider-label-row">
            <span class="slider-label">Jarak tepi foto</span>
            <span class="slider-val" id="valPadding">0px</span>
          </div>
          <input type="range" id="slPadding" min="0" max="80" value="0">
        </div>
      </div>

    </div>

  </div><!-- /right-panel -->
</div><!-- /frame-layout -->

<input type="file" id="frameFileInput" accept="image/png" hidden multiple>
<div id="toast"></div>
<!-- BOTTOM SHEET — Mobile only -->
<div class="frame-bottom-sheet" id="frameBottomSheet" style="display:none;">
  <div class="fbs-handle" id="fbsHandle">
    <div class="fbs-tab-row">
      <button class="fbs-tab-btn active" data-fbs="frames">Frames</button>
      <button class="fbs-tab-btn" data-fbs="adjust">Adjust</button>
      <button class="fbs-tab-btn" data-fbs="background">Background</button>
    </div>
  </div>
  <div class="fbs-content">

    <!-- PANEL: Frames -->
    <div class="fbs-panel active" id="fbs-frames">
      <div class="orient-filter">
        <button class="orient-btn active" data-orient="all">Semua</button>
        <button class="orient-btn" data-orient="portrait">Portrait</button>
        <button class="orient-btn" data-orient="landscape">Landscape</button>
      </div>
      <div class="active-frame-info" id="fbsActiveFrameInfo" style="display:none;">
        <span class="active-frame-info-name" id="fbsActiveFrameInfoName">—</span>
        <button class="btn-remove-frame" onclick="removeActiveFrame()">Hapus</button>
      </div>
      <div class="frames-grid" id="fbsFramesGrid"></div>
      <div class="upload-zone" id="fbsUploadZone">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 4v10M7 8l4-4 4 4M4 17h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Upload Frame PNG</span>
        <span class="upload-zone-hint">PNG transparan · max 8MB</span>
        <input type="file" id="fbsFrameFileInput" accept="image/png" hidden multiple>
      </div>
    </div>

    <!-- PANEL: Adjust -->
    <div class="fbs-panel" id="fbs-adjust">
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
        <div style="display:flex;gap:6px;margin-top:8px;">
          <button class="tool-btn" id="fbsBtnRotL" style="flex:1;font-size:16px;min-height:44px;">↺</button>
          <button class="tool-btn" id="fbsBtnRotR" style="flex:1;font-size:16px;min-height:44px;">↻</button>
          <button class="tool-btn" id="fbsBtnRotReset" style="flex:1;font-size:11px;min-height:44px;">Reset</button>
        </div>
      </div>
      <div class="adjust-block">
        <div class="adjust-block-title">Cermin (Flip)</div>
        <div style="display:flex;gap:6px;margin-top:4px;">
          <button class="tool-btn" id="fbsBtnFlipH" style="flex:1;min-height:44px;font-size:11px;">⇔ Flip H</button>
          <button class="tool-btn" id="fbsBtnFlipV" style="flex:1;min-height:44px;font-size:11px;">⇕ Flip V</button>
        </div>
      </div>
      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:8px;">Posisi Frame</div>
        <div class="pos-grid">
          <button class="pos-btn" data-pos="top-left">↖</button>
          <button class="pos-btn" data-pos="top-center">↑</button>
          <button class="pos-btn" data-pos="top-right">↗</button>
          <button class="pos-btn active" data-pos="center">✛</button>
          <button class="pos-btn" data-pos="bottom-left">↙</button>
          <button class="pos-btn" data-pos="bottom-center">↓</button>
          <button class="pos-btn" data-pos="bottom-right">↘</button>
          <button class="pos-btn" data-pos="left-center">←</button>
          <button class="pos-btn" data-pos="right-center">→</button>
        </div>
      </div>
      <button class="btn-reset" onclick="resetFrameTransform()">Reset Posisi & Ukuran</button>
    </div>

    <!-- PANEL: Background -->
    <div class="fbs-panel" id="fbs-background">
      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:10px;">Warna Background</div>
        <div class="bg-swatches" id="fbsBgSwatches"></div>
      </div>
      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:10px;">Warna Kustom</div>
        <div class="bg-custom-row">
          <span class="bg-custom-label">Pilih warna bebas</span>
          <input type="color" id="fbsBgColorPicker" value="#ffffff">
        </div>
      </div>
      <div class="adjust-block">
        <div class="adjust-block-title" style="margin-bottom:8px;">Padding Canvas</div>
        <div class="slider-label-row">
          <span class="slider-label">Jarak tepi</span>
          <span class="slider-val" id="fbsValPadding">0px</span>
        </div>
        <input type="range" id="fbsSlPadding" min="0" max="80" value="0">
      </div>
    </div>

  </div>
</div>


  <script src="js/frame.js"></script>

</body>
</html>