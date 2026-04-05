/* ============================================================
   qr.js — Bali Sadhu Photo
   Fitur QR Code Download
   Depends on: qrcode.min.js (CDN), print.js sudah di-load
   ============================================================ */

const QRModule = {
  downloadUrl: null,
  expiresAt:   null,
  generated:   false,
};

// ─── GENERATE QR ─────────────────────────────────────────────
async function generateQR() {
  const btnGen   = document.getElementById('btnGenerateQR');
  const qrWrap   = document.getElementById('qrCodeWrap');
  const qrInfo   = document.getElementById('qrInfo');
  const qrStatus = document.getElementById('qrStatus');

  // Ambil file path dari sessionStorage (sudah di-set oleh frame.js / edit.js)
  const filePath = sessionStorage.getItem('bsp_framedPath')
                || sessionStorage.getItem('bsp_editedPath')
                || sessionStorage.getItem('bsp_serverPath');

  if (!filePath) {
    showToast('❌ Tidak ada foto. Kembali ke frame terlebih dahulu.');
    return;
  }

  // Jika sudah pernah generate, langsung tampilkan lagi
  if (QRModule.generated && QRModule.downloadUrl) {
    renderQR(QRModule.downloadUrl);
    return;
  }

  // Loading state
  if (btnGen)   { btnGen.textContent = '⏳ Membuat QR…'; btnGen.disabled = true; }
  if (qrStatus) { qrStatus.textContent = 'Menghubungi server…'; qrStatus.style.display = ''; }

  // Nama file untuk download
  const rawName = sessionStorage.getItem('bsp_imageName') || 'balisadhu_photo.png';
  const baseName = rawName.replace(/\.[^.]+$/, '');
  const fileName = `${baseName}_final.png`;

  try {
    const res  = await fetch('api/generate_qr.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        file_path:     filePath,
        file_name:     fileName,
        expires_hours: 24,    // link aktif 24 jam
        max_downloads: 5,     // maks 5x download
      }),
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch(e) {
      console.error('[qr.js] Non-JSON response:', text.slice(0, 300));
      showToast('❌ Server error saat generate QR');
      return;
    }

    if (!data.success) {
      showToast('❌ ' + (data.error || 'Gagal generate QR'));
      if (qrStatus) qrStatus.style.display = 'none';
      return;
    }

    QRModule.downloadUrl = data.download_url;
    QRModule.expiresAt   = data.expires_at;
    QRModule.generated   = true;

    renderQR(data.download_url);

    // Update info
    if (qrInfo) {
      let infoHtml = `<span class="qr-info-item">✓ Link aktif</span>`;
      if (data.expires_hrs > 0) {
        infoHtml += `<span class="qr-info-dot">·</span><span class="qr-info-item">⏳ ${data.expires_hrs} jam</span>`;
      }
      if (data.max_downloads > 0) {
        infoHtml += `<span class="qr-info-dot">·</span><span class="qr-info-item">⬇️ Max ${data.max_downloads}x</span>`;
      }
      qrInfo.innerHTML = infoHtml;
      qrInfo.style.display = 'flex';
    }
    if (qrStatus) qrStatus.style.display = 'none';

    showToast('✓ QR Code siap! Tunjukkan ke customer.');

  } catch(err) {
    console.error('[qr.js] Fetch error:', err);
    showToast('❌ Tidak bisa reach server');
    if (qrStatus) qrStatus.style.display = 'none';
  } finally {
    if (btnGen) { btnGen.textContent = '🔄 Buat QR Baru'; btnGen.disabled = false; }
  }
}

// ─── RENDER QR KE CANVAS ─────────────────────────────────────
function renderQR(url) {
  const qrWrap      = document.getElementById('qrCodeWrap');
  const placeholder = document.getElementById('qrPlaceholder');
  if (!qrWrap) return;

  // Bersihkan elemen lama
  qrWrap.innerHTML = '';
  qrWrap.style.display = 'flex';
  if (placeholder) placeholder.style.display = 'none';

  // Cek library tersedia
  if (typeof QRCode === 'undefined') {
    qrWrap.innerHTML = `<p style="font-size:11px;color:var(--text-dim);text-align:center;padding:12px;">
      ⚠️ Library QR belum load.<br>Pastikan internet tersambung.</p>`;
    return;
  }

  // qrcode.js inject <canvas> + <img> sekaligus → kita pakai div wrapper
  // lalu sembunyikan canvas, tampilkan img saja
  const tempDiv = document.createElement('div');
  qrWrap.appendChild(tempDiv);

  new QRCode(tempDiv, {
    text:         url,
    width:        220,
    height:       220,
    colorDark:    '#000000',
    colorLight:   '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Sembunyikan <canvas>, biarkan <img> saja yang tampil
  setTimeout(() => {
    const canvas = tempDiv.querySelector('canvas');
    const img    = tempDiv.querySelector('img');
    if (canvas) canvas.style.display = 'none';
    if (img) {
      img.style.cssText = `
        display: block;
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        border: 10px solid #ffffff;
        box-shadow: 0 4px 20px rgba(0,0,0,0.6);
      `;
    }
  }, 100);

  // Tampilkan action buttons
  const actions = document.getElementById('qrActions');
  if (actions) actions.style.display = 'flex';
}

// ─── COPY LINK ───────────────────────────────────────────────
function copyQRLink() {
  if (!QRModule.downloadUrl) { showToast('❌ Generate QR dulu'); return; }
  navigator.clipboard.writeText(QRModule.downloadUrl)
    .then(() => showToast('✓ Link di-copy!'))
    .catch(()  => showToast('❌ Gagal copy link'));
}

// ─── PRINT QR ────────────────────────────────────────────────
function printQR() {
  if (!QRModule.downloadUrl) { showToast('❌ Generate QR dulu'); return; }

  // Ambil <img> saja (canvas sudah disembunyikan)
  const qrImg = document.querySelector('#qrCodeWrap img');
  if (!qrImg) { showToast('❌ QR belum di-render'); return; }
  const qrSrc = qrImg.src;

  // Ambil nama file
  const rawName = sessionStorage.getItem('bsp_imageName') || 'Foto';
  const baseName = rawName.replace(/\.[^.]+$/, '');

  // Buka print window baru
  const win = window.open('', '_blank', 'width=500,height=700');
  if (!win) { showToast('⚠️ Pop-up diblokir. Izinkan pop-up untuk print QR.'); return; }

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>QR Code — ${baseName}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          font-family: 'Arial', sans-serif;
          background: #fff; color: #000;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 100vh; padding: 32px 24px; text-align: center;
        }
        .brand { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #9B7A2C; margin-bottom: 8px; }
        .title { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
        .subtitle { font-size: 12px; color: #666; margin-bottom: 24px; }
        .qr-box {
          border: 2px solid #C9A84C; border-radius: 12px;
          padding: 20px; display: inline-block; margin-bottom: 20px;
        }
        .qr-box img { display: block; }
        .instructions { font-size: 13px; color: #444; line-height: 1.8; margin-bottom: 16px; }
        .instructions strong { color: #000; }
        .url-box {
          background: #f5f5f5; border: 1px solid #ddd;
          border-radius: 6px; padding: 8px 14px;
          font-size: 10px; color: #666;
          word-break: break-all; max-width: 320px;
        }
        .footer { margin-top: 24px; font-size: 10px; color: #aaa; }
        @media print {
          body { padding: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="brand">Bali Sadhu Photo</div>
      <div class="title">📸 Foto Kamu Siap!</div>
      <div class="subtitle">Scan QR code ini untuk download foto resolusi penuh</div>
      <div class="qr-box">
        <img src="${qrSrc}" width="200" height="200" alt="QR Code Download">
      </div>
      <div class="instructions">
        <strong>Cara download:</strong><br>
        1. Buka kamera HP kamu<br>
        2. Arahkan ke QR code di atas<br>
        3. Tap notifikasi yang muncul<br>
        4. Klik tombol <strong>Download</strong>
      </div>
      <div class="url-box">${QRModule.downloadUrl}</div>
      <div class="footer">Link aktif 24 jam · Kualitas foto penuh tanpa kompresi</div>
      <script>window.onload = () => { window.print(); }<\/script>
    </body>
    </html>
  `);
  win.document.close();

  showToast('🖨️ Membuka print QR…');
}

// ─── RESET QR (untuk foto baru) ──────────────────────────────
function resetQR() {
  QRModule.downloadUrl = null;
  QRModule.expiresAt   = null;
  QRModule.generated   = false;

  const qrWrap   = document.getElementById('qrCodeWrap');
  const qrInfo   = document.getElementById('qrInfo');
  const qrActions= document.getElementById('qrActions');
  const qrStatus = document.getElementById('qrStatus');
  const btnGen   = document.getElementById('btnGenerateQR');

  if (qrWrap)    { qrWrap.innerHTML = ''; qrWrap.style.display = 'none'; }
  if (qrInfo)    qrInfo.style.display = 'none';
  if (qrActions) qrActions.style.display = 'none';
  if (qrStatus)  qrStatus.style.display = 'none';
  if (btnGen)    { btnGen.textContent = 'Generate QR Code'; btnGen.disabled = false; }
}

// ─── SETUP EVENTS ────────────────────────────────────────────
function setupQREvents() {
  document.getElementById('btnGenerateQR')?.addEventListener('click', generateQR);
  document.getElementById('btnCopyQRLink')?.addEventListener('click', copyQRLink);
  document.getElementById('btnPrintQR')?.addEventListener('click',    printQR);

  // Card toggle (pakai fungsi toggleCard dari print.js)
  document.getElementById('cardQR')?.querySelector('.action-card-header')
    ?.addEventListener('click', () => {
      if (typeof toggleCard === 'function') toggleCard('QR');
    });
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', setupQREvents);