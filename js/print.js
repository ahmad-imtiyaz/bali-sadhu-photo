/* ============================================================
   print.js — Bali Sadhu Photo
   v5.1 — FIX: loadFinalPhoto() baca dari server path (bsp_framedPath / bsp_editedPath)
               bukan dari base64 sessionStorage yang crash untuk foto besar
   ============================================================ */

const PS = {
  src: null, imgEl: null, width: 0, height: 0,
  copyCount: 1, dlFormat: 'png', waFormat: 'png',
  contacts: [], selectedContact: null,
};
let _toastTimer;

// ─── UTILITIES ───────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, duration) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), duration || 3200);
}

function normalizePhoneClient(raw) {
  const clean = raw.replace(/[^0-9]/g,'');
  if (!clean) return '';
  if (clean.startsWith('08'))  return '62' + clean.slice(1);
  if (clean.startsWith('8') && !clean.startsWith('62')) return '62' + clean;
  if (clean.startsWith('62')) return clean;
  if (clean.length >= 10) return clean;
  return '';
}

// ─── CARD TOGGLE ─────────────────────────────────────────────
function toggleCard(name) {
  const card = document.getElementById('card' + name);
  if (!card) return;
  const isOpen = card.classList.contains('open');
  ['Print','Download','Wa'].forEach(n => {
    const c = document.getElementById('card' + n);
    if (c) c.classList.remove('open');
  });
  if (!isOpen) card.classList.add('open');
}

// ─── WA TABS ─────────────────────────────────────────────────
function switchWaTab(tab) {
  document.querySelectorAll('.wa-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.wa-tab-panel').forEach(p => p.classList.remove('active'));
  const btn   = document.querySelector(`.wa-tab[data-watab="${tab}"]`);
  const panel = document.getElementById(`watab-${tab}`);
  if (btn)   btn.classList.add('active');
  if (panel) panel.classList.add('active');
}

// ─── PRINT ───────────────────────────────────────────────────
function changeCopy(delta) {
  PS.copyCount = Math.max(1, Math.min(99, PS.copyCount + delta));
  const el = document.getElementById('copyCount');
  if (el) el.textContent = PS.copyCount;
}

function doPrint() {
  if (!PS.src) { showToast('❌ Tidak ada foto'); return; }
  const orient = document.getElementById('printOrient')?.value || 'auto';
  let styleTag = document.getElementById('printOrientStyle');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'printOrientStyle';
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = orient !== 'auto'
    ? `@page { size: ${orient}; margin: 0; }`
    : `@page { margin: 0; size: auto; }`;
  const frame = document.getElementById('printFrame');
  if (frame) {
    frame.innerHTML = '';
    for (let i = 0; i < PS.copyCount; i++) {
      const img = document.createElement('img');
      img.src = PS.src; img.alt = 'Print Photo';
      if (PS.copyCount > 1) img.style.cssText = 'max-width:48%;max-height:48vh;object-fit:contain;margin:4px;';
      frame.appendChild(img);
    }
  }
  showToast('🖨️ Membuka dialog cetak…');
  setTimeout(() => window.print(), 300);
}

// ─── DOWNLOAD ────────────────────────────────────────────────
function selectFmt(btn, fmt) {
  document.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  PS.dlFormat = fmt;
  const qualRow = document.getElementById('qualityRow');
  if (qualRow) qualRow.style.display = fmt === 'png' ? 'none' : '';
}

function doDownload() {
  if (!PS.imgEl) { showToast('❌ Foto belum siap'); return; }
  showToast('⏳ Menyiapkan download…');

  const quality  = parseInt(document.getElementById('slQuality')?.value || '92') / 100;
  const mimeMap  = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
  const mime     = mimeMap[PS.dlFormat] || 'image/png';
  const name     = (sessionStorage.getItem('bsp_imageName') || 'balisadhu').replace(/\.[^.]+$/, '');

  // Untuk foto besar: pakai toBlob() bukan toDataURL() agar tidak OOM
  const canvas = document.createElement('canvas');
  canvas.width  = PS.width;
  canvas.height = PS.height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(PS.imgEl, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) { showToast('❌ Gagal membuat file download'); return; }
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${name}_final.${PS.dlFormat}`;
    link.href     = url;
    link.click();
    // Bersihkan object URL setelah download
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    showToast(`✓ Foto didownload sebagai ${PS.dlFormat.toUpperCase()}`);
  }, mime, quality);
}

// ─── WA FORMAT ───────────────────────────────────────────────
function selectWaFmt(btn, fmt) {
  document.querySelectorAll('.wa-fmt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  PS.waFormat = fmt;
}

// ─── CONTACTS ────────────────────────────────────────────────
function filterContacts() {
  const q = (document.getElementById('waSearch')?.value || '').toLowerCase();
  if (!q) { renderContacts(PS.contacts); return; }
  renderContacts(PS.contacts.filter(c =>
    c.phone.includes(q) || (c.name || '').toLowerCase().includes(q)
  ));
}

function selectContact(id) {
  const c = PS.contacts.find(x => String(x.id) === String(id));
  if (!c) return;
  PS.selectedContact = c;
  renderContacts(PS.contacts);
  const panel = document.getElementById('waSendPanel');
  const badge = document.getElementById('waSelectedBadge');
  if (!panel || !badge) return;
  const initial = (c.name || c.phone).charAt(0).toUpperCase();
  badge.innerHTML = `
    <div class="badge-avatar">${initial}</div>
    <div class="badge-info">
      <span class="badge-name">${escHtml(c.name || '—')}</span>
      <span class="badge-phone">+${escHtml(c.phone)}</span>
    </div>
    <button class="badge-clear" id="btnBadgeClear" title="Batal">✕</button>`;
  document.getElementById('btnBadgeClear')?.addEventListener('click', clearSelectedContact);
  panel.style.display = 'flex';
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

function clearSelectedContact() {
  PS.selectedContact = null;
  renderContacts(PS.contacts);
  const panel = document.getElementById('waSendPanel');
  if (panel) panel.style.display = 'none';
}

async function toggleFavorite(id) {
  try {
    const res  = await fetch(`api/wa_contacts.php?id=${id}`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      const c = PS.contacts.find(x => String(x.id) === String(id));
      if (c) c.is_favorite = data.is_favorite ? 1 : 0;
      PS.contacts.sort((a,b) =>
        b.is_favorite - a.is_favorite ||
        new Date(b.last_used_at || 0) - new Date(a.last_used_at || 0)
      );
      renderContacts(PS.contacts);
      showToast(data.is_favorite ? '⭐ Ditambah ke favorit' : '☆ Dihapus dari favorit');
    }
  } catch(err) { showToast('❌ Gagal update favorit'); }
}

async function deleteContact(id) {
  if (!confirm('Hapus kontak ini?')) return;
  try {
    const res  = await fetch(`api/wa_contacts.php?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      PS.contacts = PS.contacts.filter(c => String(c.id) !== String(id));
      if (String(PS.selectedContact?.id) === String(id)) clearSelectedContact();
      renderContacts(PS.contacts);
      showToast('🗑 Kontak dihapus');
    }
  } catch(err) { showToast('❌ Gagal hapus kontak'); }
}

function renderContacts(list) {
  const wrap  = document.getElementById('waContactsList');
  const empty = document.getElementById('waContactsEmpty');
  if (!wrap) return;

  wrap.querySelectorAll('.wa-contact-item').forEach(el => el.remove());

  if (!list.length) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.forEach(c => {
    const isSelected = String(PS.selectedContact?.id) === String(c.id);
    const item       = document.createElement('div');
    item.className   = `wa-contact-item${isSelected ? ' selected' : ''}`;
    item.dataset.id  = c.id;
    const initial    = (c.name || c.phone).charAt(0).toUpperCase();

    item.innerHTML = `
      <div class="wa-contact-avatar${isSelected ? ' sel' : ''}">${initial}</div>
      <div class="wa-contact-info">
        <div class="wa-contact-name">${escHtml(c.name || '—')}</div>
        <div class="wa-contact-phone">+${escHtml(c.phone)}</div>
      </div>
      <div class="wa-contact-actions">
        <button class="wa-icon-btn fav-btn${c.is_favorite ? ' active' : ''}" title="Favorit">⭐</button>
        <button class="wa-icon-btn del-btn" title="Hapus">✕</button>
      </div>`;

    item.querySelector('.wa-contact-info').addEventListener('click', () => selectContact(c.id));
    item.querySelector('.fav-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(c.id); });
    item.querySelector('.del-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteContact(c.id); });

    wrap.appendChild(item);
  });
}

async function loadContacts() {
  try {
    const res  = await fetch('api/wa_contacts.php');
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch(e) { console.error('[loadContacts] Non-JSON:', text.slice(0,300)); return; }
    if (data.success) {
      PS.contacts = data.contacts || [];
      renderContacts(PS.contacts);
    }
  } catch(err) { console.warn('[loadContacts] network error:', err.message); }
}

async function updateContactUsage(phone, name) {
  try {
    await fetch('api/wa_contacts.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name }),
    });
    await loadContacts();
  } catch(err) {}
}

async function doAddContact() {
  const rawPhone = document.getElementById('addPhone')?.value || '';
  const name     = document.getElementById('addName')?.value?.trim() || '';
  const phone    = normalizePhoneClient(rawPhone);

  if (!phone) { showToast('❌ Nomor tidak valid (contoh: 08123456789)'); return; }

  const exists = PS.contacts.find(c => c.phone === phone);
  if (exists) {
    showToast('⚠️ Nomor sudah ada di kontak');
    switchWaTab('contacts');
    selectContact(exists.id);
    return;
  }

  const btnSave = document.querySelector('.btn-add-contact');
  if (btnSave) { btnSave.textContent = 'Menyimpan…'; btnSave.disabled = true; }

  try {
    const res  = await fetch('api/wa_contacts.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name }),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch(parseErr) {
      console.error('[doAddContact] Non-JSON:', text.slice(0, 500));
      showToast('❌ Server error.');
      return;
    }
    if (data.success) {
      showToast(`✓ Kontak "${name || phone}" tersimpan!`);
      document.getElementById('addPhone').value = '';
      document.getElementById('addName').value  = '';
      await loadContacts();
      switchWaTab('contacts');
      const newContact = PS.contacts.find(c => c.phone === phone);
      if (newContact) selectContact(newContact.id);
    } else {
      showToast('❌ ' + (data.error || 'Gagal simpan'));
    }
  } catch(err) {
    showToast('❌ Tidak bisa reach server.');
  } finally {
    if (btnSave) { btnSave.textContent = 'Simpan Kontak'; btnSave.disabled = false; }
  }
}

async function doSendWa() {
  if (!PS.selectedContact) { showToast('❌ Pilih kontak terlebih dahulu'); return; }
  if (!PS.imgEl) { showToast('❌ Foto belum siap'); return; }

  const contact  = PS.selectedContact;
  const phone    = contact.phone;
  const name     = contact.name || '';
  const mimeMap  = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
  const mime     = mimeMap[PS.waFormat] || 'image/png';
  const ext      = PS.waFormat;

  const canvas = document.createElement('canvas');
  canvas.width = PS.width; canvas.height = PS.height;
  canvas.getContext('2d').drawImage(PS.imgEl, 0, 0);
  const blob     = await new Promise(res => canvas.toBlob(res, mime, 0.92));
  const fileName = `balisadhu_${Date.now()}.${ext}`;
  const file     = new File([blob], fileName, { type: mime });

  const greeting = name ? `Halo ${name}! ` : 'Halo! ';
  const baseMsg  = `${greeting}Ini foto dari Bali Sadhu Photo 📸`;

  const canShare = navigator.canShare && navigator.canShare({ files: [file] });
  if (canShare) {
    try {
      showToast('📤 Membuka WhatsApp…');
      await navigator.share({ files: [file], title: 'Foto dari Bali Sadhu Photo', text: baseMsg });
      await updateContactUsage(phone, name);
      showToast('✓ Foto berhasil dikirim!');
      return;
    } catch(err) {
      if (err.name === 'AbortError') { showToast('Dibatalkan'); return; }
    }
  }

  showToast('⏳ Menyiapkan link foto…');
  let shareUrl = '';
  try {
    const fd = new FormData();
    fd.append('photo', blob, fileName);
    const res  = await fetch('api/wa_upload.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) shareUrl = data.url;
  } catch(err) { console.warn('[WA upload failed]:', err.message); }

  await updateContactUsage(phone, name);
  const msgText = shareUrl ? `${baseMsg}\n\n${shareUrl}` : baseMsg;
  const waUrl   = `https://wa.me/${phone}?text=${encodeURIComponent(msgText)}`;
  showToast('✓ Membuka WhatsApp…');
  window.open(waUrl, '_blank');
}

// ─── LOAD FOTO FINAL — FIX FILE BESAR ────────────────────────
/*
 * PRIORITAS sumber gambar (dari yang paling diutamakan):
 *
 * 1. bsp_framedPath  → path server hasil frame.js goToPrint() upload   ← UTAMA
 * 2. bsp_editedPath  → path server hasil edit.js goToFrame() upload    ← FALLBACK 1
 * 3. bsp_serverPath  → path server foto original dari index.js         ← FALLBACK 2
 * 4. bsp_framedSrc   → base64 lama (hanya ada jika foto kecil < 4MB)  ← FALLBACK 3
 * 5. bsp_editedSrc   → base64 lama (hanya ada jika foto kecil < 4MB)  ← FALLBACK 4
 * 6. bsp_imageSrc    → base64 original (hanya ada jika foto < 4MB)    ← FALLBACK 5
 * 7. Tidak ada       → redirect ke index
 *
 * KENAPA base64 crash untuk file besar:
 *   sessionStorage limit = 5-10MB
 *   Foto 10-20MB → canvas.toDataURL() = string 30-60MB → QuotaExceededError
 *   → sessionStorage.getItem() return null → foto tidak bisa load
 */
function loadFinalPhoto() {
  // Coba server path dulu (tidak ada limit ukuran)
  const framedPath = sessionStorage.getItem('bsp_framedPath');
  const editedPath = sessionStorage.getItem('bsp_editedPath');
  const serverPath = sessionStorage.getItem('bsp_serverPath');

  // Fallback base64 (hanya berhasil untuk foto kecil < 4MB)
  const framedSrc  = sessionStorage.getItem('bsp_framedSrc');
  const editedSrc  = sessionStorage.getItem('bsp_editedSrc');
  const imageSrc   = sessionStorage.getItem('bsp_imageSrc');

  // Pilih sumber terbaik
  const src = framedPath || editedPath || serverPath || framedSrc || editedSrc || imageSrc;

  if (!src) {
    showToast('❌ Tidak ada foto. Kembali ke index…');
    setTimeout(() => { window.location.href = 'index.php'; }, 1500);
    return;
  }

  // Simpan src ke PS untuk dipakai print/download/WA
  PS.src = src;

  // Tampilkan loading state
  const preview = document.getElementById('finalPreview');
  const loading = document.getElementById('previewLoading');
  if (preview) preview.style.display = 'none';
  if (loading) loading.style.display = '';

  const img = new Image();

  img.onload = () => {
    PS.imgEl  = img;
    PS.width  = img.naturalWidth;
    PS.height = img.naturalHeight;

    if (preview) { preview.src = src; preview.style.display = ''; }
    if (loading) loading.style.display = 'none';

    const meta   = document.getElementById('previewMeta');
    const sizeEl = document.getElementById('metaSize');
    if (meta)    meta.style.display = '';
    if (sizeEl)  sizeEl.textContent = `${PS.width} × ${PS.height} px`;
  };

  img.onerror = () => {
    console.error('[print.js] Gagal load dari:', src);

    // Jika src adalah server path dan gagal, coba fallback base64
    const fallback = framedSrc || editedSrc || imageSrc;
    if (fallback && src !== fallback) {
      console.warn('[print.js] Mencoba fallback base64…');
      showToast('⚠️ Mencoba sumber alternatif…');
      PS.src    = fallback;
      img.src   = fallback;
      return;
    }

    // Semua gagal
    if (loading) loading.style.display = 'none';
    showToast('❌ Gagal memuat foto. Kembali ke frame…');
    setTimeout(() => { window.location.href = 'frame.php'; }, 2000);
  };

  img.src = src;
}

// ─── SETUP EVENT LISTENERS ───────────────────────────────────
function setupEvents() {
  // Card headers
  document.getElementById('cardPrint')?.querySelector('.action-card-header')
    ?.addEventListener('click', () => toggleCard('Print'));
  document.getElementById('cardDownload')?.querySelector('.action-card-header')
    ?.addEventListener('click', () => toggleCard('Download'));
  document.getElementById('cardWa')?.querySelector('.action-card-header')
    ?.addEventListener('click', () => toggleCard('Wa'));

  // Print
  document.getElementById('btnMinus')?.addEventListener('click', () => changeCopy(-1));
  document.getElementById('btnPlus')?.addEventListener('click',  () => changeCopy(1));
  document.getElementById('btnPrint')?.addEventListener('click', doPrint);

  // Download
  document.querySelectorAll('.fmt-btn').forEach(btn => {
    btn.addEventListener('click', () => selectFmt(btn, btn.dataset.fmt));
  });
  document.getElementById('btnDownload')?.addEventListener('click', doDownload);

  // WA tabs
  document.querySelectorAll('.wa-tab').forEach(btn => {
    btn.addEventListener('click', () => switchWaTab(btn.dataset.watab));
  });

  // WA format
  document.querySelectorAll('.wa-fmt-btn').forEach(btn => {
    btn.addEventListener('click', () => selectWaFmt(btn, btn.dataset.wafmt));
  });

  // WA search
  document.getElementById('waSearch')?.addEventListener('input', filterContacts);

  // WA send
  document.getElementById('btnSendWa')?.addEventListener('click', doSendWa);

  // WA add contact
  document.getElementById('btnAddContact')?.addEventListener('click', doAddContact);
  document.getElementById('addPhone')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doAddContact();
  });

  // WA add-contact tab shortcut
  document.getElementById('btnAddTabInline')?.addEventListener('click', () => switchWaTab('add'));

  // Quality slider
  document.getElementById('slQuality')?.addEventListener('input', function() {
    const v = document.getElementById('valQuality');
    if (v) v.textContent = this.value + '%';
  });

  // Image name
  const name = sessionStorage.getItem('bsp_imageName') || 'photo.jpg';
  const el   = document.getElementById('imageFileName');
  if (el) el.textContent = name;
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadFinalPhoto();
  loadContacts();
  setupEvents();
});