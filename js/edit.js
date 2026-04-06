/* ============================================================
   edit.js — Bali Sadhu Photo | Image Editor Logic
   v6.0 — Simplified: Single "Edit" tab
           Basic adjustments (7 sliders) + Crop merged
           Removed: Histogram, Filters, Color, Detail/Info sections
   ============================================================ */

// ─── PRINT SIZE DEFINITIONS ───────────────────────────────
const PRINT_SIZES = [
  { id: '4R',   label: '4R',   w: 4,  h: 6,   desc: '4 × 6 in',   px: { w: 1200, h: 1800 } },
  { id: '6R',   label: '6R',   w: 6,  h: 8,   desc: '6 × 8 in',   px: { w: 1800, h: 2400 } },
  { id: '8R',   label: '8R',   w: 8,  h: 10,  desc: '8 × 10 in',  px: { w: 2400, h: 3000 } },
  { id: '10R',  label: '10R',  w: 10, h: 12,  desc: '10 × 12 in', px: { w: 3000, h: 3600 } },
  { id: '10Rs', label: '10Rs', w: 10, h: 15,  desc: '10 × 15 in', px: { w: 3000, h: 4500 } },
  { id: '12R',  label: '12R',  w: 12, h: 15,  desc: '12 × 15 in', px: { w: 3600, h: 4500 } },
  { id: '12Rs', label: '12Rs', w: 12, h: 18,  desc: '12 × 18 in', px: { w: 3600, h: 5400 } },
];

// ─── STATE ────────────────────────────────────────────────
const state = {
  originalImage: null,
  trueOriginalImage: null,
  previewImage: null,
  previewScale: 1,
  fileName: '',
  fileSize: 0,
  fileType: '',
  photoId: null,

  rotation: 0, flipH: false, flipV: false,
  zoom: 1, panX: 0, panY: 0,

  // Basic adjustments only
  brightness: 0, contrast: 0, saturation: 0, warmth: 0,
  exposure: 0, highlights: 0, shadows: 0,

  cropMode: false, cropSizeId: '4R', cropOrientation: 'portrait',
  renderPending: false,

  _touchStartX: 0, _touchStartY: 0,
  _touchStartPX: 0, _touchStartPY: 0,
  _lastPinchDist: 0,
};

// ─── HISTORY ──────────────────────────────────────────────
const history = { stack: [], pointer: -1, _saving: false };

function snapshotState(includeImage = false) {
  return {
    brightness: state.brightness, contrast: state.contrast,
    saturation: state.saturation, warmth: state.warmth,
    exposure: state.exposure, highlights: state.highlights,
    shadows: state.shadows,
    rotation: state.rotation, flipH: state.flipH, flipV: state.flipV,
    cropSizeId: state.cropSizeId, cropOrientation: state.cropOrientation,
    imageDataURL: includeImage && state.originalImage ? imageToDataURL(state.originalImage) : null,
  };
}

function imageToDataURL(img) {
  const tmp = document.createElement('canvas');
  tmp.width = img.naturalWidth; tmp.height = img.naturalHeight;
  const c = tmp.getContext('2d');
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(img, 0, 0);
  return tmp.toDataURL('image/jpeg', 0.88);
}

const MAX_HISTORY = 20;

function pushHistory(includeImage = false) {
  if (history._saving) return;
  history.stack.splice(history.pointer + 1);
  history.stack.push(snapshotState(includeImage));
  if (history.stack.length > MAX_HISTORY) {
    history.stack.shift();
  } else {
    history.pointer = history.stack.length - 1;
  }
  history.pointer = history.stack.length - 1;
  updateUndoRedoBtns();
}

function undo() { if (history.pointer <= 0) return; history.pointer--; restoreSnapshot(history.stack[history.pointer]); }
function redo() { if (history.pointer >= history.stack.length - 1) return; history.pointer++; restoreSnapshot(history.stack[history.pointer]); }

function restoreSnapshot(snap) {
  if (!snap) return;
  history._saving = true;
  if (snap.imageDataURL) {
    loadImageFromSrc(snap.imageDataURL, (img) => {
      state.originalImage = img;
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      applySnapAdjustments(snap);
      history._saving = false;
      setZoomFit(); scheduleRender();
    });
  } else {
    applySnapAdjustments(snap);
    history._saving = false;
    scheduleRender();
  }
}

function applySnapAdjustments(snap) {
  ['brightness','contrast','saturation','warmth','exposure','highlights','shadows'].forEach(k => {
    state[k] = snap[k] ?? 0;
    const sl = document.getElementById(`sl-${k}`); if (sl) sl.value = state[k];
    const val = document.getElementById(`val-${k}`); if (val) val.textContent = formatSliderVal(k, state[k]);
  });
  state.rotation = snap.rotation ?? 0; state.flipH = snap.flipH ?? false; state.flipV = snap.flipV ?? false;
  state.cropSizeId = snap.cropSizeId ?? '4R'; state.cropOrientation = snap.cropOrientation ?? 'portrait';
  document.querySelectorAll('.crop-preset-btn').forEach(b => b.classList.toggle('active', b.dataset.id === state.cropSizeId));
  setOrientation(state.cropOrientation);
  updateCropSizeInfo(); updateUndoRedoBtns();
}

function formatSliderVal(key, v) {
  return (v >= 0 ? `+${Math.round(v)}` : `${Math.round(v)}`);
}

function updateUndoRedoBtns() {
  const u = document.getElementById('btnUndo'); if (u) u.disabled = history.pointer <= 0;
  const r = document.getElementById('btnRedo'); if (r) r.disabled = history.pointer >= history.stack.length - 1;
}

// ─── DOM ──────────────────────────────────────────────────
const canvas        = document.getElementById('mainCanvas');
const ctx           = canvas.getContext('2d', { willReadFrequently: true });
const canvasWrapper = document.getElementById('canvasWrapper');
const zoomLevelEl   = document.getElementById('zoomLevel');

// ─── INIT ─────────────────────────────────────────────────
(function init() {
  loadImageFromSession();
  setupSliders(); setupToolbarButtons();
  setupZoom(); setupPan(); setupTouchPanZoom();
  setupCrop(); buildCropPresetButtons(); setupCropPresetEvents();
  setupKeyboardShortcuts(); setupBottomSheet(); loadSessionFromServer();
})();

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if ((e.ctrlKey||e.metaKey) && e.key==='z') { e.preventDefault(); undo(); }
    if ((e.ctrlKey||e.metaKey) && (e.key==='y'||(e.shiftKey&&e.key==='z'))) { e.preventDefault(); redo(); }
  });
}

// ─── BOTTOM SHEET (mobile) ────────────────────────────────
function setupBottomSheet() {
  const sheet = document.getElementById('bottomSheet'); if (!sheet) return;
  document.getElementById('sheetHandle').addEventListener('click', () => sheet.classList.toggle('expanded'));
  // Single tab — no switching needed, but keep event handler for future safety
  document.querySelectorAll('.sheet-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.sheet-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sheet-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`sheet-${btn.dataset.tab}`); if (panel) panel.classList.add('active');
      if (!sheet.classList.contains('expanded')) sheet.classList.add('expanded');
    });
  });
  syncSheetSliders();
}

function syncSheetSliders() {
  document.querySelectorAll('.sheet-slider').forEach(sl => {
    const key = sl.dataset.adj; if (!key) return;
    sl.value = state[key] || 0;
    sl.addEventListener('input', () => {
      const v = parseFloat(sl.value); state[key] = v;
      const mainSl = document.getElementById(`sl-${key}`); if (mainSl) mainSl.value = v;
      const valEl  = document.getElementById(`val-${key}`);  if (valEl)  valEl.textContent  = formatSliderVal(key, v);
      const sValEl = document.getElementById(`sval-${key}`); if (sValEl) sValEl.textContent = formatSliderVal(key, v);
      scheduleRender();
      clearTimeout(sl._th); sl._th = setTimeout(() => pushHistory(), 600);
    });
  });
}

// ─── LOAD SESSION FROM SERVER ─────────────────────────────
async function loadSessionFromServer() {
  const photoId = sessionStorage.getItem('bsp_photoId'); if (!photoId) return;
  state.photoId = parseInt(photoId);
  try {
    const res = await fetch(`api/history.php?photo_id=${photoId}&latest=1`);
    const data = await res.json();
    if (data.success && data.session?.edit_data) restoreEditState(data.session.edit_data);
  } catch (e) { console.warn('Tidak bisa load session:', e); }
}

function restoreEditState(ed) {
  ['brightness','contrast','saturation','warmth','exposure','highlights','shadows'].forEach(k => {
    if (ed[k] !== undefined) {
      state[k] = ed[k];
      const sl = document.getElementById(`sl-${k}`); if (sl) sl.value = ed[k];
      const val = document.getElementById(`val-${k}`); if (val) val.textContent = formatSliderVal(k, ed[k]);
    }
  });
  if (ed.rotation !== undefined) state.rotation = ed.rotation;
  if (ed.flipH !== undefined) state.flipH = ed.flipH;
  if (ed.flipV !== undefined) state.flipV = ed.flipV;
  if (ed.cropSizeId !== undefined) {
    state.cropSizeId = ed.cropSizeId;
    document.querySelectorAll('.crop-preset-btn').forEach(b => b.classList.toggle('active', b.dataset.id === state.cropSizeId));
  }
  if (ed.cropOrientation !== undefined) setOrientation(ed.cropOrientation);
  scheduleRender();
}

async function saveSessionToServer(status = 'editing') {
  if (!state.photoId) return;
  try {
    await fetch('api/save_edit.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photo_id: state.photoId, status,
        edit_data: {
          brightness: state.brightness, contrast: state.contrast, saturation: state.saturation,
          warmth: state.warmth, exposure: state.exposure, highlights: state.highlights,
          shadows: state.shadows,
          rotation: state.rotation, flipH: state.flipH, flipV: state.flipV,
          cropSizeId: state.cropSizeId, cropOrientation: state.cropOrientation,
        }
      }),
    });
  } catch (e) { console.warn('Gagal simpan sesi:', e); }
}

// ─── LOAD IMAGE ───────────────────────────────────────────
function loadImageFromSession() {
  const serverPath = sessionStorage.getItem('bsp_serverPath');
  const base64Src  = sessionStorage.getItem('bsp_imageSrc');
  const name = sessionStorage.getItem('bsp_imageName') || 'image.jpg';
  const size = sessionStorage.getItem('bsp_imageSize') || 0;
  const type = sessionStorage.getItem('bsp_imageType') || 'image/jpeg';

  if (!serverPath && !base64Src) {
    showToast('Tidak ada foto, kembali ke halaman utama...');
    setTimeout(() => { window.location.href = 'index.php'; }, 1500);
    return;
  }

  state.fileName = name; state.fileSize = parseInt(size); state.fileType = type;
  state.photoId = parseInt(sessionStorage.getItem('bsp_photoId') || '0') || null;

  const el = document.getElementById('imageFileName'); if (el) el.textContent = name;

  showLoadingOverlay(true);

  const tryLoad = (src, fallback) => {
    loadImageFromSrc(src, (img) => {
      onImageReady(img);
      showLoadingOverlay(false);
    }, () => {
      if (fallback) {
        showToast('Menggunakan cache lokal...');
        loadImageFromSrc(fallback, (img) => {
          onImageReady(img); showLoadingOverlay(false);
        }, () => { showLoadingOverlay(false); redirectToIndex(); });
      } else {
        showLoadingOverlay(false); redirectToIndex();
      }
    });
  };

  if (serverPath) {
    tryLoad(serverPath.startsWith('http') ? serverPath : serverPath, base64Src || null);
  } else {
    tryLoad(base64Src, null);
  }
}

function redirectToIndex() {
  showToast('Gagal memuat gambar, kembali ke halaman utama...');
  setTimeout(() => { window.location.href = 'index.php'; }, 1500);
}

function loadImageFromSrc(src, onLoad, onError) {
  const img = new Image();
  img.onload  = () => { if (typeof onLoad === 'function') onLoad(img); };
  img.onerror = () => { if (typeof onError === 'function') onError(); };
  img.src = src;
}

async function onImageReady(img) {
  state.trueOriginalImage = img;
  state.previewImage = await createPreviewImage(img);
  state.originalImage = state.previewImage;
  state.previewScale = state.previewImage.naturalWidth / img.naturalWidth;

  canvas.width  = state.previewImage.naturalWidth;
  canvas.height = state.previewImage.naturalHeight;
  setZoomFit(); renderCanvas(); pushHistory(true);
}

function createPreviewImage(img) {
  const MAX = 1400;
  const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  if (scale >= 1) return Promise.resolve(img);

  const tmp = document.createElement('canvas');
  tmp.width  = Math.round(img.naturalWidth  * scale);
  tmp.height = Math.round(img.naturalHeight * scale);
  const tc = tmp.getContext('2d');
  tc.imageSmoothingEnabled = true; tc.imageSmoothingQuality = 'high';
  tc.drawImage(img, 0, 0, tmp.width, tmp.height);

  return new Promise((resolve) => {
    const preview = new Image();
    preview.onload = () => resolve(preview);
    preview.src = tmp.toDataURL('image/jpeg', 0.92);
  });
}

function showLoadingOverlay(show) {
  let o = document.getElementById('loadingOverlay');
  if (!o) {
    o = document.createElement('div'); o.id = 'loadingOverlay';
    o.style.cssText = `position:fixed;inset:0;background:rgba(17,17,17,0.88);display:flex;
      flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:16px;
      font-family:'DM Sans',sans-serif;color:#E8E0D0;font-size:14px;`;
    o.innerHTML = `<div style="width:44px;height:44px;border:3px solid #333;border-top-color:#C9A84C;
      border-radius:50%;animation:bspSpin 0.8s linear infinite;"></div>
      <span>Memuat foto...</span>
      <style>@keyframes bspSpin{to{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(o);
  }
  o.style.display = show ? 'flex' : 'none';
}

// ─── RENDER ───────────────────────────────────────────────
function scheduleRender() {
  if (state.renderPending) return;
  state.renderPending = true;
  requestAnimationFrame(() => {
    state.renderPending = false;
    renderCanvas();
  });
}

function renderCanvas() {
  if (!state.originalImage) return;
  const img = state.originalImage, srcW = img.naturalWidth, srcH = img.naturalHeight;
  const off = new OffscreenCanvas(srcW, srcH);
  const offCtx = off.getContext('2d', { willReadFrequently: true });
  offCtx.imageSmoothingEnabled = true; offCtx.imageSmoothingQuality = 'high';
  offCtx.drawImage(img, 0, 0);

  let id = offCtx.getImageData(0, 0, srcW, srcH);
  id = applyPixelAdjustments(id);
  offCtx.putImageData(id, 0, 0);

  const rotated = (state.rotation===90||state.rotation===270);
  canvas.width = rotated ? srcH : srcW; canvas.height = rotated ? srcW : srcH;
  ctx.save();
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(state.rotation * Math.PI / 180);
  if (state.flipH) ctx.scale(-1,1);
  if (state.flipV) ctx.scale(1,-1);
  ctx.drawImage(off, -srcW/2, -srcH/2);
  ctx.restore();
  updateCanvasTransform();
}

// ─── PIXEL ADJUSTMENTS (Basic 7 only) ────────────────────
function applyPixelAdjustments(imageData) {
  const data=imageData.data, len=data.length;
  const bright=state.brightness/100, cont=state.contrast, sat=state.saturation/100;
  const warm=state.warmth/100, expo=state.exposure/100;
  const high=state.highlights/100, shad=state.shadows/100;
  const contFactor = cont!==0 ? (259*(cont+255))/(255*(259-cont)) : 1;

  for (let i=0;i<len;i+=4) {
    let r=data[i],g=data[i+1],b=data[i+2];
    if(expo!==0){const ef=Math.pow(2,expo*1.5);r=clamp(r*ef);g=clamp(g*ef);b=clamp(b*ef);}
    if(bright!==0){const bf=bright*255;r=clamp(r+bf);g=clamp(g+bf);b=clamp(b+bf);}
    if(cont!==0){r=clamp(contFactor*(r-128)+128);g=clamp(contFactor*(g-128)+128);b=clamp(contFactor*(b-128)+128);}
    const lum=(r*0.299+g*0.587+b*0.114)/255;
    if(high!==0&&lum>0.5){const hf=(lum-0.5)*2*high*90;r=clamp(r+hf);g=clamp(g+hf);b=clamp(b+hf);}
    if(shad!==0&&lum<0.5){const sf=(0.5-lum)*2*shad*90;r=clamp(r+sf);g=clamp(g+sf);b=clamp(b+sf);}
    if(warm!==0){r=clamp(r+warm*45);b=clamp(b-warm*45);g=clamp(g+warm*8);}
    if(sat!==0){const gray=r*0.299+g*0.587+b*0.114;r=clamp(gray+(r-gray)*(1+sat));g=clamp(gray+(g-gray)*(1+sat));b=clamp(gray+(b-gray)*(1+sat));}
    data[i]=r;data[i+1]=g;data[i+2]=b;
  }
  return imageData;
}

function clamp(v){return v<0?0:v>255?255:Math.round(v);}

// ─── ZOOM ─────────────────────────────────────────────────
function setupZoom() {
  document.getElementById('btnZoomIn').addEventListener('click',()=>setZoom(state.zoom*1.25));
  document.getElementById('btnZoomOut').addEventListener('click',()=>setZoom(state.zoom/1.25));
  document.getElementById('btnZoomFit').addEventListener('click',setZoomFit);
  canvasWrapper.addEventListener('wheel',(e)=>{e.preventDefault();setZoom(state.zoom*(e.deltaY>0?0.9:1.1));},{passive:false});
}

function setZoomFit() {
  if (!state.originalImage) { state.zoom=1; state.panX=0; state.panY=0; updateCanvasTransform(); return; }
  const availW=canvasWrapper.clientWidth-40, availH=canvasWrapper.clientHeight-40;
  const cw=canvas.width||state.originalImage.naturalWidth, ch=canvas.height||state.originalImage.naturalHeight;
  state.zoom=Math.min(availW/cw, availH/ch, 1);
  state.panX=0; state.panY=0; updateCanvasTransform();
}

function setZoom(z) { state.zoom=Math.max(0.05,Math.min(10,z)); updateCanvasTransform(); }
function updateCanvasTransform() {
  canvas.style.transform=`translate(${state.panX}px,${state.panY}px) scale(${state.zoom})`;
  if(zoomLevelEl) zoomLevelEl.textContent=Math.round(state.zoom*100)+'%';
}

// ─── MOUSE PAN ────────────────────────────────────────────
function setupPan() {
  let dragging=false,startX,startY,startPX,startPY;
  canvasWrapper.addEventListener('mousedown',(e)=>{if(state.cropMode)return;dragging=true;startX=e.clientX;startY=e.clientY;startPX=state.panX;startPY=state.panY;canvasWrapper.style.cursor='grabbing';});
  document.addEventListener('mousemove',(e)=>{if(!dragging)return;state.panX=startPX+(e.clientX-startX);state.panY=startPY+(e.clientY-startY);updateCanvasTransform();});
  document.addEventListener('mouseup',()=>{dragging=false;canvasWrapper.style.cursor=state.cropMode?'default':'grab';});
}

// ─── TOUCH ────────────────────────────────────────────────
function setupTouchPanZoom() {
  canvasWrapper.addEventListener('touchstart',onTouchStart,{passive:false});
  canvasWrapper.addEventListener('touchmove',onTouchMove,{passive:false});
  canvasWrapper.addEventListener('touchend',onTouchEnd,{passive:true});
}
function getTouchDist(t){const dx=t[0].clientX-t[1].clientX,dy=t[0].clientY-t[1].clientY;return Math.sqrt(dx*dx+dy*dy);}
function onTouchStart(e){if(state.cropMode)return;if(e.touches.length===1){state._touchStartX=e.touches[0].clientX;state._touchStartY=e.touches[0].clientY;state._touchStartPX=state.panX;state._touchStartPY=state.panY;}else if(e.touches.length===2){state._lastPinchDist=getTouchDist(e.touches);}}
function onTouchMove(e){if(state.cropMode)return;e.preventDefault();if(e.touches.length===1){state.panX=state._touchStartPX+(e.touches[0].clientX-state._touchStartX);state.panY=state._touchStartPY+(e.touches[0].clientY-state._touchStartY);updateCanvasTransform();}else if(e.touches.length===2){const dist=getTouchDist(e.touches);if(state._lastPinchDist>0)setZoom(state.zoom*(dist/state._lastPinchDist));state._lastPinchDist=dist;}}
function onTouchEnd(){state._lastPinchDist=0;}

// ─── TOOLBAR BUTTONS ──────────────────────────────────────
function setupToolbarButtons() {
  document.getElementById('btnRotateCCW').addEventListener('click',()=>{state.rotation=(state.rotation-90+360)%360;scheduleRender();pushHistory();});
  document.getElementById('btnRotateCW').addEventListener('click',()=>{state.rotation=(state.rotation+90)%360;scheduleRender();pushHistory();});
  document.getElementById('btnFlipH').addEventListener('click',()=>{state.flipH=!state.flipH;scheduleRender();pushHistory();});
  document.getElementById('btnFlipV').addEventListener('click',()=>{state.flipV=!state.flipV;scheduleRender();pushHistory();});
  document.getElementById('btnReset').addEventListener('click',resetToTrueOriginal);
  document.getElementById('btnCrop').addEventListener('click',toggleCropMode);
  document.getElementById('btnUndo')?.addEventListener('click',undo);
  document.getElementById('btnRedo')?.addEventListener('click',redo);
}

// ─── RESET ────────────────────────────────────────────────
async function resetToTrueOriginal() {
  if (!state.trueOriginalImage) return;
  if (!window.confirm('Reset akan mengembalikan foto ke kondisi awal. Lanjutkan?')) return;

  ['brightness','contrast','saturation','warmth','exposure','highlights','shadows'].forEach(k=>{
    state[k]=0;
    const sl=document.getElementById(`sl-${k}`);if(sl)sl.value=0;
    const val=document.getElementById(`val-${k}`);if(val)val.textContent=formatSliderVal(k,0);
    // sync bottom sheet sliders
    const sheetSl = document.querySelector(`.sheet-slider[data-adj="${k}"]`);if(sheetSl)sheetSl.value=0;
    const sVal = document.getElementById(`sval-${k}`);if(sVal)sVal.textContent=formatSliderVal(k,0);
  });
  state.rotation=0;state.flipH=false;state.flipV=false;
  state.cropSizeId='4R';state.cropOrientation='portrait';
  state.previewImage  = await createPreviewImage(state.trueOriginalImage);
  state.originalImage = state.previewImage;
  state.previewScale  = state.previewImage.naturalWidth / state.trueOriginalImage.naturalWidth;
  canvas.width  = state.previewImage.naturalWidth;
  canvas.height = state.previewImage.naturalHeight;
  document.querySelectorAll('.crop-preset-btn').forEach(b=>b.classList.toggle('active',b.dataset.id==='4R'));
  setOrientation('portrait');
  cancelCrop(); setZoomFit();
  scheduleRender();
  history.stack=[]; history.pointer=-1; pushHistory();
  showToast('Foto dikembalikan ke kondisi awal ✓');
}

// ─── SLIDERS ──────────────────────────────────────────────
function setupSliders() {
  let timer = null;
  document.querySelectorAll('.slider[data-adj]').forEach(sl => {
    const key = sl.dataset.adj;
    sl.addEventListener('input', () => {
      const v = parseFloat(sl.value); state[key] = v;
      const valEl = document.getElementById(`val-${key}`); if (valEl) valEl.textContent = formatSliderVal(key, v);
      // sync bottom sheet
      const sheetSl = document.querySelector(`.sheet-slider[data-adj="${key}"]`); if (sheetSl) sheetSl.value = v;
      const sValEl = document.getElementById(`sval-${key}`); if (sValEl) sValEl.textContent = formatSliderVal(key, v);
      scheduleRender();
      clearTimeout(timer);
      timer = setTimeout(() => pushHistory(), 600);
    });
  });
}

// ─── CROP ─────────────────────────────────────────────────
function buildCropPresetButtons() {
  document.querySelectorAll('#cropPresets').forEach(grid=>{
    grid.innerHTML='';
    PRINT_SIZES.forEach(size=>{
      const btn=document.createElement('button');
      btn.className='crop-preset-btn'+(size.id===state.cropSizeId?' active':'');
      btn.dataset.id=size.id; btn.textContent=size.label; btn.title=size.desc;
      grid.appendChild(btn);
    });
  });
}

function setupCropPresetEvents() {
  document.querySelectorAll('#cropPresets').forEach(container=>{
    container.addEventListener('click',(e)=>{
      const btn=e.target.closest('.crop-preset-btn'); if(!btn)return;
      document.querySelectorAll('.crop-preset-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); state.cropSizeId=btn.dataset.id; updateCropSizeInfo();
      if(state.cropMode){enforceCropAspect();updateCropBox();}
    });
  });
  document.querySelectorAll('#btnOrientPortrait').forEach(btn=>btn.addEventListener('click',()=>setOrientation('portrait')));
  document.querySelectorAll('#btnOrientLandscape').forEach(btn=>btn.addEventListener('click',()=>setOrientation('landscape')));
  document.querySelectorAll('#btnAutoCrop').forEach(btn=>btn.addEventListener('click',applyAutoCrop));
  document.querySelectorAll('#btnCropManualOpen').forEach(btn=>btn.addEventListener('click',()=>{if(!state.cropMode)toggleCropMode();}));
  document.querySelectorAll('#btnCropApply').forEach(btn=>btn.addEventListener('click',applyManualCrop));
  document.querySelectorAll('#btnCropCancel').forEach(btn=>btn.addEventListener('click',cancelCrop));
}

function setupCrop(){initCropDrag();}

function setOrientation(orient) {
  state.cropOrientation=orient;
  document.querySelectorAll('#btnOrientPortrait').forEach(btn=>btn.classList.toggle('active',orient==='portrait'));
  document.querySelectorAll('#btnOrientLandscape').forEach(btn=>btn.classList.toggle('active',orient==='landscape'));
  updateCropSizeInfo(); if(state.cropMode){enforceCropAspect();updateCropBox();}
}

function getActivePrintSize(){return PRINT_SIZES.find(s=>s.id===state.cropSizeId)||PRINT_SIZES[0];}
function getCropRatio(){const size=getActivePrintSize();const pw=state.cropOrientation==='portrait'?Math.min(size.w,size.h):Math.max(size.w,size.h);const ph=state.cropOrientation==='portrait'?Math.max(size.w,size.h):Math.min(size.w,size.h);return{rw:pw,rh:ph};}

function updateCropSizeInfo() {
  const size=getActivePrintSize(),{rw,rh}=getCropRatio();
  document.querySelectorAll('#cropSizeLabel').forEach(el=>el.textContent=`${size.label} — ${size.desc}`);
  document.querySelectorAll('#cropSizeDim').forEach(el=>el.textContent=`Rasio ${rw}:${rh}`);
}

function applyAutoCrop() {
  if (!state.trueOriginalImage) return;
  const {rw,rh} = getCropRatio();
  const src = state.trueOriginalImage;
  const srcW = src.naturalWidth, srcH = src.naturalHeight;
  const targetRatio = rw/rh, currentRatio = srcW/srcH;
  let cropW,cropH,cropX,cropY;
  if (currentRatio > targetRatio) {
    cropH=srcH; cropW=Math.round(srcH*targetRatio);
    cropX=Math.round((srcW-cropW)/2); cropY=0;
  } else {
    cropW=srcW; cropH=Math.round(srcW/targetRatio);
    cropX=0; cropY=Math.round((srcH-cropH)/2);
  }
  const tmp=document.createElement('canvas'); tmp.width=cropW; tmp.height=cropH;
  const tc=tmp.getContext('2d'); tc.imageSmoothingEnabled=true; tc.imageSmoothingQuality='high';
  tc.drawImage(src, cropX,cropY,cropW,cropH, 0,0,cropW,cropH);
  loadImageFromSrc(tmp.toDataURL('image/png'), async (newFullRes) => {
    state.trueOriginalImage = newFullRes;
    state.previewImage = await createPreviewImage(newFullRes);
    state.originalImage = state.previewImage;
    state.previewScale = state.previewImage.naturalWidth / newFullRes.naturalWidth;
    canvas.width  = state.previewImage.naturalWidth;
    canvas.height = state.previewImage.naturalHeight;
    showToast(`Auto crop ${getActivePrintSize().label} berhasil ✓`);
    cancelCrop(); setZoomFit(); scheduleRender(); pushHistory(true);
  });
}

let cropRect={x:0,y:0,w:0,h:0},cropDragging=false,cropHandle=null,cropStart=null;

function toggleCropMode() {
  if(!state.originalImage)return;
  state.cropMode=!state.cropMode;
  document.getElementById('btnCrop').classList.toggle('active',state.cropMode);
  const overlay=document.getElementById('cropOverlay');
  if(state.cropMode){overlay.classList.remove('hidden');initCropBox();}else{overlay.classList.add('hidden');}
}

function initCropBox() {
  const wRect=canvasWrapper.getBoundingClientRect(), cRect=canvas.getBoundingClientRect();
  const {rw,rh}=getCropRatio(), maxW=cRect.width*0.8, maxH=cRect.height*0.8;
  let boxW,boxH;
  if(maxW/rw*rh<=maxH){boxW=maxW;boxH=maxW/rw*rh;}else{boxH=maxH;boxW=maxH/rh*rw;}
  cropRect={x:cRect.left-wRect.left+(cRect.width-boxW)/2,y:cRect.top-wRect.top+(cRect.height-boxH)/2,w:boxW,h:boxH};
  updateCropBox();
}

function enforceCropAspect(){const{rw,rh}=getCropRatio();cropRect.h=cropRect.w*(rh/rw);}
function updateCropBox(){const box=document.getElementById('cropBox');if(!box)return;box.style.left=cropRect.x+'px';box.style.top=cropRect.y+'px';box.style.width=cropRect.w+'px';box.style.height=cropRect.h+'px';}

function initCropDrag() {
  document.addEventListener('mousemove',onCropMove);
  document.addEventListener('mouseup',()=>{cropDragging=false;cropHandle=null;});
  document.addEventListener('mousedown',(e)=>{
    const handle=e.target.closest('.crop-handle'), box=e.target.closest('#cropBox');
    if(!state.cropMode)return;
    if(handle){e.stopPropagation();cropHandle=[...handle.classList].find(c=>['tl','tr','bl','br'].includes(c));cropStart={x:e.clientX,y:e.clientY,rect:{...cropRect}};cropDragging=true;}
    else if(box){cropHandle='move';cropStart={x:e.clientX,y:e.clientY,rect:{...cropRect}};cropDragging=true;}
  });
}

function onCropMove(e) {
  if(!cropDragging||!cropHandle)return;
  const dx=e.clientX-cropStart.x, dy=e.clientY-cropStart.y, r=cropStart.rect, {rw,rh}=getCropRatio();
  if(cropHandle==='move'){cropRect.x=r.x+dx;cropRect.y=r.y+dy;}
  else{
    if(cropHandle.includes('r')){cropRect.w=Math.max(60,r.w+dx);}
    if(cropHandle.includes('l')){cropRect.x=r.x+dx;cropRect.w=Math.max(60,r.w-dx);}
    if(cropHandle.includes('b')){cropRect.h=Math.max(40,r.h+dy);cropRect.w=cropRect.h/rh*rw;}
    if(cropHandle.includes('t')){cropRect.y=r.y+dy;cropRect.h=Math.max(40,r.h-dy);cropRect.w=cropRect.h/rh*rw;}
    enforceCropAspect();
  }
  updateCropBox();
}

function applyManualCrop() {
  if (!state.trueOriginalImage) return;
  const wRect = canvasWrapper.getBoundingClientRect();
  const cRect = canvas.getBoundingClientRect();
  const fullW = state.trueOriginalImage.naturalWidth;
  const fullH = state.trueOriginalImage.naturalHeight;
  const scaleX = fullW / cRect.width;
  const scaleY = fullH / cRect.height;
  const relX = cropRect.x - (cRect.left - wRect.left);
  const relY = cropRect.y - (cRect.top  - wRect.top);
  const safeX = Math.max(0, Math.round(relX * scaleX));
  const safeY = Math.max(0, Math.round(relY * scaleY));
  const safeW = Math.min(Math.round(cropRect.w * scaleX), fullW - safeX);
  const safeH = Math.min(Math.round(cropRect.h * scaleY), fullH - safeY);
  if (safeW < 10 || safeH < 10) { showToast('Area crop terlalu kecil!'); return; }
  const tmp=document.createElement('canvas'); tmp.width=safeW; tmp.height=safeH;
  const tc=tmp.getContext('2d'); tc.imageSmoothingEnabled=true; tc.imageSmoothingQuality='high';
  tc.drawImage(state.trueOriginalImage, safeX,safeY,safeW,safeH, 0,0,safeW,safeH);
  loadImageFromSrc(tmp.toDataURL('image/png'), async (newFullRes) => {
    state.trueOriginalImage = newFullRes;
    state.previewImage = await createPreviewImage(newFullRes);
    state.originalImage = state.previewImage;
    state.previewScale = state.previewImage.naturalWidth / newFullRes.naturalWidth;
    canvas.width  = state.previewImage.naturalWidth;
    canvas.height = state.previewImage.naturalHeight;
    showToast('Manual crop berhasil ✓');
    cancelCrop(); setZoomFit(); scheduleRender(); pushHistory(true);
  });
}

function cancelCrop(){state.cropMode=false;document.getElementById('btnCrop')?.classList.remove('active');document.getElementById('cropOverlay')?.classList.add('hidden');}

// ─── GO TO FRAME ──────────────────────────────────────────
async function goToFrame() {
  if (!state.trueOriginalImage) return;
  const btnNext = document.getElementById('btnNextFrame');
  if (btnNext) { btnNext.disabled = true; btnNext.textContent = 'Menyiapkan…'; }
  showToast('Merender full-res untuk frame…');
  try {
    const fullResCanvas = renderToFullResCanvas();
    const blob = await canvasToBlob(fullResCanvas, state.fileType);
    const path = await uploadEditedBlob(blob, state.photoId, state.fileType);
    sessionStorage.setItem('bsp_editedPath', path);
    sessionStorage.removeItem('bsp_editedSrc');
    sessionStorage.setItem('bsp_imageName',  state.fileName);
    sessionStorage.setItem('bsp_cropSizeId', state.cropSizeId);
    sessionStorage.setItem('bsp_cropOrient', state.cropOrientation);
    await saveSessionToServer('ready_for_frame');
    window.location.href = 'frame.php';
  } catch (err) {
    console.error('[goToFrame] Error:', err);
    showToast('❌ Gagal: ' + (err.message || 'Error'));
    if (btnNext) { btnNext.disabled = false; btnNext.textContent = 'Next: Frames'; }
  }
}

function renderToFullResCanvas() {
  const img  = state.trueOriginalImage;
  const srcW = img.naturalWidth, srcH = img.naturalHeight;
  const off    = new OffscreenCanvas(srcW, srcH);
  const offCtx = off.getContext('2d', { willReadFrequently: true });
  offCtx.imageSmoothingEnabled = true; offCtx.imageSmoothingQuality = 'high';
  offCtx.drawImage(img, 0, 0);
  let id = offCtx.getImageData(0, 0, srcW, srcH);
  id = applyPixelAdjustments(id);
  offCtx.putImageData(id, 0, 0);
  const rotated = (state.rotation===90||state.rotation===270);
  const out = document.createElement('canvas');
  out.width  = rotated ? srcH : srcW;
  out.height = rotated ? srcW : srcH;
  const outCtx = out.getContext('2d');
  outCtx.imageSmoothingEnabled = true; outCtx.imageSmoothingQuality = 'high';
  outCtx.save();
  outCtx.translate(out.width/2, out.height/2);
  outCtx.rotate(state.rotation * Math.PI / 180);
  if (state.flipH) outCtx.scale(-1,1);
  if (state.flipV) outCtx.scale(1,-1);
  outCtx.drawImage(off, -srcW/2, -srcH/2);
  outCtx.restore();
  return out;
}

function canvasToBlob(canvasEl, mimeType) {
  const outputMime = mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
  const quality    = outputMime === 'image/jpeg' ? 0.92 : undefined;
  return new Promise((resolve, reject) => {
    canvasEl.toBlob(
      (blob) => { if (blob) resolve(blob); else reject(new Error('canvas.toBlob() gagal')); },
      outputMime, quality
    );
  });
}

async function uploadEditedBlob(blob, photoId, mimeType) {
  const format = mimeType === 'image/png' ? 'png' : 'jpeg';
  const ext    = format === 'png' ? 'png' : 'jpg';
  const fd = new FormData();
  fd.append('edited_image', blob, `edited.${ext}`);
  fd.append('format', format);
  if (photoId) fd.append('photo_id', photoId);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'api/save_edited_image.php');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        showToast(`Mengupload hasil edit… ${pct}%`);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success) resolve(data.path);
          else reject(new Error(data.error || 'Server error'));
        } catch (e) { reject(new Error('Response tidak valid dari server')); }
      } else { reject(new Error(`HTTP ${xhr.status}`)); }
    };
    xhr.onerror = () => reject(new Error('Koneksi gagal'));
    xhr.ontimeout = () => reject(new Error('Upload timeout'));
    xhr.timeout = 120000;
    xhr.send(fd);
  });
}

// ─── TOAST ────────────────────────────────────────────────
let _toastTimer=null;
function showToast(msg,duration=2500){
  let toast=document.getElementById('editToast');
  if(!toast){toast=document.createElement('div');toast.id='editToast';toast.style.cssText=`position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(10px);background:#2D5A3D;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.4);transition:all 0.3s ease;opacity:0;pointer-events:none;white-space:nowrap;`;document.body.appendChild(toast);}
  toast.textContent=msg;toast.style.opacity='1';toast.style.transform='translateX(-50%) translateY(0)';
  clearTimeout(_toastTimer);_toastTimer=setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translateX(-50%) translateY(10px)';},duration);
}

// ─── UTILS ────────────────────────────────────────────────
function formatBytes(bytes){if(!bytes||bytes===0)return'—';if(bytes<1024)return bytes+' B';if(bytes<1048576)return(bytes/1024).toFixed(1)+' KB';return(bytes/1048576).toFixed(2)+' MB';}
