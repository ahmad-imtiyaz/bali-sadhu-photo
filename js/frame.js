/* ============================================================
   frame.js — Bali Sadhu Photo
   v9.0 — Single panel, all features in one scroll
          Adjust section reveals after frame selected
          All controls: opacity, scale, rotate, flip, position
   ============================================================ */

let frameImgEl  = null;
let frameDragEl = null;
let _toastTimer;

const BG_SWATCHES = [
  '#ffffff','#000000','#1a1208','#f9f6f0',
  '#0d1b2a','#2a1a1a','#0d1a12','#1e0a1e',
  '#5c3d1e','#C9A84C','#2D5A3D','#888880',
];

// ─── STATE ───────────────────────────────────────────────
const S = {
  photo: null,
  photoW: 0, photoH: 0,
  orientation: 'portrait',
  bgColor: '#ffffff',
  padding: 0,

  zoom: 1, panX: 0, panY: 0,

  activeFrame: null,
  frameOffX: 0, frameOffY: 0,
  frameScale: 1, frameOpacity: 1,
  frameRotate: 0, frameFlipH: false, frameFlipV: false,

  frames: [],
  filterOrient: 'all',
};

// ─── DOM ─────────────────────────────────────────────────
const photoCanvas    = document.getElementById('photoCanvas');
const pCtx           = photoCanvas.getContext('2d');
const compositeWrap  = document.getElementById('compositeWrap');
const canvasStage    = document.getElementById('canvasStage');
const loadingOverlay = document.getElementById('loadingOverlay');

// ─── INIT ────────────────────────────────────────────────
(function init() {
  loadPhoto();
  setupZoom();
  setupUpload();
  setupAdjustControls();
  setupBackground();
  setupBottomSheet();
  loadFramesFromServer();
})();

// ─── SHOW / HIDE ADJUST SECTION ──────────────────────────
function showAdjustSection(visible) {
  // Desktop
  const sec = document.getElementById('adjustSection');
  if (sec) {
    if (visible) sec.classList.add('visible');
    else         sec.classList.remove('visible');
  }
  // Mobile
  const fbsSec = document.getElementById('fbsAdjustSection');
  if (fbsSec) {
    if (visible) fbsSec.classList.add('visible');
    else         fbsSec.classList.remove('visible');
  }
}

// ─── LOAD PHOTO ──────────────────────────────────────────
function loadPhoto() {
  const editedPath = sessionStorage.getItem('bsp_editedPath');
  const serverPath = sessionStorage.getItem('bsp_serverPath');
  const base64Src  = sessionStorage.getItem('bsp_imageSrc');
  const name       = sessionStorage.getItem('bsp_imageName') || 'photo.jpg';

  const nameEl = document.getElementById('imageFileName');
  if (nameEl) nameEl.textContent = name;

  const src = editedPath || serverPath || base64Src || null;

  if (!src) {
    photoCanvas.width  = 900;
    photoCanvas.height = 1200;
    pCtx.fillStyle = '#2a1f0e';
    pCtx.fillRect(0, 0, 900, 1200);
    pCtx.fillStyle = 'rgba(201,168,76,0.06)';
    for (let i = 0; i < 900; i += 40)
      for (let j = 0; j < 1200; j += 40)
        pCtx.fillRect(i, j, 20, 20);
    pCtx.fillStyle = 'rgba(255,255,255,0.15)';
    pCtx.font = 'bold 28px serif'; pCtx.textAlign = 'center';
    pCtx.fillText('— Demo Mode —', 450, 580);
    pCtx.font = '16px sans-serif'; pCtx.fillStyle = 'rgba(201,168,76,0.6)';
    pCtx.fillText('Upload foto dari Step 1', 450, 620);
    S.photoW = 900; S.photoH = 1200; S.orientation = 'portrait';
    finalizePhotoLoad();
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    S.photo = img;
    S.photoW = img.naturalWidth; S.photoH = img.naturalHeight;
    S.orientation = S.photoW >= S.photoH ? 'landscape' : 'portrait';
    drawPhoto(); finalizePhotoLoad();
  };
  img.onerror = () => {
    if (src !== base64Src && base64Src) {
      showToast('⚠️ Mencoba fallback cache lokal…');
      img.crossOrigin = null; img.src = base64Src;
    } else {
      showToast('❌ Gagal load foto — kembali ke edit');
      setTimeout(() => { window.location.href = 'edit.php'; }, 2000);
      if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }
  };
  img.src = src;
}

function drawPhoto() {
  if (!S.photo) return;
  const pad = S.padding;
  const cw = S.photoW + pad * 2, ch = S.photoH + pad * 2;
  photoCanvas.width = cw; photoCanvas.height = ch;
  pCtx.fillStyle = S.bgColor;
  pCtx.fillRect(0, 0, cw, ch);
  pCtx.drawImage(S.photo, pad, pad, S.photoW, S.photoH);
}

function finalizePhotoLoad() {
  if (loadingOverlay) loadingOverlay.classList.add('hidden');
  if (compositeWrap) compositeWrap.style.display = '';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fitToScreen();
    renderFrameGrid();
    updateFrameOverlay();
  }));
}

function redrawPhoto() {
  drawPhoto();
  if (compositeWrap) {
    compositeWrap.style.width  = photoCanvas.width  + 'px';
    compositeWrap.style.height = photoCanvas.height + 'px';
  }
  updateFrameOverlay();
}

// ─── GO TO PRINT ─────────────────────────────────────────
async function goToPrint() {
  showToast('⏳ Menyiapkan untuk cetak…');
  const btnNext = document.querySelector('.btn-next');
  if (btnNext) { btnNext.disabled = true; btnNext.textContent = 'Menyiapkan…'; }

  try {
    const oc = document.createElement('canvas');
    oc.width = photoCanvas.width; oc.height = photoCanvas.height;
    const octx = oc.getContext('2d');
    octx.drawImage(photoCanvas, 0, 0);
    renderFrameToCanvas(octx, oc);

    const blob = await new Promise((resolve, reject) => {
      oc.toBlob(b => { if (b) resolve(b); else reject(new Error('toBlob() gagal')); }, 'image/jpeg', 0.92);
    });

    const photoId = sessionStorage.getItem('bsp_photoId');
    const fd = new FormData();
    fd.append('edited_image', blob, 'framed.jpg');
    fd.append('format', 'jpeg');
    if (photoId) fd.append('photo_id', photoId);

    const path = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const apiBase = window.location.pathname.replace(/\/[^\/]*$/, '');
      xhr.open('POST', apiBase + '/api/save_edited_image.php');
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) showToast(`Mengupload… ${Math.round(e.loaded/e.total*100)}%`);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) resolve(data.path);
            else reject(new Error(data.error || 'Server error'));
          } catch (e) { reject(new Error('Response tidak valid')); }
        } else { reject(new Error(`HTTP ${xhr.status}`)); }
      };
      xhr.onerror   = () => reject(new Error('Koneksi gagal'));
      xhr.ontimeout = () => reject(new Error('Upload timeout'));
      xhr.timeout   = 120000;
      xhr.send(fd);
    });

    sessionStorage.setItem('bsp_framedPath', path);
    sessionStorage.removeItem('bsp_framedSrc');
    sessionStorage.setItem('bsp_frameId',    S.activeFrame?.id || 'none');
    sessionStorage.setItem('bsp_cropSizeId', sessionStorage.getItem('bsp_cropSizeId') || '4R');
    window.location.href = 'print.php';

  } catch (err) {
    console.error('[goToPrint]', err);
    showToast('❌ Gagal: ' + (err.message || 'Upload error'));
    if (btnNext) { btnNext.disabled = false; btnNext.textContent = 'Next: Print'; }
  }
}

// ─── SERVER FRAMES ────────────────────────────────────────
async function loadFramesFromServer() {
  try {
    const res = await fetch('api/frames.php');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success || !data.frames.length) return;
    let added = false;
    data.frames.forEach(f => {
      const id = 'srv-' + f.id;
      if (S.frames.find(x => x.id === id)) return;
      S.frames.push({
        id, srvId: f.id, name: f.name,
        orient: detectOrient(f.file_path, null),
        src: f.file_path, thumb: f.thumbnail || f.file_path
      });
      added = true;
    });
    if (added) renderFrameGrid();
  } catch(e) { console.warn('[frame.js] api/frames.php tidak tersedia:', e.message); }
}

function detectOrient(filePath, imgEl) {
  if (imgEl) return imgEl.naturalWidth >= imgEl.naturalHeight ? 'landscape' : 'portrait';
  const l = (filePath || '').toLowerCase();
  if (l.includes('landscape') || l.includes('_ls') || l.includes('-ls')) return 'landscape';
  return 'portrait';
}

// ─── RENDER FRAME GRID ───────────────────────────────────
function renderFrameGrid() {
  // Render ke kedua grid (desktop + mobile)
  ['framesGrid', 'fbsFramesGrid'].forEach(gridId => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';

    const visible = S.frames.filter(f => S.filterOrient === 'all' || f.orient === S.filterOrient);

    if (!visible.length) {
      grid.innerHTML = `
        <div class="empty-frame-state">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="3" y="3" width="34" height="34" rx="4" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
            <path d="M20 13v14M13 20h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="empty-frame-title">Belum ada frame</span>
          <span class="empty-frame-hint">Upload file PNG transparan di atas</span>
        </div>`;
      return;
    }

    visible.forEach(frame => {
      const isActive = S.activeFrame?.id === frame.id;
      const card = document.createElement('div');
      card.className = 'frame-thumb-card'
        + (frame.orient === 'landscape' ? ' landscape' : '')
        + (isActive ? ' active' : '');
      card.dataset.id = frame.id;
      card.style.background = '#111';

      // Badge hanya di desktop grid
      if (gridId === 'framesGrid') {
        const badge = document.createElement('span');
        badge.className = 'card-orient-badge';
        badge.textContent = frame.orient === 'landscape' ? 'L' : 'P';
        card.appendChild(badge);
      }

      const img = document.createElement('img');
      img.src = frame.thumb || frame.src;
      img.alt = frame.name; img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      card.appendChild(img);

      const nameEl = document.createElement('div');
      nameEl.className = 'card-name'; nameEl.textContent = frame.name;
      card.appendChild(nameEl);

      // Delete button hanya di desktop
      if (gridId === 'framesGrid') {
        const del = document.createElement('button');
        del.className = 'card-del'; del.title = 'Hapus frame'; del.innerHTML = '✕';
        del.addEventListener('click', e => { e.stopPropagation(); deleteFrame(frame.id, frame.srvId); });
        card.appendChild(del);
      }

      card.addEventListener('click', () => applyFrame(frame));
      grid.appendChild(card);
    });
  });

  // Update info bar frame aktif
  const hasActive = !!S.activeFrame;
  ['activeFrameInfo', 'fbsActiveFrameInfo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = hasActive ? '' : 'none';
  });
  if (hasActive) {
    ['activeFrameInfoName', 'fbsActiveFrameInfoName'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = S.activeFrame.name;
    });
  }
}

// ─── APPLY FRAME ─────────────────────────────────────────
function applyFrame(frame) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    S.activeFrame = { ...frame, img };
    S.frameOffX = 0; S.frameOffY = 0;
    S.frameScale = 1; S.frameOpacity = 1;
    S.frameRotate = 0; S.frameFlipH = false; S.frameFlipV = false;

    // Sync semua slider
    syncAllSliders();

    // Reset flip button styles
    ['btnFlipH', 'btnFlipV', 'fbsBtnFlipH', 'fbsBtnFlipV'].forEach(id => {
      const b = document.getElementById(id);
      if (b) { b.classList.remove('toggled'); }
    });

    // Reset pos buttons
    document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.pos-btn[data-pos="center"]').forEach(b => b.classList.add('active'));

    // Tampilkan adjust section
    showAdjustSection(true);

    renderFrameGrid(); updateFrameOverlay();
    showToast(`✓ Frame "${frame.name}" diterapkan`);
  };
  img.onerror = () => showToast('❌ Gagal memuat frame');
  img.src = frame.src;
}

function removeActiveFrame() {
  S.activeFrame = null;
  showAdjustSection(false);
  renderFrameGrid(); updateFrameOverlay();
  showToast('Frame dihapus dari foto');
}

// ─── SLIDER SYNC ─────────────────────────────────────────
function syncAllSliders() {
  _setSlider('slOpacity',    100, 'valOpacity',    '100%');
  _setSlider('slScale',      100, 'valScale',      '100%');
  _setSlider('slRotate',     0,   'valRotate',     '0°');
  _setSlider('fbsSlOpacity', 100, 'fbsValOpacity', '100%');
  _setSlider('fbsSlScale',   100, 'fbsValScale',   '100%');
  _setSlider('fbsSlRotate',  0,   'fbsValRotate',  '0°');
}

function syncRotateSlider() {
  _setSlider('slRotate',    S.frameRotate, 'valRotate',    S.frameRotate + '°');
  _setSlider('fbsSlRotate', S.frameRotate, 'fbsValRotate', S.frameRotate + '°');
}

function _setSlider(sid, val, lid, label) {
  const s = document.getElementById(sid); if (s) s.value = val;
  const l = document.getElementById(lid); if (l) l.textContent = label;
}

// ─── FRAME OVERLAY ───────────────────────────────────────
function updateFrameOverlay() {
  if (frameImgEl)  { frameImgEl.remove();  frameImgEl  = null; }
  if (frameDragEl) { frameDragEl.remove(); frameDragEl = null; }
  if (!S.activeFrame || !compositeWrap) return;

  const cw = photoCanvas.width, ch = photoCanvas.height;
  compositeWrap.style.width  = cw + 'px';
  compositeWrap.style.height = ch + 'px';

  frameImgEl = document.createElement('img');
  frameImgEl.src = S.activeFrame.src;
  frameImgEl.style.cssText = `
    position:absolute;top:0;left:0;width:100%;height:100%;
    object-fit:contain;pointer-events:none;
    opacity:${S.frameOpacity};
    transform:${buildTransform()};
    transform-origin:center center;
    will-change:transform;transition:opacity 0.15s;`;
  compositeWrap.appendChild(frameImgEl);

  frameDragEl = document.createElement('div');
  frameDragEl.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;cursor:grab;z-index:20;touch-action:none;';
  compositeWrap.appendChild(frameDragEl);
  setupFrameDrag(frameDragEl);
}

function buildTransform() {
  const sx = S.frameFlipH ? -S.frameScale : S.frameScale;
  const sy = S.frameFlipV ? -S.frameScale : S.frameScale;
  return `translate(${S.frameOffX}px,${S.frameOffY}px) rotate(${S.frameRotate}deg) scale(${sx},${sy})`;
}

function refreshFrameStyle() {
  if (!frameImgEl) return;
  frameImgEl.style.opacity   = S.frameOpacity;
  frameImgEl.style.transform = buildTransform();
}

// ─── FRAME DRAG ──────────────────────────────────────────
function setupFrameDrag(el) {
  let dragging = false, sx, sy, sox, soy;

  el.addEventListener('mousedown', e => {
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    sox = S.frameOffX; soy = S.frameOffY;
    el.style.cursor = 'grabbing'; e.preventDefault();
  });

  el.addEventListener('touchstart', e => {
    if (!S.activeFrame || e.touches.length !== 1) return;
    dragging = true;
    const t = e.touches[0];
    sx = t.clientX; sy = t.clientY;
    sox = S.frameOffX; soy = S.frameOffY;
    e.stopPropagation(); e.preventDefault();
  }, { passive: false });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dz = 1 / S.zoom;
    S.frameOffX = sox + (e.clientX - sx) * dz;
    S.frameOffY = soy + (e.clientY - sy) * dz;
    refreshFrameStyle();
  });

  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    if (e.touches.length !== 1) { dragging = false; return; }
    const t = e.touches[0], dz = 1 / S.zoom;
    S.frameOffX = sox + (t.clientX - sx) * dz;
    S.frameOffY = soy + (t.clientY - sy) * dz;
    refreshFrameStyle(); e.preventDefault();
  }, { passive: false });

  const stop = () => { dragging = false; if (el) el.style.cursor = 'grab'; };
  document.addEventListener('mouseup', stop);
  document.addEventListener('touchend', stop);
}

// ─── ZOOM & PAN ──────────────────────────────────────────
function setupZoom() {
  document.getElementById('btnZoomIn')?.addEventListener('click',  () => setZoom(S.zoom * 1.2));
  document.getElementById('btnZoomOut')?.addEventListener('click', () => setZoom(S.zoom / 1.2));
  document.getElementById('btnZoomFit')?.addEventListener('click', fitToScreen);
  document.getElementById('btnZoom100')?.addEventListener('click', zoomTo100);

  if (!canvasStage) return;
  canvasStage.addEventListener('wheel', e => {
    e.preventDefault(); setZoom(S.zoom * (e.deltaY > 0 ? 0.9 : 1.1));
  }, { passive: false });

  // Mouse pan (middle click or alt+drag)
  let panning = false, px, py, ppx, ppy;
  canvasStage.addEventListener('mousedown', e => {
    if (e.button === 1 || e.altKey) {
      panning = true; px = e.clientX; py = e.clientY;
      ppx = S.panX; ppy = S.panY; e.preventDefault();
    }
  });
  document.addEventListener('mousemove', e => {
    if (!panning) return;
    S.panX = ppx + (e.clientX - px); S.panY = ppy + (e.clientY - py);
    applyStageTransform();
  });
  document.addEventListener('mouseup', () => { panning = false; });

  // Touch: 1 jari pan (kalau tidak ada frame), 2 jari pinch zoom
  let _t1x, _t1y, _tpx, _tpy, _lastDist = 0;
  canvasStage.addEventListener('touchstart', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      _t1x = e.touches[0].clientX; _t1y = e.touches[0].clientY;
      _tpx = S.panX; _tpy = S.panY;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      _lastDist = Math.sqrt(dx * dx + dy * dy);
    }
  }, { passive: false });

  canvasStage.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && !S.activeFrame) {
      S.panX = _tpx + (e.touches[0].clientX - _t1x);
      S.panY = _tpy + (e.touches[0].clientY - _t1y);
      applyStageTransform();
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (_lastDist > 0) setZoom(S.zoom * (dist / _lastDist));
      _lastDist = dist;
    }
  }, { passive: false });

  canvasStage.addEventListener('touchend', () => { _lastDist = 0; }, { passive: true });
}

function setZoom(z) {
  S.zoom = Math.max(0.05, Math.min(8, z));
  applyStageTransform(); updateZoomButtons();
}

function fitToScreen() {
  if (!canvasStage) return;
  requestAnimationFrame(() => {
    const rect = canvasStage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) { setTimeout(fitToScreen, 100); return; }
    const cw = photoCanvas.width  || S.photoW || 900;
    const ch = photoCanvas.height || S.photoH || 1200;
    S.zoom = Math.min((rect.width - 32) / cw, (rect.height - 32) / ch, 1);
    S.panX = 0; S.panY = 0;
    applyStageTransform(); updateZoomButtons();
  });
}

function zoomTo100() {
  S.zoom = 1; S.panX = 0; S.panY = 0;
  applyStageTransform(); updateZoomButtons();
  showToast('Zoom 100% — ukuran asli');
}

function applyStageTransform() {
  if (compositeWrap)
    compositeWrap.style.transform = `translate(${S.panX}px,${S.panY}px) scale(${S.zoom})`;
  const zd = document.getElementById('zoomDisplay');
  if (zd) zd.textContent = Math.round(S.zoom * 100) + '%';
}

function updateZoomButtons() {
  const btn100 = document.getElementById('btnZoom100');
  if (btn100) btn100.classList.toggle('active', Math.round(S.zoom * 100) === 100);
}

// ─── SETUP ADJUST CONTROLS ───────────────────────────────
// Semua kontrol adjust di-setup satu kali di sini
// Berlaku untuk desktop (slOpacity, dll.) dan mobile (fbsSlOpacity, dll.)
function setupAdjustControls() {

  // Pasangan slider: [desktopId, mobileId, stateKey, transform, labelDesktop, labelMobile]
  const sliderPairs = [
    {
      d: 'slOpacity',  m: 'fbsSlOpacity',
      ld: 'valOpacity', lm: 'fbsValOpacity',
      fmt: v => v + '%',
      apply: v => { S.frameOpacity = v / 100; refreshFrameStyle(); },
    },
    {
      d: 'slScale',    m: 'fbsSlScale',
      ld: 'valScale',  lm: 'fbsValScale',
      fmt: v => v + '%',
      apply: v => { S.frameScale = v / 100; refreshFrameStyle(); },
    },
    {
      d: 'slRotate',   m: 'fbsSlRotate',
      ld: 'valRotate', lm: 'fbsValRotate',
      fmt: v => v + '°',
      apply: v => { S.frameRotate = v; syncRotateSlider(); refreshFrameStyle(); },
    },
  ];

  sliderPairs.forEach(({ d, m, ld, lm, fmt, apply }) => {
    [{ sid: d, lid: ld }, { sid: m, lid: lm }].forEach(({ sid, lid }) => {
      const sl = document.getElementById(sid);
      if (!sl) return;
      sl.addEventListener('input', () => {
        const v = parseInt(sl.value);
        // Update label terkait langsung
        const lbl = document.getElementById(lid); if (lbl) lbl.textContent = fmt(v);
        // Apply ke state
        apply(v);
        // Sync pasangan lain
        const otherId = (sid === d) ? m : d;
        const otherLblId = (lid === ld) ? lm : ld;
        const other = document.getElementById(otherId); if (other) other.value = v;
        const otherLbl = document.getElementById(otherLblId); if (otherLbl) otherLbl.textContent = fmt(v);
      });
    });
  });

  // Rotate step buttons (desktop)
  document.getElementById('btnRotL')?.addEventListener('click', () => {
    S.frameRotate = ((S.frameRotate - 90 + 540) % 360) - 180;
    syncRotateSlider(); refreshFrameStyle();
  });
  document.getElementById('btnRotR')?.addEventListener('click', () => {
    S.frameRotate = ((S.frameRotate + 90 + 180) % 360) - 180;
    syncRotateSlider(); refreshFrameStyle();
  });
  document.getElementById('btnRotReset')?.addEventListener('click', () => {
    S.frameRotate = 0; syncRotateSlider(); refreshFrameStyle();
  });

  // Rotate step buttons (mobile)
  document.getElementById('fbsBtnRotL')?.addEventListener('click', () => {
    S.frameRotate = ((S.frameRotate - 90 + 540) % 360) - 180;
    syncRotateSlider(); refreshFrameStyle();
  });
  document.getElementById('fbsBtnRotR')?.addEventListener('click', () => {
    S.frameRotate = ((S.frameRotate + 90 + 180) % 360) - 180;
    syncRotateSlider(); refreshFrameStyle();
  });
  document.getElementById('fbsBtnRotReset')?.addEventListener('click', () => {
    S.frameRotate = 0; syncRotateSlider(); refreshFrameStyle();
  });

  // Flip buttons (desktop)
  document.getElementById('btnFlipH')?.addEventListener('click', () => {
    S.frameFlipH = !S.frameFlipH;
    document.getElementById('btnFlipH')?.classList.toggle('toggled', S.frameFlipH);
    document.getElementById('fbsBtnFlipH')?.classList.toggle('toggled', S.frameFlipH);
    refreshFrameStyle();
  });
  document.getElementById('btnFlipV')?.addEventListener('click', () => {
    S.frameFlipV = !S.frameFlipV;
    document.getElementById('btnFlipV')?.classList.toggle('toggled', S.frameFlipV);
    document.getElementById('fbsBtnFlipV')?.classList.toggle('toggled', S.frameFlipV);
    refreshFrameStyle();
  });

  // Flip buttons (mobile)
  document.getElementById('fbsBtnFlipH')?.addEventListener('click', () => {
    S.frameFlipH = !S.frameFlipH;
    document.getElementById('btnFlipH')?.classList.toggle('toggled', S.frameFlipH);
    document.getElementById('fbsBtnFlipH')?.classList.toggle('toggled', S.frameFlipH);
    refreshFrameStyle();
  });
  document.getElementById('fbsBtnFlipV')?.addEventListener('click', () => {
    S.frameFlipV = !S.frameFlipV;
    document.getElementById('btnFlipV')?.classList.toggle('toggled', S.frameFlipV);
    document.getElementById('fbsBtnFlipV')?.classList.toggle('toggled', S.frameFlipV);
    refreshFrameStyle();
  });

  // Posisi preset — semua .pos-btn di seluruh halaman
  document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate semua pos-btn
      document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
      // Activate semua yang sama posisi (desktop + mobile)
      document.querySelectorAll(`.pos-btn[data-pos="${btn.dataset.pos}"]`).forEach(b => b.classList.add('active'));
      applyPositionPreset(btn.dataset.pos);
    });
  });

  // Orient filter — semua .orient-btn
  document.querySelectorAll('.orient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Deactivate dalam container yang sama
      btn.closest('.orient-filter')?.querySelectorAll('.orient-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.filterOrient = btn.dataset.orient;
      // Sync container lain
      document.querySelectorAll(`.orient-btn[data-orient="${btn.dataset.orient}"]`).forEach(b => b.classList.add('active'));
      renderFrameGrid();
    });
  });
}

function applyPositionPreset(pos) {
  if (!S.activeFrame) return;
  const cw = photoCanvas.width, ch = photoCanvas.height;
  const hdw = (cw * S.frameScale - cw) / 2;
  const hdh = (ch * S.frameScale - ch) / 2;
  const map = {
    'top-left':     [-hdw, -hdh], 'top-center':    [0, -hdh], 'top-right':    [hdw, -hdh],
    'left-center':  [-hdw, 0],    'center':         [0, 0],    'right-center': [hdw, 0],
    'bottom-left':  [-hdw, hdh],  'bottom-center': [0, hdh],   'bottom-right': [hdw, hdh],
  };
  if (map[pos]) { [S.frameOffX, S.frameOffY] = map[pos]; refreshFrameStyle(); }
}

function resetFrameTransform() {
  S.frameOffX = 0; S.frameOffY = 0;
  S.frameScale = 1; S.frameOpacity = 1;
  S.frameRotate = 0; S.frameFlipH = false; S.frameFlipV = false;

  syncAllSliders();

  // Reset flip buttons
  ['btnFlipH','btnFlipV','fbsBtnFlipH','fbsBtnFlipV'].forEach(id => {
    document.getElementById(id)?.classList.remove('toggled');
  });

  // Reset pos buttons
  document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.pos-btn[data-pos="center"]').forEach(b => b.classList.add('active'));

  refreshFrameStyle();
  showToast('✓ Pengaturan frame di-reset');
}

// ─── BACKGROUND ──────────────────────────────────────────
function setupBackground() {
  // Render swatch ke kedua grid
  ['bgSwatches', 'fbsBgSwatches'].forEach(gridId => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    BG_SWATCHES.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'bg-swatch' + (color === S.bgColor ? ' active' : '');
      btn.style.background = color;
      btn.style.border = color === '#ffffff' ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent';
      btn.title = color;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bg-swatch').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.bg-swatch').forEach(b => {
          if (b.title === color) b.classList.add('active');
        });
        setBgColor(color);
      });
      grid.appendChild(btn);
    });
  });

  // Color picker sync
  ['bgColorPicker', 'fbsBgColorPicker'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => {
      setBgColor(e.target.value);
      document.querySelectorAll('.bg-swatch').forEach(b => b.classList.remove('active'));
    });
  });

  // Padding slider sync
  ['slPadding', 'fbsSlPadding'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => {
      S.padding = parseInt(e.target.value);
      ['valPadding','fbsValPadding'].forEach(vid => {
        const el = document.getElementById(vid); if (el) el.textContent = S.padding + 'px';
      });
      ['slPadding','fbsSlPadding'].forEach(sid => {
        const sl = document.getElementById(sid); if (sl) sl.value = S.padding;
      });
      redrawPhoto(); fitToScreen();
    });
  });
}

function setBgColor(c) {
  S.bgColor = c;
  ['bgColorPicker','fbsBgColorPicker'].forEach(id => {
    const p = document.getElementById(id); if (p) p.value = c;
  });
  redrawPhoto();
}

// ─── UPLOAD FRAME ─────────────────────────────────────────
function setupUpload() {
  ['uploadZone', 'fbsUploadZone'].forEach(zoneId => {
    const zone  = document.getElementById(zoneId);
    if (!zone) return;
    const input = zone.querySelector('input[type="file"]');
    zone.addEventListener('click', () => input?.click());
    if (zoneId === 'uploadZone') {
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
      zone.addEventListener('drop', e => {
        e.preventDefault(); zone.classList.remove('dragover');
        [...e.dataTransfer.files].forEach(handleFrameFile);
      });
    }
    if (input) input.addEventListener('change', e => {
      [...e.target.files].forEach(handleFrameFile); input.value = '';
    });
  });
}

function handleFrameFile(file) {
  if (!file) return;
  if (file.type !== 'image/png') { showToast('❌ Harus file PNG (transparan)'); return; }
  if (file.size > 8 * 1024 * 1024) { showToast('❌ File terlalu besar! Maks 8MB'); return; }

  showToast('⏳ Memproses frame…');
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    try {
      const orient  = img.naturalWidth >= img.naturalHeight ? 'landscape' : 'portrait';
      const localId = 'local-' + Date.now();
      const frameObj = {
        id: localId, name: cleanFileName(file.name), orient,
        src: objectUrl, thumb: objectUrl, _objUrl: objectUrl
      };
      S.frames.push(frameObj);
      renderFrameGrid();
      showToast('✓ Frame berhasil ditambahkan!');
      uploadToServer(file, frameObj);
    } catch (err) {
      console.error(err); URL.revokeObjectURL(objectUrl);
      showToast('❌ Kesalahan saat memproses');
    }
  };
  img.onerror = () => { URL.revokeObjectURL(objectUrl); showToast('❌ File PNG tidak valid'); };
  img.src = objectUrl;
}

function cleanFileName(fn) {
  return fn.replace(/\.png$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()).trim() || 'Custom Frame';
}

async function uploadToServer(file, frameObj) {
  const fd = new FormData();
  fd.append('frame', file); fd.append('name', frameObj.name);
  try {
    const res  = await fetch('api/upload_frame.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      const idx = S.frames.findIndex(f => f.id === frameObj.id);
      if (idx !== -1) S.frames[idx] = {
        id: 'srv-' + data.frame_id, srvId: data.frame_id,
        name: data.name, orient: data.orient || frameObj.orient,
        src: data.path, thumb: data.thumbnail || data.path
      };
      if (S.activeFrame?.id === frameObj.id) {
        S.activeFrame.id = 'srv-' + data.frame_id;
        S.activeFrame.srvId = data.frame_id;
      }
      renderFrameGrid(); showToast('☁️ Frame tersimpan ke server');
    } else {
      showToast('⚠️ Tersimpan lokal (' + (data.error || 'server error') + ')');
    }
  } catch(e) {
    showToast('⚠️ Tersimpan lokal (server tidak tersedia)');
  }
}

async function deleteFrame(localId, srvId) {
  if (srvId) try { await fetch(`api/frames.php?id=${srvId}`, { method: 'DELETE' }); } catch(e) {}
  const f = S.frames.find(f => f.id === localId);
  if (f?._objUrl) URL.revokeObjectURL(f._objUrl);
  S.frames = S.frames.filter(f => f.id !== localId);
  if (S.activeFrame?.id === localId) removeActiveFrame();
  renderFrameGrid(); showToast('🗑 Frame dihapus');
}

// ─── RENDER FRAME TO CANVAS (export) ─────────────────────
function renderFrameToCanvas(octx, oc) {
  if (!S.activeFrame?.img) return;
  const img = S.activeFrame.img;
  const cw = oc.width, ch = oc.height;
  const fw = img.naturalWidth || cw, fh = img.naturalHeight || ch;
  const containScale = Math.min(cw / fw, ch / fh);
  const drawW = fw * containScale * S.frameScale;
  const drawH = fh * containScale * S.frameScale;

  octx.save();
  octx.globalAlpha = S.frameOpacity;
  octx.translate(cw / 2 + S.frameOffX, ch / 2 + S.frameOffY);
  octx.rotate(S.frameRotate * Math.PI / 180);
  octx.scale(S.frameFlipH ? -1 : 1, S.frameFlipV ? -1 : 1);
  octx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  octx.restore();
}

// ─── DOWNLOAD PREVIEW ────────────────────────────────────
async function downloadPreview() {
  showToast('⏳ Menyiapkan preview…');
  const oc = document.createElement('canvas');
  oc.width = photoCanvas.width; oc.height = photoCanvas.height;
  const octx = oc.getContext('2d');
  octx.drawImage(photoCanvas, 0, 0);
  renderFrameToCanvas(octx, oc);
  oc.toBlob(blob => {
    if (!blob) { showToast('❌ Gagal buat preview'); return; }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'balisadhu-preview.jpg'; link.href = url; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    showToast('✓ Preview didownload');
  }, 'image/jpeg', 0.92);
}
document.getElementById('btnDownload')?.addEventListener('click', downloadPreview);

// ─── TOAST ───────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── BOTTOM SHEET (Mobile) ───────────────────────────────
function setupBottomSheet() {
  const sheet = document.getElementById('frameBottomSheet');
  if (!sheet) return;

  // Handle click — toggle expand
  document.getElementById('fbsHandle')?.addEventListener('click', () => {
    sheet.classList.toggle('expanded');
  });

  // Tab button juga expand
  document.getElementById('fbsMainBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    if (!sheet.classList.contains('expanded')) sheet.classList.add('expanded');
  });
}

// ─── EXPOSE GLOBALS ──────────────────────────────────────
window.removeActiveFrame   = removeActiveFrame;
window.resetFrameTransform = resetFrameTransform;
window.goToPrint           = goToPrint;