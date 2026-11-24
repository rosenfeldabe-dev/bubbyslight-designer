/* Embedded mode: running inside the merkos302.judaica.com page */
const BL_EMBED = window.self !== window.top;
function blModal(open) { if (BL_EMBED) parent.postMessage({ bl: 'modal', open }, '*'); }
if (BL_EMBED) {
  document.documentElement.classList.add('embedded');
  const blPost = () => parent.postMessage({ bl: 'h', h: Math.ceil(document.body.getBoundingClientRect().height) }, '*');
  window.addEventListener('DOMContentLoaded', () => { blPost(); new ResizeObserver(blPost).observe(document.body); });
  window.addEventListener('load', blPost);
  window.addEventListener('message', e => {
    const d = e.data || {};
    if (d.bl !== 'view') return;
    const r = document.documentElement.style;
    r.setProperty('--bl-top', Math.max(0, d.top) + 'px');
    r.setProperty('--bl-vh', Math.max(300, d.vh) + 'px');
  });
}
/* Bubby's Light kit designer for Merkos302 */
(() => {
  'use strict';

  // Where order requests go once the Merkos302 hub endpoint exists. Null = prototype mode (local only).
  const ORDER_ENDPOINT = null;

  const BASE_HUE = 325;            // hue of the original blush watercolor
  const BASE_BG = [254, 220, 241]; // average color of the original background
  const BASE_ACCENT = [146, 52, 106]; // #92346A headline rose

  const ZONES = {
    msg:   { x: 60.3, y: 49.7,  w: 111.7, h: 28.1 },
    ded:   { x: 60.3, y: 264.9, w: 107.7, h: 25.5 },
    logo:  { x: 78.3, y: 295.6, w: 71.9,  h: 16.7 },
    big:   { x: 60.3, y: 262.5, w: 107.7, h: 50.5 },
    dedXL: { x: 60.3, y: 266.0, w: 107.7, h: 44.0 }
  };

  const PRESETS = [
    { id: 'blush', name: 'Blush', hue: 325, sat: 1 },
    { id: 'lavender', name: 'Lavender', hue: 272, sat: 1 },
    { id: 'sky', name: 'Sky', hue: 212, sat: 1 },
    { id: 'seafoam', name: 'Seafoam', hue: 168, sat: 1 },
    { id: 'sage', name: 'Sage', hue: 112, sat: 0.85 },
    { id: 'honey', name: 'Honey', hue: 42, sat: 1.05 },
    { id: 'coral', name: 'Coral', hue: 8, sat: 1 },
    { id: 'pearl', name: 'Pearl', hue: 325, sat: 0.18 }
  ];

  const INKS = [
    { id: 'match', label: 'Match kit' },
    { id: 'navy', label: 'Navy', color: '#052549' },
    { id: 'charcoal', label: 'Charcoal', color: '#2b2b2e' },
    { id: 'gold', label: 'Antique gold', color: '#8a6a2f' }
  ];

  const QTYS = [10000, 15000, 20000, 'other'];
  const MIN_QTY = 10000;
  // customer prices per kit, shipping included, before tax (Bubby's Light proposal, Nov 2026)
  function pricePerKit(q) { return q >= 20000 ? 0.44 : q >= 15000 ? 0.45 : 0.46; }
  const money = n => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const cents = p => `${Math.round(p * 100)}¢`;

  const GALLERY = [
    { f: '01-bubbyslight-classic', t: "The Bubby's Light Kit", d: 'Our classic kit', n: '40,000' },
    { f: '02-chabad-air', t: 'Chabad Air', d: 'Co-branded for Chabad of the Air', n: '20,000' },
    { f: '03-chaya-menucha', t: 'Chaya Menucha Memorial Kit', d: 'In loving memory', n: '20,000' },
    { f: '04-yeshiva-flatbush', t: 'Yeshiva of Flatbush', d: 'Spread the Light campaign', n: '10,000' },
    { f: '05-soul-links', t: 'Soul Links', d: 'In memory of Staff Sgt. Rose Lubin HY"D', n: '20,000' },
    { f: '06-motti-aqua', t: 'Mitzvos for Motti', d: 'Design 1', n: '70,000 across both designs' },
    { f: '07-motti-blue', t: 'Mitzvos for Motti', d: 'Design 2', n: '70,000 across both designs' },
    { f: '08-generic-v26', t: 'Shabbat Candles', d: 'Generic watercolor kit', n: '' }
  ];

  const FONTS = {
    'lora-i': { family: 'Lora', style: 'italic' },
    'lora':   { family: 'Lora', style: 'normal' },
    'frank':  { family: 'Frank Ruhl Libre', style: 'normal' }
  };

  const state = {
    hue: BASE_HUE, sat: 1, preset: 'blush',
    layout: 'both', font: 'lora-i', ink: 'match',
    logo: null, logoName: '', logoRaw: null, logoIsSvg: false, logoColor: 'original', knock: false, logoScale: 1,
    ded1: '', ded2: '', msg1: '', msg2: '', qty: 10000,
    mode: 'pink', flap: 'both', refFiles: []
  };
  const BRS_INK = '#934253'; // Brushstroke headline rose, sampled from the kit
  const FLAP_W = 124.3, FLAP_H = 42.4; // top flap face in points (1.73 x 0.59 in)
  const FLAP_ZONES = {
    both:  { logo: { x: 14, y: 4, w: 96.3, h: 19 }, text: { x: 6, y: 24, w: 112.3, h: 15 } },
    logo:  { logo: { x: 10, y: 5, w: 104.3, h: 32.4 } },
    words: { text: { x: 5, y: 4, w: 114.3, h: 34.4 } }
  };
  const MODES = {
    pink: { name: 'Watercolor kit, fully custom', steps: ['step-color', 'step-logo', 'step-words', 'step-order'] },
    brs:  { name: 'Brushstroke kit, custom top flap', steps: ['step-logo', 'step-words', 'step-order'] },
    own:  { name: 'Your own unique design', steps: ['step-idea', 'step-order'] }
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- color math (matches SVG feColorMatrix) ---------- */
  function hueMatrix(deg) {
    const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    return [
      0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
      0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.140, 0.072 - c * 0.072 - s * 0.283,
      0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072
    ];
  }
  function satMatrix(s) {
    return [
      0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
      0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
      0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s
    ];
  }
  function apply(m, [r, g, b]) {
    return [m[0] * r + m[1] * g + m[2] * b, m[3] * r + m[4] * g + m[5] * b, m[6] * r + m[7] * g + m[8] * b]
      .map(v => Math.max(0, Math.min(255, Math.round(v))));
  }
  function toned(rgb) { return apply(satMatrix(state.sat), apply(hueMatrix(rotation()), rgb)); }
  const hex = ([r, g, b]) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  const rotation = () => ((state.hue - BASE_HUE) % 360 + 360) % 360;
  const inkColor = () => state.ink === 'match' ? (state.mode === 'brs' ? BRS_INK : hex(toned(BASE_ACCENT))) : INKS.find(i => i.id === state.ink).color;

  /* ---------- template load ---------- */
  async function loadTemplate() {
    const res = await fetch('assets/kit-template.svg');
    const txt = await res.text();
    const doc = new DOMParser().parseFromString(`<svg xmlns="${NS}" xmlns:xlink="http://www.w3.org/1999/xlink">${txt}</svg>`, 'image/svg+xml');
    const art = $('#kitArt');
    const frag = document.createDocumentFragment();
    Array.from(doc.documentElement.childNodes).forEach(n => frag.appendChild(document.importNode(n, true)));
    art.appendChild(frag);
    keepOriginalColors(art, ['#source-39']); // silver candlesticks and flames stay true to life
  }
  // Re-draw selected artwork layers above the tinted art without the color filter,
  // rebuilding each layer's ancestor chain so clips, masks and transforms stay identical.
  function keepOriginalColors(art, refs) {
    const fixed = document.createElementNS(NS, 'g');
    fixed.setAttribute('id', 'kitFixed');
    fixed.setAttribute('filter', 'url(#candleTone)');
    art.querySelectorAll('use').forEach(u => {
      const href = u.getAttribute('href') || u.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      if (!refs.includes(href)) return;
      const chain = [];
      for (let n = u.parentNode; n && n !== art; n = n.parentNode) chain.unshift(n);
      let parent = fixed;
      chain.forEach(n => { const c = n.cloneNode(false); c.removeAttribute('id'); parent.appendChild(c); parent = c; });
      parent.appendChild(u.cloneNode(true));
    });
    art.parentNode.insertBefore(fixed, art.nextSibling);
  }

  /* ---------- text fitting ---------- */
  const measureCtx = document.createElement('canvas').getContext('2d');
  const isHeb = s => /[\u0590-\u05FF]/.test(s);
  function fontFor(text) {
    if (isHeb(text)) return FONTS.frank;
    return FONTS[state.font];
  }
  function fitSize(text, f, maxW, maxSize) {
    if (!text) return maxSize;
    measureCtx.font = `${f.style} 500 100px "${f.family}"`;
    const w = measureCtx.measureText(text).width / 100;
    return Math.min(maxSize, maxW / Math.max(w, 0.01));
  }
  function setText(el, text, cx, baseline, size, f) {
    el.textContent = text;
    el.setAttribute('x', cx);
    el.setAttribute('y', baseline);
    el.setAttribute('font-family', `${f.family}, serif`);
    el.setAttribute('font-style', f.style);
    el.setAttribute('font-weight', '500');
    el.setAttribute('font-size', size.toFixed(2));
    el.setAttribute('fill', inkColor());
    if (isHeb(text)) { el.setAttribute('direction', 'rtl'); el.setAttribute('unicode-bidi', 'embed'); }
    else { el.removeAttribute('direction'); el.removeAttribute('unicode-bidi'); }
  }
  function layoutLines(lines, zone, oneMax, twoMax, els) {
    const pad = 4, maxW = zone.w - pad * 2, cx = zone.x + zone.w / 2;
    const L = lines.filter(Boolean);
    els.forEach(e => { e.textContent = ''; });
    if (!L.length) return;
    if (L.length === 1) {
      const f = fontFor(L[0]);
      const size = fitSize(L[0], f, maxW, oneMax);
      setText(els[0], L[0], cx, zone.y + zone.h / 2 + size * 0.34, size, f);
    } else {
      const fs = L.map(fontFor);
      const size = Math.min(fitSize(L[0], fs[0], maxW, twoMax), fitSize(L[1], fs[1], maxW, twoMax));
      const gap = size * 1.22, mid = zone.y + zone.h / 2;
      setText(els[0], L[0], cx, mid - gap / 2 + size * 0.34, size, fs[0]);
      setText(els[1], L[1], cx, mid + gap / 2 + size * 0.34, size, fs[1]);
    }
  }

  /* ---------- render ---------- */
  let raf = 0;
  function render() { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
  function draw() {
    $('#toneHue').setAttribute('values', rotation().toFixed(1));
    $('#toneSat').setAttribute('values', state.sat.toFixed(2));
    const off = Math.min(1, Math.abs(((rotation() + 180) % 360) - 180) / 40);
    $('#candleSat').setAttribute('values', (1 - 0.6 * off).toFixed(2));

    // wheel
    const bg = hex(toned(BASE_BG));
    $('#wheelSwatch').style.background = `radial-gradient(circle at 35% 30%, #fff 0%, ${bg} 55%, ${hex(toned(BASE_ACCENT))} 140%)`;
    const a = (state.hue - 90) * Math.PI / 180, R = 84 - 19;
    const k = $('#wheelKnob');
    k.style.left = (84 + Math.cos(a) * R) + 'px';
    k.style.top = (84 + Math.sin(a) * R) + 'px';
    k.style.background = `hsl(${state.hue} 60% 70%)`;
    $('#wheel').setAttribute('aria-valuenow', Math.round(state.hue));
    $('#wheel').setAttribute('aria-valuetext', `${presetName()} color`);
    $$('.preset').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === state.preset)));
    $('#sat').value = state.sat;
    $('.ink.match') && ($('.ink.match').title = `Match kit (${inkColor()})`);

    // message (top flap)
    layoutLines([state.msg1, state.msg2], ZONES.msg, 11, 8.6, [$('#tMessage'), $('#tMessage2')]);

    // dedication
    const ded = state.layout === 'logo' ? [] : [state.ded1, state.ded2];
    const dz = state.layout === 'ded' ? ZONES.dedXL : ZONES.ded;
    layoutLines(ded, dz, state.layout === 'ded' ? 12 : 9.2, state.layout === 'ded' ? 9.5 : 7.6, [$('#tDed1'), $('#tDed2')]);

    // logo
    const img = $('#logoImg');
    const lz = state.layout === 'logo' ? ZONES.big : ZONES.logo;
    const show = state.logo && state.layout !== 'ded';
    if (show) {
      const s = state.logoScale, w = lz.w * s, h = lz.h * s;
      const x = lz.x + (lz.w - w) / 2, y = lz.y + (lz.h - h) / 2;
      img.setAttribute('href', state.logo);
      [['x', x], ['y', y], ['width', w], ['height', h]].forEach(([n, v]) => img.setAttribute(n, v.toFixed(2)));
      const cr = $('#logoClipRect');
      [['x', lz.x], ['y', lz.y], ['width', lz.w], ['height', lz.h]].forEach(([n, v]) => cr.setAttribute(n, v));
      $('#logoMonoColor').setAttribute('flood-color', inkColor());
      if (state.logoColor === 'mono') img.setAttribute('filter', 'url(#logoMono)'); else img.removeAttribute('filter');
    } else {
      img.removeAttribute('href');
    }
    $('#dedField').style.opacity = state.layout === 'logo' ? 0.45 : 1;
    drawFlap();
    updateLogoWarn();
  }
  function drawFlap() {
    const z = FLAP_ZONES[state.flap];
    const t1 = $('#fMsg1'), t2 = $('#fMsg2');
    if (z.text) {
      layoutLines([state.msg1, state.msg2], z.text, state.flap === 'words' ? 13 : 9, state.flap === 'words' ? 10.5 : 6.6, [t1, t2]);
    } else { t1.textContent = ''; t2.textContent = ''; }
    const img = $('#flapLogo');
    if (z.logo && state.logo) {
      const lz = z.logo, sc = state.logoScale, w = lz.w * sc, h = lz.h * sc;
      img.setAttribute('href', state.logo);
      [['x', lz.x + (lz.w - w) / 2], ['y', lz.y + (lz.h - h) / 2], ['width', w], ['height', h]].forEach(([n, v]) => img.setAttribute(n, v.toFixed(2)));
      const cr = $('#flapLogoClipRect');
      [['x', lz.x], ['y', lz.y], ['width', lz.w], ['height', lz.h]].forEach(([n, v]) => cr.setAttribute(n, v));
      $('#flapMonoColor').setAttribute('flood-color', inkColor());
      if (state.logoColor === 'mono') img.setAttribute('filter', 'url(#flapMono)'); else img.removeAttribute('filter');
    } else img.removeAttribute('href');
    $('#flapEmpty').hidden = !!((z.text && (state.msg1 || state.msg2)) || (z.logo && state.logo));
  }
  const presetName = () => (PRESETS.find(p => p.id === state.preset) || { name: 'Custom' }).name;

  /* ---------- color controls ---------- */
  function buildPresets() {
    const wrap = $('#presets');
    PRESETS.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'preset'; b.dataset.id = p.id;
      const prev = { hue: state.hue, sat: state.sat };
      state.hue = p.hue; state.sat = p.sat;
      b.innerHTML = `<i style="background:${hex(toned([238, 170, 205]))}"></i>${p.name}`;
      state.hue = prev.hue; state.sat = prev.sat;
      b.addEventListener('click', () => { state.hue = p.hue; state.sat = p.sat; state.preset = p.id; render(); });
      wrap.appendChild(b);
    });
    $('#sat').addEventListener('input', e => { state.sat = +e.target.value; state.preset = matchPreset(); render(); });
  }
  const matchPreset = () => (PRESETS.find(p => Math.abs(p.hue - state.hue) < 1 && Math.abs(p.sat - state.sat) < .01) || { id: 'custom' }).id;

  function bindWheel() {
    const w = $('#wheel');
    const setFrom = e => {
      const r = w.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      let h = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      state.hue = (h + 360) % 360;
      if (state.sat < 0.3) state.sat = 1;
      state.preset = matchPreset();
      render();
    };
    w.addEventListener('pointerdown', e => { w.setPointerCapture(e.pointerId); setFrom(e); });
    w.addEventListener('pointermove', e => { if (w.hasPointerCapture(e.pointerId)) setFrom(e); });
    w.addEventListener('keydown', e => {
      const step = e.shiftKey ? 15 : 4;
      if (['ArrowRight', 'ArrowUp'].includes(e.key)) state.hue = (state.hue + step) % 360;
      else if (['ArrowLeft', 'ArrowDown'].includes(e.key)) state.hue = (state.hue - step + 360) % 360;
      else return;
      e.preventDefault(); state.preset = matchPreset(); render();
    });
  }

  /* ---------- segmented controls ---------- */
  function seg(id, key, after) {
    $$(`#${id} button`).forEach(b => b.addEventListener('click', () => {
      state[key] = b.dataset.v;
      $$(`#${id} button`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      after && after(); render();
    }));
  }

  function buildInks() {
    const wrap = $('#inkSet');
    INKS.forEach(i => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ink' + (i.id === 'match' ? ' match' : '');
      if (i.color) b.style.background = i.color;
      b.title = i.label; b.setAttribute('aria-label', i.label);
      b.setAttribute('aria-pressed', String(i.id === state.ink));
      b.addEventListener('click', () => { state.ink = i.id; $$('.ink').forEach(x => x.setAttribute('aria-pressed', String(x === b))); render(); });
      wrap.appendChild(b);
    });
  }

  /* ---------- logo ---------- */
  function loadImage(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  }
  async function processLogo() {
    if (!state.logoRaw) return;
    if (state.logoIsSvg) { state.logo = state.logoRaw; state.logoPx = Infinity; finishLogo(); return; }
    const img = await loadImage(state.logoRaw);
    const max = 1800, sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const W = Math.round(img.naturalWidth * sc), H = Math.round(img.naturalHeight * sc);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H), p = d.data;
    if (state.knock) {
      for (let i = 0; i < p.length; i += 4) {
        const m = Math.min(p[i], p[i + 1], p[i + 2]);
        if (m > 242) p[i + 3] = 0;
        else if (m > 215) p[i + 3] = Math.round(p[i + 3] * (242 - m) / 27);
      }
    }
    // trim transparent / pure white edges
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      const i = (yy * W + xx) * 4;
      const blank = p[i + 3] < 8 || (p[i] > 248 && p[i + 1] > 248 && p[i + 2] > 248);
      if (!blank) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
    }
    x.putImageData(d, 0, 0);
    if (x1 < 0) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
    const tw = x1 - x0 + 1, th = y1 - y0 + 1;
    const t = document.createElement('canvas'); t.width = tw; t.height = th;
    t.getContext('2d').drawImage(c, x0, y0, tw, th, 0, 0, tw, th);
    state.logo = t.toDataURL('image/png');
    state.logoPx = Math.round(tw / sc);
    finishLogo();
  }
  function finishLogo() {
    $('#logoThumb').src = state.logo;
    $('#logoName').textContent = state.logoName;
    $('#logoTools').hidden = false;
    $('#knockWhite').disabled = state.logoIsSvg;
    $('#knockWhite').closest('label').style.opacity = state.logoIsSvg ? .5 : 1;
    render();
  }
  function updateLogoWarn() {
    const el = $('#logoWarn');
    const brs = state.mode === 'brs';
    if (!state.logo || state.logoIsSvg || (!brs && state.layout === 'ded') || (brs && state.flap === 'words')) { el.hidden = true; return; }
    const zone = brs ? FLAP_ZONES[state.flap].logo : state.layout === 'logo' ? ZONES.big : ZONES.logo;
    const needed = Math.round(zone.w * state.logoScale / 72 * 300);
    if (state.logoPx < needed) {
      el.hidden = false;
      el.textContent = `This logo is ${state.logoPx}px wide. For a sharp print at this size, send at least ${needed}px wide, or an SVG. Bubby's Light can also request a better file with your proof.`;
    } else el.hidden = true;
  }
  function bindLogo() {
    const input = $('#logoFile'), drop = $('#drop');
    const take = file => {
      if (!file) return;
      if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type)) { alert('Please upload a PNG, JPG, WEBP or SVG file.'); return; }
      const r = new FileReader();
      r.onload = () => {
        state.logoRaw = r.result; state.logoName = file.name; state.logoIsSvg = file.type === 'image/svg+xml';
        state.knock = !state.logoIsSvg && file.type === 'image/jpeg';
        $('#knockWhite').checked = state.knock;
        processLogo();
      };
      r.readAsDataURL(file);
    };
    input.addEventListener('change', () => take(input.files[0]));
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', e => take(e.dataTransfer.files[0]));
    $('#knockWhite').addEventListener('change', e => { state.knock = e.target.checked; processLogo(); });
    $('#logoScale').addEventListener('input', e => { state.logoScale = +e.target.value; render(); });
    $('#logoRemove').addEventListener('click', () => {
      Object.assign(state, { logo: null, logoRaw: null, logoName: '' });
      input.value = ''; $('#logoTools').hidden = true; render();
    });
  }

  /* ---------- text inputs ---------- */
  function bindText() {
    ['ded1', 'ded2', 'msg1', 'msg2'].forEach(id => $('#' + id).addEventListener('input', e => { state[id] = e.target.value.trim(); render(); }));
  }

  /* ---------- 3D box ---------- */
  function bindBox() {
    const vp = $('#viewport'), box = $('#box');
    let rx = -22, ry = -30, sx = 0, sy = 0, srx = 0, sry = 0, drag = false;
    const set = () => { box.style.setProperty('--rx', rx + 'deg'); box.style.setProperty('--ry', ry + 'deg'); };
    vp.addEventListener('pointerdown', e => {
      if (view !== 'box') return;
      drag = true; vp.classList.add('dragging'); vp.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY; srx = rx; sry = ry;
    });
    vp.addEventListener('pointermove', e => {
      if (!drag) return;
      ry = sry + (e.clientX - sx) * 0.5;
      rx = Math.max(-25, Math.min(40, srx - (e.clientY - sy) * 0.3));
      set();
    });
    const end = () => { drag = false; vp.classList.remove('dragging'); };
    vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
    const stops = [-32, -118, -212, 58];
    let si = 0;
    $('#spinBtn').addEventListener('click', () => {
      si = (si + 1) % stops.length;
      const target = stops[si];
      ry = ry + (((target - ry) % 360) + 540) % 360 - 180; rx = -22; set();
    });
    set();
  }
  let view = 'box';
  function bindView() {
    $$('[data-view]').forEach(b => b.addEventListener('click', () => {
      view = b.dataset.view;
      $$('[data-view]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
      $('#scene').style.display = view === 'box' ? '' : 'none';
      $('#flat').classList.toggle('offstage', view !== 'flat');
      $('#flat').style.cssText = view === 'flat' ? '' : 'position:absolute;width:10px;height:10px;opacity:0;pointer-events:none;overflow:hidden;';
      $('#spinBtn').style.visibility = view === 'box' ? '' : 'hidden';
      $('#stageNote').textContent = view === 'box'
        ? "Drag to turn the box. The print layout shows every panel flat, as Bubby's Light prints it."
        : 'Flat print layout with all panels. Fold lines are shown in fine gray.';
    }));
  }

  /* ---------- export ---------- */
  let fontCSS = null;
  async function embeddedFonts() {
    if (fontCSS) return fontCSS;
    const files = [
      ['Lora', 'italic', 'Lora-italic-500-latin.woff2'], ['Lora', 'normal', 'Lora-normal-500-latin.woff2'],
      ['Frank Ruhl Libre', 'normal', 'FrankRuhlLibre-normal-500-hebrew.woff2'], ['Frank Ruhl Libre', 'normal', 'FrankRuhlLibre-normal-500-latin.woff2']
    ];
    const parts = await Promise.all(files.map(async ([fam, st, fn]) => {
      const buf = await (await fetch('assets/fonts/' + fn)).arrayBuffer();
      let bin = ''; const u = new Uint8Array(buf);
      for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      return `@font-face{font-family:'${fam}';font-style:${st};font-weight:500;src:url(data:font/woff2;base64,${btoa(bin)}) format('woff2');}`;
    }));
    return (fontCSS = parts.join(''));
  }
  const SHEET_W = 396, SHEET_H = 398.16; // points, actual print sheet size (5.5 x 5.53 in)
  async function svgToCanvas(svgEl, width, height, bg) {
    const svg = svgEl.cloneNode(true);
    svg.setAttribute('xmlns', NS);
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.removeAttribute('style');
    const style = document.createElementNS(NS, 'style');
    style.textContent = await embeddedFonts();
    svg.insertBefore(style, svg.firstChild);
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    try {
      const img = await loadImage(url);
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      const x = c.getContext('2d'); x.fillStyle = bg || '#fff'; x.fillRect(0, 0, width, height);
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, width, height);
      return c;
    } finally { URL.revokeObjectURL(url); }
  }
  const renderCanvas = width => svgToCanvas($('#kit'), width, Math.round(width * SHEET_H / SHEET_W));
  const renderFlapCanvas = width => svgToCanvas($('#flap'), width, Math.round(width * FLAP_H / FLAP_W), '#f6e4d9');
  async function renderPNG(width = 2400) {
    if (state.mode === 'own') return null;
    const c = state.mode === 'brs' ? await renderFlapCanvas(width) : await renderCanvas(width);
    return c.toDataURL('image/png');
  }
  const PRINT_DPI = 600;

  /* CMYK PDF writer: converts the rendered artwork to DeviceCMYK and writes an actual size PDF */
  function canvasToCMYK(canvas) {
    const w = canvas.width, h = canvas.height;
    const d = canvas.getContext('2d').getImageData(0, 0, w, h).data;
    const out = new Uint8Array(w * h * 4);
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
      const k = 1 - Math.max(r, g, b);
      if (k >= 0.999) { out[i + 3] = 255; continue; }
      const ik = 1 / (1 - k);
      out[i] = Math.round((1 - r - k) * ik * 255);
      out[i + 1] = Math.round((1 - g - k) * ik * 255);
      out[i + 2] = Math.round((1 - b - k) * ik * 255);
      out[i + 3] = Math.round(k * 255);
    }
    return { w, h, data: out };
  }
  async function deflate(u8) {
    if (typeof CompressionStream === 'undefined') return null;
    const stream = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  const pdfStr = t => t.replace(/[\\()]/g, m => '\\' + m).replace(/[^\x20-\x7e]/g, '');
  async function cmykPDF(canvas, wPt, hPt, title, subject) {
    const { w, h, data } = canvasToCMYK(canvas);
    const packed = await deflate(data);
    const img = packed || data;
    const enc = new TextEncoder(), parts = [], offs = [];
    let len = 0;
    const push = x => { const u = typeof x === 'string' ? enc.encode(x) : x; parts.push(u); len += u.length; };
    const obj = (n, ...body) => { offs[n] = len; push(`${n} 0 obj\n`); body.forEach(push); push('\nendobj\n'); };
    const W = +wPt.toFixed(2), H = +hPt.toFixed(2);
    const content = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    const d = new Date(), pad = n => String(n).padStart(2, '0');
    const when = `D:${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    push('%PDF-1.4\n');
    push(new Uint8Array([37, 226, 227, 207, 211, 10]));
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /TrimBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`);
    obj(4, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    obj(5, `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceCMYK /BitsPerComponent 8${packed ? ' /Filter /FlateDecode' : ''} /Length ${img.length} >>\nstream\n`, img, '\nendstream');
    obj(6, `<< /Title (${pdfStr(title)}) /Subject (${pdfStr(subject)}) /Creator (Bubby's Light Kit Designer) /Producer (Merkos302) /CreationDate (${when}) >>`);
    const xref = len;
    push(`xref\n0 7\n0000000000 65535 f \n${offs.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`);
    push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, { type: 'application/pdf' });
  }
  async function renderPrintPDF() {
    if (state.mode === 'brs') {
      const c = await renderFlapCanvas(Math.round(FLAP_W / 72 * PRINT_DPI));
      return cmykPDF(c, FLAP_W, FLAP_H, "Bubby's Light Brushstroke kit, custom top flap", `Top flap artwork 1.73 x 0.59 in, CMYK, ${PRINT_DPI} dpi`);
    }
    const c = await renderCanvas(Math.round(SHEET_W / 72 * PRINT_DPI));
    return cmykPDF(c, SHEET_W, SHEET_H, "Bubby's Light custom watercolor kit print file", `Print sheet 5.5 x 5.53 in, CMYK, ${PRINT_DPI} dpi`);
  }
  function stamp() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function saveBlob(blob, name) {
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  async function download(base) {
    const btns = [$('#dlProof'), $('#doneDl')];
    btns.forEach(b => { b.disabled = true; b.dataset.t = b.textContent; b.textContent = 'Preparing print file'; });
    try {
      const pdf = await renderPrintPDF();
      const kind = state.mode === 'brs' ? 'bubbys-light-top-flap-print-file' : 'bubbys-light-kit-print-file';
      saveBlob(pdf, `${base || kind}-${stamp()}.pdf`);
    } catch (err) { console.error(err); alert('Sorry, the print file could not be created in this browser.'); }
    finally { btns.forEach(b => { b.disabled = false; b.textContent = b.dataset.t; }); }
  }
  window.blRenderPrintPDF = renderPrintPDF;

  /* ---------- order ---------- */
  function currentQty() { return state.qty === 'other' ? parseInt($('#qtyOther').value, 10) : state.qty; }
  function updatePrice() {
    const q = currentQty(), el = $('#priceEst');
    if (!q || q < MIN_QTY) {
      el.innerHTML = `<strong>Minimum order is ${MIN_QTY.toLocaleString()} kits.</strong>`;
      return;
    }
    const p = pricePerKit(q);
    el.innerHTML = `<span>Estimated total</span><strong>${money(q * p)}</strong><span>${q.toLocaleString()} kits at ${cents(p)} per kit</span><span class="freight"><b>Freight:</b> included, delivered to your door<br><b>20% deposit on approval:</b> ${money(Math.round(q * p * 20) / 100)}</span>`;
  }
  function buildQty() {
    const g = $('#qtyGrid');
    QTYS.forEach(q => {
      const b = document.createElement('button'); b.type = 'button';
      b.innerHTML = q === 'other' ? 'More<small>your amount</small>' : `${q.toLocaleString()}<small>${cents(pricePerKit(q))} per kit</small>`;
      b.setAttribute('aria-pressed', String(q === state.qty));
      b.addEventListener('click', () => {
        state.qty = q;
        $$('#qtyGrid button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        $('#qtyOther').hidden = q !== 'other';
        if (q === 'other') $('#qtyOther').focus();
        updatePrice();
      });
      g.appendChild(b);
    });
    $('#qtyOther').addEventListener('input', updatePrice);
    updatePrice();
  }
  function bindOrder() {
    const form = $('#orderForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const err = $('#formErr'); err.hidden = true;
      $$('.bad', form).forEach(x => x.classList.remove('bad'));
      const need = ['org', 'name', 'email', 'addr'];
      const missing = need.filter(id => !$('#' + id).value.trim());
      const email = $('#email').value.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push('email');
      const qty = currentQty();
      if (!qty || qty < MIN_QTY) missing.push('qtyOther');
      missing.forEach(id => $('#' + id).classList.add('bad'));
      if (state.mode === 'own' && !$('#idea').value.trim()) { $('#idea').classList.add('bad'); missing.unshift('idea'); }
      if (!$('#approve').checked) missing.push('approve');
      if (missing.length) {
        err.hidden = false;
        err.textContent = missing.includes('qtyOther')
          ? `Custom kits start at ${MIN_QTY.toLocaleString()}. Please enter ${MIN_QTY.toLocaleString()} or more, or choose the ready made Brushstroke kit below.`
          : missing.includes('approve') && missing.length === 1
          ? 'Please confirm you will approve a proof before printing.'
          : missing[0] === 'idea'
          ? 'Please tell us a little about the design you have in mind.'
          : 'Please fill in the highlighted fields so we can send your proof.';
        const first = $('#' + missing[0]); first && first.focus();
        return;
      }
      const d = new Date();
      const ref = `BL-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const order = {
        ref, createdAt: d.toISOString(), qty, pricePerKit: pricePerKit(qty), estimatedTotal: Math.round(qty * pricePerKit(qty) * 100) / 100,
        customer: { org: $('#org').value.trim(), name: $('#name').value.trim(), email, phone: $('#phone').value.trim(), address: $('#addr').value.trim(), needBy: $('#needBy').value, notes: $('#notes').value.trim() },
        option: state.mode, optionName: MODES[state.mode].name,
        design: state.mode === 'own' ? { idea: $('#idea').value.trim(), referenceFiles: state.refFiles } : state.mode === 'brs' ? { template: 'brushstroke-generic-v26', customizes: 'top flap', flapLayout: state.flap, lettering: state.font, ink: inkColor(), message: [state.msg1, state.msg2].filter(Boolean), logoFile: state.logoName || null, logoColor: state.logoColor, logoScale: state.logoScale } : { template: 'custom-template-logo-ready', color: presetName(), hue: Math.round(state.hue), hueRotation: Math.round(rotation()), saturation: state.sat, layout: state.layout, lettering: state.font, ink: inkColor(), dedication: [state.ded1, state.ded2].filter(Boolean), message: [state.msg1, state.msg2].filter(Boolean), logoFile: state.logoName || null, logoColor: state.logoColor, logoScale: state.logoScale }
      };
      const submitBtn = $('button[type=submit]', form);
      submitBtn.disabled = true; submitBtn.textContent = 'Sending';
      try {
        const proof = await renderPNG(1400);
        if (ORDER_ENDPOINT) {
          const r = await fetch(ORDER_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...order, proofPng: proof, logoData: state.logo }) });
          if (!r.ok) throw new Error('Order endpoint returned ' + r.status);
        } else {
          (window.blOrders = window.blOrders || []).push(order);
          window.lastOrder = order;
        }
        showDone(order, proof);
      } catch (ex) {
        console.error(ex); err.hidden = false; err.textContent = 'Something went wrong sending your request. Please try again, or email Bubbyslight@gmail.com.';
      } finally { submitBtn.disabled = false; submitBtn.textContent = 'Send my order request'; }
    });
    $('#dlProof').addEventListener('click', () => download());
  }
  function showDone(o, proof) {
    $('#doneRef').textContent = o.ref;
    $('#doneImg').hidden = !proof;
    if (proof) $('#doneImg').src = proof;
    $('#doneDl').hidden = o.option === 'own';
    const d = o.design;
    const designRows = o.option === 'own'
      ? [['Your idea', d.idea], ['Reference files', d.referenceFiles.join(', ') || 'None']]
      : o.option === 'brs'
      ? [['Top flap', d.message.join(' / ') || 'None'], ['Logo', d.logoFile || 'None']]
      : [['Color', d.color], ['Dedication', d.dedication.join(' / ') || 'None'], ['Top flap', d.message.join(' / ') || 'None'], ['Logo', d.logoFile || 'None']];
    const rows = [
      ['Design option', o.optionName], ['Quantity', `${o.qty.toLocaleString()} kits`], ['Estimated total', `${money(o.estimatedTotal)} at ${cents(o.pricePerKit)} per kit`], ['Freight', 'Included'], ['Deposit on approval', `${money(Math.round(o.estimatedTotal * 20) / 100)} (20%)`], ['For', o.customer.org], ...designRows, ['Proof to', o.customer.email]
    ];
    const dl = $('#doneSum'); dl.innerHTML = '';
    rows.forEach(([k, v]) => { const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; dl.append(dt, dd); });
    $('#done').hidden = false; blModal(true); $('#doneClose').focus();
  }
  $('#doneClose').addEventListener('click', () => { $('#done').hidden = true; blModal(false); });
  $('#doneDl').addEventListener('click', () => download(`${$('#doneRef').textContent}-print-file`));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#done').hidden) { $('#done').hidden = true; blModal(false); } });

  /* ---------- gallery ---------- */
  function buildGallery() {
    const t = $('#galTrack');
    GALLERY.forEach(g => {
      const c = document.createElement('article'); c.className = 'gal-card';
      c.innerHTML = `<img loading="lazy" src="assets/gallery/${g.f}.jpg" alt="${g.t} candle kit"><div><h3>${g.t}</h3><p>${g.d}${g.n ? ` · ${g.n} made` : ''}</p></div>`;
      t.appendChild(c);
    });
  }

  /* ---------- design options ---------- */
  function setMode(mode, scroll) {
    state.mode = mode;
    $$('.opt-card').forEach(c => c.setAttribute('aria-checked', String(c.dataset.mode === mode)));
    const steps = MODES[mode].steps;
    ['step-idea', 'step-color', 'step-logo', 'step-words', 'step-order'].forEach(id => { $('#' + id).hidden = !steps.includes(id); });
    steps.forEach((id, i) => { const n = $('#' + id + ' [data-n]'); if (n) n.textContent = i + 1; });
    const brs = mode === 'brs', own = mode === 'own';
    $('#stageHead').hidden = mode !== 'pink';
    $('#viewport').hidden = mode !== 'pink';
    $('#brsStage').hidden = !brs;
    $('#ownStage').hidden = !own;
    $('#stageNote').hidden = mode !== 'pink';
    $('#flapLayoutRow').hidden = !brs;
    $('#frontLayoutRow').hidden = brs;
    $('#dedField').hidden = brs;
    $('#wordsTitle').textContent = brs ? 'Add your top flap words' : 'Add your words';
    $('#msgLabel').textContent = brs ? 'Words on the top flap, such as a dedication' : 'Message, top flap';
    $('#msg1').placeholder = brs ? 'In loving memory of' : 'Chabad of Your City';
    $('#msg2').placeholder = brs ? 'Second line, optional' : 'Second line, optional';
    $('#dlProof').hidden = own;
    $('#dlProof').textContent = brs ? 'Download top flap file (PDF)' : 'Download print file (PDF)';
    $('#doneDl').textContent = $('#dlProof').textContent;
    $('#dlNote').textContent = own
      ? "Bubby's Light will design your kit and email you a proof to approve before anything prints."
      : brs
      ? 'The top flap file is a CMYK PDF at actual size, 1.73 by 0.59 inches, at 600 dpi. Bubby\'s Light places it on the Brushstroke kit.'
      : "The print file is a CMYK PDF at the kit's actual size, 5.5 by 5.53 inches, at 600 dpi.";
    $('#notes').placeholder = own ? 'Anything else we should know' : 'Anything we should know';
    render();
    if (scroll) $('#studio').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function bindModes() {
    $$('.opt-card').forEach(c => c.addEventListener('click', () => setMode(c.dataset.mode, true)));
    const f = $('#refFiles');
    f.addEventListener('change', () => {
      state.refFiles = Array.from(f.files).map(x => x.name);
      $('#refList').hidden = !state.refFiles.length;
      $('#refList').textContent = state.refFiles.length ? 'Added: ' + state.refFiles.join(', ') : '';
    });
  }

  /* ---------- init ---------- */
  async function init() {
    buildPresets(); buildInks(); buildQty(); buildGallery();
    bindWheel(); bindLogo(); bindText(); bindBox(); bindView(); bindOrder(); bindModes();
    seg('layoutSeg', 'layout'); seg('fontSeg', 'font'); seg('logoColorSeg', 'logoColor'); seg('flapSeg', 'flap');
    $('#flat').style.cssText = 'position:absolute;width:10px;height:10px;opacity:0;pointer-events:none;overflow:hidden;';
    $('#flat').hidden = false;
    try {
      await Promise.all([loadTemplate(), document.fonts.load('italic 500 12px Lora'), document.fonts.load('500 12px Lora'), document.fonts.load('500 12px "Frank Ruhl Libre"', 'אב')]);
    } catch (e) { console.error(e); }
    setMode('pink');
    $('#loading').hidden = true;
  }
  init();
})();
