/* ============================================================
   frame.js — Bali Sadhu Photo
   - Bali/Hindu ornamental default frames (SVG)
   - Canva-like transform: drag, scale, rotate, flip H/V
   - Upload PNG → server → fallback lokal
============================================================ */

// ─── EARLY DECLARATIONS ──────────────────────────────────────
let frameImgEl  = null;
let frameDragEl = null;
let _toastTimer;

const BG_SWATCHES = [
  '#ffffff','#000000','#1a1208','#f9f6f0',
  '#0d1b2a','#2a1a1a','#0d1a12','#1e0a1e',
  '#5c3d1e','#C9A84C','#2D5A3D','#888880',
];

// ─── STATE ───────────────────────────────────────────────────
const S = {
  photo: null,
  photoW: 0, photoH: 0,
  orientation: 'portrait',
  bgColor: '#ffffff',
  padding: 0,

  zoom: 1,
  panX: 0, panY: 0,

  activeFrame: null,
  frameOffX: 0,
  frameOffY: 0,
  frameScale: 1,
  frameOpacity: 1,
  frameRotate: 0,
  frameFlipH: false,
  frameFlipV: false,

  frames: [],
  filterOrient: 'all',
  
  touchMode: 'pan', // ← TAMBAHKAN INI (baris baru di paling bawah sebelum closing })
};

// ─── BALI/HINDU ORNAMENTAL DEFAULT FRAMES ────────────────────
const DEFAULT_FRAMES = [

  // 1. PURA GATE — Full ornamental Bali gate border
  {
    id: 'bali-1',
    name: 'Pura Gate',
    orient: 'portrait',
    isDefault: true,
    makeSvg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C9A84C"/>
      <stop offset="50%" stop-color="#E2C97E"/>
      <stop offset="100%" stop-color="#9B7A2C"/>
    </linearGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#9B7A2C"/>
      <stop offset="50%" stop-color="#E2C97E"/>
      <stop offset="100%" stop-color="#9B7A2C"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Overlay panels -->
  <rect x="0" y="0" width="${w}" height="120" fill="rgba(8,5,2,0.92)"/>
  <rect x="0" y="${h-140}" width="${w}" height="140" fill="rgba(8,5,2,0.92)"/>
  <rect x="0" y="120" width="60" height="${h-260}" fill="rgba(8,5,2,0.88)"/>
  <rect x="${w-60}" y="120" width="60" height="${h-260}" fill="rgba(8,5,2,0.88)"/>

  <!-- Top gold border lines -->
  <rect x="0" y="0" width="${w}" height="3" fill="url(#g2)"/>
  <rect x="0" y="118" width="${w}" height="2" fill="url(#g2)" opacity="0.7"/>
  <rect x="0" y="122" width="${w}" height="1" fill="#C9A84C" opacity="0.3"/>

  <!-- Bottom gold border lines -->
  <rect x="0" y="${h-142}" width="${w}" height="1" fill="#C9A84C" opacity="0.3"/>
  <rect x="0" y="${h-140}" width="${w}" height="2" fill="url(#g2)" opacity="0.7"/>
  <rect x="0" y="${h-3}" width="${w}" height="3" fill="url(#g2)"/>

  <!-- Left border lines -->
  <rect x="0" y="120" width="2" height="${h-260}" fill="url(#g1)" opacity="0.9"/>
  <rect x="58" y="120" width="2" height="${h-260}" fill="url(#g1)" opacity="0.5"/>

  <!-- Right border lines -->
  <rect x="${w-2}" y="120" width="2" height="${h-260}" fill="url(#g1)" opacity="0.9"/>
  <rect x="${w-60}" y="120" width="2" height="${h-260}" fill="url(#g1)" opacity="0.5"/>

  <!-- TOP: Candi/temple silhouette -->
  <g fill="url(#g2)" filter="url(#glow)" opacity="0.9">
    <!-- Main temple spire center -->
    <polygon points="${w/2},8 ${w/2-4},28 ${w/2+4},28"/>
    <polygon points="${w/2},14 ${w/2-10},40 ${w/2+10},40"/>
    <polygon points="${w/2},22 ${w/2-18},58 ${w/2+18},58"/>
    <polygon points="${w/2},32 ${w/2-28},78 ${w/2+28},78"/>
    <rect x="${w/2-32}" y="78" width="64" height="6" rx="2"/>
    <rect x="${w/2-40}" y="84" width="80" height="8" rx="2"/>
    <rect x="${w/2-48}" y="92" width="96" height="6" rx="2"/>
    <!-- Steps -->
    <rect x="${w/2-56}" y="98" width="112" height="5" rx="1"/>
    <rect x="${w/2-68}" y="103" width="136" height="5" rx="1"/>
    <rect x="${w/2-80}" y="108" width="160" height="5" rx="1"/>
    <!-- Base platform -->
    <rect x="${w/2-96}" y="113" width="192" height="6" rx="1"/>
  </g>

  <!-- Top left mini spire -->
  <g fill="#C9A84C" opacity="0.6" transform="translate(${w*0.15}, 10)">
    <polygon points="0,4 -3,20 3,20"/>
    <polygon points="0,10 -7,34 7,34"/>
    <rect x="-10" y="34" width="20" height="4" rx="1"/>
    <rect x="-13" y="38" width="26" height="4" rx="1"/>
  </g>

  <!-- Top right mini spire -->
  <g fill="#C9A84C" opacity="0.6" transform="translate(${w*0.85}, 10)">
    <polygon points="0,4 -3,20 3,20"/>
    <polygon points="0,10 -7,34 7,34"/>
    <rect x="-10" y="34" width="20" height="4" rx="1"/>
    <rect x="-13" y="38" width="26" height="4" rx="1"/>
  </g>

  <!-- Top decorative band — lotus chain -->
  ${Array.from({length: 9}, (_,i) => {
    const cx = w * (i+1) / 10;
    return `<g transform="translate(${cx}, 62)">
      <ellipse cx="0" cy="0" rx="8" ry="3" fill="#C9A84C" opacity="0.5"/>
      <ellipse cx="0" cy="0" rx="3" ry="8" fill="#C9A84C" opacity="0.5"/>
      <circle cx="0" cy="0" r="3" fill="#C9A84C" opacity="0.8"/>
      <circle cx="0" cy="0" r="1.5" fill="#1a1208"/>
    </g>`;
  }).join('')}

  <!-- BOTTOM decorative panel -->
  <!-- Garuda/bird motif center bottom -->
  <g transform="translate(${w/2}, ${h-70})" fill="#C9A84C" opacity="0.9" filter="url(#glow)">
    <!-- Wings -->
    <path d="M0,0 C-20,-12 -50,-8 -70,0 C-50,-4 -28,4 0,6 C28,4 50,-4 70,0 C50,-8 20,-12 0,0Z" opacity="0.7"/>
    <!-- Body -->
    <ellipse cx="0" cy="2" rx="10" ry="14"/>
    <!-- Head -->
    <circle cx="0" cy="-10" r="7"/>
    <circle cx="0" cy="-10" r="4" fill="#1a1208"/>
    <circle cx="0" cy="-10" r="2" fill="#C9A84C"/>
    <!-- Crown -->
    <polygon points="0,-18 -4,-12 4,-12"/>
    <polygon points="-6,-16 -8,-10 -3,-10"/>
    <polygon points="6,-16 8,-10 3,-10"/>
    <!-- Tail feathers -->
    <path d="M-8,14 C-16,24 -12,32 -8,30 C-4,28 -2,18 0,16Z" opacity="0.8"/>
    <path d="M8,14 C16,24 12,32 8,30 C4,28 2,18 0,16Z" opacity="0.8"/>
    <path d="M0,14 C-2,26 2,34 0,32 C-2,30 -2,22 0,20Z"/>
  </g>

  <!-- Bottom lotus band -->
  ${Array.from({length: 9}, (_,i) => {
    const cx = w * (i+1) / 10;
    return `<g transform="translate(${cx}, ${h-108})">
      <ellipse cx="0" cy="0" rx="8" ry="3" fill="#C9A84C" opacity="0.5"/>
      <ellipse cx="0" cy="0" rx="3" ry="8" fill="#C9A84C" opacity="0.5"/>
      <circle cx="0" cy="0" r="3" fill="#C9A84C" opacity="0.8"/>
      <circle cx="0" cy="0" r="1.5" fill="#1a1208"/>
    </g>`;
  }).join('')}

  <!-- Bottom horizontal line -->
  <line x1="20" y1="${h-112}" x2="${w-20}" y2="${h-112}" stroke="#C9A84C" stroke-width="0.8" opacity="0.5"/>
  <line x1="20" y1="${h-30}" x2="${w-20}" y2="${h-30}" stroke="#C9A84C" stroke-width="0.8" opacity="0.5"/>

  <!-- Left side: vertical lotus chain -->
  ${Array.from({length: 6}, (_,i) => {
    const cy = 130 + (h-270) * (i+1) / 7;
    return `<g transform="translate(30, ${cy})">
      <ellipse cx="0" cy="0" rx="3" ry="10" fill="#C9A84C" opacity="0.4"/>
      <ellipse cx="0" cy="0" rx="10" ry="3" fill="#C9A84C" opacity="0.4"/>
      <circle cx="0" cy="0" r="3.5" fill="#C9A84C" opacity="0.7"/>
      <circle cx="0" cy="0" r="1.5" fill="#1a1208"/>
    </g>`;
  }).join('')}

  <!-- Right side: vertical lotus chain -->
  ${Array.from({length: 6}, (_,i) => {
    const cy = 130 + (h-270) * (i+1) / 7;
    return `<g transform="translate(${w-30}, ${cy})">
      <ellipse cx="0" cy="0" rx="3" ry="10" fill="#C9A84C" opacity="0.4"/>
      <ellipse cx="0" cy="0" rx="10" ry="3" fill="#C9A84C" opacity="0.4"/>
      <circle cx="0" cy="0" r="3.5" fill="#C9A84C" opacity="0.7"/>
      <circle cx="0" cy="0" r="1.5" fill="#1a1208"/>
    </g>`;
  }).join('')}

  <!-- Corner ornaments: Kala face motif (simplified) -->
  ${[[20,20],[w-20,20],[20,h-20],[w-20,h-20]].map(([cx,cy]) => `
    <g transform="translate(${cx},${cy})">
      <circle r="14" fill="#C9A84C" opacity="0.15"/>
      <circle r="10" fill="none" stroke="#C9A84C" stroke-width="1.5" opacity="0.8"/>
      <circle r="5" fill="#C9A84C" opacity="0.9"/>
      <circle r="2.5" fill="#1a1208"/>
      <circle r="1.2" fill="#C9A84C"/>
      <!-- Decorative rays -->
      ${Array.from({length:8},(_,i)=>{
        const a = i*45*Math.PI/180;
        const x1 = Math.cos(a)*11, y1 = Math.sin(a)*11;
        const x2 = Math.cos(a)*16, y2 = Math.sin(a)*16;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#C9A84C" stroke-width="1" opacity="0.6"/>`;
      }).join('')}
    </g>`).join('')}
</svg>`,
  },

  // 2. BATIK KAWUNG — Classic Javanese Kawung pattern border
  {
    id: 'bali-2',
    name: 'Batik Kawung',
    orient: 'portrait',
    isDefault: true,
    makeSvg: (w, h) => {
      const bw = 56; // border width
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <pattern id="kawung" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="#0d0900"/>
      <!-- Kawung: 4 ovals arranged in cross -->
      <ellipse cx="14" cy="7" rx="5" ry="5.5" fill="none" stroke="#C9A84C" stroke-width="0.8" opacity="0.8"/>
      <ellipse cx="14" cy="21" rx="5" ry="5.5" fill="none" stroke="#C9A84C" stroke-width="0.8" opacity="0.8"/>
      <ellipse cx="7" cy="14" rx="5.5" ry="5" fill="none" stroke="#C9A84C" stroke-width="0.8" opacity="0.8"/>
      <ellipse cx="21" cy="14" rx="5.5" ry="5" fill="none" stroke="#C9A84C" stroke-width="0.8" opacity="0.8"/>
      <circle cx="14" cy="14" r="2.5" fill="#C9A84C" opacity="0.4"/>
      <circle cx="14" cy="14" r="1.2" fill="#C9A84C" opacity="0.8"/>
    </pattern>
    <pattern id="kawungCorner" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="#100b00"/>
      <ellipse cx="14" cy="7" rx="5" ry="5.5" fill="none" stroke="#E2C97E" stroke-width="1" opacity="0.9"/>
      <ellipse cx="14" cy="21" rx="5" ry="5.5" fill="none" stroke="#E2C97E" stroke-width="1" opacity="0.9"/>
      <ellipse cx="7" cy="14" rx="5.5" ry="5" fill="none" stroke="#E2C97E" stroke-width="1" opacity="0.9"/>
      <ellipse cx="21" cy="14" rx="5.5" ry="5" fill="none" stroke="#E2C97E" stroke-width="1" opacity="0.9"/>
      <circle cx="14" cy="14" r="2.5" fill="#C9A84C" opacity="0.6"/>
      <circle cx="14" cy="14" r="1.2" fill="#E2C97E"/>
    </pattern>
    <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C9A84C"/>
      <stop offset="50%" stop-color="#E2C97E"/>
      <stop offset="100%" stop-color="#9B7A2C"/>
    </linearGradient>
    <linearGradient id="gh" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#9B7A2C"/>
      <stop offset="50%" stop-color="#E2C97E"/>
      <stop offset="100%" stop-color="#9B7A2C"/>
    </linearGradient>
  </defs>

  <!-- Border panels filled with Kawung pattern -->
  <rect x="0" y="0" width="${w}" height="${bw}" fill="url(#kawung)"/>
  <rect x="0" y="${h-bw}" width="${w}" height="${bw}" fill="url(#kawung)"/>
  <rect x="0" y="${bw}" width="${bw}" height="${h-bw*2}" fill="url(#kawung)"/>
  <rect x="${w-bw}" y="${bw}" width="${bw}" height="${h-bw*2}" fill="url(#kawung)"/>

  <!-- Corner squares with brighter pattern -->
  <rect x="0" y="0" width="${bw}" height="${bw}" fill="url(#kawungCorner)"/>
  <rect x="${w-bw}" y="0" width="${bw}" height="${bw}" fill="url(#kawungCorner)"/>
  <rect x="0" y="${h-bw}" width="${bw}" height="${bw}" fill="url(#kawungCorner)"/>
  <rect x="${w-bw}" y="${h-bw}" width="${bw}" height="${bw}" fill="url(#kawungCorner)"/>

  <!-- Gold edge lines -->
  <rect x="0" y="0" width="${w}" height="2.5" fill="url(#gh)"/>
  <rect x="0" y="${bw-2.5}" width="${w}" height="2.5" fill="url(#gh)" opacity="0.8"/>
  <rect x="0" y="${h-bw}" width="${w}" height="2.5" fill="url(#gh)" opacity="0.8"/>
  <rect x="0" y="${h-2.5}" width="${w}" height="2.5" fill="url(#gh)"/>
  <rect x="0" y="0" width="2.5" height="${h}" fill="url(#gv)"/>
  <rect x="${bw-2.5}" y="0" width="2.5" height="${h}" fill="url(#gv)" opacity="0.8"/>
  <rect x="${w-bw}" y="0" width="2.5" height="${h}" fill="url(#gv)" opacity="0.8"/>
  <rect x="${w-2.5}" y="0" width="2.5" height="${h}" fill="url(#gv)"/>

  <!-- Center diamond ornament top -->
  <g transform="translate(${w/2}, ${bw/2})">
    <polygon points="0,-14 14,0 0,14 -14,0" fill="none" stroke="#E2C97E" stroke-width="1.5"/>
    <polygon points="0,-8 8,0 0,8 -8,0" fill="#C9A84C" opacity="0.8"/>
    <circle r="3" fill="#1a1208"/>
    <circle r="1.5" fill="#E2C97E"/>
  </g>

  <!-- Center diamond ornament bottom -->
  <g transform="translate(${w/2}, ${h-bw/2})">
    <polygon points="0,-14 14,0 0,14 -14,0" fill="none" stroke="#E2C97E" stroke-width="1.5"/>
    <polygon points="0,-8 8,0 0,8 -8,0" fill="#C9A84C" opacity="0.8"/>
    <circle r="3" fill="#1a1208"/>
    <circle r="1.5" fill="#E2C97E"/>
  </g>

  <!-- Center diamond ornament left -->
  <g transform="translate(${bw/2}, ${h/2})">
    <polygon points="0,-14 14,0 0,14 -14,0" fill="none" stroke="#E2C97E" stroke-width="1.5"/>
    <polygon points="0,-8 8,0 0,8 -8,0" fill="#C9A84C" opacity="0.8"/>
    <circle r="3" fill="#1a1208"/>
    <circle r="1.5" fill="#E2C97E"/>
  </g>

  <!-- Center diamond ornament right -->
  <g transform="translate(${w-bw/2}, ${h/2})">
    <polygon points="0,-14 14,0 0,14 -14,0" fill="none" stroke="#E2C97E" stroke-width="1.5"/>
    <polygon points="0,-8 8,0 0,8 -8,0" fill="#C9A84C" opacity="0.8"/>
    <circle r="3" fill="#1a1208"/>
    <circle r="1.5" fill="#E2C97E"/>
  </g>

  <!-- Corner medallions -->
  ${[[bw/2,bw/2],[w-bw/2,bw/2],[bw/2,h-bw/2],[w-bw/2,h-bw/2]].map(([cx,cy])=>`
    <g transform="translate(${cx},${cy})">
      <circle r="18" fill="rgba(201,168,76,0.12)"/>
      <circle r="14" fill="none" stroke="#C9A84C" stroke-width="1.5" opacity="0.8"/>
      <circle r="8" fill="#C9A84C" opacity="0.2"/>
      <circle r="5" fill="#C9A84C" opacity="0.8"/>
      <circle r="2.5" fill="#1a1208"/>
      <circle r="1.2" fill="#E2C97E"/>
    </g>`).join('')}
</svg>`;
    },
  },

  // 3. PEPADUAN — Landscape cetak-style with Bali ornaments
  {
    id: 'bali-3',
    name: 'Pepaduan Cetak',
    orient: 'landscape',
    isDefault: true,
    makeSvg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="gh3" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#9B7A2C"/>
      <stop offset="30%" stop-color="#E2C97E"/>
      <stop offset="70%" stop-color="#E2C97E"/>
      <stop offset="100%" stop-color="#9B7A2C"/>
    </linearGradient>
    <linearGradient id="gv3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#9B7A2C"/>
      <stop offset="50%" stop-color="#E2C97E"/>
      <stop offset="100%" stop-color="#9B7A2C"/>
    </linearGradient>
    <filter id="glow3"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Right panel (label area) -->
  <rect x="${w-110}" y="0" width="110" height="${h}" fill="rgba(8,5,2,0.93)"/>
  <rect x="${w-112}" y="0" width="3" fill="url(#gv3)" height="${h}"/>
  <rect x="${w-2}" y="0" width="2" height="${h}" fill="url(#gv3)"/>

  <!-- Top thin bar -->
  <rect x="0" y="0" width="${w-110}" height="10" fill="rgba(8,5,2,0.85)"/>
  <rect x="0" y="0" width="${w-110}" height="2.5" fill="url(#gh3)"/>
  <rect x="0" y="8" width="${w-110}" height="1.5" fill="#C9A84C" opacity="0.4"/>

  <!-- Bottom thin bar -->
  <rect x="0" y="${h-10}" width="${w-110}" height="10" fill="rgba(8,5,2,0.85)"/>
  <rect x="0" y="${h-2.5}" width="${w-110}" height="2.5" fill="url(#gh3)"/>
  <rect x="0" y="${h-9}" width="${w-110}" height="1.5" fill="#C9A84C" opacity="0.4"/>

  <!-- Left thin strip -->
  <rect x="0" y="0" width="10" height="${h}" fill="rgba(8,5,2,0.85)"/>
  <rect x="0" y="0" width="2.5" height="${h}" fill="url(#gv3)"/>
  <rect x="8" y="0" width="1.5" height="${h}" fill="#C9A84C" opacity="0.4"/>

  <!-- Right panel ornaments -->
  <!-- Top lotus -->
  <g transform="translate(${w-55}, 36)" fill="#C9A84C" filter="url(#glow3)">
    <ellipse cx="0" cy="0" rx="18" ry="6" opacity="0.6"/>
    <ellipse cx="0" cy="0" rx="6" ry="18" opacity="0.6"/>
    <ellipse cx="0" cy="0" rx="12" ry="4" opacity="0.4"/>
    <ellipse cx="0" cy="0" rx="4" ry="12" opacity="0.4"/>
    <circle r="6" opacity="0.9"/>
    <circle r="3" fill="#1a1208"/>
    <circle r="1.5" fill="#E2C97E"/>
  </g>

  <!-- Divider line -->
  <line x1="${w-100}" y1="65" x2="${w-10}" y2="65" stroke="#C9A84C" stroke-width="1" opacity="0.5"/>

  <!-- Center motif in right panel -->
  <g transform="translate(${w-55}, ${h/2})" fill="#C9A84C" filter="url(#glow3)">
    <!-- Star/surya -->
    ${Array.from({length:8},(_,i)=>{
      const a = i*45*Math.PI/180;
      const x1 = Math.cos(a)*10, y1 = Math.sin(a)*10;
      const x2 = Math.cos(a)*24, y2 = Math.sin(a)*24;
      const xa = Math.cos((i+0.5)*45*Math.PI/180)*16;
      const ya = Math.sin((i+0.5)*45*Math.PI/180)*16;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#C9A84C" stroke-width="1.5" opacity="0.7"/>
              <circle cx="${xa}" cy="${ya}" r="2" opacity="0.5"/>`;
    }).join('')}
    <circle r="12" fill="none" stroke="#C9A84C" stroke-width="1.5" opacity="0.6"/>
    <circle r="7" opacity="0.8"/>
    <circle r="4" fill="#1a1208"/>
    <circle r="2" fill="#E2C97E"/>
  </g>

  <!-- Divider line 2 -->
  <line x1="${w-100}" y1="${h-65}" x2="${w-10}" y2="${h-65}" stroke="#C9A84C" stroke-width="1" opacity="0.5"/>

  <!-- Bottom lotus right panel -->
  <g transform="translate(${w-55}, ${h-36})" fill="#C9A84C" filter="url(#glow3)">
    <ellipse cx="0" cy="0" rx="18" ry="6" opacity="0.6"/>
    <ellipse cx="0" cy="0" rx="6" ry="18" opacity="0.6"/>
    <circle r="6" opacity="0.9"/>
    <circle r="3" fill="#1a1208"/>
    <circle r="1.5" fill="#E2C97E"/>
  </g>

  <!-- Vertical chain in right panel -->
  ${Array.from({length:5},(_,i)=>{
    const cy = 80 + (h-160)*(i+1)/6;
    return `<g transform="translate(${w-55},${cy})" fill="#C9A84C" opacity="0.5">
      <ellipse cx="0" cy="0" rx="4" ry="8"/>
      <ellipse cx="0" cy="0" rx="8" ry="4"/>
      <circle r="2.5" fill="#C9A84C"/>
    </g>`;
  }).join('')}

  <!-- Top/bottom corner ornaments (photo area) -->
  ${[[10,10],[10,h-10]].map(([cx,cy])=>`
    <g transform="translate(${cx},${cy})" fill="#C9A84C" opacity="0.8">
      <rect x="-1" y="-1" width="24" height="2.5" rx="1"/>
      <rect x="-1" y="-1" width="2.5" height="24" rx="1"/>
      <circle r="4" opacity="0.6"/>
      <circle r="2" fill="#1a1208"/>
    </g>`).join('')}
  ${[[w-120,10],[w-120,h-10]].map(([cx,cy])=>`
    <g transform="translate(${cx},${cy})" fill="#C9A84C" opacity="0.8">
      <rect x="-23" y="-1" width="24" height="2.5" rx="1"/>
      <rect x="-1" y="-1" width="2.5" height="24" rx="1"/>
      <circle r="4" opacity="0.6"/>
      <circle r="2" fill="#1a1208"/>
    </g>`).join('')}
</svg>`,
  },

  // 4. RANG RANG — Interlocking diamond Balinese pattern
  {
    id: 'bali-4',
    name: 'Rang-Rang Diamond',
    orient: 'portrait',
    isDefault: true,
    makeSvg: (w, h) => {
      const bw = 48;
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <pattern id="rangrang" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <rect width="24" height="24" fill="#0c0800"/>
      <!-- Diamond outline -->
      <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="#C9A84C" stroke-width="0.8" opacity="0.7"/>
      <!-- Inner diamond -->
      <polygon points="12,6 18,12 12,18 6,12" fill="none" stroke="#C9A84C" stroke-width="0.5" opacity="0.4"/>
      <!-- Center -->
      <polygon points="12,9 15,12 12,15 9,12" fill="#C9A84C" opacity="0.6"/>
      <!-- Corner dots -->
      <circle cx="12" cy="2" r="1.2" fill="#C9A84C" opacity="0.5"/>
      <circle cx="22" cy="12" r="1.2" fill="#C9A84C" opacity="0.5"/>
      <circle cx="12" cy="22" r="1.2" fill="#C9A84C" opacity="0.5"/>
      <circle cx="2" cy="12" r="1.2" fill="#C9A84C" opacity="0.5"/>
    </pattern>
    <linearGradient id="gvr" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E2C97E"/>
      <stop offset="50%" stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#E2C97E"/>
    </linearGradient>
    <linearGradient id="ghr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#E2C97E"/>
      <stop offset="50%" stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#E2C97E"/>
    </linearGradient>
    <filter id="glow4"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Border panels -->
  <rect x="0" y="0" width="${w}" height="${bw}" fill="url(#rangrang)"/>
  <rect x="0" y="${h-bw}" width="${w}" height="${bw}" fill="url(#rangrang)"/>
  <rect x="0" y="${bw}" width="${bw}" height="${h-bw*2}" fill="url(#rangrang)"/>
  <rect x="${w-bw}" y="${bw}" width="${bw}" height="${h-bw*2}" fill="url(#rangrang)"/>

  <!-- Gold frame lines -->
  <rect x="0" y="0" width="${w}" height="3" fill="url(#ghr)"/>
  <rect x="0" y="${bw-3}" width="${w}" height="3" fill="url(#ghr)" opacity="0.6"/>
  <rect x="0" y="${h-bw}" width="${w}" height="3" fill="url(#ghr)" opacity="0.6"/>
  <rect x="0" y="${h-3}" width="${w}" height="3" fill="url(#ghr)"/>
  <rect x="0" y="0" width="3" height="${h}" fill="url(#gvr)"/>
  <rect x="${bw-3}" y="0" width="3" height="${h}" fill="url(#gvr)" opacity="0.6"/>
  <rect x="${w-bw}" y="0" width="3" height="${h}" fill="url(#gvr)" opacity="0.6"/>
  <rect x="${w-3}" y="0" width="3" height="${h}" fill="url(#gvr)"/>

  <!-- Center top mega-diamond -->
  <g transform="translate(${w/2}, ${bw/2})" filter="url(#glow4)">
    <polygon points="0,-20 20,0 0,20 -20,0" fill="rgba(201,168,76,0.15)"/>
    <polygon points="0,-18 18,0 0,18 -18,0" fill="none" stroke="#E2C97E" stroke-width="1.5"/>
    <polygon points="0,-10 10,0 0,10 -10,0" fill="#C9A84C" opacity="0.7"/>
    <circle r="5" fill="#1a1208"/>
    <circle r="2.5" fill="#E2C97E"/>
  </g>

  <!-- Center bottom mega-diamond -->
  <g transform="translate(${w/2}, ${h-bw/2})" filter="url(#glow4)">
    <polygon points="0,-20 20,0 0,20 -20,0" fill="rgba(201,168,76,0.15)"/>
    <polygon points="0,-18 18,0 0,18 -18,0" fill="none" stroke="#E2C97E" stroke-width="1.5"/>
    <polygon points="0,-10 10,0 0,10 -10,0" fill="#C9A84C" opacity="0.7"/>
    <circle r="5" fill="#1a1208"/>
    <circle r="2.5" fill="#E2C97E"/>
  </g>

  <!-- Left center diamond -->
  <g transform="translate(${bw/2}, ${h/2})" filter="url(#glow4)">
    <polygon points="0,-20 20,0 0,20 -20,0" fill="rgba(201,168,76,0.15)"/>
    <polygon points="0,-18 18,0 0,18 -18,0" fill="none" stroke="#E2C97E" stroke-width="1.5"/>
    <polygon points="0,-10 10,0 0,10 -10,0" fill="#C9A84C" opacity="0.7"/>
    <circle r="5" fill="#1a1208"/>
    <circle r="2.5" fill="#E2C97E"/>
  </g>

  <!-- Right center diamond -->
  <g transform="translate(${w-bw/2}, ${h/2})" filter="url(#glow4)">
    <polygon points="0,-20 20,0 0,20 -20,0" fill="rgba(201,168,76,0.15)"/>
    <polygon points="0,-18 18,0 0,18 -18,0" fill="none" stroke="#E2C97E" stroke-width="1.5"/>
    <polygon points="0,-10 10,0 0,10 -10,0" fill="#C9A84C" opacity="0.7"/>
    <circle r="5" fill="#1a1208"/>
    <circle r="2.5" fill="#E2C97E"/>
  </g>

  <!-- Corner jewels -->
  ${[[bw/2,bw/2],[w-bw/2,bw/2],[bw/2,h-bw/2],[w-bw/2,h-bw/2]].map(([cx,cy])=>`
    <g transform="translate(${cx},${cy})">
      <polygon points="0,-22 22,0 0,22 -22,0" fill="rgba(201,168,76,0.1)"/>
      <polygon points="0,-20 20,0 0,20 -20,0" fill="none" stroke="#C9A84C" stroke-width="1.5" opacity="0.9"/>
      <polygon points="0,-12 12,0 0,12 -12,0" fill="#C9A84C" opacity="0.3"/>
      <polygon points="0,-7 7,0 0,7 -7,0" fill="#C9A84C" opacity="0.9"/>
      <circle r="3.5" fill="#1a1208"/>
      <circle r="1.8" fill="#E2C97E"/>
    </g>`).join('')}
</svg>`;
    },
  },

  // 5. SURYA MAJAPAHIT — Sun + 8-pointed star, full overlay
  {
    id: 'bali-5',
    name: 'Surya Majapahit',
    orient: 'portrait',
    isDefault: true,
    makeSvg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="suryaGrad" cx="50%" cy="50%">
      <stop offset="0%" stop-color="#E2C97E" stop-opacity="0.3"/>
      <stop offset="60%" stop-color="#C9A84C" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#9B7A2C" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="topBot" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#9B7A2C"/>
      <stop offset="50%" stop-color="#E2C97E"/>
      <stop offset="100%" stop-color="#9B7A2C"/>
    </linearGradient>
    <filter id="suryaGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Subtle radial glow center -->
  <ellipse cx="${w/2}" cy="${h/2}" rx="${w*0.45}" ry="${h*0.45}" fill="url(#suryaGrad)"/>

  <!-- Top bar -->
  <rect x="0" y="0" width="${w}" height="72" fill="rgba(8,5,2,0.9)"/>
  <rect x="0" y="0" width="${w}" height="2.5" fill="url(#topBot)"/>
  <rect x="0" y="70" width="${w}" height="2" fill="url(#topBot)" opacity="0.6"/>

  <!-- Bottom bar -->
  <rect x="0" y="${h-72}" width="${w}" height="72" fill="rgba(8,5,2,0.9)"/>
  <rect x="0" y="${h-72}" width="${w}" height="2" fill="url(#topBot)" opacity="0.6"/>
  <rect x="0" y="${h-2.5}" width="${w}" height="2.5" fill="url(#topBot)"/>

  <!-- Thin side strips -->
  <rect x="0" y="72" width="28" height="${h-144}" fill="rgba(8,5,2,0.7)"/>
  <rect x="${w-28}" y="72" width="28" height="${h-144}" fill="rgba(8,5,2,0.7)"/>
  <rect x="0" y="72" width="2" height="${h-144}" fill="#C9A84C" opacity="0.7"/>
  <rect x="26" y="72" width="1.5" height="${h-144}" fill="#C9A84C" opacity="0.3"/>
  <rect x="${w-28}" y="72" width="1.5" height="${h-144}" fill="#C9A84C" opacity="0.3"/>
  <rect x="${w-2}" y="72" width="2" height="${h-144}" fill="#C9A84C" opacity="0.7"/>

  <!-- TOP: Surya Majapahit (8-pointed star) -->
  <g transform="translate(${w/2}, 36)" filter="url(#suryaGlow)">
    <!-- Outer rays 8-pointed -->
    ${Array.from({length:8},(_,i)=>{
      const a = i*45*Math.PI/180;
      const x1=Math.cos(a)*12,y1=Math.sin(a)*12;
      const x2=Math.cos(a)*28,y2=Math.sin(a)*28;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E2C97E" stroke-width="2" opacity="0.8"/>`;
    }).join('')}
    <!-- 8-pointed star body -->
    <polygon points="${Array.from({length:16},(_,i)=>{
      const a = i*22.5*Math.PI/180;
      const r = i%2===0 ? 18 : 9;
      return `${Math.cos(a-Math.PI/2)*r},${Math.sin(a-Math.PI/2)*r}`;
    }).join(' ')}" fill="#C9A84C" opacity="0.85"/>
    <!-- Inner circle -->
    <circle r="9" fill="#1a1208"/>
    <circle r="6" fill="#C9A84C" opacity="0.5"/>
    <circle r="3.5" fill="#1a1208"/>
    <circle r="1.8" fill="#E2C97E"/>
  </g>

  <!-- BOTTOM: mirrored Surya -->
  <g transform="translate(${w/2}, ${h-36})" filter="url(#suryaGlow)">
    ${Array.from({length:8},(_,i)=>{
      const a = i*45*Math.PI/180;
      const x1=Math.cos(a)*12,y1=Math.sin(a)*12;
      const x2=Math.cos(a)*28,y2=Math.sin(a)*28;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E2C97E" stroke-width="2" opacity="0.8"/>`;
    }).join('')}
    <polygon points="${Array.from({length:16},(_,i)=>{
      const a = i*22.5*Math.PI/180;
      const r = i%2===0 ? 18 : 9;
      return `${Math.cos(a-Math.PI/2)*r},${Math.sin(a-Math.PI/2)*r}`;
    }).join(' ')}" fill="#C9A84C" opacity="0.85"/>
    <circle r="9" fill="#1a1208"/>
    <circle r="6" fill="#C9A84C" opacity="0.5"/>
    <circle r="3.5" fill="#1a1208"/>
    <circle r="1.8" fill="#E2C97E"/>
  </g>

  <!-- Top: flanking mini suns -->
  ${[w*0.22, w*0.78].map(cx=>`
    <g transform="translate(${cx}, 36)">
      ${Array.from({length:8},(_,i)=>{
        const a=i*45*Math.PI/180;
        return `<line x1="${Math.cos(a)*7}" y1="${Math.sin(a)*7}" x2="${Math.cos(a)*16}" y2="${Math.sin(a)*16}" stroke="#C9A84C" stroke-width="1.2" opacity="0.6"/>`;
      }).join('')}
      <polygon points="${Array.from({length:16},(_,i)=>{
        const a=i*22.5*Math.PI/180, r=i%2===0?10:5;
        return `${Math.cos(a-Math.PI/2)*r},${Math.sin(a-Math.PI/2)*r}`;
      }).join(' ')}" fill="#C9A84C" opacity="0.6"/>
      <circle r="4" fill="#1a1208"/>
      <circle r="2" fill="#C9A84C"/>
    </g>`).join('')}

  <!-- Side chain ornaments -->
  ${Array.from({length:5},(_,i)=>{
    const cy = 80 + (h-160)*(i+1)/6;
    return `
      <g transform="translate(14,${cy})" fill="#C9A84C" opacity="0.6">
        <polygon points="0,-8 8,0 0,8 -8,0"/>
        <circle r="3" fill="#1a1208"/>
        <circle r="1.5" fill="#C9A84C"/>
      </g>
      <g transform="translate(${w-14},${cy})" fill="#C9A84C" opacity="0.6">
        <polygon points="0,-8 8,0 0,8 -8,0"/>
        <circle r="3" fill="#1a1208"/>
        <circle r="1.5" fill="#C9A84C"/>
      </g>`;
  }).join('')}

  <!-- Horizontal decorative lines inside bars -->
  <line x1="20" y1="50" x2="${w-20}" y2="50" stroke="#C9A84C" stroke-width="0.7" opacity="0.35"/>
  <line x1="20" y1="${h-50}" x2="${w-20}" y2="${h-50}" stroke="#C9A84C" stroke-width="0.7" opacity="0.35"/>

  <!-- Corner brackets -->
  ${[[0,0,1,1],[w,0,-1,1],[0,h,1,-1],[w,h,-1,-1]].map(([x,y,sx,sy])=>`
    <g transform="translate(${x},${y}) scale(${sx},${sy})">
      <rect x="0" y="0" width="32" height="3" fill="#C9A84C" opacity="0.8"/>
      <rect x="0" y="0" width="3" height="32" fill="#C9A84C" opacity="0.8"/>
      <circle cx="0" cy="0" r="5" fill="#C9A84C" opacity="0.4"/>
    </g>`).join('')}
</svg>`,
  },
];

// Konversi DEFAULT_FRAMES ke format state
function initDefaultFrames() {
  DEFAULT_FRAMES.forEach(df => {
    if (S.frames.find(f => f.id === df.id)) return;
    const svgStr = df.makeSvg(900, 1200).trim();
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    S.frames.push({ id: df.id, name: df.name, orient: df.orient, src: svgUrl, thumb: svgUrl, isDefault: true });
  });
}

// ─── DOM ─────────────────────────────────────────────────────
const photoCanvas   = document.getElementById('photoCanvas');
const pCtx          = photoCanvas.getContext('2d');
const compositeWrap = document.getElementById('compositeWrap');
const canvasStage   = document.getElementById('canvasStage');
const loadingOverlay= document.getElementById('loadingOverlay');

// ─── INIT ─────────────────────────────────────────────────────
(function init() {
  loadPhoto();
  setupTabs();
  setupZoom();
  setupUpload();
  setupAdjust();
  setupBackground();
  setupFrameBottomSheet();
    setupTouchModeToggle();
  initDefaultFrames();
  loadFramesFromServer();
  injectTransformPanel();
})();

// ─── INJECT TRANSFORM CONTROLS INTO HTML ─────────────────────
function injectTransformPanel() {
  const panel = document.getElementById('adjustPanel');
  if (!panel) return;

  // Tambah rotate & flip controls setelah slider scale
  const extra = document.createElement('div');
  extra.innerHTML = `
    <!-- Rotate -->
    <div class="adjust-block">
      <div class="adjust-block-title">Rotasi Frame</div>
      <div class="slider-group">
        <div class="slider-label-row">
          <span class="slider-label">Sudut</span>
          <span class="slider-val" id="valRotate">0°</span>
        </div>
        <input type="range" id="slRotate" min="-180" max="180" value="0">
      </div>
      <div style="display:flex;gap:6px;margin-top:8px;">
        <button class="tool-btn" id="btnRotL" title="-90°" style="flex:1;font-size:16px;">↺</button>
        <button class="tool-btn" id="btnRotR" title="+90°" style="flex:1;font-size:16px;">↻</button>
        <button class="tool-btn" id="btnRotReset" style="flex:1;font-size:11px;">Reset</button>
      </div>
    </div>

    <!-- Flip -->
    <div class="adjust-block">
      <div class="adjust-block-title">Cermin (Flip)</div>
      <div style="display:flex;gap:6px;margin-top:4px;">
        <button class="tool-btn" id="btnFlipH" style="flex:1;font-size:11px;">
          ⇔ Flip Horizontal
        </button>
        <button class="tool-btn" id="btnFlipV" style="flex:1;font-size:11px;">
          ⇕ Flip Vertikal
        </button>
      </div>
    </div>
  `;

  panel.appendChild(extra);

  // Rotate slider
  const slRot = document.getElementById('slRotate');
  if (slRot) {
    slRot.addEventListener('input', e => {
      S.frameRotate = parseInt(e.target.value);
      const v = document.getElementById('valRotate');
      if (v) v.textContent = S.frameRotate + '°';
      refreshFrameStyle();
    });
  }

  // Rotate buttons
  const btnL = document.getElementById('btnRotL');
  const btnR = document.getElementById('btnRotR');
  const btnRR = document.getElementById('btnRotReset');
  if (btnL) btnL.addEventListener('click', () => {
    S.frameRotate = ((S.frameRotate - 90 + 540) % 360) - 180;
    syncRotateSlider();
    refreshFrameStyle();
  });
  if (btnR) btnR.addEventListener('click', () => {
    S.frameRotate = ((S.frameRotate + 90 + 180) % 360) - 180;
    syncRotateSlider();
    refreshFrameStyle();
  });
  if (btnRR) btnRR.addEventListener('click', () => {
    S.frameRotate = 0;
    syncRotateSlider();
    refreshFrameStyle();
  });

  // Flip buttons
  const btnFH = document.getElementById('btnFlipH');
  const btnFV = document.getElementById('btnFlipV');
  if (btnFH) btnFH.addEventListener('click', () => {
    S.frameFlipH = !S.frameFlipH;
    btnFH.style.color = S.frameFlipH ? 'var(--gold)' : '';
    btnFH.style.borderColor = S.frameFlipH ? 'var(--gold)' : '';
    refreshFrameStyle();
  });
  if (btnFV) btnFV.addEventListener('click', () => {
    S.frameFlipV = !S.frameFlipV;
    btnFV.style.color = S.frameFlipV ? 'var(--gold)' : '';
    btnFV.style.borderColor = S.frameFlipV ? 'var(--gold)' : '';
    refreshFrameStyle();
  });
}

function syncRotateSlider() {
  const sl = document.getElementById('slRotate');
  const vl = document.getElementById('valRotate');
  if (sl) sl.value = S.frameRotate;
  if (vl) vl.textContent = S.frameRotate + '°';
  syncFbsRotate();
}

// ─── LOAD PHOTO ──────────────────────────────────────────────
function loadPhoto() {
  const src  = sessionStorage.getItem('bsp_editedSrc') || sessionStorage.getItem('bsp_imageSrc');
  const name = sessionStorage.getItem('bsp_imageName') || 'photo.jpg';
  const nameEl = document.getElementById('imageFileName');
  if (nameEl) nameEl.textContent = name;

  if (!src) {
    photoCanvas.width  = 900;
    photoCanvas.height = 1200;
    pCtx.fillStyle = '#2a1f0e';
    pCtx.fillRect(0, 0, 900, 1200);
    pCtx.fillStyle = 'rgba(201,168,76,0.06)';
    for (let i = 0; i < 900; i += 40) for (let j = 0; j < 1200; j += 40) pCtx.fillRect(i, j, 20, 20);
    pCtx.fillStyle = 'rgba(255,255,255,0.15)';
    pCtx.font = 'bold 28px serif';
    pCtx.textAlign = 'center';
    pCtx.fillText('— Demo Mode —', 450, 580);
    pCtx.font = '16px sans-serif';
    pCtx.fillStyle = 'rgba(201,168,76,0.6)';
    pCtx.fillText('Upload foto dari Step 1', 450, 620);
    S.photoW = 900; S.photoH = 1200;
    S.orientation = 'portrait';
    finalizePhotoLoad();
    return;
  }

  const img = new Image();
  img.onload = () => {
    S.photo = img; S.photoW = img.naturalWidth; S.photoH = img.naturalHeight;
    S.orientation = S.photoW >= S.photoH ? 'landscape' : 'portrait';
    drawPhoto(); finalizePhotoLoad();
  };
  img.onerror = () => { showToast('❌ Gagal load foto'); if (loadingOverlay) loadingOverlay.classList.add('hidden'); };
  img.src = src;
}

function drawPhoto() {
  if (!S.photo) return;
  const pad = S.padding;
  const cw = S.photoW + pad*2, ch = S.photoH + pad*2;
  photoCanvas.width = cw; photoCanvas.height = ch;
  pCtx.fillStyle = S.bgColor;
  pCtx.fillRect(0,0,cw,ch);
  pCtx.drawImage(S.photo, pad, pad, S.photoW, S.photoH);
  const sl = document.getElementById('canvasSizeLabel');
  if (sl) sl.textContent = `${cw} × ${ch} px`;
}

function finalizePhotoLoad() {
  if (loadingOverlay) loadingOverlay.classList.add('hidden');
  if (compositeWrap) compositeWrap.style.display = '';
  // Delay kecil agar CSS layout selesai dihitung dulu
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fitToScreen();
      renderFrameGrid();
      updateFrameOverlay();
    });
  });
}

function redrawPhoto() {
  drawPhoto();
  if (compositeWrap) { compositeWrap.style.width = photoCanvas.width+'px'; compositeWrap.style.height = photoCanvas.height+'px'; }
  updateFrameOverlay();
}

// ─── SERVER FRAMES ───────────────────────────────────────────
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
      S.frames.push({ id, srvId: f.id, name: f.name, orient: detectOrient(f.file_path, null), src: f.file_path, thumb: f.thumbnail || f.file_path });
      added = true;
    });
    if (added) renderFrameGrid();
  } catch(e) { console.warn('[frame.js] api/frames.php tidak tersedia:', e.message); }
}

function detectOrient(filePath, imgEl) {
  if (imgEl) return imgEl.naturalWidth >= imgEl.naturalHeight ? 'landscape' : 'portrait';
  const l = (filePath||'').toLowerCase();
  if (l.includes('landscape')||l.includes('_ls')||l.includes('-ls')) return 'landscape';
  return 'portrait';
}

// ─── RENDER FRAME GRID ───────────────────────────────────────
function renderFrameGrid() {
  const grid = document.getElementById('framesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const filter = S.filterOrient;
  const visible = S.frames.filter(f => filter==='all' || f.orient===filter);

  if (!visible.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;font-size:11px;color:var(--text-dim);padding:24px 0;line-height:1.8;">Belum ada frame<br><span style="color:var(--gold);opacity:0.7;">Upload PNG di bawah ↓</span></div>`;
    return;
  }

  visible.forEach(frame => {
    const isActive = S.activeFrame?.id === frame.id;
    const card = document.createElement('div');
    card.className = 'frame-thumb-card' + (frame.orient==='landscape'?' landscape':'') + (isActive?' active':'');
    card.dataset.id = frame.id;
    card.style.background = '#111';

    const badge = document.createElement('span');
    badge.className = 'card-orient-badge';
    badge.textContent = frame.isDefault ? 'Bali' : (frame.orient==='landscape'?'L':'P');
    if (frame.isDefault) badge.style.cssText = 'background:rgba(201,168,76,0.3);color:#E2C97E;';
    card.appendChild(badge);

    const img = document.createElement('img');
    img.src = frame.thumb || frame.src;
    img.alt = frame.name;
    img.loading = 'lazy';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    card.appendChild(img);

    const nameEl = document.createElement('div');
    nameEl.className = 'card-name';
    nameEl.textContent = frame.name;
    card.appendChild(nameEl);

    if (!frame.isDefault) {
      const del = document.createElement('button');
      del.className = 'card-del'; del.title = 'Hapus frame'; del.innerHTML = '✕';
      del.addEventListener('click', e => { e.stopPropagation(); deleteFrame(frame.id, frame.srvId); });
      card.appendChild(del);
    }

  card.addEventListener('click', () => applyFrame(frame));
    grid.appendChild(card);
  });

  // Selalu sync ke bottom sheet grid juga
  renderFbsFrameGrid();
  // Sync active frame info di sheet
  const fbsInfoBar  = document.getElementById('fbsActiveFrameInfo');
  const fbsInfoName = document.getElementById('fbsActiveFrameInfoName');
  if (fbsInfoBar)  fbsInfoBar.style.display = S.activeFrame ? '' : 'none';
  if (fbsInfoName && S.activeFrame) fbsInfoName.textContent = S.activeFrame.name;
}

// ─── APPLY FRAME ─────────────────────────────────────────────
function applyFrame(frame) {
  const img = new Image();
  img.onload = () => {
    S.activeFrame  = { ...frame, img };
    S.frameOffX    = 0; S.frameOffY = 0;
    S.frameScale   = 1; S.frameOpacity = 1;
    S.frameRotate  = 0; S.frameFlipH = false; S.frameFlipV = false;
    S.touchMode = 'pan';
      updateTouchModeBtn();

    setSlider('slOpacity', 100, 'valOpacity', '100%');
    const fbsOp = document.getElementById('fbsSlOpacity'); if(fbsOp) fbsOp.value = 100;
const fbsSc = document.getElementById('fbsSlScale');   if(fbsSc) fbsSc.value = 100;
const fbsOV = document.getElementById('fbsValOpacity'); if(fbsOV) fbsOV.textContent = '100%';
const fbsSV = document.getElementById('fbsValScale');   if(fbsSV) fbsSV.textContent = '100%';
    setSlider('slScale',   100, 'valScale',   '100%');
    syncRotateSlider();
    syncFbsRotate();

    // Reset flip button highlight
    ['btnFlipH','btnFlipV'].forEach(id => {
      const b = document.getElementById(id);
      if (b) { b.style.color=''; b.style.borderColor=''; }
    });

    toggleAdjustPanel(true);
    const infoBar  = document.getElementById('activeFrameInfo');
    const infoName = document.getElementById('activeFrameInfoName');
    if (infoBar)  infoBar.style.display = '';
    if (infoName) infoName.textContent  = frame.name;
    document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
    const cb = document.querySelector('.pos-btn[data-pos="center"]');
    if (cb) cb.classList.add('active');

    renderFrameGrid(); updateFrameOverlay();
    showToast(`✓ Frame "${frame.name}" diterapkan`);
  };
  img.onerror = () => showToast('❌ Gagal memuat frame');
  img.src = frame.src;
}

function removeActiveFrame() {
  S.activeFrame = null;
   S.touchMode = 'pan';
  updateTouchModeBtn();
  const infoBar = document.getElementById('activeFrameInfo');
  if (infoBar) infoBar.style.display = 'none';
  toggleAdjustPanel(false);
  renderFrameGrid(); updateFrameOverlay();
  showToast('Frame dihapus dari foto');
}

function toggleAdjustPanel(show) {
  const nf = document.getElementById('adjustNoFrame');
  const p  = document.getElementById('adjustPanel');
  if (nf) nf.style.display = show ? 'none' : '';
  if (p)  p.style.display  = show ? 'flex'  : 'none';
}

function setSlider(id, val, vid, label) {
  const sl = document.getElementById(id), vl = document.getElementById(vid);
  if (sl) sl.value = val;
  if (vl) vl.textContent = label;
}

// ─── FRAME OVERLAY ───────────────────────────────────────────
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
    position:absolute;top:0;left:0;
    width:100%;height:100%;
    object-fit:contain;
    pointer-events:none;
    opacity:${S.frameOpacity};
    transform:${buildTransform()};
    transform-origin:center center;
    will-change:transform;
    transition:opacity 0.15s;
  `;
  compositeWrap.appendChild(frameImgEl);

  frameDragEl = document.createElement('div');
  frameDragEl.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;cursor:grab;z-index:20;`;
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

// ─── DRAG ────────────────────────────────────────────────────
function setupFrameDrag(el) {
  let dragging = false, sx, sy, sox, soy;

  // Mouse (desktop) — tetap sama seperti sebelumnya
  el.addEventListener('mousedown', e => {
    dragging = true; sx = e.clientX; sy = e.clientY;
    sox = S.frameOffX; soy = S.frameOffY;
    el.style.cursor = 'grabbing';
    e.preventDefault();
  });

  // Touch (mobile) — hanya aktif kalau mode moveFrame
  el.addEventListener('touchstart', e => {
    if (S.touchMode !== 'moveFrame') return; // ← kunci utama
    dragging = true;
    const t = e.touches[0];
    sx = t.clientX; sy = t.clientY;
    sox = S.frameOffX; soy = S.frameOffY;
    e.stopPropagation(); // jangan bubble ke canvasStage
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dz = 1 / S.zoom;
    S.frameOffX = sox + (e.clientX - sx) * dz;
    S.frameOffY = soy + (e.clientY - sy) * dz;
    refreshFrameStyle();
  });

  document.addEventListener('touchmove', e => {
    if (!dragging || S.touchMode !== 'moveFrame') return;
    const t = e.touches[0], dz = 1 / S.zoom;
    S.frameOffX = sox + (t.clientX - sx) * dz;
    S.frameOffY = soy + (t.clientY - sy) * dz;
    refreshFrameStyle();
    e.preventDefault();
  }, { passive: false });

  const stop = () => { dragging = false; if (el) el.style.cursor = 'grab'; };
  document.addEventListener('mouseup', stop);
  document.addEventListener('touchend', stop);
}


// setup button mobile
function setupTouchModeToggle() {
  const btn = document.getElementById('btnTouchMode');
  if (!btn) return;

  // Sembunyikan kalau tidak ada frame aktif
  updateTouchModeBtn();

  btn.addEventListener('click', () => {
    S.touchMode = S.touchMode === 'pan' ? 'moveFrame' : 'pan';
    updateTouchModeBtn();
  });
}

function updateTouchModeBtn() {
  const btn = document.getElementById('btnTouchMode');
  if (!btn) return;

  // Hanya tampil kalau ada frame aktif DAN di mobile
  const isMobile = window.innerWidth <= 767;
  btn.style.display = (S.activeFrame && isMobile) ? 'flex' : 'none';

  if (S.touchMode === 'moveFrame') {
    btn.textContent = '🖼 Move Frame';
    btn.classList.add('frame-mode');
  } else {
    btn.textContent = '🔍 Pan / Zoom';
    btn.classList.remove('frame-mode');
  }
}

// ─── ZOOM & PAN ──────────────────────────────────────────────
function setupZoom() {
  const btnIn  = document.getElementById('btnZoomIn');
  const btnOut = document.getElementById('btnZoomOut');
  const btnFit = document.getElementById('btnZoomFit');
  if (btnIn)  btnIn.addEventListener('click',  () => setZoom(S.zoom * 1.2));
  if (btnOut) btnOut.addEventListener('click', () => setZoom(S.zoom / 1.2));
  if (btnFit) btnFit.addEventListener('click', fitToScreen);

  if (!canvasStage) return;

  // Mouse wheel zoom
  canvasStage.addEventListener('wheel', e => {
    e.preventDefault();
    setZoom(S.zoom * (e.deltaY > 0 ? 0.9 : 1.1));
  }, { passive: false });

  // Mouse pan (alt/middle button)
  let panning = false, px, py, ppx, ppy;
  canvasStage.addEventListener('mousedown', e => {
    if (e.button === 1 || e.altKey) {
      panning = true;
      px = e.clientX; py = e.clientY;
      ppx = S.panX;   ppy = S.panY;
      e.preventDefault();
    }
  });
  document.addEventListener('mousemove', e => {
    if (!panning) return;
    S.panX = ppx + (e.clientX - px);
    S.panY = ppy + (e.clientY - py);
    applyStageTransform();
  });
  document.addEventListener('mouseup', () => { panning = false; });

  // ─── TOUCH: pinch zoom + single-finger pan ───────────────
  let _t1x, _t1y, _tpx, _tpy, _lastDist = 0;

canvasStage.addEventListener('touchstart', e => {
  // Kalau ada frame aktif dan mode moveFrame → skip pan, biarkan frameDragEl handle
  if (S.activeFrame && S.touchMode === 'moveFrame') return;
  e.preventDefault();
  if (e.touches.length === 1) {
    _t1x = e.touches[0].clientX;
    _t1y = e.touches[0].clientY;
    _tpx = S.panX;
    _tpy = S.panY;
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    _lastDist = Math.sqrt(dx * dx + dy * dy);
  }
}, { passive: false });

  canvasStage.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      // single finger pan
      const dx = e.touches[0].clientX - _t1x;
      const dy = e.touches[0].clientY - _t1y;
      S.panX = _tpx + dx;
      S.panY = _tpy + dy;
      applyStageTransform();
    } else if (e.touches.length === 2) {
      // pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (_lastDist > 0) {
        setZoom(S.zoom * (dist / _lastDist));
      }
      _lastDist = dist;
    }
  }, { passive: false });

  canvasStage.addEventListener('touchend', e => {
    _lastDist = 0;
  }, { passive: true });
}

function setZoom(z) { S.zoom=Math.max(0.05,Math.min(8,z)); applyStageTransform(); }

function applyStageTransform() {
  if (compositeWrap) compositeWrap.style.transform=`translate(${S.panX}px,${S.panY}px) scale(${S.zoom})`;
  const zd=document.getElementById('zoomDisplay'); if(zd) zd.textContent=Math.round(S.zoom*100)+'%';
}

function fitToScreen() {
  if (!canvasStage) return;
  const rect = canvasStage.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    setTimeout(fitToScreen, 100);
    return;
  }
  // Selalu 100% zoom, user bisa zoom out manual kalau perlu
  S.zoom = 1;
  S.panX = 0; S.panY = 0;
  applyStageTransform();
}

// ─── ADJUST ──────────────────────────────────────────────────
function setupAdjust() {
  const slOp=document.getElementById('slOpacity'), slSc=document.getElementById('slScale');
  if (slOp) slOp.addEventListener('input', e => { S.frameOpacity=parseInt(e.target.value)/100; const v=document.getElementById('valOpacity'); if(v)v.textContent=e.target.value+'%'; refreshFrameStyle(); });
  if (slSc) slSc.addEventListener('input', e => { S.frameScale=parseInt(e.target.value)/100; const v=document.getElementById('valScale'); if(v)v.textContent=e.target.value+'%'; refreshFrameStyle(); });

  document.querySelectorAll('.pos-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.pos-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); applyPositionPreset(btn.dataset.pos);
  }));
  document.querySelectorAll('.orient-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.orient-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); S.filterOrient=btn.dataset.orient; renderFrameGrid();
  }));
}

function applyPositionPreset(pos) {
  if (!S.activeFrame) return;
  const cw=photoCanvas.width, ch=photoCanvas.height;
  const hdw=(cw*S.frameScale-cw)/2, hdh=(ch*S.frameScale-ch)/2;
  const map={'top-left':[-hdw,-hdh],'top-center':[0,-hdh],'top-right':[hdw,-hdh],'center':[0,0],'bottom-left':[-hdw,hdh],'bottom-center':[0,hdh],'bottom-right':[hdw,hdh],'left-center':[-hdw,0],'right-center':[hdw,0]};
  if (map[pos]) { [S.frameOffX,S.frameOffY]=map[pos]; refreshFrameStyle(); }
}

function resetFrameTransform() {
  S.frameOffX=0; S.frameOffY=0; S.frameScale=1; S.frameOpacity=1; S.frameRotate=0; S.frameFlipH=false; S.frameFlipV=false;
  setSlider('slOpacity',100,'valOpacity','100%');
  setSlider('slScale',100,'valScale','100%');
  syncRotateSlider();
  ['btnFlipH','btnFlipV'].forEach(id=>{ const b=document.getElementById(id); if(b){b.style.color='';b.style.borderColor='';} });
  document.querySelectorAll('.pos-btn').forEach(b=>b.classList.remove('active'));
  const cb=document.querySelector('.pos-btn[data-pos="center"]'); if(cb) cb.classList.add('active');
  refreshFrameStyle();
}

// ─── BACKGROUND ──────────────────────────────────────────────
function setupBackground() {
  const grid=document.getElementById('bgSwatches');
  if (!grid) return;
  BG_SWATCHES.forEach(color => {
    const btn=document.createElement('button');
    btn.className='bg-swatch'+(color===S.bgColor?' active':'');
    btn.style.background=color;
    btn.style.border=color==='#ffffff'?'2px solid rgba(255,255,255,0.3)':'2px solid transparent';
    btn.title=color;
    btn.addEventListener('click',()=>{ setBgColor(color); document.querySelectorAll('.bg-swatch').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); });
    grid.appendChild(btn);
  });
  const picker=document.getElementById('bgColorPicker');
  if (picker) picker.addEventListener('input', e=>{ setBgColor(e.target.value); document.querySelectorAll('.bg-swatch').forEach(b=>b.classList.remove('active')); });
  const slPad=document.getElementById('slPadding');
  if (slPad) slPad.addEventListener('input', e=>{ S.padding=parseInt(e.target.value); const v=document.getElementById('valPadding'); if(v) v.textContent=S.padding+'px'; redrawPhoto(); fitToScreen(); });
}

function setBgColor(c) { S.bgColor=c; const p=document.getElementById('bgColorPicker'); if(p) p.value=c; redrawPhoto(); }

// ─── UPLOAD ──────────────────────────────────────────────────
function setupUpload() {
  // Cari input yang di dalam tab-frames (bukan yang duplikat di luar)
  const zone  = document.getElementById('uploadZone');
  // Cari semua input dengan id frameFileInput, pakai yang pertama di dalam zone
  const input = zone ? zone.querySelector('input[type="file"]') : document.getElementById('frameFileInput');

  if (zone) {
    zone.addEventListener('click', () => input && input.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor='var(--gold)'; zone.style.background='var(--gold-glow)'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor=''; zone.style.background=''; });
    zone.addEventListener('drop', e => { e.preventDefault(); zone.style.borderColor=''; zone.style.background=''; [...e.dataTransfer.files].forEach(handleFrameFile); });
  }
  if (input) input.addEventListener('change', e => { [...e.target.files].forEach(handleFrameFile); input.value=''; });
}

function handleFrameFile(file) {
  if (!file) return;

  // Validasi tipe file
  if (file.type !== 'image/png') {
    showToast('❌ Harus file PNG (transparan)');
    return;
  }

  // Validasi ukuran (max 8MB)
  if (file.size > 8 * 1024 * 1024) {
    showToast('❌ File terlalu besar! Maksimal 8MB');
    return;
  }

  showToast('⏳ Memproses frame…');

  // Gunakan Object URL (lebih cepat dari base64)
  
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    try {
      // Deteksi orientasi gambar
      const orient =
        img.naturalWidth >= img.naturalHeight
          ? 'landscape'
          : 'portrait';

      const localId = 'local-' + Date.now();

      const frameObj = {
        id: localId,
        name: cleanFileName(file.name),
        orient: orient,
        src: objectUrl,
        thumb: objectUrl,
        _objUrl: objectUrl // simpan untuk cleanup nanti
      };

      // Simpan ke state
      S.frames.push(frameObj);

      // Render ulang UI
      renderFrameGrid();

      showToast('✓ Frame berhasil ditambahkan!');

      // Upload ke server (async)
      uploadToServer(file, frameObj);

    } catch (err) {
      console.error(err);
      URL.revokeObjectURL(objectUrl);
      showToast('❌ Terjadi kesalahan saat memproses gambar');
    }
  };

  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    showToast('❌ File PNG tidak valid atau tidak bisa dibaca');  
  };

  // Trigger load
  img.src = objectUrl;
}

function cleanFileName(fn) {
  return fn.replace(/\.png$/i,'').replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase()).trim() || 'Custom Frame';
}

async function uploadToServer(file, frameObj) {
  const fd = new FormData();
  fd.append('frame', file); fd.append('name', frameObj.name);
  try {
    const res  = await fetch('api/upload_frame.php', {method:'POST',body:fd});
    const data = await res.json();
    if (data.success) {
      const idx = S.frames.findIndex(f=>f.id===frameObj.id);
      if (idx!==-1) S.frames[idx]={ id:'srv-'+data.frame_id, srvId:data.frame_id, name:data.name, orient:data.orient||frameObj.orient, src:data.path, thumb:data.thumbnail||data.path };
      if (S.activeFrame?.id===frameObj.id) { S.activeFrame.id='srv-'+data.frame_id; S.activeFrame.srvId=data.frame_id; }
      renderFrameGrid(); showToast('☁️ Frame tersimpan ke server');
    } else {
      console.warn('[upload] Server error:', data.error);
      showToast('⚠️ Tersimpan lokal ('+( data.error||'server error')+')');
    }
  } catch(e) {
    console.warn('[upload] Server tidak tersedia:', e.message);
    showToast('⚠️ Tersimpan lokal (server tidak tersedia)');
  }
}

async function deleteFrame(localId, srvId) {
  if (srvId) try { await fetch(`api/frames.php?id=${srvId}`,{method:'DELETE'}); } catch(e) {}
  const f = S.frames.find(f => f.id === localId);
  if (f?._objUrl) URL.revokeObjectURL(f._objUrl);
  S.frames = S.frames.filter(f=>f.id!==localId);
  if (S.activeFrame?.id===localId) removeActiveFrame();
  renderFrameGrid(); showToast('🗑 Frame dihapus');
}

// ─── TABS ────────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tc=>tc.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById(`tab-${tab.dataset.tab}`);
      if (content) content.classList.add('active');
    });
  });
}

// ─── Helper render frame ke canvas (dipakai downloadPreview & goToPrint) ───
function renderFrameToCanvas(octx, oc) {
  if (!S.activeFrame?.img) return;
  
  const img = S.activeFrame.img;
  const cw = oc.width, ch = oc.height;
  
  // Sama seperti CSS object-fit:contain — frame mengisi canvas tanpa crop
  const fw = img.naturalWidth  || cw;
  const fh = img.naturalHeight || ch;
  
  // contain: scale terkecil agar seluruh frame muat
  const containScale = Math.min(cw / fw, ch / fh);
  
  // Ukuran frame setelah contain, lalu kalikan S.frameScale
  const drawW = fw * containScale * S.frameScale;
  const drawH = fh * containScale * S.frameScale;
  
  octx.save();
  octx.globalAlpha = S.frameOpacity;
  
  // Center canvas + offset drag
  const cx = cw / 2 + S.frameOffX;
  const cy = ch / 2 + S.frameOffY;
  
  octx.translate(cx, cy);
  octx.rotate(S.frameRotate * Math.PI / 180);
  octx.scale(
    S.frameFlipH ? -1 : 1,
    S.frameFlipV ? -1 : 1
  );
  
  octx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  octx.restore();
}

// ─── DOWNLOAD ────────────────────────────────────────────────
async function downloadPreview() {
  showToast('⏳ Menyiapkan preview…');
  const oc = document.createElement('canvas');
  oc.width = photoCanvas.width;
  oc.height = photoCanvas.height;
  const octx = oc.getContext('2d');
  octx.drawImage(photoCanvas, 0, 0);
  renderFrameToCanvas(octx, oc);
  const link = document.createElement('a');
  link.download = 'balisadhu-preview.png';
  link.href = oc.toDataURL('image/png');
  link.click();
  showToast('✓ Preview didownload');
}

const btnDownload = document.getElementById('btnDownload');
if (btnDownload) btnDownload.addEventListener('click', downloadPreview);

// ─── GO TO PRINT ─────────────────────────────────────────────
async function goToPrint() {
  showToast('⏳ Menyiapkan untuk cetak…');
  const oc = document.createElement('canvas');
  oc.width = photoCanvas.width;
  oc.height = photoCanvas.height;
  const octx = oc.getContext('2d');
  octx.drawImage(photoCanvas, 0, 0);
  renderFrameToCanvas(octx, oc);
  sessionStorage.setItem('bsp_framedSrc', oc.toDataURL('image/png'));
  sessionStorage.setItem('bsp_frameId', S.activeFrame?.id || 'none');
  sessionStorage.setItem('bsp_cropSizeId', sessionStorage.getItem('bsp_cropSizeId') || '4R');
  window.location.href = 'print.php';
}
// ─── TOAST ───────────────────────────────────────────────────
function showToast(msg) {
  const el=document.getElementById('toast');
  if (!el) return;
  el.textContent=msg; el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>el.classList.remove('show'),3000);
}

// ─── BOTTOM SHEET MOBILE ─────────────────────────────────────
function setupFrameBottomSheet() {
  const sheet = document.getElementById('frameBottomSheet');
  if (!sheet) return;

  // Tab switching
  document.querySelectorAll('.fbs-tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.fbs-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.fbs-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`fbs-${btn.dataset.fbs}`);
      if (panel) panel.classList.add('active');
      if (!sheet.classList.contains('expanded')) sheet.classList.add('expanded');
    });
  });

  // Handle toggle
  document.getElementById('fbsHandle')?.addEventListener('click', () => sheet.classList.toggle('expanded'));

  // Sliders — sync dengan state S
  const sliders = [
    { id: 'fbsSlOpacity', val: 'fbsValOpacity', fmt: v => v+'%', apply: v => { S.frameOpacity = v/100; refreshFrameStyle(); } },
    { id: 'fbsSlScale',   val: 'fbsValScale',   fmt: v => v+'%', apply: v => { S.frameScale = v/100; refreshFrameStyle(); } },
    { id: 'fbsSlRotate',  val: 'fbsValRotate',  fmt: v => v+'°', apply: v => { S.frameRotate = v; syncRotateSlider(); refreshFrameStyle(); } },
    { id: 'fbsSlPadding', val: 'fbsValPadding', fmt: v => v+'px', apply: v => { S.padding = v; const el = document.getElementById('valPadding'); if(el) el.textContent = v+'px'; const sl = document.getElementById('slPadding'); if(sl) sl.value = v; redrawPhoto(); fitToScreen(); } },
  ];
  sliders.forEach(({id, val, fmt, apply}) => {
    const sl = document.getElementById(id), vl = document.getElementById(val);
    if (!sl) return;
    sl.addEventListener('input', () => { const v = parseInt(sl.value); if(vl) vl.textContent = fmt(v); apply(v); });
  });

  // Rotate buttons
  document.getElementById('fbsBtnRotL')?.addEventListener('click', () => {
    S.frameRotate = ((S.frameRotate - 90 + 540) % 360) - 180;
    syncRotateSlider(); syncFbsRotate(); refreshFrameStyle();
  });
  document.getElementById('fbsBtnRotR')?.addEventListener('click', () => {
    S.frameRotate = ((S.frameRotate + 90 + 180) % 360) - 180;
    syncRotateSlider(); syncFbsRotate(); refreshFrameStyle();
  });
  document.getElementById('fbsBtnRotReset')?.addEventListener('click', () => {
    S.frameRotate = 0; syncRotateSlider(); syncFbsRotate(); refreshFrameStyle();
  });

  // Flip buttons
  document.getElementById('fbsBtnFlipH')?.addEventListener('click', () => {
    S.frameFlipH = !S.frameFlipH;
    const b = document.getElementById('fbsBtnFlipH');
    if(b){ b.style.color = S.frameFlipH ? 'var(--gold)' : ''; b.style.borderColor = S.frameFlipH ? 'var(--gold)' : ''; }
    refreshFrameStyle();
  });
  document.getElementById('fbsBtnFlipV')?.addEventListener('click', () => {
    S.frameFlipV = !S.frameFlipV;
    const b = document.getElementById('fbsBtnFlipV');
    if(b){ b.style.color = S.frameFlipV ? 'var(--gold)' : ''; b.style.borderColor = S.frameFlipV ? 'var(--gold)' : ''; }
    refreshFrameStyle();
  });

  // Position buttons in sheet
  document.querySelectorAll('#fbs-adjust .pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#fbs-adjust .pos-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyPositionPreset(btn.dataset.pos);
    });
  });

  // Orient filter in sheet
  document.querySelectorAll('#fbs-frames .orient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#fbs-frames .orient-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.filterOrient = btn.dataset.orient;
      renderFrameGrid();
    });
  });

  // Upload in sheet
  const fbsZone  = document.getElementById('fbsUploadZone');
  const fbsInput = document.getElementById('fbsFrameFileInput');
  if (fbsZone && fbsInput) {
    fbsZone.addEventListener('click', () => fbsInput.click());
    fbsInput.addEventListener('change', e => { [...e.target.files].forEach(handleFrameFile); fbsInput.value = ''; });
  }

  // Background swatches in sheet
  const fbsSwatches = document.getElementById('fbsBgSwatches');
  if (fbsSwatches) {
    BG_SWATCHES.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'bg-swatch';
      btn.style.background = color;
      btn.style.border = color==='#ffffff' ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent';
      btn.addEventListener('click', () => { setBgColor(color); });
      fbsSwatches.appendChild(btn);
    });
  }
  const fbsPicker = document.getElementById('fbsBgColorPicker');
  if (fbsPicker) fbsPicker.addEventListener('input', e => setBgColor(e.target.value));

  // Render frames ke sheet grid juga — patch renderFrameGrid
  // sementara koosong
}

function syncFbsRotate() {
  const sl = document.getElementById('fbsSlRotate');
  const vl = document.getElementById('fbsValRotate');
  if (sl) sl.value = S.frameRotate;
  if (vl) vl.textContent = S.frameRotate + '°';
}

let _origRenderFrameGrid = null;

function renderFbsFrameGrid() {
  const grid = document.getElementById('fbsFramesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const filter = S.filterOrient;
  const visible = S.frames.filter(f => filter==='all' || f.orient===filter);
  if (!visible.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;font-size:11px;color:var(--text-dim);padding:24px 0;">Belum ada frame</div>`;
    return;
  }
  visible.forEach(frame => {
    const isActive = S.activeFrame?.id === frame.id;
    const card = document.createElement('div');
    card.className = 'frame-thumb-card' + (frame.orient==='landscape'?' landscape':'') + (isActive?' active':'');
    card.style.background = '#111';
    const img = document.createElement('img');
    img.src = frame.thumb || frame.src;
    img.alt = frame.name;
    img.loading = 'lazy';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    card.appendChild(img);
    const nameEl = document.createElement('div');
    nameEl.className = 'card-name';
    nameEl.textContent = frame.name;
    card.appendChild(nameEl);
    card.addEventListener('click', () => applyFrame(frame));
    grid.appendChild(card);
  });
}

// ─── EXPOSE ──────────────────────────────────────────────────
window.removeActiveFrame   = removeActiveFrame;
window.resetFrameTransform = resetFrameTransform;
window.goToPrint           = goToPrint;