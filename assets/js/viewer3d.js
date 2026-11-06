/* AETHERIA Parfums · viewer3d.js
   Visor 3D del frasco (three.js r147, script clásico). Los mandos funcionan
   también sin WebGL: el visitante elige perfume, mantiene pulsado y ve las notas
   por orden de evaporación sobre la imagen renderizada. */
(function () {
  "use strict";

  var doc = document;
  var section = doc.querySelector("[data-viewer]");
  if (!section) return;
  var AE = window.__AE__ || {};
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var inOut = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var api = function () { return window.AEUI || { lang: function () { return "es"; }, L: function (o) { return o ? o.es : ""; }, fmt: function (n) { return n + " €"; } }; };

  var MODEL = "assets/models/aetheria-nocturne.glb?v=20261106";
  /* abierta con doble clic (file://) el navegador no deja leer el .glb ni usar las
     texturas sueltas en 3D; se cargan de una copia en base64 (un script normal) */
  var LOCAL = location.protocol === "file:";
  var MODEL_LOCAL = "assets/models/aetheria-nocturne.glb.js?v=20261106";
  var STONE_TEX = { nocturne: "assets/tex/stone-marquina.webp", sylva: "assets/tex/stone-verde.webp", sel: "assets/tex/stone-sal.webp", fumee: "assets/tex/stone-obsidiana.webp" };
  var GLOW = { nocturne: "#c7742a", sylva: "#6f8a3a", sel: "#8fa6bf", fumee: "#b0341c" };
  var LABEL = {
    nocturne: ["Nocturne", "d'Or", "EXTRAIT DE PARFUM", "0417"], sylva: ["Sylva", "Obscura", "EAU DE PARFUM INTENSE", "0522"],
    sel: ["Sel", "d'Argent", "EAU DE PARFUM", "0309"], fumee: ["Fumée", "Céleste", "EXTRAIT DE PARFUM", "0611"]
  };
  var D = { capLift: 0.032, waterY: -0.032, pedR: 0.058 };

  var ui = {
    swatches: $$(".swatch", section), hold: $("[data-hold]", section), holdLabel: $("[data-hold-label]", section),
    tiers: $$("[data-viewer-tiers] li", section), add: $("[data-viewer-add]", section), fallback: $("[data-viewer-fallback]", section),
    wrap: $("[data-viewer-canvas]", section)
  };
  var state = { variant: "nocturne", hold: 0, holding: false, open: false, closing: false, last: 0, raf: null };
  function product(id) { return (AE.products || []).filter(function (p) { return p.id === id; })[0]; }
  function lang() { return api().lang(); }

  /* ---------- interfaz (con o sin 3D) ---------- */
  function labelText() {
    var en = lang() === "en";
    if (state.open) return en ? "Open · tap to close" : "Abierto · pulsa para cerrar";
    if (state.holding) return en ? "Opening" : "Abriendo";
    return en ? "Press and hold to open" : "Mantén pulsado para abrir";
  }
  var lastLabel = "";
  function syncUI() {
    ui.hold.style.setProperty("--hold", state.hold.toFixed(3));
    ui.hold.classList.toggle("is-open", state.open);
    var lt = labelText();
    if (lt !== lastLabel) { lastLabel = lt; ui.holdLabel.textContent = lt; }
    var th = [0.18, 0.55, 0.9];
    ui.tiers.forEach(function (li, i) {
      var on = state.hold >= th[i] || state.open;
      if (on !== li.__on) { li.__on = on; li.classList.toggle("on", on); }
    });
  }
  /* sin 3D (o mientras carga): la foto nueva sube desde abajo como un líquido */
  function swapFallback(src, alt) {
    var img = ui.fallback;
    if (img.getAttribute("src") === src) return;
    if (three.ready || reducedMQ.matches || !img.complete || !img.naturalWidth || !window.Promise) { img.src = src; img.alt = alt; return; }
    var next = doc.createElement("img");
    next.className = "viewer-fallback viewer-fallback-next";
    next.alt = ""; next.setAttribute("aria-hidden", "true"); next.src = src;
    img.parentNode.insertBefore(next, img.nextSibling);
    function done() { img.src = src; img.alt = alt; setTimeout(function () { if (next.parentNode) next.parentNode.removeChild(next); }, 80); }
    (next.decode ? next.decode() : Promise.resolve()).then(function () {
      requestAnimationFrame(function () { next.classList.add("in"); });
      setTimeout(done, 950);
    }, done);
  }
  function renderNotes() {
    var p = product(state.variant); if (!p) return;
    var L = api().L;
    ui.tiers.forEach(function (li) {
      var k = li.getAttribute("data-tier"), n = $("[data-tier-notes]", li);
      if (n && p.pyramid[k]) n.textContent = L(p.pyramid[k]).join(" · ");
    });
    var price = api().fmt(p.sizes[0].price);
    ui.add.textContent = (lang() === "en" ? "Add " : "Añadir ") + p.name + " · " + price;
    ui.add.setAttribute("data-add", p.id + ":" + p.sizes[0].id);
    swapFallback(p.img + "?v=20261106", p.name);
    lastLabel = "";
    syncUI();
  }
  function setVariant(id) {
    if (!product(id) || id === state.variant) return;
    state.variant = id;
    ui.swatches.forEach(function (s) {
      var on = s.getAttribute("data-variant") === id;
      s.setAttribute("aria-checked", String(on)); s.tabIndex = on ? 0 : -1;
    });
    renderNotes();
    if (three.ready) three.setVariant(id);
  }
  ui.swatches.forEach(function (s, i) {
    s.tabIndex = s.getAttribute("aria-checked") === "true" ? 0 : -1;
    s.addEventListener("click", function () { setVariant(s.getAttribute("data-variant")); });
    s.addEventListener("keydown", function (e) {
      var d = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : (e.key === "ArrowLeft" || e.key === "ArrowUp") ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = ui.swatches[(i + d + ui.swatches.length) % ui.swatches.length];
      n.focus(); setVariant(n.getAttribute("data-variant"));
    });
  });

  /* mantener pulsado: el progreso sube mientras se sostiene y baja suave al soltar */
  var reducedMQ = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  function loop(now) {
    var dt = Math.min(64, now - (state.last || now)); state.last = now;
    var before = state.hold;
    if (state.closing) {
      state.hold = Math.max(0, state.hold - dt / 650);
      if (state.hold === 0) { state.closing = false; state.open = false; }
    } else if (state.holding && !state.open) {
      state.hold = Math.min(1, state.hold + dt / 2200);
      if (state.hold >= 1) { state.open = true; state.holding = false; if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) { /* sin vibración */ } } }
    } else if (!state.open && state.hold > 0) {
      state.hold = Math.max(0, state.hold - dt / 900);
    }
    syncUI();
    if (three.ready) three.setHold(state.hold);
    var moving = state.holding || state.closing || (!state.open && state.hold > 0) || before !== state.hold;
    if (moving) state.raf = requestAnimationFrame(loop); else { state.raf = null; state.last = 0; }
  }
  function kick() { if (state.raf === null) state.raf = requestAnimationFrame(loop); }
  function press() {
    if (reducedMQ.matches) { state.open = !state.open; state.hold = state.open ? 1 : 0; syncUI(); if (three.ready) three.setHold(state.hold); return; }
    if (state.open) { state.closing = true; kick(); return; }
    state.holding = true; kick();
  }
  function release() { if (state.holding) { state.holding = false; kick(); } }
  ui.hold.addEventListener("pointerdown", function (e) { if (e.button !== undefined && e.button !== 0) return; e.preventDefault(); try { ui.hold.setPointerCapture(e.pointerId); } catch (er) { /* opcional */ } press(); });
  ui.hold.addEventListener("pointerup", release);
  ui.hold.addEventListener("pointercancel", release);
  ui.hold.addEventListener("lostpointercapture", release);
  ui.hold.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  ui.hold.addEventListener("keydown", function (e) {
    if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); press(); }
  });
  ui.hold.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(); } });
  ui.hold.addEventListener("click", function (e) { e.preventDefault(); });
  doc.addEventListener("ae:lang", function () { renderNotes(); if (three.ready) three.redrawLabel(); });

  /* ---------- 3D ---------- */
  var three = { ready: false };
  function webgl() {
    try { var c = doc.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; }
  }
  function loadLocalModel(ok, fail) {
    function go() {
      try {
        var bin = atob(window.__AE_GLB__), u = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        ok(u.buffer);
      } catch (e) { fail(); }
    }
    if (window.__AE_GLB__) { go(); return; }
    var s = doc.createElement("script");
    s.src = MODEL_LOCAL;
    s.onload = function () { if (window.__AE_GLB__) go(); else fail(); };
    s.onerror = fail;
    doc.head.appendChild(s);
  }
  function canvasTex(w, h, draw) {
    var c = doc.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    var tx = new THREE.CanvasTexture(c);
    tx.flipY = false; tx.anisotropy = 8;
    return tx;
  }
  function noiseFill(ctx, w, h, base, amp, seed) {
    var img = ctx.createImageData(w, h), d = img.data, s = seed >>> 0;
    for (var i = 0; i < d.length; i += 4) {
      s = (s * 1664525 + 1013904223) >>> 0;
      var n = (s / 4294967296 - 0.5) * amp;
      d[i] = clamp(base[0] + n, 0, 255); d[i + 1] = clamp(base[1] + n, 0, 255); d[i + 2] = clamp(base[2] + n * 0.9, 0, 255); d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  function init3D() {
    if (three.started) return; three.started = true;
    var T = THREE;
    /* gestión de color real: los hex de la marca son sRGB (en r147 venía desactivada) */
    if (T.ColorManagement) T.ColorManagement.legacyMode = false;
    var wrap = ui.wrap;
    var coarse = window.matchMedia && matchMedia("(pointer: coarse)").matches;
    var small = innerWidth < 960;
    var renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }); } catch (e) { return; }
    /* en pantallas normales se dibuja algo por encima de su resolución: bordes y estrías más finos */
    var dpr = Math.min(Math.max(window.devicePixelRatio || 1, coarse ? 1 : 1.25), coarse ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.physicallyCorrectLights = true;
    renderer.domElement.setAttribute("aria-hidden", "true");
    wrap.appendChild(renderer.domElement);

    var scene = new T.Scene();
    /* negro puro como en los renders; a lo lejos el agua se funde con él (sin línea de horizonte) */
    scene.background = new T.Color(0x000000);
    scene.fog = new T.Fog(0x000000, 1.4, 3.6);
    var camera = new T.PerspectiveCamera(small ? 21 : 18, 1, 0.01, 60);
    var target = new T.Vector3(0, 0.074, 0);

    /* estudio fotográfico para reflejos: tiras de luz, cenital y resplandor */
    (function env() {
      var es = new T.Scene();
      es.background = new T.Color(0x010102);
      function panel(w, h, hex, k, p, look) {
        var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(hex).multiplyScalar(k), side: T.DoubleSide }));
        m.position.set(p[0], p[1], p[2]); m.lookAt(look[0], look[1], look[2]); es.add(m);
      }
      panel(0.28, 2.2, 0xffe2c4, 9, [-1.7, 0.8, 1.05], [0, 0.1, 0]);       // key en tira (izquierda delante)
      panel(0.10, 1.8, 0xffb36b, 14, [-0.95, 0.4, -1.3], [0, 0.1, 0]);     // rim izquierdo (detrás)
      panel(0.09, 1.8, 0xffbf80, 12, [0.9, 0.4, -1.4], [0, 0.1, 0]);       // rim derecho (detrás)
      panel(1.2, 1.2, 0xfff1e2, 2.2, [0, 2.4, 0.3], [0, 0, 0]);            // cenital
      panel(2.2, 1.4, 0xc06a24, 0.9, [0.6, 0.5, -3.2], [0, 0.1, 0]);       // resplandor cálido del fondo
      var pm = new T.PMREMGenerator(renderer);
      scene.environment = pm.fromScene(es, 0.03).texture;
      pm.dispose();
    })();

    /* resplandor de fondo por perfume (como en los renders) */
    var glowTex = canvasTex(256, 256, function (ctx, w, h) {
      var g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.18, "rgba(255,255,255,.62)"); g.addColorStop(0.4, "rgba(255,255,255,.24)");
      g.addColorStop(0.65, "rgba(255,255,255,.06)"); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    glowTex.flipY = true;
    glowTex.encoding = T.sRGBEncoding;
    /* halo cálido pegado detrás del frasco, como el de los renders de Blender (suma de luz).
       Se dibuja al final: rodea el frasco y se refleja en el agua, pero no tiñe el vidrio,
       así el frasco vacío se lee vacío durante el cambio de perfume */
    var GLOW_K = 1.7;
    var glowMat = new T.MeshBasicMaterial({ map: glowTex, color: new T.Color(GLOW.nocturne).multiplyScalar(GLOW_K), transparent: true,
      blending: T.AdditiveBlending, depthWrite: false });
    var glow = new T.Mesh(new T.PlaneGeometry(0.36, 0.36), glowMat);
    glow.position.set(0, 0.085, -0.2);
    glow.renderOrder = 1;   /* después del agua: si no, el agua lejana lo tapa y se ve cortado */
    scene.add(glow);

    /* luces directas como en Blender: key en tira delante-izquierda y contraluz ámbar */
    var key = new T.DirectionalLight(0xffe6cc, 2.4);
    key.position.set(-1.5, 1.1, 1.3);
    scene.add(key);
    var rim = new T.DirectionalLight(0xffb870, 1.6);
    rim.position.set(0.9, 0.5, -1.4);
    scene.add(rim);
    var top = new T.DirectionalLight(0xfff1e2, 0.6);
    top.position.set(0, 2, 0.3);
    scene.add(top);

    /* materiales */
    var M = {};
    /* cambio de perfume animado: vaciado y llenado */
    var SWAP_MS = 1700, LEVEL_MIN = 0.03;
    var swap = { on: false, t: 0, done: false, shown: state.variant, want: state.variant };
    var capSpin = 0, capRise = 0, liqLevel = 1, liqBaseY = 0, liqMinY = 0, paper = null;
    /* más grosor de refracción para que las 36 estrías dibujen bandas sobre el líquido */
    M.glass = new T.MeshPhysicalMaterial({ color: 0xf2efe9, metalness: 0, roughness: 0.03, transmission: 1, thickness: 0.04, ior: 1.52,
      attenuationColor: new T.Color(0.88, 0.86, 0.82), attenuationDistance: 0.5, specularIntensity: 1, envMapIntensity: 1.45 });
    /* líquido "encendido desde dentro": poca respuesta difusa y brillo propio del color del perfume */
    M.liquid = new T.MeshPhysicalMaterial({ color: new T.Color("#120803"), roughness: 0.4, metalness: 0, specularIntensity: 0.25,
      emissive: new T.Color("#C87A28"), emissiveIntensity: 0.85, envMapIntensity: 0.12 });
    /* volumen: el centro brilla más y los bordes se oscurecen, como un líquido a contraluz */
    M.liquid.onBeforeCompile = function (sh) {
      sh.fragmentShader = sh.fragmentShader.replace("#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\n  float aeFacing = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);\n  totalEmissiveRadiance *= mix(0.3, 1.1, pow(aeFacing, 0.75));");
    };
    M.brass = new T.MeshPhysicalMaterial({ color: new T.Color("#d6aa52"), metalness: 1, roughness: 0.3, envMapIntensity: 1.35, clearcoat: 0.2, clearcoatRoughness: 0.3 });
    M.dark = new T.MeshStandardMaterial({ color: 0x0d0b09, metalness: 0.6, roughness: 0.5 });
    M.stone = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.05, clearcoat: 0.9, clearcoatRoughness: 0.04, envMapIntensity: 1.1 });
    var basaltTex = canvasTex(512, 512, function (ctx, w, h) {
      noiseFill(ctx, w, h, [26, 26, 28], 26, 7);
      ctx.globalAlpha = 0.9;
      var s = 99;
      for (var i = 0; i < 900; i++) {
        s = (s * 1664525 + 1013904223) >>> 0; var x = s / 4294967296 * w;
        s = (s * 1664525 + 1013904223) >>> 0; var y = s / 4294967296 * h;
        s = (s * 1664525 + 1013904223) >>> 0; var r = 0.6 + s / 4294967296 * 2.4;
        ctx.fillStyle = "rgba(4,4,5,.9)"; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
      }
    });
    basaltTex.wrapS = basaltTex.wrapT = T.RepeatWrapping;
    basaltTex.encoding = T.sRGBEncoding;
    M.basalt = new T.MeshStandardMaterial({ map: basaltTex, color: 0x9a9a9e, roughness: 0.86, metalness: 0, envMapIntensity: 0.6 });

    /* etiqueta dibujada con las fuentes de la web */
    var labelCanvas = doc.createElement("canvas"); labelCanvas.width = 1024; labelCanvas.height = 1544;
    var mrCanvas = doc.createElement("canvas"); mrCanvas.width = 512; mrCanvas.height = 772;
    var labelTex = new T.CanvasTexture(labelCanvas); labelTex.flipY = false; labelTex.encoding = T.sRGBEncoding; labelTex.anisotropy = 8;
    var mrTex = new T.CanvasTexture(mrCanvas); mrTex.flipY = false;
    M.label = new T.MeshStandardMaterial({ map: labelTex, metalnessMap: mrTex, roughnessMap: mrTex, metalness: 1, roughness: 1, envMapIntensity: 1.1 });
    function drawLabel() {
      var v = LABEL[swap.shown] || LABEL.nocturne, W = 1024, H = 1544, mm = W / 28.9;
      var c = labelCanvas.getContext("2d"), m = mrCanvas.getContext("2d");
      /* el grano del papel se calcula una vez y se reutiliza en cada cambio */
      if (!paper) { paper = doc.createElement("canvas"); paper.width = W; paper.height = H; noiseFill(paper.getContext("2d"), W, H, [238, 230, 213], 10, 3); }
      c.drawImage(paper, 0, 0);
      var gold = "#b98a32";
      m.fillStyle = "rgb(0,235,0)"; m.fillRect(0, 0, 512, 772);         // G = rugosidad papel, B = metal 0
      function both(fn) { c.save(); fn(c, 1); c.restore(); m.save(); m.scale(0.5, 0.5); fn(m, 0); m.restore(); }
      both(function (ctx, isColor) {
        ctx.fillStyle = isColor ? gold : "rgb(0,80,255)";
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 0.55 * mm; ctx.strokeRect(0.27 * mm, 0.27 * mm, W - 0.55 * mm, H - 0.55 * mm);
        ctx.lineWidth = 0.22 * mm; ctx.strokeRect(1.35 * mm, 1.35 * mm, W - 2.7 * mm, H - 2.7 * mm);
        ctx.fillRect(6 * mm, H - 33.6 * mm, W - 12 * mm, 0.17 * mm);
        ctx.fillRect(6 * mm, H - 11.6 * mm, W - 12 * mm, 0.17 * mm);
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        function txt(s, font, y, spacing) {
          ctx.font = font;
          if (spacing && "letterSpacing" in ctx) ctx.letterSpacing = spacing + "px";
          ctx.fillText(s, W / 2 + (spacing ? spacing / 2 : 0), H - y * mm);
          if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
        }
        txt("AETHERIA", "600 " + Math.round(2.1 * mm) + "px Manrope, sans-serif", 37.6, 0.45 * 2.1 * mm);
        txt(v[0], "italic 500 " + Math.round(6.8 * mm) + "px 'Cormorant Garamond', serif", 25.1, 0);
        txt(v[1], "italic 500 " + Math.round(6.8 * mm) + "px 'Cormorant Garamond', serif", 17.7, 0);
        txt(v[2], "600 " + Math.round(1.5 * mm) + "px Manrope, sans-serif", 8.6, 0.3 * 1.5 * mm);
        txt("100 ml · 3.4 fl.oz", "500 " + Math.round(1.35 * mm) + "px 'JetBrains Mono', monospace", 5.6, 0);
        txt("N° " + v[3] + " · GRASSE", "500 " + Math.round(1.05 * mm) + "px 'JetBrains Mono', monospace", 3.1, 0);
      });
      labelTex.needsUpdate = true; mrTex.needsUpdate = true;
    }
    three.redrawLabel = function () { drawLabel(); requestRender(); };

    /* agua: espejo negro con ondas concéntricas (escritorio) o plano brillante (móvil) */
    var water, waterUniforms = null, reflRender = null;
    var useReflector = !!T.Reflector && !coarse && !small;
    if (useReflector) {
      var shader = {
        uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, time: { value: 0 }, camPos: { value: new T.Vector3() } },
        vertexShader: [
          "uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vWorld;",
          "#include <common>", "#include <logdepthbuf_pars_vertex>",
          "void main(){ vUv = textureMatrix * vec4(position,1.0); vec4 wp = modelMatrix * vec4(position,1.0); vWorld = wp.xyz;",
          " gl_Position = projectionMatrix * viewMatrix * wp;", " #include <logdepthbuf_vertex>", "}"
        ].join("\n"),
        fragmentShader: [
          "uniform vec3 color; uniform sampler2D tDiffuse; uniform float time; uniform vec3 camPos; varying vec4 vUv; varying vec3 vWorld;",
          "#include <logdepthbuf_pars_fragment>",
          "void main(){", " #include <logdepthbuf_fragment>",
          " float r = length(vWorld.xz); float rr = max(r - " + D.pedR.toFixed(3) + ", 0.0);",
          " float decay = exp(-rr / 0.11) * smoothstep(0.0, 0.006, rr);",
          " float slope = cos(rr * 571.2 - time * 3.4) * decay;",
          " vec2 dir = r > 0.0001 ? vWorld.xz / r : vec2(0.0);",
          " vec4 uv = vUv; uv.xy += dir * slope * 0.0045 * uv.w;",
          " vec3 refl = texture2DProj(tDiffuse, uv).rgb;",
          " vec3 V = normalize(camPos - vWorld);",
          " float fres = 0.04 + 0.96 * pow(1.0 - clamp(V.y, 0.0, 1.0), 5.0);",
          " gl_FragColor = vec4(color + refl * mix(0.32, 0.92, fres), 1.0);",
          " #include <tonemapping_fragment>", " #include <encodings_fragment>",
          /* lejos del pedestal el agua se apaga hasta el negro del fondo: sin línea de horizonte */
          " gl_FragColor.rgb *= exp(-max(r - 0.12, 0.0) / 0.55);", "}"
        ].join("\n")
      };
      var rw = Math.round(Math.min(1400, wrap.clientWidth * dpr * 0.6)), rh = Math.round(Math.min(900, wrap.clientHeight * dpr * 0.6));
      water = new T.Reflector(new T.PlaneGeometry(60, 60), { shader: shader, textureWidth: rw, textureHeight: rh, color: 0x020203, multisample: 4 });
      water.material.uniforms.color.value = new T.Color(0.006, 0.007, 0.009);
      waterUniforms = water.material.uniforms;
      /* el reflejo se calcula aparte, antes de cada fotograma: si se hiciera dentro
         del render principal estropearía el pase de transmisión del vidrio */
      reflRender = water.onBeforeRender;
      water.onBeforeRender = function () {};
    } else {
      /* móvil: agua negra satinada (sin espejo, que es caro); casi no refleja el estudio */
      water = new T.Mesh(new T.PlaneGeometry(60, 60), new T.MeshStandardMaterial({ color: 0x020203, roughness: 0.38, metalness: 0, envMapIntensity: 0.12 }));
    }
    water.rotation.x = -Math.PI / 2;
    water.position.y = D.waterY;
    scene.add(water);

    /* carga del modelo de Blender */
    var pivot = new T.Group(); scene.add(pivot);
    var cap = null, capBaseY = 0, liquid = null;
    var loader = new T.GLTFLoader();
    function onModel(gltf) {
      var g = gltf.scene;
      g.traverse(function (o) {
        if (!o.isMesh) return;
        var n = (o.name || "") + " " + ((o.material && o.material.name) || "");
        if (/web_glass/.test(n)) o.material = M.glass;
        else if (/web_liquid/.test(n)) { o.material = M.liquid; liquid = o; }
        else if (/web_tube/.test(n)) o.visible = false;
        else if (/web_brass/.test(n)) o.material = M.brass;
        else if (/web_dark/.test(n)) o.material = M.dark;
        else if (/web_stone/.test(n)) o.material = M.stone;
        else if (/web_label/.test(n)) o.material = M.label;
        else if (/web_basalt/.test(n)) o.material = M.basalt;
      });
      if (liquid) { liquid.geometry.computeBoundingBox(); liqMinY = liquid.geometry.boundingBox.min.y; liqBaseY = liquid.position.y; }
      swap.shown = swap.want = state.variant;
      cap = g.getObjectByName("web_cap");
      if (cap) {
        capBaseY = cap.position.y;
        var sock = g.getObjectByName("web_socket");
        if (sock && sock.parent !== cap) cap.attach(sock);
      }
      pivot.add(g);
      setStone(state.variant, true);
      setLiquid(state.variant, true);
      var fontsReady = doc.fonts && doc.fonts.load ? Promise.all([
        doc.fonts.load("italic 500 64px 'Cormorant Garamond'"), doc.fonts.load("600 32px Manrope"), doc.fonts.load("500 32px 'JetBrains Mono'")
      ]) : Promise.resolve();
      fontsReady.then(drawLabel, drawLabel).then(function () {
        three.ready = true;
        section.classList.add("is-3d");
        resize(); requestRender();
        /* las otras tres piedras se preparan ya, para que el cambio no dé tirones */
        Object.keys(STONE_TEX).forEach(function (id) { getStone(id, function (tx) { if (renderer.initTexture) renderer.initTexture(tx); }); });
      });
    }
    function onFail() { /* sin modelo: queda la imagen */ if (renderer.domElement.parentNode) wrap.removeChild(renderer.domElement); }
    if (LOCAL) loadLocalModel(function (buf) { try { loader.parse(buf, "", onModel, onFail); } catch (e) { onFail(); } }, onFail);
    else loader.load(MODEL, onModel, undefined, onFail);

    var texLoader = new T.TextureLoader(), stoneCache = {}, stoneWait = {};
    function getStone(id, cb) {
      if (stoneCache[id]) { cb(stoneCache[id]); return; }
      var url = LOCAL ? (window.__AE_TEX__ || {})[id] : STONE_TEX[id];
      if (!url) return;
      if (stoneWait[id]) { stoneWait[id].push(cb); return; }
      stoneWait[id] = [cb];
      texLoader.load(url, function (tx) {
        tx.flipY = false; tx.encoding = T.sRGBEncoding; tx.anisotropy = 8; stoneCache[id] = tx;
        var w = stoneWait[id]; stoneWait[id] = null;
        w.forEach(function (f) { f(tx); });
      });
    }
    function setStone(id) {
      getStone(id, function (tx) { if (swap.shown === id) { M.stone.map = tx; M.stone.needsUpdate = true; requestRender(); } });
    }
    var liqFrom = new T.Color(), liqTo = new T.Color(), glowFrom = new T.Color(), glowTo = new T.Color(), liqT = 1;
    function setLiquid(id, instant) {
      var p = product(id); if (!p) return;
      liqFrom.copy(M.liquid.emissive); liqTo.set(p.liquid);
      glowFrom.copy(glowMat.color); glowTo.set(GLOW[id] || "#c7742a").multiplyScalar(GLOW_K);
      if (instant) { M.liquid.emissive.copy(liqTo); glowMat.color.copy(glowTo); liqT = 1; }
      else liqT = 0;
      M.liquid.emissiveIntensity = { nocturne: 0.85, sylva: 1.5, sel: 0.42, fumee: 1.25 }[id] || 0.85;
      M.liquid.color.set(id === "sel" ? "#3c4247" : "#120803");
      requestRender();
    }
    /* cambio de perfume: el líquido baja, el tapón da una vuelta y cambia de piedra,
       la etiqueta cambia con el frasco vacío y se vuelve a llenar con el color nuevo */
    function applyVariant(id) {
      swap.shown = id;
      setStone(id);
      setLiquid(id, false);
      liqFrom.copy(liqTo);   /* el líquido nuevo entra ya con su color; el resplandor se funde */
      drawLabel();
    }
    function setLevel(l) {
      if (!liquid || l === liqLevel) return;
      liqLevel = l;
      liquid.scale.y = l;
      liquid.position.y = liqBaseY + liqMinY * (1 - l);
    }
    three.setVariant = function (id) {
      swap.want = id;
      if (reducedMQ.matches || !liquid) { if (!swap.on) applyVariant(id); requestRender(); return; }
      if (!swap.on && id !== swap.shown) { swap.on = true; swap.t = 0; swap.done = false; }
      requestRender();
    };
    var holdV = 0;
    three.setHold = function (h) { holdV = h; requestRender(); };

    /* cámara y tamaño */
    function resize() {
      var w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var wide = w / h > 1.2 && innerWidth >= 960;
      camera.fov = wide ? 17 : 21;
      camera.position.set(wide ? 0.03 : 0, 0.088, wide ? 0.86 : 0.8);
      camera.lookAt(target.x + (wide ? 0.0 : 0), target.y, target.z);
      camera.updateProjectionMatrix();
      requestRender();
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap); else addEventListener("resize", resize);

    /* girar arrastrando (solo horizontal; el gesto vertical sigue haciendo scroll) */
    var rot = 0, vel = 0, dragging = false, lastX = 0, lastT = 0, idleSpin = !reducedMQ.matches, swayT = 0;
    wrap.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; lastT = performance.now(); vel = 0;
      try { wrap.setPointerCapture(e.pointerId); } catch (er) { /* opcional */ }
    });
    wrap.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var now = performance.now(), dx = e.clientX - lastX;
      rot += dx * 0.008; vel = dx * 0.008 / Math.max(8, now - lastT) * 16; lastX = e.clientX; lastT = now;
      requestRender();
    });
    function endDrag() { dragging = false; requestRender(); }
    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);

    /* bucle: solo dibuja cuando el visor está a la vista */
    var visible = false, rafId = null, lastFrame = 0, clockStart = performance.now(), slowFrames = 0, needs = true;
    function requestRender() { needs = true; if (visible && rafId === null) rafId = requestAnimationFrame(frame); }
    function frame(now) {
      rafId = null;
      var dt = Math.min(50, now - (lastFrame || now)); lastFrame = now;
      var animating = false;
      if (!dragging) {
        if (Math.abs(vel) > 0.0002) { rot += vel; vel *= Math.pow(0.92, dt / 16.7); animating = true; }
        if (idleSpin) { swayT += dt; animating = true; }
      }
      /* en reposo se balancea suave (±22°) para que la etiqueta quede casi siempre de frente */
      pivot.rotation.y = rot + (idleSpin ? Math.sin(swayT / 2400) * 0.38 : 0);
      if (swap.on) {
        swap.t = Math.min(1, swap.t + dt / SWAP_MS);
        var s = swap.t;
        /* nivel: baja (0-42 %), vacío un instante, y vuelve a subir (55-100 %) */
        setLevel(s < 0.42 ? 1 - inOut(s / 0.42) * (1 - LEVEL_MIN) : s < 0.55 ? LEVEL_MIN : LEVEL_MIN + inOut((s - 0.55) / 0.45) * (1 - LEVEL_MIN));
        if (!swap.done && s >= 0.46) { swap.done = true; applyVariant(swap.want); }
        capSpin = inOut(s) * Math.PI * 2;
        capRise = Math.sin(Math.PI * s) * 0.012;
        if (s >= 1) {
          swap.on = false; capSpin = 0; capRise = 0; setLevel(1);
          if (swap.want !== swap.shown) { swap.on = true; swap.t = 0; swap.done = false; }
        }
        animating = true;
      }
      if (cap) {
        var e = inOut(holdV);
        cap.position.y = capBaseY + e * D.capLift + capRise;
        cap.rotation.y = e * 0.6 + capSpin;
      }
      if (liqT < 1) {
        liqT = Math.min(1, liqT + dt / 600);
        M.liquid.emissive.copy(liqFrom).lerp(liqTo, liqT);
        glowMat.color.copy(glowFrom).lerp(glowTo, liqT); animating = true;
      }
      if (waterUniforms) {
        waterUniforms.time.value = reducedMQ.matches ? 0 : (now - clockStart) / 1000;
        waterUniforms.camPos.value.copy(camera.position);
        animating = animating || !reducedMQ.matches;
      }
      var t0 = performance.now();
      if (reflRender) {
        scene.updateMatrixWorld(); camera.updateMatrixWorld();
        reflRender.call(water, renderer, scene, camera);
      }
      renderer.render(scene, camera);
      var cost = performance.now() - t0;
      if (cost > 28) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 40 && dpr > 1) { dpr = 1; slowFrames = 0; resize(); }
      needs = false;
      if (visible && (animating || dragging)) rafId = requestAnimationFrame(frame);
    }
    if ("IntersectionObserver" in window) {
      /* se usa el último aviso: con scroll suave pueden llegar varios juntos */
      new IntersectionObserver(function (es) {
        visible = es[es.length - 1].isIntersecting && !doc.hidden;
        if (visible) requestRender(); else if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      }, { threshold: 0 }).observe(wrap);
    } else { visible = true; }
    doc.addEventListener("visibilitychange", function () { if (doc.hidden && rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } else if (!doc.hidden) requestRender(); });
    resize();
  }

  /* arranque: interfaz siempre; 3D al acercarse si hay WebGL y three.js */
  renderNotes();
  function start3D() { if (window.THREE && THREE.GLTFLoader && webgl()) { try { init3D(); } catch (e) { if (window.console) console.warn("[viewer3d]", e); } } }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { if (es[es.length - 1].isIntersecting) { io.disconnect(); start3D(); } }, { rootMargin: "400px 0px" });
    io.observe(section);
  } else { start3D(); }
})();
