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

  const QTYS = [500, 1000, 2500, 5000, 10000, 'other'];

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
    ded1: '', ded2: '', msg1: '', msg2: '', qty: 1000
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
  const inkColor = () => state.ink === 'match' ? hex(toned(BASE_ACCENT)) : INKS.find(i => i.id === state.ink).color;

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
    updateLogoWarn();
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
    if (!state.logo || state.logoIsSvg || state.layout === 'ded') { el.hidden = true; return; }
    const zone = state.layout === 'logo' ? ZONES.big : ZONES.logo;
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
  async function renderCanvas(width) {
    const height = Math.round(width * SHEET_H / SHEET_W);
    const svg = $('#kit').cloneNode(true);
    svg.setAttribute('xmlns', NS);
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    const style = document.createElementNS(NS, 'style');
    style.textContent = await embeddedFonts();
    svg.insertBefore(style, svg.firstChild);
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    try {
      const img = await loadImage(url);
      const c = document.createElement('canvas');
      c.width = width; c.height = height;
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, width, height);
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, width, height);
      return c;
    } finally { URL.revokeObjectURL(url); }
  }
  async function renderPNG(width = 2400) { return (await renderCanvas(width)).toDataURL('image/png'); }
  let jsPDFReady = null;
  function loadJsPDF() {
    if (window.jspdf) return Promise.resolve(window.jspdf);
    return jsPDFReady || (jsPDFReady = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = 'assets/jspdf.umd.min.js';
      s.onload = () => res(window.jspdf); s.onerror = rej; document.head.appendChild(s);
    }));
  }
  const PRINT_DPI = 600;
  async function renderPrintPDF() {
    const [{ jsPDF }, canvas] = await Promise.all([loadJsPDF(), renderCanvas(Math.round(SHEET_W / 72 * PRINT_DPI))]);
    const pdf = new jsPDF({ unit: 'pt', format: [SHEET_W, SHEET_H], orientation: 'portrait', compress: true });
    pdf.setProperties({ title: "Bubby's Light custom candle kit print file", subject: `Print sheet 5.5 x 5.53 in at ${PRINT_DPI} dpi`, creator: "Bubby's Light Kit Designer" });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, SHEET_W, SHEET_H, undefined, 'NONE');
    return pdf;
  }
  function stamp() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  async function download(base) {
    const btns = [$('#dlProof'), $('#doneDl')];
    btns.forEach(b => { b.disabled = true; b.dataset.t = b.textContent; b.textContent = 'Preparing print file'; });
    try {
      const pdf = await renderPrintPDF();
      pdf.save(`${base || 'bubbys-light-kit-print-file'}-${stamp()}.pdf`);
    } catch (err) { console.error(err); alert('Sorry, the print file could not be created in this browser.'); }
    finally { btns.forEach(b => { b.disabled = false; b.textContent = b.dataset.t; }); }
  }
  window.blRenderPrintPDF = renderPrintPDF;

  /* ---------- order ---------- */
  function buildQty() {
    const g = $('#qtyGrid');
    QTYS.forEach(q => {
      const b = document.createElement('button'); b.type = 'button';
      b.innerHTML = q === 'other' ? 'Other<small>your amount</small>' : `${q.toLocaleString()}<small>kits</small>`;
      b.setAttribute('aria-pressed', String(q === state.qty));
      b.addEventListener('click', () => {
        state.qty = q;
        $$('#qtyGrid button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        $('#qtyOther').hidden = q !== 'other';
        if (q === 'other') $('#qtyOther').focus();
      });
      g.appendChild(b);
    });
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
      const qty = state.qty === 'other' ? parseInt($('#qtyOther').value, 10) : state.qty;
      if (!qty || qty < 1) missing.push('qtyOther');
      missing.forEach(id => $('#' + id).classList.add('bad'));
      if (!$('#approve').checked) missing.push('approve');
      if (missing.length) {
        err.hidden = false;
        err.textContent = missing.includes('approve') && missing.length === 1
          ? 'Please confirm you will approve a proof before printing.'
          : 'Please fill in the highlighted fields so we can send your proof.';
        const first = $('#' + missing[0]); first && first.focus();
        return;
      }
      const d = new Date();
      const ref = `BL-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const order = {
        ref, createdAt: d.toISOString(), qty,
        customer: { org: $('#org').value.trim(), name: $('#name').value.trim(), email, phone: $('#phone').value.trim(), address: $('#addr').value.trim(), needBy: $('#needBy').value, notes: $('#notes').value.trim() },
        design: { template: 'custom-template-logo-ready', color: presetName(), hue: Math.round(state.hue), hueRotation: Math.round(rotation()), saturation: state.sat, layout: state.layout, lettering: state.font, ink: inkColor(), dedication: [state.ded1, state.ded2].filter(Boolean), message: [state.msg1, state.msg2].filter(Boolean), logoFile: state.logoName || null, logoColor: state.logoColor, logoScale: state.logoScale }
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
    $('#doneImg').src = proof;
    const rows = [
      ['Quantity', `${o.qty.toLocaleString()} kits`], ['For', o.customer.org], ['Color', o.design.color],
      ['Dedication', o.design.dedication.join(' / ') || 'None'], ['Top flap', o.design.message.join(' / ') || 'None'],
      ['Logo', o.design.logoFile || 'None'], ['Proof to', o.customer.email]
    ];
    const dl = $('#doneSum'); dl.innerHTML = '';
    rows.forEach(([k, v]) => { const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; dl.append(dt, dd); });
    $('#done').hidden = false; $('#doneClose').focus();
  }
  $('#doneClose').addEventListener('click', () => { $('#done').hidden = true; });
  $('#doneDl').addEventListener('click', () => download(`${$('#doneRef').textContent}-print-file`));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#done').hidden = true; });

  /* ---------- gallery ---------- */
  function buildGallery() {
    const t = $('#galTrack');
    GALLERY.forEach(g => {
      const c = document.createElement('article'); c.className = 'gal-card';
      c.innerHTML = `<img loading="lazy" src="assets/gallery/${g.f}.jpg" alt="${g.t} candle kit"><div><h3>${g.t}</h3><p>${g.d}${g.n ? ` · ${g.n} made` : ''}</p></div>`;
      t.appendChild(c);
    });
  }

  /* ---------- init ---------- */
  async function init() {
    buildPresets(); buildInks(); buildQty(); buildGallery();
    bindWheel(); bindLogo(); bindText(); bindBox(); bindView(); bindOrder();
    seg('layoutSeg', 'layout'); seg('fontSeg', 'font'); seg('logoColorSeg', 'logoColor');
    $('#flat').style.cssText = 'position:absolute;width:10px;height:10px;opacity:0;pointer-events:none;overflow:hidden;';
    $('#flat').hidden = false;
    try {
      await Promise.all([loadTemplate(), document.fonts.load('italic 500 12px Lora'), document.fonts.load('500 12px Lora'), document.fonts.load('500 12px "Frank Ruhl Libre"', 'אב')]);
    } catch (e) { console.error(e); }
    render();
    $('#loading').hidden = true;
  }
  init();
})();
