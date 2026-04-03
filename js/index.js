/* ============================================================
   index.js — Bali Sadhu Photo
   Phase 1: Pick Image + Upload ke backend
   ============================================================ */

const RECENT_KEY = 'bsp_recent_v1';
const MAX_RECENT = 4;

/* === DOM REFERENCES === */
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
   FILE HANDLING
   ============================================================ */
function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('File harus berupa gambar!');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const src = e.target.result;
    showPreview(src, file.name, file);
    saveToRecent(src, file.name);

    // Upload ke server backend (non-blocking)
    try {
      await uploadToServer(file);
    } catch (err) {
      console.warn('Upload ke server gagal (mode offline):', err);
      // Lanjut tanpa backend — tidak block user
    }
  };
  reader.readAsDataURL(file);
}

async function uploadToServer(file) {
  const formData = new FormData();
  formData.append('photo', file);

  const res  = await fetch('api/upload.php', { method: 'POST', body: formData });
  const data = await res.json();

  if (data.success) {
    // Simpan photo_id untuk dipakai di edit.js
    sessionStorage.setItem('bsp_photoId', data.photo_id);
    console.log('✅ Foto tersimpan di server, photo_id:', data.photo_id);
  } else {
    console.warn('Server upload error:', data.error);
  }
}

function showPreview(src, name, file) {
  previewImg.src   = src;
  previewName.textContent = name;

  uploadZone.classList.add('hidden');
  previewPanel.classList.add('visible');

  sessionStorage.setItem('bsp_imageSrc',  src);
  sessionStorage.setItem('bsp_imageName', name);
  sessionStorage.setItem('bsp_imageSize', file ? file.size : 0);
  sessionStorage.setItem('bsp_imageType', file ? file.type : 'image/jpeg');
}

function resetUpload() {
  previewPanel.classList.remove('visible');
  uploadZone.classList.remove('hidden');
  fileInput.value = '';
  sessionStorage.removeItem('bsp_imageSrc');
  sessionStorage.removeItem('bsp_photoId');
}

function goToEdit() {
  if (!sessionStorage.getItem('bsp_imageSrc')) {
    alert('Pilih foto terlebih dahulu!');
    return;
  }
  window.location.href = 'edit.php';
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
btnBrowse.addEventListener('click',  () => fileInput.click());
fileInput.addEventListener('change', (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); });
btnNext  .addEventListener('click',  goToEdit);
btnReupload.addEventListener('click', resetUpload);

/* Drag & Drop */
uploadZone.addEventListener('dragover',  (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', ()  => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});
uploadZone.addEventListener('click', (e) => {
  if (!e.target.closest('#btnBrowse')) fileInput.click();
});

/* ============================================================
   RECENT PHOTOS — LOCAL STORAGE
   ============================================================ */
function saveToRecent(src, name) {
  let recent = getRecent();
  recent = recent.filter(r => r.name !== name);
  recent.unshift({ src, name, ts: Date.now() });
  if (recent.length > MAX_RECENT) recent = recent.slice(0, MAX_RECENT);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch(e) { console.warn(e); }
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
    btn.addEventListener('click', (e) => { e.stopPropagation(); deleteRecent(parseInt(btn.dataset.index)); });
  });
}

function loadRecent(idx) {
  const recent = getRecent();
  if (!recent[idx]) return;
  sessionStorage.setItem('bsp_imageSrc',  recent[idx].src);
  sessionStorage.setItem('bsp_imageName', recent[idx].name);
  sessionStorage.setItem('bsp_imageSize', 0);
  sessionStorage.setItem('bsp_imageType', 'image/jpeg');
  showPreview(recent[idx].src, recent[idx].name, null);
}

function deleteRecent(idx) {
  let recent = getRecent();
  recent.splice(idx, 1);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch(e) {}
  renderRecent();
}

/* ============================================================
   INIT
   ============================================================ */
renderRecent();