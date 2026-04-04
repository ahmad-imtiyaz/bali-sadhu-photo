/* ============================================================
   index.js — Bali Sadhu Photo
   v2 — Fix: sessionStorage overflow, custom toast, touch support
   ============================================================ */

const RECENT_KEY = 'bsp_recent_v1';
const MAX_RECENT = 4;
/* Batas preview di recent: 400px agar tidak overflow localStorage */
const RECENT_THUMB_SIZE = 400;

/* === DOM === */
const fileInput    = document.getElementById('fileInput');
const uploadZone   = document.getElementById('uploadZone');
const previewPanel = document.getElementById('previewPanel');
const previewImg   = document.getElementById('previewImg');
const previewName  = document.getElementById('previewName');
const btnBrowse    = document.getElementById('btnBrowse');
const btnNext      = document.getElementById('btnNext');
const btnReupload  = document.getElementById('btnReupload');
const recentEmpty  = document.getElementById('recentEmpty');
const recentGrid   = document.getElementById('recentGrid');

/* ============================================================
   TOAST — ganti alert() native yang bermasalah di iOS/iPad
   ============================================================ */
let _toastTimer = null;
function showToast(msg, duration = 3000) {
  let toast = document.getElementById('bspToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'bspToast';
    toast.className = 'bsp-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ============================================================
   FILE HANDLING
   ============================================================ */
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('File harus berupa gambar!');
    return;
  }

  const objectUrl = URL.createObjectURL(file);

  /* Tampilkan preview langsung pakai objectURL — tidak perlu base64 dulu */
  showPreview(objectUrl, file.name);

  /* Simpan ke sessionStorage: hanya metadata + flag, bukan base64 besar */
  try {
    sessionStorage.setItem('bsp_imageName', file.name);
    sessionStorage.setItem('bsp_imageSize', file.size);
    sessionStorage.setItem('bsp_imageType', file.type);
    sessionStorage.setItem('bsp_imageReady', '1');
    /* objectURL tidak bisa lintas halaman — buat juga base64 untuk edit.php
       tapi async agar UI tidak freeze */
    encodeBase64Async(file);
  } catch (e) {
    console.warn('sessionStorage error:', e);
  }

  /* Upload ke server (non-blocking) */
  uploadToServer(file).catch(err => console.warn('Upload server gagal:', err));

  /* Simpan thumbnail kecil ke recent */
  resizeAndSaveRecent(file);
}

/* Encode base64 async di background, simpan ke sessionStorage saat selesai */
function encodeBase64Async(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target.result;
    try {
      sessionStorage.setItem('bsp_imageSrc', src);
    } catch (e) {
      /* Jika file terlalu besar (>5MB base64), skip — edit.php pakai server path */
      console.warn('File terlalu besar untuk sessionStorage, akan pakai server path');
    }
  };
  reader.readAsDataURL(file);
}

/* Resize foto jadi thumbnail untuk Recent (hemat localStorage) */
function resizeAndSaveRecent(file) {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const scale  = Math.min(RECENT_THUMB_SIZE / img.width, RECENT_THUMB_SIZE / img.height, 1);
    canvas.width  = Math.round(img.width  * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const thumb = canvas.toDataURL('image/jpeg', 0.7);
    URL.revokeObjectURL(url);
    saveToRecent(thumb, file.name);
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

async function uploadToServer(file) {
  const formData = new FormData();
  formData.append('photo', file);
  const res  = await fetch('api/upload.php', { method: 'POST', body: formData });
  const data = await res.json();
  if (data.success) {
    sessionStorage.setItem('bsp_photoId',   data.photo_id);
    sessionStorage.setItem('bsp_serverPath', data.path);
    console.log('Server upload OK, photo_id:', data.photo_id);
  } else {
    console.warn('Server error:', data.error);
  }
}

function showPreview(src, name) {
  previewImg.src = src;
  previewName.textContent = name || '—';
  uploadZone.classList.add('hidden');
  previewPanel.classList.add('visible');
}

function resetUpload() {
  previewPanel.classList.remove('visible');
  uploadZone.classList.remove('hidden');
  fileInput.value = '';
  /* Bersihkan objectURL lama jika ada */
  if (previewImg.src && previewImg.src.startsWith('blob:')) {
    URL.revokeObjectURL(previewImg.src);
  }
  sessionStorage.removeItem('bsp_imageSrc');
  sessionStorage.removeItem('bsp_imageReady');
  sessionStorage.removeItem('bsp_photoId');
}

function goToEdit() {
  const ready    = sessionStorage.getItem('bsp_imageReady');
  const photoId  = sessionStorage.getItem('bsp_photoId');
  const src      = sessionStorage.getItem('bsp_imageSrc');

  /* Boleh lanjut jika: ada flag ready (file baru dipilih) ATAU ada photoId dari server */
  if (!ready && !photoId && !src) {
    showToast('Pilih foto terlebih dahulu!');
    return;
  }
  window.location.href = 'edit.php';
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
btnBrowse.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
});

btnNext.addEventListener('click', goToEdit);
btnReupload.addEventListener('click', resetUpload);

/* Drag & Drop — hanya untuk desktop */
uploadZone.addEventListener('dragover',  (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', ()  => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

/* Klik upload zone (bukan tombol browse) */
uploadZone.addEventListener('click', (e) => {
  if (e.target.closest('#btnBrowse')) return;
  fileInput.click();
});

/* ============================================================
   RECENT PHOTOS
   ============================================================ */
function saveToRecent(thumbSrc, name) {
  let recent = getRecent();
  recent = recent.filter(r => r.name !== name);
  recent.unshift({ src: thumbSrc, name, ts: Date.now() });
  if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch (e) {
    /* localStorage penuh — hapus yang lama */
    recent = recent.slice(0, 2);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch (_) {}
  }
  renderRecent();
}

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

function renderRecent() {
  const recent = getRecent();
  if (recent.length === 0) {
    recentEmpty.style.display = 'flex';
    recentGrid.style.display  = 'none';
    return;
  }
  recentEmpty.style.display = 'none';
  recentGrid.style.display  = 'grid';
  recentGrid.innerHTML = recent.map((item, i) => `
    <div class="recent-item" data-index="${i}">
      <img src="${item.src}" alt="${item.name}" loading="lazy"/>
      <button class="recent-item-del" data-index="${i}" title="Hapus">✕</button>
    </div>
  `).join('');

  recentGrid.querySelectorAll('.recent-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.recent-item-del')) return;
      loadRecent(parseInt(el.dataset.index));
    });
  });
  recentGrid.querySelectorAll('.recent-item-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteRecent(parseInt(btn.dataset.index));
    });
  });
}

function loadRecent(idx) {
  const recent = getRecent();
  if (!recent[idx]) return;
  /* Recent hanya thumbnail — set preview dari thumbnail
     Catatan: dari recent tidak bisa lanjut edit kecuali ada serverPath.
     Tampilkan pesan agar user pilih ulang jika tidak ada server */
  showPreview(recent[idx].src, recent[idx].name);
  sessionStorage.setItem('bsp_imageName', recent[idx].name);
  sessionStorage.setItem('bsp_imageSize', 0);
  sessionStorage.setItem('bsp_imageType', 'image/jpeg');
  sessionStorage.setItem('bsp_imageSrc',  recent[idx].src);
  sessionStorage.setItem('bsp_imageReady', '1');
  showToast('Foto dimuat dari riwayat');
}

function deleteRecent(idx) {
  let recent = getRecent();
  recent.splice(idx, 1);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch (e) {}
  renderRecent();
}

/* === INIT === */
renderRecent();