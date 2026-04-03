<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edit Image — Bali Sadhu Photo</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/edit.css">
</head>
<body>

  <!-- TOP BAR -->
  <header class="topbar">
 <button class="btn-back" onclick="window.location.href='index.php'" title="Kembali">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
</button>

    <div class="topbar-title">
      <span class="brand">Bali Sadhu Photo</span>
      <span class="page-name" id="imageFileName">Edit Image</span>
    </div>

    <!-- STEP INDICATOR -->
    <nav class="steps">
      <a href="index.php" class="step done">
        <span class="step-num">✓</span>
        <span class="step-label">Pick Image</span>
      </a>
      <div class="step-line done"></div>
      <div class="step active">
        <span class="step-num">2</span>
        <span class="step-label">Edit</span>
      </div>
      <div class="step-line"></div>
      <div class="step">
        <span class="step-num">3</span>
        <span class="step-label">Frame</span>
      </div>
      <div class="step-line"></div>
      <div class="step">
        <span class="step-num">4</span>
        <span class="step-label">Print</span>
      </div>
    </nav>

    <button class="btn-next" id="btnNextFrame" onclick="goToFrame()">
      Next: Frames
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </header>

  <!-- MAIN LAYOUT -->
  <main class="editor-layout">

    <!-- CANVAS AREA -->
    <section class="canvas-area">
      <div class="canvas-wrapper" id="canvasWrapper">
        <canvas id="mainCanvas"></canvas>
      </div>

      <!-- BOTTOM TOOLBAR -->
      <div class="canvas-toolbar">
        <div class="zoom-controls">
          <button class="tool-btn" id="btnZoomOut" title="Zoom Out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button class="tool-btn zoom-fit" id="btnZoomFit" title="Fit to Screen">Fit</button>
          <button class="tool-btn" id="btnZoomIn" title="Zoom In">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <span class="zoom-level" id="zoomLevel">100%</span>
        </div>

        <div class="canvas-actions">

          <!-- UNDO / REDO -->
          <button class="tool-btn btn-undo" id="btnUndo" title="Undo (Ctrl+Z)" disabled>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
          </button>
          <button class="tool-btn btn-redo" id="btnRedo" title="Redo (Ctrl+Y)" disabled>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4.5"/></svg>
          </button>

          <div class="toolbar-divider"></div>

          <button class="tool-btn" id="btnRotateCCW" title="Rotate Left 90°">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
          </button>
          <button class="tool-btn" id="btnRotateCW" title="Rotate Right 90°">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4"/></svg>
          </button>
          <button class="tool-btn" id="btnFlipH" title="Flip Horizontal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          </button>
          <button class="tool-btn" id="btnFlipV" title="Flip Vertical">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 7 19 3 15 7"/><path d="M13 21h2a4 4 0 0 0 4-4V3"/><polyline points="1 17 5 21 9 17"/><path d="M11 3H9a4 4 0 0 0-4 4v14"/></svg>
          </button>
         <button class="tool-btn" id="btnCrop" title="Manual Crop">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M6 1v15a2 2 0 0 0 2 2h15"/>
    <path d="M1 6h15a2 2 0 0 1 2 2v15"/>
  </svg>
  Crop
</button>
          <button class="tool-btn btn-reset" id="btnReset" title="Reset ke Foto Asli">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
            Reset
          </button>
        </div>
      </div>
    </section>

    <!-- RIGHT PANEL -->
    <aside class="right-panel">

      <!-- TAB NAVIGATION -->
      <div class="panel-tabs">
        <button class="panel-tab active" data-tab="adjustments">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
          Adjustments
        </button>
        <button class="panel-tab" data-tab="filters">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          Filters
        </button>
        <button class="panel-tab" data-tab="details">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Details
        </button>
      </div>

      <!-- TAB: ADJUSTMENTS -->
      <div class="tab-content active" id="tab-adjustments">

        <!-- Histogram -->
        <div class="histogram-container">
          <div class="section-label">Histogram</div>
          <canvas id="histogramCanvas" width="240" height="60"></canvas>
        </div>

        <!-- Basic Adjustments -->
        <div class="adjustment-group">
          <div class="group-label">Basic</div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <span>Brightness</span>
              <span class="slider-value" id="val-brightness">+0</span>
            </div>
            <input type="range" class="slider" id="sl-brightness" min="-100" max="100" value="0" data-adj="brightness">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg>
              <span>Contrast</span>
              <span class="slider-value" id="val-contrast">+0</span>
            </div>
            <input type="range" class="slider" id="sl-contrast" min="-100" max="100" value="0" data-adj="contrast">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              <span>Saturation</span>
              <span class="slider-value" id="val-saturation">+0</span>
            </div>
            <input type="range" class="slider" id="sl-saturation" min="-100" max="100" value="0" data-adj="saturation">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <span>Warmth</span>
              <span class="slider-value" id="val-warmth">+0</span>
            </div>
            <input type="range" class="slider" id="sl-warmth" min="-100" max="100" value="0" data-adj="warmth">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Exposure</span>
              <span class="slider-value" id="val-exposure">+0</span>
            </div>
            <input type="range" class="slider" id="sl-exposure" min="-100" max="100" value="0" data-adj="exposure">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V12m0 0C12 6 6 2 2 7m10 5c0-6 6-10 10-5"/></svg>
              <span>Highlights</span>
              <span class="slider-value" id="val-highlights">+0</span>
            </div>
            <input type="range" class="slider" id="sl-highlights" min="-100" max="100" value="0" data-adj="highlights">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M8 16V8m4 8v-4m4 4V6"/></svg>
              <span>Shadows</span>
              <span class="slider-value" id="val-shadows">+0</span>
            </div>
            <input type="range" class="slider" id="sl-shadows" min="-100" max="100" value="0" data-adj="shadows">
          </div>
        </div>

        <!-- Color Adjustments -->
        <div class="adjustment-group">
          <div class="group-label">Color</div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
              <span>Hue</span>
              <span class="slider-value" id="val-hue">+0</span>
            </div>
            <input type="range" class="slider slider-hue" id="sl-hue" min="-180" max="180" value="0" data-adj="hue">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>Tint</span>
              <span class="slider-value" id="val-tint">+0</span>
            </div>
            <input type="range" class="slider" id="sl-tint" min="-100" max="100" value="0" data-adj="tint">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              <span>Vibrance</span>
              <span class="slider-value" id="val-vibrance">+0</span>
            </div>
            <input type="range" class="slider" id="sl-vibrance" min="-100" max="100" value="0" data-adj="vibrance">
          </div>
        </div>

        <!-- Detail Adjustments -->
        <div class="adjustment-group">
          <div class="group-label">Detail</div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>Sharpness</span>
              <span class="slider-value" id="val-sharpness">0</span>
            </div>
            <input type="range" class="slider" id="sl-sharpness" min="0" max="100" value="0" data-adj="sharpness">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/></svg>
              <span>Vignette</span>
              <span class="slider-value" id="val-vignette">0</span>
            </div>
            <input type="range" class="slider" id="sl-vignette" min="0" max="100" value="0" data-adj="vignette">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>
              <span>Noise Reduction</span>
              <span class="slider-value" id="val-noise">0</span>
            </div>
            <input type="range" class="slider" id="sl-noise" min="0" max="100" value="0" data-adj="noise">
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Blur</span>
              <span class="slider-value" id="val-blur">0</span>
            </div>
            <input type="range" class="slider" id="sl-blur" min="0" max="20" value="0" data-adj="blur">
          </div>
        </div>

      </div>

      <!-- TAB: FILTERS -->
      <div class="tab-content" id="tab-filters">
        <div class="filter-grid" id="filterGrid"></div>
      </div>

      <!-- TAB: DETAILS (Image Info + Crop) -->
      <div class="tab-content" id="tab-details">

        <!-- Image Info -->
        <div class="detail-section">
          <div class="group-label">Image Info</div>
          <div class="detail-row"><span>Filename</span><span id="info-filename">—</span></div>
          <div class="detail-row"><span>Dimensions</span><span id="info-dimensions">—</span></div>
          <div class="detail-row"><span>File Size</span><span id="info-filesize">—</span></div>
          <div class="detail-row"><span>Format</span><span id="info-format">—</span></div>
        </div>

        <!-- Current Edits -->
        <div class="detail-section">
          <div class="group-label">Current Edits</div>
          <div class="detail-row"><span>Rotation</span><span id="info-rotation">0°</span></div>
          <div class="detail-row"><span>Flip</span><span id="info-flip">None</span></div>
          <div class="detail-row"><span>Active Filter</span><span id="info-filter">None</span></div>
        </div>

        <!-- CROP SECTION -->
        <div class="detail-section">
          <div class="group-label">Crop — Ukuran Cetak</div>

          <div class="crop-orientation">
            <button class="crop-orient-btn active" id="btnOrientPortrait">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
              Portrait
            </button>
            <button class="crop-orient-btn" id="btnOrientLandscape">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
              Landscape
            </button>
          </div>

          <div class="crop-presets" id="cropPresets">
            <!-- Generated by buildCropPresetButtons() -->
          </div>

          <div class="crop-size-info">
            <span id="cropSizeLabel">4R — 4 × 6 in</span>
            <span id="cropSizeDim" class="crop-size-dim">Rasio 4:6</span>
          </div>

          <div class="crop-auto-wrap">
            <div class="crop-auto-label">Auto Crop</div>
            <button class="btn-auto-crop" id="btnAutoCrop">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              Auto Crop ke Ukuran Ini
            </button>
            <p class="crop-auto-hint">Potong otomatis ke tengah gambar dengan rasio yang dipilih di atas.</p>
          </div>

          <div class="crop-divider"><span>atau manual</span></div>

          <div class="crop-actions">
           <button class="btn-crop-manual" id="btnCropManualOpen">
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M6 1v15a2 2 0 0 0 2 2h15"/>
    <path d="M1 6h15a2 2 0 0 1 2 2v15"/>
  </svg>
  Manual
</button>
            <button class="btn-crop-apply" id="btnCropApply">Apply</button>
            <button class="btn-crop-cancel" id="btnCropCancel">Cancel</button>
          </div>
        </div>

      </div><!-- /tab-details -->

    </aside>
  </main>

  <!-- CROP OVERLAY -->
  <div class="crop-overlay hidden" id="cropOverlay">
    <div class="crop-box" id="cropBox">
      <div class="crop-handle tl"></div>
      <div class="crop-handle tr"></div>
      <div class="crop-handle bl"></div>
      <div class="crop-handle br"></div>
      <div class="crop-grid"></div>
    </div>
  </div>

  <script src="js/edit.js"></script>
</body>
</html>