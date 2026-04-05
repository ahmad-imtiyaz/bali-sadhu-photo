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

    <!-- RIGHT PANEL — Single "Edit" tab -->
    <aside class="right-panel">

      <!-- TAB HEADER (single tab, kept for visual consistency) -->
      <div class="panel-tabs">
        <button class="panel-tab active" data-tab="edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
          Edit
        </button>
      </div>

      <!-- TAB: EDIT (Basic adjustments + Crop merged) -->
      <div class="tab-content active" id="tab-edit">

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

        <!-- Crop Section (merged into Edit tab) -->
        <div class="adjustment-group">
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

      </div><!-- /tab-edit -->

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

  <!-- BOTTOM SHEET — Mobile only -->
  <div class="bottom-sheet" id="bottomSheet">

    <!-- Handle bar + single tab pill -->
    <div class="sheet-handle" id="sheetHandle">
      <div class="sheet-tab-row">
        <button class="sheet-tab-btn active" data-tab="edit">Edit</button>
      </div>
    </div>

    <!-- Scrollable content -->
    <div class="sheet-content">

      <!-- PANEL: Edit (Basic + Crop merged) -->
      <div class="sheet-panel active" id="sheet-edit">

        <!-- Basic -->
        <div class="adjustment-group">
          <div class="group-label">Basic</div>

          <div class="slider-row">
            <div class="slider-header">
              <span>Brightness</span>
              <span class="slider-value" id="sval-brightness">+0</span>
            </div>
            <input type="range" class="slider sheet-slider" data-adj="brightness" min="-100" max="100" value="0">
          </div>
          <div class="slider-row">
            <div class="slider-header">
              <span>Contrast</span>
              <span class="slider-value" id="sval-contrast">+0</span>
            </div>
            <input type="range" class="slider sheet-slider" data-adj="contrast" min="-100" max="100" value="0">
          </div>
          <div class="slider-row">
            <div class="slider-header">
              <span>Saturation</span>
              <span class="slider-value" id="sval-saturation">+0</span>
            </div>
            <input type="range" class="slider sheet-slider" data-adj="saturation" min="-100" max="100" value="0">
          </div>
          <div class="slider-row">
            <div class="slider-header">
              <span>Warmth</span>
              <span class="slider-value" id="sval-warmth">+0</span>
            </div>
            <input type="range" class="slider sheet-slider" data-adj="warmth" min="-100" max="100" value="0">
          </div>
          <div class="slider-row">
            <div class="slider-header">
              <span>Exposure</span>
              <span class="slider-value" id="sval-exposure">+0</span>
            </div>
            <input type="range" class="slider sheet-slider" data-adj="exposure" min="-100" max="100" value="0">
          </div>
          <div class="slider-row">
            <div class="slider-header">
              <span>Highlights</span>
              <span class="slider-value" id="sval-highlights">+0</span>
            </div>
            <input type="range" class="slider sheet-slider" data-adj="highlights" min="-100" max="100" value="0">
          </div>
          <div class="slider-row">
            <div class="slider-header">
              <span>Shadows</span>
              <span class="slider-value" id="sval-shadows">+0</span>
            </div>
            <input type="range" class="slider sheet-slider" data-adj="shadows" min="-100" max="100" value="0">
          </div>
        </div>

        <!-- Crop (merged) -->
        <div class="adjustment-group">
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

          <div class="crop-presets" id="cropPresets"></div>

          <div class="crop-size-info">
            <span id="cropSizeLabel">4R — 4 × 6 in</span>
            <span id="cropSizeDim" class="crop-size-dim">Rasio 4:6</span>
          </div>

          <button class="btn-auto-crop" id="btnAutoCrop">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            Auto Crop ke Ukuran Ini
          </button>
          <p class="crop-auto-hint">Potong otomatis ke tengah dengan rasio yang dipilih.</p>

          <div class="crop-divider"><span>atau manual</span></div>

          <div class="crop-actions">
            <button class="btn-crop-manual" id="btnCropManualOpen">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 1v15a2 2 0 0 0 2 2h15"/><path d="M1 6h15a2 2 0 0 1 2 2v15"/></svg>
              Manual
            </button>
            <button class="btn-crop-apply" id="btnCropApply">Apply</button>
            <button class="btn-crop-cancel" id="btnCropCancel">Cancel</button>
          </div>
        </div>

      </div><!-- /sheet-edit -->

    </div><!-- /sheet-content -->
  </div><!-- /bottom-sheet -->

  <script src="js/edit.js"></script>
</body>
</html>