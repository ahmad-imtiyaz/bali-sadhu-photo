/* ============================================================
   index.js — Bali Sadhu Photo
   v3.0 — FIX: File besar (20-30MB+) tidak crash
   
   PERUBAHAN UTAMA:
   - HAPUS encodeBase64Async() — tidak lagi simpan base64 ke sessionStorage
   - Preview pakai objectURL (langsung, tidak perlu encode)
   - Edit page load gambar dari server path (bsp_serverPath)
   - Fallback: jika upload server belum selesai, pakai objectURL via blob cache
   - Recent thumbnail tetap pakai resize kecil (aman)
   ============================================================ */

const RECENT_KEY      = 'bsp_recent_v1';
const MAX_RECENT      = 4;
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
   STATE — simpan file object untuk upload ulang jika perlu
   ============================================================ */
let _currentFile      = null;   // File object asli
let _currentObjectURL = null;   // objectURL untuk preview
let _uploadDone       = false;  // flag: server upload selesai
let _uploadPromise    = null;   // promise upload aktif

/* ============================================================
   TOAST
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
   PROGRESS BAR — feedback upload file besar
   ============================================================ */
function showProgress(pct) {
  let bar = document.getElementById('bspProgress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'bspProgress';
    bar.style.cssText = `
      position:fixed; top:0; left:0; width:0%; height:3px;
      background:linear-gradient(90deg,#C8922A,#E8B84B);
      z-index:9999; transition:width 0.2s ease;
      box-shadow:0 0 8px rgba(200,146,42,0.6);
    `;
    document.body.appendChild(bar);
  }
  bar.style.width = pct + '%';
  if (pct >= 100) {
    setTimeout(() => {
      bar.style.opacity = '0';
      setTimeout(() => { bar.style.width = '0%'; bar.style.opacity = '1'; }, 400);
    }, 500);
  }
}

/* ============================================================
   FILE HANDLING — FIXED untuk file besar
   ============================================================ */
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('File harus berupa gambar!');
    return;
  }

  /* Bersihkan state sebelumnya */
  clearCurrentFile();

  _currentFile = file;

  /* 1. Preview langsung pakai objectURL — tidak perlu encode apapun */
  _currentObjectURL = URL.createObjectURL(file);
  showPreview(_currentObjectURL, file.name);

  /* 2. Simpan metadata ke sessionStorage — TIDAK ada base64 */
  try {
    sessionStorage.setItem('bsp_imageName', file.name);
    sessionStorage.setItem('bsp_imageSize', file.size);
    sessionStorage.setItem('bsp_imageType', file.type);
    sessionStorage.setItem('bsp_imageReady', '1');
    /* Hapus data lama supaya tidak ada sisa base64 */
    sessionStorage.removeItem('bsp_imageSrc');
    sessionStorage.removeItem('bsp_serverPath');
    sessionStorage.removeItem('bsp_photoId');
  } catch (e) {
    console.warn('sessionStorage error:', e);
  }

  /* 3. Upload ke server (non-blocking) — dengan progress */
  _uploadDone    = false;
  _uploadPromise = uploadToServer(file);
  _uploadPromise
    .then(() => { _uploadDone = true; })
    .catch(err => console.warn('Upload server gagal:', err));

  /* 4. Simpan thumbnail kecil ke recent (aman, hanya 400px) */
  resizeAndSaveRecent(file);
}

/* Hapus state file sebelumnya */
function clearCurrentFile() {
  if (_currentObjectURL) {
    URL.revokeObjectURL(_currentObjectURL);
    _currentObjectURL = null;
  }
  _currentFile   = null;
  _uploadDone    = false;
  _uploadPromise = null;
}

/* Upload ke server dengan XMLHttpRequest agar bisa track progress */
function uploadToServer(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('photo', file);

    const xhr = new XMLHttpRequest();

    /* Progress bar */
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 85); /* 85% saat upload */
        showProgress(pct);
      }
    });

    xhr.addEventListener('load', () => {
      showProgress(100);
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          sessionStorage.setItem('bsp_photoId',    data.photo_id);
          sessionStorage.setItem('bsp_serverPath', data.path);
          console.log('Server upload OK, photo_id:', data.photo_id, 'path:', data.path);
          resolve(data);
        } else {
          console.warn('Server error:', data.error);
          reject(new Error(data.error));
        }
      } catch (e) {
        reject(e);
      }
    });

    xhr.addEventListener('error', () => {
      showProgress(0);
      reject(new Error('Network error'));
    });

    xhr.open('POST', 'api/upload.php');
    xhr.send(formData);
  });
}

/* Resize foto → thumbnail kecil untuk Recent (hemat localStorage) */
function resizeAndSaveRecent(file) {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const canvas  = document.createElement('canvas');
    const scale   = Math.min(RECENT_THUMB_SIZE / img.width, RECENT_THUMB_SIZE / img.height, 1);
    canvas.width  = Math.round(img.width  * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled  = true;
    ctx.imageSmoothingQuality  = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const thumb = canvas.toDataURL('image/jpeg', 0.72);
    URL.revokeObjectURL(url);
    saveToRecent(thumb, file.name);
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

function showPreview(src, name) {
  previewImg.src = src;
  previewName.textContent = name || '—';
  uploadZone.classList.add('hidden');
  previewPanel.classList.add('visible');
}

function resetUpload() {
  clearCurrentFile();
  previewPanel.classList.remove('visible');
  uploadZone.classList.remove('hidden');
  fileInput.value = '';
  sessionStorage.removeItem('bsp_imageSrc');
  sessionStorage.removeItem('bsp_imageReady');
  sessionStorage.removeItem('bsp_photoId');
  sessionStorage.removeItem('bsp_serverPath');
}

/* ============================================================
   GO TO EDIT — tunggu upload selesai jika perlu
   ============================================================ */
async function goToEdit() {
  const ready      = sessionStorage.getItem('bsp_imageReady');
  const serverPath = sessionStorage.getItem('bsp_serverPath');
  const photoId    = sessionStorage.getItem('bsp_photoId');

  if (!ready && !serverPath && !photoId) {
    showToast('Pilih foto terlebih dahulu!');
    return;
  }

  /* Jika server upload belum selesai, tunggu */
  if (!serverPath && _uploadPromise && !_uploadDone) {
    showToast('Mengunggah foto ke server, harap tunggu...', 5000);
    btnNext.disabled = true;
    btnNext.textContent = 'Mengunggah...';
    try {
      await _uploadPromise;
    } catch (e) {
      /* Upload gagal — tetap lanjut, edit.js akan pakai objectURL fallback */
      console.warn('Upload gagal, lanjut dengan objectURL fallback');
    }
    btnNext.disabled = false;
    btnNext.innerHTML = `Lanjut ke Edit
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 7H11M8 4L11 7L8 10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }

  /*
   * Simpan objectURL ke sessionStorage sebagai fallback KECIL
   * Hanya dilakukan jika server path tidak ada DAN file kecil (< 4MB)
   * File besar: edit.js wajib andalkan server path
   */
  const finalServerPath = sessionStorage.getItem('bsp_serverPath');
  if (!finalServerPath && _currentObjectURL && _currentFile && _currentFile.size < 4 * 1024 * 1024) {
    /* File kecil: encode base64 sebagai fallback */
    try {
      await encodeSmallFileBase64(_currentFile);
    } catch (e) {
      console.warn('Encode base64 fallback gagal:', e);
    }
  }

  window.location.href = 'edit.php';
}

/* Encode base64 hanya untuk file KECIL (< 4MB) sebagai fallback */
function encodeSmallFileBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        sessionStorage.setItem('bsp_imageSrc', e.target.result);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

/* Drag & Drop */
uploadZone.addEventListener('dragover',  (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', ()  => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

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
  /*
   * Recent hanya simpan thumbnail kecil.
   * Set preview dari thumbnail, tapi tandai imageReady
   * agar user tahu ini dari cache (kualitas rendah).
   * Untuk edit berkualitas, user harus pilih file ulang.
   */
  showPreview(recent[idx].src, recent[idx].name);
  sessionStorage.setItem('bsp_imageName',  recent[idx].name);
  sessionStorage.setItem('bsp_imageSize',  '0');
  sessionStorage.setItem('bsp_imageType',  'image/jpeg');
  sessionStorage.setItem('bsp_imageSrc',   recent[idx].src); /* thumbnail kecil OK */
  sessionStorage.setItem('bsp_imageReady', '1');
  /* Hapus server path lama supaya edit.js tidak pakai path yang salah */
  sessionStorage.removeItem('bsp_serverPath');
  sessionStorage.removeItem('bsp_photoId');
  showToast('⚠️ Foto dari riwayat — kualitas thumbnail. Pilih file asli untuk hasil terbaik.');
}

function deleteRecent(idx) {
  let recent = getRecent();
  recent.splice(idx, 1);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch (e) {}
  renderRecent();
}

/* === INIT === */
renderRecent();