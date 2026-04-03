/* ============================================================
   edit.js — Bali Sadhu Photo | Image Editor Logic
   v3.0 — Fixed auto crop, true reset, undo/redo unlimited
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
  originalImage: null,       // gambar aktif (bisa sudah di-crop)
  trueOriginalImage: null,   // gambar asli dari upload — TIDAK PERNAH DIUBAH
  fileName: '',
  fileSize: 0,
  fileType: '',
  sessionId: null,
  photoId: null,

  rotation: 0,
  flipH: false,
  flipV: false,
  zoom: 1,
  panX: 0,
  panY: 0,

  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  hue: 0,
  tint: 0,
  vibrance: 0,
  sharpness: 0,
  vignette: 0,
  noise: 0,
  blur: 0,

  activeFilter: 'none',
  cropMode: false,
  cropSizeId: '4R',
  cropOrientation: 'portrait',
  renderPending: false,
};

// ─── HISTORY (Undo/Redo) ──────────────────────────────────
// Setiap entry: { adjustments, rotation, flipH, flipV, activeFilter,
//                 cropSizeId, cropOrientation, imageDataURL }
// imageDataURL = snapshot originalImage setelah operasi crop
const history = {
  stack: [],      // array of snapshots
  pointer: -1,    // index snapshot aktif
  _saving: false, // guard agar tidak double-push
};

function snapshotState() {
  return {
    brightness: state.brightness, contrast: state.contrast,
    saturation: state.saturation, warmth: state.warmth,
    exposure: state.exposure, highlights: state.highlights,
    shadows: state.shadows, hue: state.hue, tint: state.tint,
    vibrance: state.vibrance, sharpness: state.sharpness,
    vignette: state.vignette, noise: state.noise, blur: state.blur,
    rotation: state.rotation, flipH: state.flipH, flipV: state.flipV,
    activeFilter: state.activeFilter,
    cropSizeId: state.cropSizeId, cropOrientation: state.cropOrientation,
    imageDataURL: state.originalImage ? imageToDataURL(state.originalImage) : null,
  };
}

function imageToDataURL(img) {
  const tmp = document.createElement('canvas');
  tmp.width = img.naturalWidth; tmp.height = img.naturalHeight;
  tmp.getContext('2d').drawImage(img, 0, 0);
  return tmp.toDataURL('image/png');
}

// Panggil ini SETELAH setiap aksi yang ingin bisa di-undo
function pushHistory() {
  if (history._saving) return;
  // Hapus redo entries di atas pointer
  history.stack.splice(history.pointer + 1);
  history.stack.push(snapshotState());
  history.pointer = history.stack.length - 1;
  updateUndoRedoBtns();
}

function undo() {
  if (history.pointer <= 0) return;
  history.pointer--;
  restoreSnapshot(history.stack[history.pointer]);
}

function redo() {
  if (history.pointer >= history.stack.length - 1) return;
  history.pointer++;
  restoreSnapshot(history.stack[history.pointer]);
}

function restoreSnapshot(snap) {
  if (!snap) return;
  history._saving = true;

  // Restore image
  if (snap.imageDataURL) {
    const img = new Image();
    img.onload = () => {
      state.originalImage = img;
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      setDetailText('info-dimensions', `${img.naturalWidth} × ${img.naturalHeight}`);
      applySnapAdjustments(snap);
      history._saving = false;
      fitToScreen(); scheduleRender(); setupFilters();
    };
    img.src = snap.imageDataURL;
  } else {
    applySnapAdjustments(snap);
    history._saving = false;
    scheduleRender();
  }
}

function applySnapAdjustments(snap) {
  const adjs = ['brightness','contrast','saturation','warmth','exposure',
                 'highlights','shadows','hue','tint','vibrance',
                 'sharpness','vignette','noise','blur'];
  adjs.forEach(k => {
    state[k] = snap[k] ?? 0;
    const sl  = document.getElementById(`sl-${k}`);
    const val = document.getElementById(`val-${k}`);
    if (sl)  sl.value = state[k];
    if (val) val.textContent = formatSliderVal(k, state[k]);
  });
  state.rotation     = snap.rotation     ?? 0;
  state.flipH        = snap.flipH        ?? false;
  state.flipV        = snap.flipV        ?? false;
  state.activeFilter = snap.activeFilter ?? 'none';
  state.cropSizeId   = snap.cropSizeId   ?? '4R';
  state.cropOrientation = snap.cropOrientation ?? 'portrait';

  document.querySelectorAll('.filter-item').forEach(el =>
    el.classList.toggle('active', el.dataset.id === state.activeFilter));
  document.querySelectorAll('.crop-preset-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.id === state.cropSizeId));
  setOrientation(state.cropOrientation);
  updateInfoPanel();
  updateCropSizeInfo();
  updateUndoRedoBtns();
}

function formatSliderVal(key, v) {
  const isPos = ['sharpness','vignette','noise','blur'].includes(key);
  return isPos ? Math.round(v) : (v >= 0 ? `+${Math.round(v)}` : `${Math.round(v)}`);
}

function updateUndoRedoBtns() {
  const btnUndo = document.getElementById('btnUndo');
  const btnRedo = document.getElementById('btnRedo');
  if (btnUndo) btnUndo.disabled = history.pointer <= 0;
  if (btnRedo) btnRedo.disabled = history.pointer >= history.stack.length - 1;
}

// ─── DOM REFS ─────────────────────────────────────────────
const canvas        = document.getElementById('mainCanvas');
const ctx           = canvas.getContext('2d', { willReadFrequently: true });
const histCanvas    = document.getElementById('histogramCanvas');
const histCtx       = histCanvas.getContext('2d');
const canvasWrapper = document.getElementById('canvasWrapper');
const zoomLevelEl   = document.getElementById('zoomLevel');

// ─── INIT ─────────────────────────────────────────────────
(function init() {
  loadImageFromSession();
  setupTabSwitching();
  setupSliders();
  setupToolbarButtons();
  setupZoom();
  setupPan();
  setupCrop();
  buildCropPresetButtons();
  setupCropPresetEvents();
  setupKeyboardShortcuts();
  loadSessionFromServer();
})();

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
  });
}

// ─── LOAD SESSION FROM SERVER ─────────────────────────────
async function loadSessionFromServer() {
  const photoId = sessionStorage.getItem('bsp_photoId');
  if (!photoId) return;
  state.photoId = parseInt(photoId);
  try {
    const res  = await fetch(`api/history.php?photo_id=${photoId}&latest=1`);
    const data = await res.json();
    if (data.success && data.session) {
      const ed = data.session.edit_data;
      if (ed) restoreEditState(ed);
    }
  } catch (e) {
    console.warn('Tidak bisa load session dari server:', e);
  }
}

function restoreEditState(ed) {
  const adjs = ['brightness','contrast','saturation','warmth','exposure',
                 'highlights','shadows','hue','tint','vibrance',
                 'sharpness','vignette','noise','blur'];
  adjs.forEach(k => {
    if (ed[k] !== undefined) {
      state[k] = ed[k];
      const sl  = document.getElementById(`sl-${k}`);
      const val = document.getElementById(`val-${k}`);
      if (sl)  sl.value = ed[k];
      if (val) val.textContent = formatSliderVal(k, ed[k]);
    }
  });
  if (ed.rotation    !== undefined) state.rotation    = ed.rotation;
  if (ed.flipH       !== undefined) state.flipH       = ed.flipH;
  if (ed.flipV       !== undefined) state.flipV       = ed.flipV;
  if (ed.activeFilter!== undefined) state.activeFilter= ed.activeFilter;
  if (ed.cropSizeId  !== undefined) {
    state.cropSizeId = ed.cropSizeId;
    document.querySelectorAll('.crop-preset-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.id === state.cropSizeId));
  }
  if (ed.cropOrientation !== undefined) setOrientation(ed.cropOrientation);
  scheduleRender();
}

// ─── SAVE SESSION TO SERVER ───────────────────────────────
async function saveSessionToServer(status = 'editing') {
  if (!state.photoId) return;
  const editData = {
    brightness: state.brightness, contrast: state.contrast,
    saturation: state.saturation, warmth: state.warmth,
    exposure: state.exposure, highlights: state.highlights,
    shadows: state.shadows, hue: state.hue, tint: state.tint,
    vibrance: state.vibrance, sharpness: state.sharpness,
    vignette: state.vignette, noise: state.noise, blur: state.blur,
    rotation: state.rotation, flipH: state.flipH, flipV: state.flipV,
    activeFilter: state.activeFilter,
    cropSizeId: state.cropSizeId, cropOrientation: state.cropOrientation,
  };
  try {
    await fetch('api/save_edit.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_id: state.photoId, edit_data: editData, status }),
    });
  } catch (e) {
    console.warn('Gagal simpan sesi ke server:', e);
  }
}

// ─── LOAD IMAGE ───────────────────────────────────────────

function loadImageFromSession() {
  
  const src  = sessionStorage.getItem('bsp_imageSrc')  || sessionStorage.getItem('bsp_current_img');
  const name = sessionStorage.getItem('bsp_imageName') || sessionStorage.getItem('bsp_current_name') || 'image.jpg';
  const size = sessionStorage.getItem('bsp_imageSize') || 0;
  const type = sessionStorage.getItem('bsp_imageType') || 'image/jpeg';

  if (!src) { window.location.href = 'index.php'; return; }

  state.fileName = name;
  state.fileSize = parseInt(size);
  state.fileType = type;

  const fileNameEl = document.getElementById('imageFileName');
  if (fileNameEl) fileNameEl.textContent = name;

  setDetailText('info-filename',  name);
  setDetailText('info-filesize',  formatBytes(state.fileSize));
  setDetailText('info-format',    (type.split('/')[1] || 'Unknown').toUpperCase());

  const img = new Image();
  img.onload = () => {
    state.originalImage     = img;
    state.trueOriginalImage = img;   // simpan referensi asli permanen
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    setDetailText('info-dimensions', `${img.naturalWidth} × ${img.naturalHeight}`);
    fitToScreen();
    renderCanvas();
    drawHistogram();
    setupFilters();
    updateInfoPanel();
    updateCropSizeInfo();
    // Push snapshot awal sebagai titik undo terdalam
    pushHistory();
  };
  img.onerror = () => { alert('Gagal memuat gambar.'); window.location.href = 'index.php'; };
  img.src = src;
}

function setDetailText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ─── RENDER PIPELINE ──────────────────────────────────────
function scheduleRender() {
  if (state.renderPending) return;
  state.renderPending = true;
  requestAnimationFrame(() => {
    state.renderPending = false;
    renderCanvas();
    drawHistogram();
  });
}

function renderCanvas() {
  if (!state.originalImage) return;
  const img  = state.originalImage;
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;

  const off    = new OffscreenCanvas(srcW, srcH);
  const offCtx = off.getContext('2d', { willReadFrequently: true });
  offCtx.drawImage(img, 0, 0);

  let id = offCtx.getImageData(0, 0, srcW, srcH);
  id = applyPixelAdjustments(id);
  offCtx.putImageData(id, 0, 0);

  if (state.blur > 0) applyBlur(offCtx, srcW, srcH, state.blur * 0.5);

  if (state.vignette > 0) {
    const grad = offCtx.createRadialGradient(srcW/2, srcH/2, Math.min(srcW,srcH)*0.25, srcW/2, srcH/2, Math.max(srcW,srcH)*0.85);
    const v = state.vignette / 100;
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${(v*0.9).toFixed(2)})`);
    offCtx.fillStyle = grad;
    offCtx.fillRect(0, 0, srcW, srcH);
  }

  applyFilterPreset(offCtx, srcW, srcH);

  const rotated = (state.rotation === 90 || state.rotation === 270);
  canvas.width  = rotated ? srcH : srcW;
  canvas.height = rotated ? srcW : srcH;

  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(state.rotation * Math.PI / 180);
  if (state.flipH) ctx.scale(-1, 1);
  if (state.flipV) ctx.scale(1, -1);
  ctx.drawImage(off, -srcW/2, -srcH/2);
  ctx.restore();

  updateCanvasTransform();
}

// ─── PIXEL ADJUSTMENTS ────────────────────────────────────
function applyPixelAdjustments(imageData) {
  const data  = imageData.data;
  const len   = data.length;
  const bright = state.brightness / 100;
  const cont   = state.contrast;
  const sat    = state.saturation / 100;
  const warm   = state.warmth / 100;
  const expo   = state.exposure / 100;
  const high   = state.highlights / 100;
  const shad   = state.shadows / 100;
  const hueRot = state.hue;
  const tint   = state.tint / 100;
  const vibr   = state.vibrance / 100;

  const contFactor = cont !== 0 ? (259*(cont+255))/(255*(259-cont)) : 1;

  for (let i = 0; i < len; i += 4) {
    let r = data[i], g = data[i+1], b = data[i+2];
    if (expo !== 0)   { const ef = Math.pow(2, expo*1.5); r=clamp(r*ef); g=clamp(g*ef); b=clamp(b*ef); }
    if (bright !== 0) { const bf = bright*255; r=clamp(r+bf); g=clamp(g+bf); b=clamp(b+bf); }
    if (cont !== 0)   { r=clamp(contFactor*(r-128)+128); g=clamp(contFactor*(g-128)+128); b=clamp(contFactor*(b-128)+128); }
    const lum = (r*0.299 + g*0.587 + b*0.114)/255;
    if (high !== 0 && lum > 0.5) { const hf=(lum-0.5)*2*high*90; r=clamp(r+hf); g=clamp(g+hf); b=clamp(b+hf); }
    if (shad !== 0 && lum < 0.5) { const sf=(0.5-lum)*2*shad*90; r=clamp(r+sf); g=clamp(g+sf); b=clamp(b+sf); }
    if (warm !== 0)  { r=clamp(r+warm*45); b=clamp(b-warm*45); g=clamp(g+warm*8); }
    if (tint !== 0)  { g=clamp(g+tint*40); r=clamp(r-tint*15); b=clamp(b-tint*15); }
    if (sat !== 0)   { const gray=r*0.299+g*0.587+b*0.114; r=clamp(gray+(r-gray)*(1+sat)); g=clamp(gray+(g-gray)*(1+sat)); b=clamp(gray+(b-gray)*(1+sat)); }
    if (vibr !== 0)  { const mx=Math.max(r,g,b),mn=Math.min(r,g,b),cs=mx===0?0:(mx-mn)/mx,boost=(1-cs)*vibr*0.9,g2=r*0.299+g*0.587+b*0.114; r=clamp(g2+(r-g2)*(1+boost)); g=clamp(g2+(g-g2)*(1+boost)); b=clamp(g2+(b-g2)*(1+boost)); }
    if (hueRot !== 0){ const [h,s,l]=rgbToHsl(r,g,b),newH=((h+hueRot/360)%1+1)%1;[r,g,b]=hslToRgb(newH,s,l); }
    data[i]=r; data[i+1]=g; data[i+2]=b;
  }

  if (state.sharpness > 0) {
    const strength = state.sharpness/100*2;
    const w=imageData.width, h=imageData.height;
    const copy = new Uint8ClampedArray(data);
    for (let y=1;y<h-1;y++) for (let x=1;x<w-1;x++) {
      const idx=(y*w+x)*4;
      for (let c=0;c<3;c++) {
        const center=copy[idx+c];
        const avg=(copy[((y-1)*w+x)*4+c]+copy[((y+1)*w+x)*4+c]+copy[(y*w+x-1)*4+c]+copy[(y*w+x+1)*4+c])/4;
        data[idx+c]=clamp(center+(center-avg)*strength);
      }
    }
  }
  return imageData;
}

function clamp(v){ return v<0?0:v>255?255:Math.round(v); }
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h,s;const l=(mx+mn)/2;if(mx===mn){h=s=0;}else{const d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h/=6;}return[h,s,l];}
function hslToRgb(h,s,l){if(s===0){const v=Math.round(l*255);return[v,v,v];}const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q,hue2rgb=(t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};return[Math.round(hue2rgb(h+1/3)*255),Math.round(hue2rgb(h)*255),Math.round(hue2rgb(h-1/3)*255)];}

// ─── BLUR ─────────────────────────────────────────────────
function applyBlur(offCtx,w,h,radius){const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;const tc=tmp.getContext('2d');tc.filter=`blur(${radius}px)`;tc.drawImage(offCtx.canvas,0,0);offCtx.clearRect(0,0,w,h);offCtx.drawImage(tmp,0,0);}

// ─── FILTER PRESETS ───────────────────────────────────────
const FILTERS = [
  { id:'none',    name:'Original',  fn:null },
  { id:'vivid',   name:'Vivid',     fn:(c,w,h)=>cssFilter(c,w,h,'saturate(1.6) contrast(1.12)') },
  { id:'matte',   name:'Matte',     fn:matteFilter },
  { id:'mono',    name:'Mono',      fn:(c,w,h)=>cssFilter(c,w,h,'grayscale(1)') },
  { id:'fade',    name:'Fade',      fn:fadeFilter },
  { id:'warm',    name:'Warm',      fn:(c,w,h)=>colorOverlay(c,w,h,255,200,150,0.18) },
  { id:'cool',    name:'Cool',      fn:(c,w,h)=>colorOverlay(c,w,h,140,185,255,0.18) },
  { id:'sepia',   name:'Sepia',     fn:(c,w,h)=>cssFilter(c,w,h,'sepia(0.85)') },
  { id:'dramatic',name:'Dramatic',  fn:(c,w,h)=>cssFilter(c,w,h,'contrast(1.45) brightness(0.82) saturate(0.65)') },
  { id:'golden',  name:'Golden',    fn:(c,w,h)=>colorOverlay(c,w,h,255,215,120,0.28) },
  { id:'teal',    name:'Teal&Org',  fn:tealOrangeFilter },
  { id:'cinema',  name:'Cinematic', fn:cinematicFilter },
];

function applyFilterPreset(offCtx,w,h){const f=FILTERS.find(f=>f.id===state.activeFilter);if(!f||!f.fn)return;f.fn(offCtx,w,h);}
function cssFilter(offCtx,w,h,filter){const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;const tc=tmp.getContext('2d');tc.filter=filter;tc.drawImage(offCtx.canvas,0,0);offCtx.clearRect(0,0,w,h);offCtx.drawImage(tmp,0,0);}
function colorOverlay(offCtx,w,h,r,g,b,alpha){offCtx.fillStyle=`rgba(${r},${g},${b},${alpha})`;offCtx.fillRect(0,0,w,h);}
function matteFilter(offCtx,w,h){const id=offCtx.getImageData(0,0,w,h);const d=id.data;for(let i=0;i<d.length;i+=4){d[i]=clamp(d[i]*0.82+32);d[i+1]=clamp(d[i+1]*0.82+28);d[i+2]=clamp(d[i+2]*0.82+38);}offCtx.putImageData(id,0,0);}
function fadeFilter(offCtx,w,h){cssFilter(offCtx,w,h,'contrast(0.82) brightness(1.12) saturate(0.7)');offCtx.fillStyle='rgba(255,235,220,0.18)';offCtx.fillRect(0,0,w,h);}
function tealOrangeFilter(offCtx,w,h){const id=offCtx.getImageData(0,0,w,h);const d=id.data;for(let i=0;i<d.length;i+=4){const lum=(d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114)/255;if(lum>0.5){d[i]=clamp(d[i]+25);d[i+2]=clamp(d[i+2]-25);}else{d[i]=clamp(d[i]-12);d[i+1]=clamp(d[i+1]+12);d[i+2]=clamp(d[i+2]+25);}}offCtx.putImageData(id,0,0);}
function cinematicFilter(offCtx,w,h){cssFilter(offCtx,w,h,'contrast(1.18) saturate(0.88) brightness(0.93)');const barH=Math.round(h*0.055);offCtx.fillStyle='#000';offCtx.fillRect(0,0,w,barH);offCtx.fillRect(0,h-barH,w,barH);}

// ─── FILTER SETUP & PREVIEWS ──────────────────────────────
function setupFilters() {
  const grid = document.getElementById('filterGrid');
  if (!grid) return;
  grid.innerHTML = '';
  FILTERS.forEach(f => {
    const item = document.createElement('div');
    item.className = 'filter-item' + (f.id === state.activeFilter ? ' active' : '');
    item.dataset.id = f.id;
    const fc = document.createElement('canvas');
    renderFilterPreview(fc, f);
    item.appendChild(fc);
    const label = document.createElement('div');
    label.className = 'filter-name';
    label.textContent = f.name;
    item.appendChild(label);
    item.addEventListener('click', () => {
      document.querySelectorAll('.filter-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      state.activeFilter = f.id;
      setDetailText('info-filter', f.name);
      scheduleRender();
      pushHistory();
    });
    grid.appendChild(item);
  });
}

function renderFilterPreview(fc, filter) {
  if (!state.originalImage) return;
  const img = state.originalImage;
  const aspect = img.naturalWidth / img.naturalHeight;
  fc.width = 180;
  fc.height = Math.round(180 / aspect);
  const pc = fc.getContext('2d');
  pc.drawImage(img, 0, 0, fc.width, fc.height);
  if (filter.fn) filter.fn(pc, fc.width, fc.height);
}

// ─── HISTOGRAM ────────────────────────────────────────────
function drawHistogram() {
  if (!canvas.width || !canvas.height) return;
  const W = histCanvas.width, H = histCanvas.height;
  histCtx.clearRect(0, 0, W, H);
  const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d  = id.data;
  const rH=new Uint32Array(256),gH=new Uint32Array(256),bH=new Uint32Array(256),lH=new Uint32Array(256);
  for (let i=0;i<d.length;i+=4){rH[d[i]]++;gH[d[i+1]]++;bH[d[i+2]]++;lH[Math.round(d[i]*0.299+d[i+1]*0.587+d[i+2]*0.114)]++;}
  const maxVal=Math.max(Math.max(...rH),Math.max(...gH),Math.max(...bH),Math.max(...lH));
  if(maxVal===0)return;
  const drawCh=(hist,color)=>{histCtx.beginPath();histCtx.fillStyle=color;const bw=W/256;for(let i=0;i<256;i++){const bh=(hist[i]/maxVal)*H;histCtx.fillRect(i*bw,H-bh,bw+0.5,bh);}};
  drawCh(lH,'rgba(255,255,255,0.18)');drawCh(rH,'rgba(255,80,80,0.55)');drawCh(gH,'rgba(80,210,80,0.55)');drawCh(bH,'rgba(80,130,255,0.55)');
  const grad=histCtx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(1,'rgba(0,0,0,0.35)');histCtx.fillStyle=grad;histCtx.fillRect(0,0,W,H);
}

// ─── ZOOM & PAN ───────────────────────────────────────────
function setupZoom() {
  document.getElementById('btnZoomIn') .addEventListener('click', () => setZoom(state.zoom * 1.25));
  document.getElementById('btnZoomOut').addEventListener('click', () => setZoom(state.zoom / 1.25));
  document.getElementById('btnZoomFit').addEventListener('click', fitToScreen);
  canvasWrapper.addEventListener('wheel', (e) => { e.preventDefault(); setZoom(state.zoom * (e.deltaY > 0 ? 0.9 : 1.1)); }, { passive: false });
}

function setZoom(z) { state.zoom = Math.max(0.05, Math.min(10, z)); updateCanvasTransform(); }

function fitToScreen() {
  if (!state.originalImage) return;
  const availW = canvasWrapper.clientWidth  - 48;
  const availH = canvasWrapper.clientHeight - 48;
  const cw = canvas.width  || state.originalImage.naturalWidth;
  const ch = canvas.height || state.originalImage.naturalHeight;
  state.zoom = Math.min(availW/cw, availH/ch, 1);
  state.panX = 0; state.panY = 0;
  updateCanvasTransform();
}

function updateCanvasTransform() {
  canvas.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
  if (zoomLevelEl) zoomLevelEl.textContent = Math.round(state.zoom * 100) + '%';
}

function setupPan() {
  let dragging=false,startX,startY,startPX,startPY;
  canvasWrapper.addEventListener('mousedown', (e) => {
    if (state.cropMode) return;
    dragging=true; startX=e.clientX; startY=e.clientY; startPX=state.panX; startPY=state.panY;
    canvasWrapper.style.cursor='grabbing';
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    state.panX=startPX+(e.clientX-startX); state.panY=startPY+(e.clientY-startY);
    updateCanvasTransform();
  });
  document.addEventListener('mouseup', () => { dragging=false; canvasWrapper.style.cursor='grab'; });
}

// ─── TOOLBAR BUTTONS ──────────────────────────────────────
function setupToolbarButtons() {
  document.getElementById('btnRotateCCW').addEventListener('click', () => {
    state.rotation=(state.rotation-90+360)%360; updateInfoPanel(); scheduleRender(); pushHistory();
  });
  document.getElementById('btnRotateCW') .addEventListener('click', () => {
    state.rotation=(state.rotation+90)%360; updateInfoPanel(); scheduleRender(); pushHistory();
  });
  document.getElementById('btnFlipH').addEventListener('click', () => {
    state.flipH=!state.flipH; updateInfoPanel(); scheduleRender(); pushHistory();
  });
  document.getElementById('btnFlipV').addEventListener('click', () => {
    state.flipV=!state.flipV; updateInfoPanel(); scheduleRender(); pushHistory();
  });
  document.getElementById('btnReset').addEventListener('click', resetToTrueOriginal);
  document.getElementById('btnCrop') .addEventListener('click', toggleCropMode);
  document.getElementById('btnUndo') ?.addEventListener('click', undo);
  document.getElementById('btnRedo') ?.addEventListener('click', redo);
}

// ─── TRUE RESET (kembali ke foto asli upload) ─────────────
function resetToTrueOriginal() {
  if (!state.trueOriginalImage) return;

  const confirm_msg = 'Reset akan mengembalikan foto ke kondisi awal (sebelum semua edit dan crop). Lanjutkan?';
  if (!window.confirm(confirm_msg)) return;

  // Restore semua adjustment ke 0
  const adjs = ['brightness','contrast','saturation','warmth','exposure',
                 'highlights','shadows','hue','tint','vibrance',
                 'sharpness','vignette','noise','blur'];
  adjs.forEach(k => {
    state[k] = 0;
    const sl  = document.getElementById(`sl-${k}`);
    const val = document.getElementById(`val-${k}`);
    if (sl)  sl.value = 0;
    if (val) val.textContent = formatSliderVal(k, 0);
  });

  state.rotation = 0;
  state.flipH    = false;
  state.flipV    = false;
  state.activeFilter = 'none';
  state.cropSizeId   = '4R';
  state.cropOrientation = 'portrait';

  // Restore gambar asli
  state.originalImage = state.trueOriginalImage;
  canvas.width  = state.trueOriginalImage.naturalWidth;
  canvas.height = state.trueOriginalImage.naturalHeight;

  // Reset filter UI
  document.querySelectorAll('.filter-item').forEach(el => el.classList.remove('active'));
  const noneItem = document.querySelector('.filter-item[data-id="none"]');
  if (noneItem) noneItem.classList.add('active');

  // Reset crop UI
  document.querySelectorAll('.crop-preset-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.id === '4R'));
  setOrientation('portrait');

  setDetailText('info-filter', 'None');
  setDetailText('info-dimensions', `${state.trueOriginalImage.naturalWidth} × ${state.trueOriginalImage.naturalHeight}`);

  cancelCrop();
  updateInfoPanel();
  updateCropSizeInfo();
  fitToScreen();
  scheduleRender();
  setupFilters();

  // Clear history, mulai dari titik awal lagi
  history.stack = [];
  history.pointer = -1;
  pushHistory();

  showCropNotif('Foto dikembalikan ke kondisi awal ✓');
}

// ─── SLIDERS ──────────────────────────────────────────────
function setupSliders() {
  let sliderTimer = null;
  document.querySelectorAll('.slider[data-adj]').forEach(slider => {
    const key = slider.dataset.adj;
    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      state[key] = v;
      const valEl = document.getElementById(`val-${key}`);
      if (valEl) valEl.textContent = formatSliderVal(key, v);
      scheduleRender();
      // Debounce pushHistory — push setelah berhenti gerak 600ms
      clearTimeout(sliderTimer);
      sliderTimer = setTimeout(() => pushHistory(), 600);
    });
  });
}

// ─── TAB SWITCHING ────────────────────────────────────────
function setupTabSwitching() {
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tc=>tc.classList.remove('active'));
      tab.classList.add('active');
      const target=document.getElementById(`tab-${tab.dataset.tab}`);
      if(target) target.classList.add('active');
    });
  });
}

// ═══════════════════════════════════════════════════════════
// CROP SYSTEM — v3 (Fixed auto crop dari originalImage)
// ═══════════════════════════════════════════════════════════

function buildCropPresetButtons() {
  const grid = document.getElementById('cropPresets');
  if (!grid) return;
  grid.innerHTML = '';
  PRINT_SIZES.forEach(size => {
    const btn = document.createElement('button');
    btn.className = 'crop-preset-btn' + (size.id === state.cropSizeId ? ' active' : '');
    btn.dataset.id = size.id;
    btn.textContent = size.label;
    btn.title = size.desc;
    grid.appendChild(btn);
  });
}

function setupCropPresetEvents() {
  document.getElementById('cropPresets').addEventListener('click', (e) => {
    const btn = e.target.closest('.crop-preset-btn');
    if (!btn) return;
    document.querySelectorAll('.crop-preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.cropSizeId = btn.dataset.id;
    updateCropSizeInfo();
    if (state.cropMode) { enforceCropAspect(); updateCropBox(); }
  });

  document.getElementById('btnOrientPortrait') ?.addEventListener('click', () => setOrientation('portrait'));
  document.getElementById('btnOrientLandscape')?.addEventListener('click', () => setOrientation('landscape'));
  document.getElementById('btnAutoCrop')       ?.addEventListener('click', applyAutoCrop);
  document.getElementById('btnCropManualOpen') ?.addEventListener('click', () => {
    if (!state.cropMode) toggleCropMode();
  });
  document.getElementById('btnCropApply') ?.addEventListener('click', applyManualCrop);
  document.getElementById('btnCropCancel')?.addEventListener('click', cancelCrop);
}

function setupCrop() { initCropDrag(); }

function setOrientation(orient) {
  state.cropOrientation = orient;
  document.getElementById('btnOrientPortrait') ?.classList.toggle('active', orient==='portrait');
  document.getElementById('btnOrientLandscape')?.classList.toggle('active', orient==='landscape');
  updateCropSizeInfo();
  if (state.cropMode) { enforceCropAspect(); updateCropBox(); }
}

function getActivePrintSize() {
  return PRINT_SIZES.find(s => s.id === state.cropSizeId) || PRINT_SIZES[0];
}

function getCropRatio() {
  const size = getActivePrintSize();
  const pw = state.cropOrientation==='portrait' ? Math.min(size.w,size.h) : Math.max(size.w,size.h);
  const ph = state.cropOrientation==='portrait' ? Math.max(size.w,size.h) : Math.min(size.w,size.h);
  return { rw: pw, rh: ph };
}

function updateCropSizeInfo() {
  const size = getActivePrintSize();
  const { rw, rh } = getCropRatio();
  const labelEl = document.getElementById('cropSizeLabel');
  const dimEl   = document.getElementById('cropSizeDim');
  if (labelEl) labelEl.textContent = `${size.label} — ${size.desc}`;
  if (dimEl)   dimEl.textContent   = `Rasio ${rw}:${rh}`;
}

// ─── AUTO CROP v3 — Crop dari originalImage langsung ──────
// MASALAH LAMA: crop dari canvas display yang sudah di-scale/zoom
//               → hasilnya ada bidang kosong / gambar kecil
// SOLUSI: crop dari state.originalImage (pixel asli, tidak terpengaruh zoom)
function applyAutoCrop() {
  if (!state.originalImage) return;

  const { rw, rh } = getCropRatio();

  // Gunakan naturalWidth/Height dari originalImage — bukan dari canvas display
  const srcW = state.originalImage.naturalWidth;
  const srcH = state.originalImage.naturalHeight;
  const targetRatio  = rw / rh;
  const currentRatio = srcW / srcH;

  let cropW, cropH, cropX, cropY;

  if (currentRatio > targetRatio) {
    // Gambar lebih lebar dari target → crop kiri & kanan, pertahankan tinggi penuh
    cropH = srcH;
    cropW = Math.round(srcH * targetRatio);
    cropX = Math.round((srcW - cropW) / 2);
    cropY = 0;
  } else {
    // Gambar lebih tinggi dari target → crop atas & bawah, pertahankan lebar penuh
    cropW = srcW;
    cropH = Math.round(srcW / targetRatio);
    cropX = 0;
    cropY = Math.round((srcH - cropH) / 2);
  }

  // Buat canvas sementara di ukuran pixel asli
  const tmp = document.createElement('canvas');
  tmp.width = cropW; tmp.height = cropH;
  // drawImage dari state.originalImage langsung — bukan dari canvas display
  tmp.getContext('2d').drawImage(
    state.originalImage,
    cropX, cropY, cropW, cropH,   // source rect (pixel asli)
    0, 0, cropW, cropH            // destination
  );

  const newImg = new Image();
  newImg.onload = () => {
    state.originalImage = newImg;
    canvas.width  = cropW;
    canvas.height = cropH;

    // Render ulang dengan adjustment yang ada
    scheduleRender();
    setDetailText('info-dimensions', `${cropW} × ${cropH}`);
    showCropNotif(`Auto crop ${getActivePrintSize().label} (${rw}:${rh}) berhasil!`);
    cancelCrop();
    fitToScreen();
    setupFilters();
    pushHistory();   // simpan ke undo stack
  };
  newImg.src = tmp.toDataURL('image/png');
}

function showCropNotif(msg) {
  let notif = document.getElementById('cropNotif');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'cropNotif';
    notif.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:#2D5A3D; color:#fff; padding:10px 20px; border-radius:8px;
      font-size:13px; font-family:'DM Sans',sans-serif; z-index:9999;
      box-shadow:0 4px 16px rgba(0,0,0,0.3); transition:opacity 0.4s;
    `;
    document.body.appendChild(notif);
  }
  notif.textContent = msg;
  notif.style.opacity = '1';
  clearTimeout(notif._t);
  notif._t = setTimeout(() => { notif.style.opacity = '0'; }, 2500);
}

// ─── MANUAL CROP ──────────────────────────────────────────
let cropRect     = { x:0, y:0, w:0, h:0 };
let cropDragging = false;
let cropHandle   = null;
let cropStart    = null;

function toggleCropMode() {
  if (!state.originalImage) return;
  state.cropMode = !state.cropMode;
  document.getElementById('btnCrop').classList.toggle('active', state.cropMode);
  const overlay = document.getElementById('cropOverlay');
  if (state.cropMode) { overlay.classList.remove('hidden'); initCropBox(); }
  else                { overlay.classList.add('hidden'); }
}

function initCropBox() {
  const wRect = canvasWrapper.getBoundingClientRect();
  const cRect = canvas.getBoundingClientRect();
  const { rw, rh } = getCropRatio();
  const maxW = cRect.width  * 0.8;
  const maxH = cRect.height * 0.8;
  let boxW, boxH;
  if (maxW / rw * rh <= maxH) { boxW=maxW; boxH=maxW/rw*rh; }
  else                         { boxH=maxH; boxW=maxH/rh*rw; }
  cropRect = {
    x: cRect.left - wRect.left + (cRect.width  - boxW) / 2,
    y: cRect.top  - wRect.top  + (cRect.height - boxH) / 2,
    w: boxW, h: boxH,
  };
  updateCropBox();
}

function enforceCropAspect() {
  const { rw, rh } = getCropRatio();
  cropRect.h = cropRect.w * (rh / rw);
}

function updateCropBox() {
  const box = document.getElementById('cropBox');
  if (!box) return;
  box.style.left   = cropRect.x + 'px';
  box.style.top    = cropRect.y + 'px';
  box.style.width  = cropRect.w + 'px';
  box.style.height = cropRect.h + 'px';
}

function initCropDrag() {
  document.addEventListener('mousemove', onCropMove);
  document.addEventListener('mouseup', () => { cropDragging=false; cropHandle=null; });
  document.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.crop-handle');
    const box    = e.target.closest('#cropBox');
    if (!state.cropMode) return;
    if (handle) {
      e.stopPropagation();
      cropHandle   = [...handle.classList].find(c=>['tl','tr','bl','br'].includes(c));
      cropStart    = { x:e.clientX, y:e.clientY, rect:{...cropRect} };
      cropDragging = true;
    } else if (box) {
      cropHandle   = 'move';
      cropStart    = { x:e.clientX, y:e.clientY, rect:{...cropRect} };
      cropDragging = true;
    }
  });
}

function onCropMove(e) {
  if (!cropDragging || !cropHandle) return;
  const dx = e.clientX - cropStart.x;
  const dy = e.clientY - cropStart.y;
  const r  = cropStart.rect;
  const { rw, rh } = getCropRatio();
  if (cropHandle === 'move') {
    cropRect.x = r.x + dx; cropRect.y = r.y + dy;
  } else {
    if (cropHandle.includes('r')) { cropRect.w=Math.max(60,r.w+dx); }
    if (cropHandle.includes('l')) { cropRect.x=r.x+dx; cropRect.w=Math.max(60,r.w-dx); }
    if (cropHandle.includes('b')) { cropRect.h=Math.max(40,r.h+dy); cropRect.w=cropRect.h/rh*rw; }
    if (cropHandle.includes('t')) { cropRect.y=r.y+dy; cropRect.h=Math.max(40,r.h-dy); cropRect.w=cropRect.h/rh*rw; }
    enforceCropAspect();
  }
  updateCropBox();
}

// Manual crop juga fix: crop dari pixel originalImage
function applyManualCrop() {
  if (!state.originalImage) return;
  const wRect  = canvasWrapper.getBoundingClientRect();
  const cRect  = canvas.getBoundingClientRect();

  // Scale dari koordinat layar → pixel originalImage
  const scaleX = state.originalImage.naturalWidth  / cRect.width;
  const scaleY = state.originalImage.naturalHeight / cRect.height;

  const relX = Math.round((cropRect.x - (cRect.left - wRect.left)) * scaleX);
  const relY = Math.round((cropRect.y - (cRect.top  - wRect.top )) * scaleY);
  const relW = Math.round(cropRect.w * scaleX);
  const relH = Math.round(cropRect.h * scaleY);

  // Clamp agar tidak keluar batas
  const safeX = Math.max(0, relX);
  const safeY = Math.max(0, relY);
  const safeW = Math.min(relW, state.originalImage.naturalWidth  - safeX);
  const safeH = Math.min(relH, state.originalImage.naturalHeight - safeY);

  const tmp = document.createElement('canvas');
  tmp.width=safeW; tmp.height=safeH;
  tmp.getContext('2d').drawImage(
    state.originalImage,
    safeX, safeY, safeW, safeH,
    0, 0, safeW, safeH
  );

  const newImg = new Image();
  newImg.onload = () => {
    state.originalImage = newImg;
    canvas.width=safeW; canvas.height=safeH;
    setDetailText('info-dimensions', `${safeW} × ${safeH}`);
    showCropNotif('Manual crop berhasil!');
    cancelCrop(); fitToScreen(); scheduleRender(); setupFilters();
    pushHistory();
  };
  newImg.src = tmp.toDataURL('image/png');
}

function cancelCrop() {
  state.cropMode = false;
  document.getElementById('btnCrop')?.classList.remove('active');
  document.getElementById('cropOverlay')?.classList.add('hidden');
}

// ─── INFO PANEL ───────────────────────────────────────────
function updateInfoPanel() {
  setDetailText('info-rotation', state.rotation + '°');
  const flips=[];
  if(state.flipH) flips.push('Horizontal');
  if(state.flipV) flips.push('Vertical');
  setDetailText('info-flip', flips.length ? flips.join(', ') : 'None');
}

// ─── NAVIGATE TO FRAME ────────────────────────────────────
async function goToFrame() {
  if (!state.originalImage) return;
  sessionStorage.setItem('bsp_editedSrc',  canvas.toDataURL('image/png'));
  sessionStorage.setItem('bsp_imageName',  state.fileName);
  sessionStorage.setItem('bsp_cropSizeId', state.cropSizeId);
  sessionStorage.setItem('bsp_cropOrient', state.cropOrientation);
  await saveSessionToServer('ready_for_frame');
  window.location.href = 'frame.php';
}

// ─── UTILS ────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes||bytes===0) return '—';
  if (bytes<1024)     return bytes + ' B';
  if (bytes<1048576)  return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(2) + ' MB';
}