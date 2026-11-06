/* AETHERIA Parfums · main.js
   Script clásico (IIFE). Película con scroll, reloj de evaporación, idioma,
   carrito, filtros, Oráculo, fichas y Diario. Todo el contenido existe en el
   HTML; este archivo solo lo enriquece. */
(function () {
  "use strict";

  var AE = window.__AE__ || {};
  var I18N = window.__AE_I18N__ || { en: {} };
  var doc = document, root = doc.documentElement;

  /* ---------- utilidades ---------- */
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (p, e0, e1) { var t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[" + name + "]", e); } }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- idioma ---------- */
  var lang = (store("ae-lang") === "en") ? "en" : "es";
  function t(key, fallback) { return lang === "en" && I18N.en && I18N.en[key] != null ? I18N.en[key] : fallback; }
  function L(obj) { return obj ? (obj[lang] != null ? obj[lang] : obj.es) : ""; }
  function fmt(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    if (lang === "en") return "€" + (whole ? String(Math.round(n)) : n.toFixed(2));
    return (whole ? String(Math.round(n)) : n.toFixed(2).replace(".", ",")) + " €";
  }
  var UI = { es: {
      added: "Añadido: ", items: function (n) { return n === 1 ? "1 artículo" : n + " artículos"; },
      openCart: function (n) { return "Abrir tu pedido, " + (n === 1 ? "1 artículo" : n + " artículos"); },
      perfumes: function (n) { return n === 1 ? "1 perfume" : n + " perfumes"; },
      empty: "Tu pedido está vacío.", emptyTip: "Empieza por Nocturne d'Or o por el Discovery Set: los cuatro elementos en viales de 5 ml.",
      toCollection: "Ver la colección", discovery: "Discovery Set · 65 €", remove: "Quitar", less: "Quitar una unidad", more: "Añadir una unidad",
      subtotal: "Subtotal", shipping: "Envío península", free: "Gratis", total: "Total", gift: "Muestra de 2 ml de Nocturne d'Or", giftV: "de regalo",
      toFree: function (x) { return "Te faltan " + x + " para el envío gratis."; }, freeOk: "Tu envío es gratis.",
      checkout: "Finalizar pedido", summary: "Resumen del pedido", conceptNote: "AETHERIA es un proyecto conceptual: no se ha realizado ningún cobro ni se ha guardado ningún dato. Así quedaría tu pedido en una tienda real.",
      back: "Volver a la tienda", clear: "Vaciar el pedido", voucher: "Incluye un bono de 65 € para tu primer frasco de 100 ml.",
      emptyFilter: function (f, s) { return "Ningún perfume de la colección es " + f + " y de " + s + "."; },
      emptyFilterGeneric: "Ningún perfume de la colección combina esa familia y esa estación.",
      step: "Pregunta", pick: "Elige una respuesta para continuar.", yourElement: "Tu elemento",
      why: function (a) { return "Has elegido " + a.slice(0, -1).join(", ") + " y " + a[a.length - 1] + "."; },
      second: function (n) { return "Tu segunda afinidad es " + n + "."; }, retry: "Repetir el test", addX: function (n, p) { return "Añadir " + n + " · " + p; },
      close: "Cerrar", by: "Por ", sheetSize: "Tamaño", seeFicha: "Ver Nocturne d'Or", sealed: "Precintado", cartTitle: "Tu pedido"
    }, en: {
      added: "Added: ", items: function (n) { return n === 1 ? "1 item" : n + " items"; },
      openCart: function (n) { return "Open your bag, " + (n === 1 ? "1 item" : n + " items"); },
      perfumes: function (n) { return n === 1 ? "1 perfume" : n + " perfumes"; },
      empty: "Your bag is empty.", emptyTip: "Start with Nocturne d'Or or with the Discovery Set: all four elements in 5 ml vials.",
      toCollection: "See the collection", discovery: "Discovery Set · €65", remove: "Remove", less: "Remove one", more: "Add one",
      subtotal: "Subtotal", shipping: "Mainland Spain shipping", free: "Free", total: "Total", gift: "2 ml Nocturne d'Or sample", giftV: "complimentary",
      toFree: function (x) { return x + " more for free shipping."; }, freeOk: "Your shipping is free.",
      checkout: "Checkout", summary: "Order summary", conceptNote: "AETHERIA is a concept project: nothing has been charged and no data has been stored. This is how your order would look in a real shop.",
      back: "Back to the shop", clear: "Empty the bag", voucher: "Includes a €65 voucher for your first 100 ml bottle.",
      emptyFilter: function (f, s) { return "No perfume in the collection is both " + f + " and for " + s + "."; },
      emptyFilterGeneric: "No perfume in the collection matches that family and season.",
      step: "Question", pick: "Choose an answer to continue.", yourElement: "Your element",
      why: function (a) { return "You chose " + a.slice(0, -1).join(", ") + " and " + a[a.length - 1] + "."; },
      second: function (n) { return "Your second match is " + n + "."; }, retry: "Take the test again", addX: function (n, p) { return "Add " + n + " · " + p; },
      close: "Close", by: "By ", sheetSize: "Size", seeFicha: "See Nocturne d'Or", sealed: "Sealed", cartTitle: "Your bag"
    } };
  function U() { return UI[lang]; }

  /* guarda el HTML original (español) antes de que nada lo divida o lo cambie */
  function cacheI18n() {
    $$("[data-i18n]").forEach(function (el) { if (el.__es == null) el.__es = el.innerHTML; });
  }
  function applyLang(next) {
    lang = next === "en" ? "en" : "es";
    store("ae-lang", lang);
    root.lang = lang;
    $$("[data-i18n]").forEach(function (el) {
      if (el.__es == null) el.__es = el.innerHTML;
      var key = el.getAttribute("data-i18n");
      var val = lang === "en" && I18N.en[key] != null ? I18N.en[key] : el.__es;
      if (el.innerHTML !== val) el.innerHTML = val;
    });
    $$("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":"), attr = p[0], key = p[1];
        if (!attr || !key) return;
        el.__esAttr = el.__esAttr || {};
        if (el.__esAttr[attr] == null) el.__esAttr[attr] = el.getAttribute(attr) || "";
        el.setAttribute(attr, lang === "en" && I18N.en[key] != null ? I18N.en[key] : el.__esAttr[attr]);
      });
    });
    $$(".lang-btn").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    doc.dispatchEvent(new CustomEvent("ae:lang", { detail: { lang: lang } }));
  }
  function initLang() {
    $$(".lang-btn").forEach(function (b) {
      b.addEventListener("click", function () { if (b.getAttribute("data-lang") !== lang) applyLang(b.getAttribute("data-lang")); });
    });
    if (lang !== "es") applyLang(lang);
  }

  /* ---------- texto dividido (preserva <em> y <br>) ---------- */
  function splitInto(el, mode, seed) {
    var r = rng(seed || 7);
    var plain = el.textContent.replace(/\s+/g, " ").trim();
    var vis = doc.createElement("span");
    vis.setAttribute("aria-hidden", "true");
    var words = [];
    function addWords(text, wrapTag) {
      text.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { vis.appendChild(doc.createTextNode(" ")); return; }
        var ws = doc.createElement("span");
        ws.className = "w";
        var holder = ws;
        if (wrapTag) { var em = doc.createElement(wrapTag); ws.appendChild(em); holder = em; }
        if (mode === "chars") {
          Array.prototype.forEach.call(w, function (ch) {
            var c = doc.createElement("span"); c.className = "c"; c.textContent = ch; holder.appendChild(c);
          });
        } else { holder.textContent = w; }
        vis.appendChild(ws); words.push(ws);
      });
    }
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3) addWords(n.textContent);
      else if (n.nodeName === "BR") vis.appendChild(doc.createElement("br"));
      else if (n.nodeType === 1) addWords(n.textContent, n.nodeName.toLowerCase());
    });
    var sr = doc.createElement("span"); sr.className = "sr-only"; sr.textContent = plain;
    el.textContent = "";
    el.appendChild(sr); el.appendChild(vis);
    // umbrales sembrados
    if (mode === "chars") {
      var cs = $$(".c", vis), n = cs.length || 1;
      cs.forEach(function (c, i) {
        c.style.setProperty("--th", (i / n * 0.55 + r() * 0.06).toFixed(3));
        c.style.setProperty("--jx", ((r() * 2 - 1) * 30).toFixed(1) + "px");
      });
    } else {
      var nw = words.length || 1;
      words.forEach(function (w, i) { w.style.setProperty("--th", (i / nw * 0.45).toFixed(3)); });
    }
    return vis;
  }
  function prepareBands() {
    $$(".band").forEach(function (band, bi) {
      var fx = band.getAttribute("data-fx");
      var title = $("[data-split]", band);
      if (!title) return;
      if (fx === "focus") {
        var html = title.innerHTML, plain = title.textContent.replace(/\s+/g, " ").trim();
        title.innerHTML = '<span class="sr-only"></span><span class="soft" aria-hidden="true"></span><span class="sharp" aria-hidden="true"></span>';
        title.firstChild.textContent = plain;
        title.children[1].innerHTML = html; title.children[2].innerHTML = html;
      } else {
        splitInto(title, fx === "snap" ? "chars" : "words", 11 + bi * 7);
      }
    });
  }

  /* ---------- PORTADA: película en bucle, fase a fase ---------- */
  /* La película se reproduce sola y seguida (algo más lenta que la original), sin
     scroll: los textos de cada fase y el reloj de evaporación cambian con ella. Al acabar
     se queda quieta unos segundos en el último plano, con la compra a la vista; luego se
     funde a negro y vuelve a empezar. Fuera de pantalla se pausa sola. */
  var GATES = ["(prefers-reduced-motion: reduce)"];
  var VIDEO_URL = "assets/video/hero-loop.mp4?v=20261106";
  var POSTER = "assets/img/hero-poster.webp?v=20261106";
  /* velocidad (0,9: unos 9 s en vez de 8), descanso final y fundidos en ms; entrada/salida de los textos */
  var RATE = 0.9, REST_MS = 5000, FADE_OUT = 600, FADE_IN = 800, TEXT_IN = 500, BAND_IN = 260, BAND_OUT = 320;
  /* dónde está el frasco a lo ancho de la película (0,5 menos el desplazamiento de
     la cámara en Blender): en pantallas estrechas el recorte lo sigue */
  var FRAME_X = [[0, 0.64], [0.967, 0.62], [2.567, 0.55], [3.7, 0.5], [7.1, 0.5], [7.767, 0.64], [8, 0.64]];
  var hero = {}, filmOn = false, rafId = null, lastTick = 0;
  var st = { mode: "wait", until: 0, frozenAt: 0, kickAt: 0, visible: true, userPaused: false };

  function fade(on, ms) {
    if (!hero.fade) return;
    hero.fade.style.transitionDuration = ms + "ms";
    hero.fade.classList.toggle("on", on);
  }
  function syncPauseBtn() { if (hero.pauseBtn) hero.pauseBtn.setAttribute("aria-pressed", String(st.userPaused)); }
  function isSuspended() { return !filmOn || !st.visible || st.userPaused || doc.hidden; }
  function kick() { if (rafId === null && !hero.susp && filmOn) { lastTick = 0; rafId = requestAnimationFrame(tick); } }
  /* se pausa fuera de pantalla, con la pestaña oculta o con el botón; y sigue donde iba */
  function refresh() {
    var s = isSuspended(), v = hero.video;
    if (s && !hero.susp) {
      hero.susp = true; st.frozenAt = performance.now();
      if (v && !v.paused) v.pause();
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (!s && hero.susp) {
      hero.susp = false;
      st.until += performance.now() - st.frozenAt;   /* el descanso final no corre mientras está en pausa */
      if (st.mode === "play") { st.kickAt = performance.now(); playVideo(); }
      kick();
    }
  }
  function playVideo() {
    var pr, v = hero.video;
    try { v.playbackRate = RATE; } catch (e) { /* velocidad fija */ }
    try { pr = v.play(); } catch (e) { blocked(); return; }
    if (pr && pr.catch) pr.catch(function (err) { if (!err || err.name !== "AbortError") blocked(); });
  }
  /* reproducción automática bloqueada (por ejemplo, ahorro de batería en el iPhone):
     queda el primer plano con el titular y la película arranca al primer toque */
  function blocked() {
    if (st.userPaused) return;
    st.userPaused = true; syncPauseBtn(); refresh();
    var go = function (e) {
      if (e.target.closest && e.target.closest("[data-hero-pause]")) return;
      hero.stage.removeEventListener("pointerdown", go);
      if (st.userPaused) { st.userPaused = false; syncPauseBtn(); refresh(); }
    };
    hero.stage.addEventListener("pointerdown", go);
  }
  /* tras el fundido a negro, la película ya está al principio: arranca y se abre */
  function onRewound() {
    if (st.mode !== "rewind") return;
    st.mode = "play"; st.kickAt = performance.now();
    if (!hero.susp) playVideo();
    fade(false, FADE_IN);
  }
  function onReady() {
    if (hero.ready || hero.failed) return;
    hero.ready = true;
    root.classList.add("video-ready", "film-ready");
    st.mode = "play"; st.kickAt = performance.now();
    if (!hero.susp) playVideo();
    kick();
  }
  function onProgress() {
    var v = hero.video;
    try {
      var b = v.buffered;
      if (b.length && v.duration) hero.ring.style.setProperty("--ld", Math.round(126 * (1 - Math.min(1, b.end(b.length - 1) / v.duration))));
    } catch (e) { /* sin datos de carga */ }
  }
  /* el propio <video> lee el archivo, así que también funciona abierta con doble clic */
  function loadVideo() {
    if (hero.loading) return; hero.loading = true;
    var v = hero.video;
    v.addEventListener("canplaythrough", onReady);
    v.addEventListener("canplay", function () { setTimeout(onReady, 5000); });
    v.addEventListener("progress", onProgress);
    v.addEventListener("seeked", onRewound);
    v.addEventListener("error", function () {
      hero.failed = true; st.mode = "wait";
      root.classList.remove("video-ready", "film-ready"); root.classList.add("video-failed");
    });
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.loop = false;
    try { v.defaultPlaybackRate = RATE; v.playbackRate = RATE; } catch (e) { /* velocidad fija */ }
    v.preload = "auto"; v.src = VIDEO_URL; v.load();
  }
  function startLoading() {
    if (hero.queued) return; hero.queued = true;
    var img = new Image();
    img.onload = img.onerror = loadVideo;
    img.src = POSTER;
    setTimeout(loadVideo, 2500);
  }
  function frameX(t) {
    for (var i = 1; i < FRAME_X.length; i++) {
      var a = FRAME_X[i - 1], b = FRAME_X[i];
      if (t <= b[0]) return a[1] + (b[1] - a[1]) * smooth(t, a[0], b[0]);
    }
    return FRAME_X[FRAME_X.length - 1][1];
  }
  function updateFraming(t) {
    if (!hero.sw || !hero.sh) return;
    var vis = hero.sw / (hero.sh * 16 / 9), ox = -2;
    if (vis < 0.995) ox = Math.round(clamp(frameX(t) - vis / 2, 0, 1 - vis) / (1 - vis) * 1000) / 10;
    if (ox === hero.ox) return;
    hero.ox = ox;
    var pos = ox < 0 ? "" : ox + "% 50%";
    hero.video.style.objectPosition = pos;
    hero.poster.style.backgroundPosition = pos;
  }
  function measure() {
    if (!hero.stage) return;
    hero.sw = hero.stage.clientWidth; hero.sh = hero.stage.clientHeight; hero.ox = -1;
    updateFraming(hero.ready && !hero.failed ? hero.video.currentTime : 0);
  }
  function applyBand(b) {
    var op = b.ov * b.ov * (3 - 2 * b.ov);
    if (Math.abs(op - b.op) > 0.004 || (op === 0 && b.op !== 0) || (op === 1 && b.op !== 1)) {
      b.op = op; b.el.style.opacity = op.toFixed(3);
      var vis = op > 0.01;
      if (vis !== b.vis) { b.vis = vis; b.el.style.visibility = vis ? "visible" : "hidden"; }
    }
    if (Math.abs(b.kv - b.k) > 0.008 || (b.kv === 1 && b.k !== 1) || (b.kv === 0 && b.k !== 0)) { b.k = b.kv; b.el.style.setProperty("--k", b.kv.toFixed(3)); }
  }
  /* cada texto entra y sale a su ritmo (en tiempo real), aunque la película vaya rápida */
  function updateBands(p, dt) {
    hero.bands.forEach(function (b) {
      if (p >= b.a && p <= b.b) { b.ov = Math.min(1, b.ov + dt / BAND_IN); b.kv = Math.min(1, b.kv + dt / TEXT_IN); }
      else { b.ov = Math.max(0, b.ov - dt / BAND_OUT); if (b.ov === 0) b.kv = 0; }
      applyBand(b);
    });
  }
  function resetBands() { hero.bands.forEach(function (b) { b.ov = 0; b.kv = 0; applyBand(b); }); }
  /* reloj: precintado hasta abrir; salida 0-15 min, corazón 15 min-4 h, fondo 4 h-24 h */
  var CLOCK = [[0.36, 0.51, 0, 1 / 3, 0, 15], [0.57, 0.72, 1 / 3, 2 / 3, 15, 240], [0.76, 0.89, 2 / 3, 1, 240, 1440]];
  function clockAt(p) {
    if (p < CLOCK[0][0]) return { pos: 0, min: -1 };
    for (var i = 0; i < CLOCK.length; i++) {
      var s = CLOCK[i];
      if (p <= s[1]) { var tt = clamp((p - s[0]) / (s[1] - s[0]), 0, 1); return { pos: s[2] + (s[3] - s[2]) * tt, min: s[4] + (s[5] - s[4]) * tt }; }
      if (i < CLOCK.length - 1 && p < CLOCK[i + 1][0]) return { pos: s[3], min: s[5] };
    }
    return { pos: 1, min: 1440 };
  }
  function updateClock(p, now) {
    if (!hero.clock) return;
    var c = clockAt(p);
    if (Math.abs(c.pos - hero.cpos) > 0.0015) { hero.cpos = c.pos; hero.marker.style.setProperty("--pos", c.pos.toFixed(4)); }
    var passed = Math.round(c.pos * 36);
    if (passed !== hero.passed) { hero.passed = passed; hero.ticks.forEach(function (tk, i) { tk.classList.toggle("passed", i <= passed && c.min >= 0); }); }
    if (now - (hero.lastRead || 0) > 100) {
      var txt;
      if (c.min < 0) txt = U().sealed;
      else { var m = Math.round(c.min), h = Math.floor(m / 60), mm = m % 60; txt = "T+" + (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }
      if (txt !== hero.readTxt) { hero.readTxt = txt; hero.read.textContent = txt; hero.lastRead = now; }
    }
  }
  function tick(now) {
    rafId = null;
    var dt = Math.min(100, now - (lastTick || now)); lastTick = now;
    var v = hero.video, live = hero.ready && !hero.failed;
    var dur = live && v.duration ? v.duration : 8, T = live ? v.currentTime : 0;
    if (st.mode === "play") {
      /* llega al último plano: se queda quieto unos segundos (sin zoom: escalar la imagen hace temblar las estrías) */
      if (v.ended || T >= dur - 0.04) { st.mode = "rest"; st.until = now + REST_MS; }
      else if (v.paused && now - st.kickAt > 700) { st.kickAt = now; playVideo(); }
    } else if (st.mode === "rest" && now >= st.until) {
      st.mode = "fadeout"; st.until = now + FADE_OUT; fade(true, FADE_OUT);
    } else if (st.mode === "fadeout" && now >= st.until) {
      /* ya en negro: vuelve al principio */
      st.mode = "rewind"; resetBands(); T = 0;
      try { v.currentTime = 0; } catch (e) { onRewound(); }
    }
    var p = clamp(T / dur, 0, 1);
    updateBands(p, dt);
    updateClock(p, now);
    updateFraming(T);
    if (filmOn && !hero.susp) rafId = requestAnimationFrame(tick);
  }
  function enableFilm() {
    if (filmOn) return; filmOn = true;
    root.classList.add("film");
    if (hero.ready) root.classList.add("film-ready");
    hero.bands.forEach(function (b, i) { b.ov = i === 0 ? 1 : 0; b.kv = 0; b.op = -1; b.k = -1; b.vis = null; });
    hero.cpos = -1; hero.passed = -1; hero.readTxt = "";
    if (hero.ready) {
      fade(false, 0); st.mode = "play";
      try { hero.video.currentTime = 0; } catch (e) { /* sin salto */ }
    }
    measure();
    startLoading();
    refresh(); kick();
  }
  function disableFilm() {
    if (!filmOn) return; filmOn = false;
    root.classList.remove("film", "film-ready");
    refresh();
  }
  function applyHeroMode() {
    var off = GATES.some(function (q) { return matchMedia(q).matches; });
    if (off) disableFilm(); else enableFilm();
  }
  function initHero() {
    hero.track = $("[data-hero]");
    if (!hero.track) return;
    hero.stage = $(".hero-stage", hero.track);
    hero.video = $("[data-video]");
    hero.poster = $("[data-poster]");
    hero.fade = $("[data-hero-fade]");
    hero.ring = $(".ring", hero.track);
    hero.clock = $("[data-clock]");
    hero.marker = $("[data-clock-marker]");
    hero.read = $("[data-clock-read]");
    hero.pauseBtn = $("[data-hero-pause]");
    var rail = $("[data-clock-rail]");
    hero.ticks = [];
    for (var i = 0; i <= 36; i++) {
      var tk = doc.createElement("i");
      tk.style.top = (i / 36 * 100).toFixed(3) + "%";
      if (i % 12 === 0) tk.className = "major";
      rail.appendChild(tk); hero.ticks.push(tk);
    }
    prepareBands();
    hero.bands = $$(".band", hero.track).map(function (el) {
      var r = el.getAttribute("data-band").split(",").map(Number);
      return { el: el, a: r[0], b: r[1], ov: 0, kv: 0, op: -1, k: -1, vis: null };
    });
    if (hero.pauseBtn) hero.pauseBtn.addEventListener("click", function () { st.userPaused = !st.userPaused; syncPauseBtn(); refresh(); });
    if ("IntersectionObserver" in window) {
      /* se usa el último aviso: con scroll suave pueden llegar varios juntos */
      new IntersectionObserver(function (es) { st.visible = es[es.length - 1].isIntersecting; refresh(); }, { threshold: 0.02 }).observe(hero.track);
    }
    doc.addEventListener("visibilitychange", refresh);
    addEventListener("resize", measure, { passive: true });
    GATES.forEach(function (q) {
      var m = matchMedia(q);
      if (m.addEventListener) m.addEventListener("change", applyHeroMode); else if (m.addListener) m.addListener(applyHeroMode);
    });
    applyHeroMode();
    doc.addEventListener("ae:lang", function () {
      prepareBands();
      hero.bands.forEach(function (b) { b.op = -1; b.k = -1; b.vis = null; });
      hero.readTxt = "";
      kick();
    });
  }

  /* ---------- tagline palabra a palabra ---------- */
  function initTagline() {
    var el = $("[data-words]");
    if (!el) return;
    var words = [];
    function build() {
      var plain = el.textContent.replace(/\s+/g, " ").trim();
      var html = '<span class="sr-only">' + esc(plain) + '</span><span aria-hidden="true">';
      html += plain.split(" ").map(function (w) { return '<span class="tw">' + esc(w) + "</span>"; }).join(" ") + "</span>";
      el.innerHTML = html;
      words = $$(".tw", el);
      if (reduced) words.forEach(function (w) { w.classList.add("on"); });
    }
    build();
    var active = false, raf = null;
    function update() {
      raf = null;
      var line = innerHeight * 0.66;
      words.forEach(function (w) {
        var on = w.getBoundingClientRect().top < line;
        if (on !== w.__on) { w.__on = on; w.classList.toggle("on", on); }
      });
    }
    function onScroll() { if (active && raf === null) raf = requestAnimationFrame(update); }
    if ("IntersectionObserver" in window && !reduced) {
      new IntersectionObserver(function (es) { active = es[es.length - 1].isIntersecting; if (active) onScroll(); }, { threshold: 0 }).observe(el);
      addEventListener("scroll", onScroll, { passive: true });
    } else { words.forEach(function (w) { w.classList.add("on"); }); }
    doc.addEventListener("ae:lang", function () { build(); words.forEach(function (w) { w.__on = undefined; }); update(); });
  }

  /* ---------- entradas al hacer scroll ---------- */
  function initReveals() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
        setTimeout(function () { e.target.classList.add("done"); }, 1100);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { io.observe(e); });
    root.classList.add("reveals-armed");
    setTimeout(function () {
      $$(".reveal:not(.in)").forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) e.classList.add("in", "done"); });
    }, 6000);
  }

  /* ---------- navegación ---------- */
  function initNav() {
    var nav = $("[data-nav]"), btn = $("[data-menu-btn]"), panel = $("[data-menu]");
    var lastY = scrollY, ticking = false;
    addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = scrollY, down = y > lastY + 4, up = y < lastY - 4;
        if (down && y > 240 && !panel.classList.contains("is-open")) nav.classList.add("is-hidden");
        else if (up || y < 120) nav.classList.remove("is-hidden");
        lastY = y;
      });
    }, { passive: true });
    function setMenu(open) {
      btn.setAttribute("aria-expanded", String(open));
      if (open) { panel.hidden = false; requestAnimationFrame(function () { panel.classList.add("is-open"); }); doc.body.style.overflow = "hidden"; }
      else { panel.classList.remove("is-open"); panel.hidden = true; doc.body.style.overflow = ""; }
    }
    btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setMenu(false); btn.focus(); } });
    // sección actual en la navegación
    var links = $$(".nav-links a");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) {
            if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["inicio", "ficha", "frasco", "coleccion", "oraculo", "discovery", "atelier", "diario", "preguntas"].forEach(function (id) { var s = doc.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ---------- carrito ---------- */
  var cart = [];
  try { cart = JSON.parse(store("ae-cart") || "[]") || []; } catch (e) { cart = []; }
  function findItem(key) {
    var p = key.split(":"), id = p[0], size = p[1];
    var prod = id === "discovery" ? AE.discovery : (AE.products || []).filter(function (x) { return x.id === id; })[0];
    if (!prod) return null;
    var s = prod.sizes.filter(function (z) { return z.id === size; })[0] || prod.sizes[0];
    return { key: id + ":" + s.id, id: id, prod: prod, size: s, price: s.price, name: prod.name, img: prod.img };
  }
  function saveCart() { store("ae-cart", JSON.stringify(cart)); renderCount(); }
  function cartQty() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function subtotal() { return cart.reduce(function (s, l) { var it = findItem(l.key); return s + (it ? it.price * l.qty : 0); }, 0); }
  function renderCount() {
    var n = cartQty();
    $$("[data-cart-count]").forEach(function (c) { c.textContent = n; c.classList.toggle("has", n > 0); });
    $$("[data-open-cart]").forEach(function (b) { b.setAttribute("aria-label", U().openCart(n)); });
  }
  function bump() { $$("[data-cart-count]").forEach(function (c) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); setTimeout(function () { c.classList.remove("bump"); }, 400); }); }
  function addToCart(key, qty) {
    var it = findItem(key); if (!it) return;
    var line = cart.filter(function (l) { return l.key === it.key; })[0];
    if (line) line.qty = Math.min(9, line.qty + (qty || 1)); else cart.push({ key: it.key, qty: qty || 1 });
    saveCart(); bump();
    toast(U().added + it.name + ", " + L(it.size.label));
    if (cartDlg && cartDlg.open) renderCart();
  }
  var toastTimer = null;
  function toast(msg) {
    var el = $("[data-toast]"); if (!el) return;
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }
  var cartDlg = null, cartView = "lines";
  function renderCart() {
    var body = $("[data-cart-body]", cartDlg), foot = $("[data-cart-foot]", cartDlg), u = U();
    if (cartView === "checkout" && cart.length) {
      var sub = subtotal(), ship = sub >= AE.shipping.freeFrom ? 0 : AE.shipping.cost;
      body.innerHTML = '<div class="checkout"><h3>' + u.summary + "</h3><ul>" + cart.map(function (l) {
        var it = findItem(l.key); return it ? "<li>" + l.qty + " × " + esc(it.name) + " · " + esc(L(it.size.label)) + " · " + fmt(it.price * l.qty) + "</li>" : "";
      }).join("") + "<li>" + u.gift + " · " + u.giftV + "</li><li>" + u.shipping + " · " + (ship ? fmt(ship) : u.free) + "</li><li><b>" + u.total + " · " + fmt(sub + ship) + "</b></li></ul>" +
        '<p class="note">' + u.conceptNote + '</p><button type="button" class="btn-line" data-cart-back>' + u.back + '</button><button type="button" class="btn-line" data-cart-clear>' + u.clear + "</button></div>";
      foot.innerHTML = "";
      return;
    }
    cartView = "lines";
    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty"><p>' + u.empty + "</p><p class=\"proof\">" + u.emptyTip + '</p><button type="button" class="btn-line" data-cart-go="#coleccion">' + u.toCollection + '</button><button type="button" class="btn-line" data-cart-go="#discovery">' + u.discovery + "</button></div>";
      foot.innerHTML = "";
      return;
    }
    body.innerHTML = cart.map(function (l) {
      var it = findItem(l.key); if (!it) return "";
      return '<div class="line"><img src="' + esc(it.img) + '" alt="" width="64" height="80"><div><p class="line-name">' + esc(it.name) + '</p><p class="line-size mono">' + esc(L(it.size.label)) + " · " + fmt(it.price) + '</p><div class="qty"><button type="button" data-qty="-1" data-key="' + it.key + '" aria-label="' + u.less + '">−</button><output>' + l.qty + '</output><button type="button" data-qty="1" data-key="' + it.key + '" aria-label="' + u.more + '">+</button></div></div><div class="line-right"><span class="mono">' + fmt(it.price * l.qty) + '</span><button type="button" class="line-remove" data-remove="' + it.key + '">' + u.remove + "</button></div></div>";
    }).join("") + '<div class="gift-line"><span>' + u.gift + "</span><span>" + u.giftV + "</span></div>" +
      (cart.some(function (l) { return l.key.indexOf("discovery") === 0; }) ? '<p class="proof" style="padding:12px 0">' + u.voucher + "</p>" : "");
    var sub = subtotal(), ship = sub >= AE.shipping.freeFrom ? 0 : AE.shipping.cost, missing = Math.max(0, AE.shipping.freeFrom - sub);
    foot.innerHTML = '<div class="ship-meter" style="--f:' + Math.min(1, sub / AE.shipping.freeFrom).toFixed(3) + '">' + (missing > 0 ? u.toFree(fmt(missing)) : u.freeOk) + "<i></i></div>" +
      '<div class="totals"><div><span>' + u.subtotal + "</span><span class=\"mono\">" + fmt(sub) + "</span></div><div><span>" + u.shipping + "</span><span class=\"mono\">" + (ship ? fmt(ship) : u.free) + '</span></div><div class="grand"><span>' + u.total + '</span><span class="mono">' + fmt(sub + ship) + "</span></div></div>" +
      '<button type="button" class="btn btn-gold" data-checkout>' + u.checkout + "</button>";
  }
  function initCart() {
    cartDlg = $("[data-cart]");
    renderCount();
    doc.addEventListener("click", function (e) {
      var add = e.target.closest("[data-add]");
      if (add) { e.preventDefault(); addToCart(add.getAttribute("data-add"), 1); return; }
      if (e.target.closest("[data-open-cart]")) { cartView = "lines"; renderCart(); if (cartDlg.showModal) cartDlg.showModal(); else cartDlg.setAttribute("open", ""); return; }
    });
    cartDlg.addEventListener("click", function (e) {
      if (e.target === cartDlg || e.target.closest("[data-close]")) { cartDlg.close(); return; }
      var q = e.target.closest("[data-qty]");
      if (q) {
        var key = q.getAttribute("data-key"), d = Number(q.getAttribute("data-qty"));
        cart.forEach(function (l) { if (l.key === key) l.qty = clamp(l.qty + d, 0, 9); });
        cart = cart.filter(function (l) { return l.qty > 0; }); saveCart(); renderCart(); return;
      }
      var rm = e.target.closest("[data-remove]");
      if (rm) { var k = rm.getAttribute("data-remove"); cart = cart.filter(function (l) { return l.key !== k; }); saveCart(); renderCart(); return; }
      if (e.target.closest("[data-checkout]")) { cartView = "checkout"; renderCart(); var h = $(".checkout h3", cartDlg); if (h) { h.tabIndex = -1; h.focus(); } return; }
      if (e.target.closest("[data-cart-back]")) { cartView = "lines"; cartDlg.close(); return; }
      if (e.target.closest("[data-cart-clear]")) { cart = []; saveCart(); cartView = "lines"; renderCart(); return; }
      var go = e.target.closest("[data-cart-go]");
      if (go) { cartDlg.close(); var tgt = $(go.getAttribute("data-cart-go")); if (tgt) tgt.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
    });
    var buy = $("[data-buy]");
    if (buy) buy.addEventListener("submit", function (e) {
      e.preventDefault();
      var sel = $("input[type=radio]:checked", buy);
      addToCart(buy.getAttribute("data-buy") + ":" + (sel ? sel.value : "100"), 1);
    });
    addEventListener("storage", function (e) { if (e.key === "ae-cart") { try { cart = JSON.parse(e.newValue || "[]"); } catch (er) { cart = []; } renderCount(); } });
    doc.addEventListener("ae:lang", function () { renderCount(); if (cartDlg.open) renderCart(); });
  }

  /* ---------- fichas de producto ---------- */
  function renderSheet(id) {
    var p = (AE.products || []).filter(function (x) { return x.id === id; })[0]; if (!p) return "";
    var u = U();
    var tiers = ["salida", "corazon", "fondo"].map(function (k) {
      return "<li><b>" + esc(L(AE.tiers[k])) + " · " + esc(L(AE.tiers[k].time)) + "</b><span>" + esc(L(p.pyramid[k]).join(" · ")) + "</span></li>";
    }).join("");
    var fam = p.family.map(function (f) { return L(AE.families[f]); }).join(", ");
    var sea = p.seasons.map(function (s) { return L(AE.seasons[s]); }).join(", ");
    var opts = p.sizes.map(function (s) { return '<option value="' + s.id + '">' + esc(L(s.label)) + " · " + fmt(s.price) + "</option>"; }).join("");
    return '<div class="sheet-media"><img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" width="1200" height="1500"></div>' +
      '<div class="sheet-body"><button type="button" class="x" data-close aria-label="' + u.close + '"><span aria-hidden="true"></span></button>' +
      '<h2 class="sheet-name" id="sheet-title">' + esc(p.name) + '</h2><p class="sheet-conc mono">' + esc(L(p.conc)) + " · " + (lang === "en" ? "Batch" : "Lote") + " " + p.lot + "</p>" +
      '<p class="sheet-desc">' + esc(L(p.desc)) + '</p><ol class="sheet-tiers">' + tiers + "</ol>" +
      '<div class="sheet-meta"><span>' + esc(fam) + " · " + esc(sea) + "</span><span>" + esc(L(p.wear)) + "</span><span>" + esc(L(p.stoneName)) + "</span></div>" +
      '<div class="sheet-buy"><label class="sr-only" for="sheet-size">' + u.sheetSize + '</label><select id="sheet-size" data-sheet-size>' + opts + '</select><button type="button" class="btn btn-gold" data-sheet-add="' + p.id + '">' + (lang === "en" ? "Add to bag" : "Añadir al carrito") + "</button></div></div>";
  }
  function initSheets() {
    var dlg = $("[data-sheet-dialog]"), body = $("[data-sheet-body]"), current = null;
    doc.addEventListener("click", function (e) {
      var b = e.target.closest("[data-sheet]");
      if (!b) return;
      current = b.getAttribute("data-sheet");
      body.innerHTML = renderSheet(current);
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.closest("[data-close]")) { dlg.close(); return; }
      var a = e.target.closest("[data-sheet-add]");
      if (a) { var s = $("[data-sheet-size]", dlg); addToCart(a.getAttribute("data-sheet-add") + ":" + (s ? s.value : "100"), 1); }
    });
    doc.addEventListener("ae:lang", function () { if (dlg.open && current) body.innerHTML = renderSheet(current); });
  }

  /* ---------- filtros de la colección ---------- */
  function initFilters() {
    var form = $("[data-filters]"); if (!form) return;
    var cards = $$("[data-grid] .card"), count = $("[data-col-count]"), empty = $("[data-col-empty]"), emptyText = $("[data-col-empty-text]");
    function apply() {
      var fam = (form.querySelector("input[name=family]:checked") || {}).value || "all";
      var sea = (form.querySelector("input[name=season]:checked") || {}).value || "all";
      var n = 0;
      cards.forEach(function (c) {
        var ok = (fam === "all" || c.getAttribute("data-family").split(" ").indexOf(fam) > -1) &&
                 (sea === "all" || c.getAttribute("data-seasons").split(" ").indexOf(sea) > -1);
        c.classList.toggle("is-out", !ok);
        if (ok) { n++; c.classList.add("in", "done"); }
      });
      count.textContent = U().perfumes(n);
      empty.hidden = n > 0;
      if (!n) {
        emptyText.textContent = (fam !== "all" && sea !== "all") ? U().emptyFilter(L(AE.families[fam]).toLowerCase(), L(AE.seasons[sea]).toLowerCase()) : U().emptyFilterGeneric;
      }
    }
    form.addEventListener("change", apply);
    var reset = $("[data-filters-reset]");
    if (reset) reset.addEventListener("click", function () {
      $$("input[value=all]", form).forEach(function (i) { i.checked = true; }); apply();
      var first = form.querySelector("input"); if (first) first.focus();
    });
    doc.addEventListener("ae:lang", apply);
    apply();
  }

  /* ---------- El Oráculo ---------- */
  function initOracle() {
    var form = $("[data-oracle]"); if (!form || !AE.quiz) return;
    var steps = $("[data-or-steps]"), back = $("[data-or-back]"), err = $("[data-or-error]"), result = $("[data-or-result]");
    var stepNum = $("[data-or-step]"), bar = $("[data-or-bar]");
    var answers = [], cur = 0, letters = ["A", "B", "C", "D"];
    function build() {
      steps.innerHTML = AE.quiz.map(function (q, qi) {
        return '<fieldset class="or-step" data-q="' + qi + '"' + (qi === cur ? "" : " hidden") + '><legend class="or-q" tabindex="-1">' + esc(L(q.q)) + '</legend><div class="or-options">' +
          q.a.map(function (a, ai) {
            return '<label class="or-opt"><input type="radio" name="q' + qi + '" value="' + ai + '"' + (answers[qi] === ai ? " checked" : "") + '><span class="k">' + letters[ai] + '</span><span class="t">' + esc(a[lang] || a.es) + "</span></label>";
          }).join("") + "</div></fieldset>";
      }).join("");
      progress();
    }
    function progress() {
      stepNum.textContent = String(Math.min(cur + 1, AE.quiz.length));
      bar.style.setProperty("--p", ((cur + 1) / AE.quiz.length).toFixed(3));
      back.disabled = cur === 0;
    }
    function show(i, focus) {
      cur = i;
      $$(".or-step", steps).forEach(function (f, fi) { f.hidden = fi !== i; });
      progress(); err.textContent = "";
      if (focus) { var lg = $('.or-step[data-q="' + i + '"] .or-q', steps); if (lg) lg.focus({ preventScroll: true }); }
    }
    function score() {
      var s = { nocturne: 0, sylva: 0, sel: 0, fumee: 0 };
      answers.forEach(function (ai, qi) { var w = AE.quiz[qi].a[ai].w; Object.keys(w).forEach(function (k) { s[k] += w[k]; }); });
      var order = ["nocturne", "fumee", "sylva", "sel"];
      return order.slice().sort(function (a, b) { return s[b] - s[a] || order.indexOf(a) - order.indexOf(b); });
    }
    function renderResult() {
      var rank = score(), u = U();
      var p1 = (AE.products || []).filter(function (x) { return x.id === rank[0]; })[0], p2 = (AE.products || []).filter(function (x) { return x.id === rank[1]; })[0];
      var whys = answers.map(function (ai, qi) { return L(AE.quiz[qi].a[ai].why); });
      result.innerHTML = '<p class="kicker mono">' + u.yourElement + '</p><p class="or-name">' + esc(p1.name) + '</p><p class="or-why">' + esc(u.why(whys)) + '</p><p class="or-desc">' + esc(L(AE.quizResult[p1.id])) + '</p><p class="or-alt">' + esc(u.second(p2.name)) + '</p>' +
        '<div class="or-actions"><button type="button" class="btn btn-ink" data-add="' + p1.id + ':100">' + esc(u.addX(p1.name, fmt(p1.sizes[0].price))) + '</button><button type="button" class="btn-line" data-add="discovery:set">' + u.discovery + '</button><button type="button" class="btn-line" data-or-retry>' + u.retry + "</button></div>";
      result.hidden = false; form.hidden = true;
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }
    steps.addEventListener("change", function (e) {
      var inp = e.target; if (inp.type !== "radio") return;
      var qi = Number(inp.name.slice(1)); answers[qi] = Number(inp.value);
      setTimeout(function () {
        if (qi < AE.quiz.length - 1) show(qi + 1, true); else renderResult();
      }, reduced ? 0 : 280);
    });
    back.addEventListener("click", function () { if (cur > 0) show(cur - 1, true); });
    result.addEventListener("click", function (e) {
      if (e.target.closest("[data-or-retry]")) { answers = []; result.hidden = true; form.hidden = false; build(); show(0, true); }
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); if (answers[cur] == null) err.textContent = U().pick; });
    build();
    doc.addEventListener("ae:lang", function () { build(); show(cur, false); if (!result.hidden) renderResult(); });
  }

  /* ---------- Diario ---------- */
  function initReader() {
    var dlg = $("[data-reader]"), body = $("[data-reader-body]"), current = null;
    function render(id) {
      var a = (AE.journal || []).filter(function (x) { return x.id === id; })[0]; if (!a) return;
      var u = U();
      body.innerHTML = '<button type="button" class="x" data-close aria-label="' + u.close + '"><span aria-hidden="true"></span></button><img src="' + esc(a.img) + '" alt="" width="1600" height="1000">' +
        '<div class="reader-text paper"><p class="kicker mono">' + esc(L(a.kicker)) + " · " + esc(L(a.date)) + '</p><h2 id="reader-title">' + esc(L(a.title)) + '</h2><p class="reader-by">' + u.by + esc(L(a.author)) + "</p>" +
        L(a.body).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
        '<div class="reader-foot"><button type="button" class="btn btn-ink" data-close>' + u.close + '</button><button type="button" class="btn-line" data-reader-go>' + u.seeFicha + "</button></div></div>";
    }
    doc.addEventListener("click", function (e) {
      var b = e.target.closest("[data-read]"); if (!b) return;
      current = b.getAttribute("data-read"); render(current);
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
      dlg.scrollTop = 0;
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.closest("[data-close]")) { dlg.close(); return; }
      if (e.target.closest("[data-reader-go]")) { dlg.close(); var f = $("#ficha"); if (f) f.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
    });
    doc.addEventListener("ae:lang", function () { if (dlg.open && current) render(current); });
  }

  /* ---------- pausa en pestañas ocultas ---------- */
  function initVisibility() {
    doc.addEventListener("visibilitychange", function () { doc.body.classList.toggle("paused", doc.hidden); });
  }

  /* ---------- API compartida con el visor 3D ---------- */
  window.AEUI = {
    lang: function () { return lang; }, L: L, fmt: fmt, addToCart: addToCart, toast: toast, t: t,
    reduced: function () { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  };

  function boot() {
    window.__AE_BOOTED__ = true;
    safe(cacheI18n, "cacheI18n");
    safe(initHero, "initHero");
    safe(initLang, "initLang");
    safe(initTagline, "initTagline");
    safe(initReveals, "initReveals");
    safe(initNav, "initNav");
    safe(initCart, "initCart");
    safe(initSheets, "initSheets");
    safe(initFilters, "initFilters");
    safe(initOracle, "initOracle");
    safe(initReader, "initReader");
    safe(initVisibility, "initVisibility");
    root.classList.add("is-ready");
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot); else boot();
})();
