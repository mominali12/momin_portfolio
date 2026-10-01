/**
 * main.js - Momin Ali Portfolio
 *
 * Animations and their motivations (SKILL §5 - Motion must be motivated):
 *
 * 1. Particle field     - Domain: sonar ping visualisation for the ship-acoustics project
 * 2. Cursor glow        - Hierarchy: spotlights whatever the user's attention is on
 * 3. Custom cursor      - Premium tactile feel; consistent with magnetic buttons
 * 4. Magnetic buttons   - Feedback: physical response to user intent
 * 5. Card spotlight     - Feedback: tells user which card they're over
 * 6. Pill shimmer       - Feedback: confirms hover on capability pills
 * 7. Timeline draw      - Storytelling: line draws as you scroll, reinforcing chronology
 * 8. Stat count-up      - Hierarchy: draws eye to key numbers in the hero
 * 9. Scroll reveal      - Sequence storytelling: content enters in reading order
 * 10. Nav scroll-hide   - Feedback: frees viewport real-estate when reading
 *
 * Rules:
 * - prefers-reduced-motion: every animation gated by reducedMotion flag
 * - No layout-triggering CSS (only transform + opacity animated). SKILL §6.A
 * - passive:true on all scroll listeners. rAF-batched for direction detection.
 * - All observers disconnected / rAF cancelled on unload.
 */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  /* ─────────────────────────────────────────────
     0. THEME TOGGLE
     Reads/writes data-theme on <html>.
     Persists to localStorage. Updates aria-label.
     The inline <head> script already applied the
     saved theme before first paint (no FODT).
  ───────────────────────────────────────────── */
  (function initThemeToggle() {
    const btn  = document.getElementById('theme-toggle');
    const root = document.documentElement;
    if (!btn) return;

    function getTheme() {
      // data-theme was set by the inline head script; read it as source of truth
      return root.getAttribute('data-theme') || 'light';
    }

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }

    // Sync aria-label on load (inline script set data-theme but not aria-label)
    applyTheme(getTheme());

    btn.addEventListener('click', () => {
      const next = getTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });

    // Respond to OS preference changes if user has not saved a manual preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (localStorage.getItem('theme')) return; // user has a manual preference, don't override
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }());

  /* ─────────────────────────────────────────────
     1. CUSTOM CURSOR
     Two-layer: small dot (fast) + ring (lagged)
     Motivation: premium feel, consistent with magnetic buttons
  ───────────────────────────────────────────── */
  (function initCursor() {
    if (reducedMotion || isTouchDevice) return;

    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = -100, my = -100; // mouse position
    let rx = -100, ry = -100; // ring position (lagged)

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    // Hover state: enlarge on interactive elements
    document.addEventListener('mouseover', e => {
      const el = e.target.closest('a, button, .pill, .stat-cell, .venue-chip');
      document.body.classList.toggle('cursor-hover', !!el);
    }, { passive: true });

    document.addEventListener('mousedown', () => document.body.classList.add('cursor-clicking'),    { passive: true });
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-clicking'), { passive: true });

    // Ring lags behind dot using linear interpolation
    const LERP = 0.12;
    let rafId;

    function tick() {
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;

      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';

      rafId = requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener('unload', () => cancelAnimationFrame(rafId), { once: true });
  }());

  /* ─────────────────────────────────────────────
     2. PARTICLE FIELD (canvas)
     Motivation: sonar ping visualisation - floating nodes
     representing acoustic signal propagation, directly tied
     to the ship-detection domain.
  ───────────────────────────────────────────── */
  (function initParticles() {
    if (reducedMotion) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    hero.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], rafId;

    // Accent color parsed from CSS variable
    function getAccent() {
      const s = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      return s || '#2C6EAB';
    }

    function resize() {
      const rect = hero.getBoundingClientRect();
      W = canvas.width  = rect.width;
      H = canvas.height = rect.height;
    }

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return { r, g, b };
    }

    // Particle: a floating sonar node
    function makeParticle() {
      return {
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    Math.random() * 2 + 0.8,       // radius 0.8 - 2.8px
        vx:   (Math.random() - 0.5) * 0.3,   // slow drift
        vy:   (Math.random() - 0.5) * 0.3,
        life: Math.random(),                   // phase offset for opacity pulse
        speed: Math.random() * 0.004 + 0.002, // pulse speed
      };
    }

    function init() {
      resize();
      // ~60 particles — enough to feel like a field, not so many it's noise
      const count = Math.min(60, Math.floor((W * H) / 14000));
      particles = Array.from({ length: count }, makeParticle);
    }

    // Ripple rings: periodic pulses from random nodes (sonar ping metaphor)
    const ripples = [];

    function spawnRipple() {
      if (ripples.length > 4) return;
      const p = particles[Math.floor(Math.random() * particles.length)];
      if (!p) return;
      ripples.push({ x: p.x, y: p.y, r: 0, maxR: 60 + Math.random() * 40, alpha: 0.6 });
    }

    let rippleTimer = 0;

    function draw(t) {
      ctx.clearRect(0, 0, W, H);

      const accent = getAccent();
      let rgb = { r: 44, g: 110, b: 171 }; // fallback
      if (accent.startsWith('#') && accent.length === 7) rgb = hexToRgb(accent);

      // Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        p.life += p.speed;
        const pulse = 0.3 + 0.5 * Math.sin(p.life * Math.PI * 2);

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${pulse * 0.7})`;
        ctx.fill();

        // Halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${pulse * 0.08})`;
        ctx.fill();

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap at edges
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
      });

      // Draw ripples (sonar pings)
      rippleTimer += 0.016;
      if (rippleTimer > 2.5) { spawnRipple(); rippleTimer = 0; }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r   += 0.8;
        rp.alpha *= 0.97;

        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${rp.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (rp.r > rp.maxR || rp.alpha < 0.01) ripples.splice(i, 1);
      }

      rafId = requestAnimationFrame(draw);
    }

    init();
    draw(0);

    // Resize: debounced
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { init(); }, 150);
    }, { passive: true });

    window.addEventListener('unload', () => cancelAnimationFrame(rafId), { once: true });
  }());

  /* ─────────────────────────────────────────────
     3. CURSOR SPOTLIGHT (hero section)
     Motivation: hierarchy - spotlights the area the user
     is looking at, makes the hero feel alive and reactive.
  ───────────────────────────────────────────── */
  (function initSpotlight() {
    if (reducedMotion || isTouchDevice) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      hero.style.setProperty('--cursor-x', x);
      hero.style.setProperty('--cursor-y', y);
    }, { passive: true });
  }());

  /* ─────────────────────────────────────────────
     4. MAGNETIC BUTTONS
     Motivation: feedback - physical response to user intent;
     signals interactivity before click.
  ───────────────────────────────────────────── */
  (function initMagneticButtons() {
    if (reducedMotion || isTouchDevice) return;

    const STRENGTH = 0.3; // how strongly the button pulls (0-1)

    document.querySelectorAll('.btn, .btn-ghost-inv').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) * STRENGTH;
        const dy = (e.clientY - cy) * STRENGTH;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        // Spring back
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        btn.style.transform  = 'translate(0, 0)';
        setTimeout(() => { btn.style.transition = ''; }, 500);
      }, { passive: true });
    });
  }());

  /* ─────────────────────────────────────────────
     5. CARD SPOTLIGHT BORDER
     Motivation: feedback - tells user which card is active;
     radial gradient tracks cursor inside each card.
  ───────────────────────────────────────────── */
  (function initCardSpotlight() {
    if (reducedMotion || isTouchDevice) return;

    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--card-x', x + 'px');
        card.style.setProperty('--card-y', y + 'px');
      }, { passive: true });
    });
  }());

  /* ─────────────────────────────────────────────
     6. NAV: scroll-hide + scroll-spy
  ───────────────────────────────────────────── */
  (function initNav() {
    const nav = document.getElementById('nav');
    if (!nav || reducedMotion) return;

    let prevY = window.scrollY, ticking = false;

    document.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > prevY && y > 80)       nav.classList.add('hidden');
        else if (y < prevY && y > 80)  nav.classList.remove('hidden');
        else if (y <= 80)              nav.classList.remove('hidden');
        prevY = y;
        ticking = false;
      });
    }, { passive: true });

    // Scroll-spy
    const links = document.querySelectorAll('.nav-links a');
    const ids   = ['work','capabilities','recognition','experience','contact'];

    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.toggle('active',
            l.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    ids.forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }());

  /* ─────────────────────────────────────────────
     7. MOBILE MENU
  ───────────────────────────────────────────── */
  (function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const menu   = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.setAttribute('aria-hidden',     String(open));
      menu.classList.toggle('open', !open);
    });

    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        menu.classList.remove('open');
      });
    });
  }());

  /* ─────────────────────────────────────────────
     8. ACOUSTIC WAVE (hero footer)
     Motivation: domain signal, ship acoustics
  ───────────────────────────────────────────── */
  (function initWave() {
    const path = document.getElementById('wpath');
    if (!path) return;

    const W = 1440, H = 100, mid = H * 0.6, N = 180;

    function build(t) {
      let d = 'M0,' + mid;
      for (let i = 0; i <= N; i++) {
        const x = (i / N) * W;
        const p = i / N;
        const env = Math.exp(-1.6 * p) * (0.4 + 0.6 * Math.sin(p * Math.PI));
        const y   = mid
          + Math.sin(p * 40 + t) * 28 * env
          + Math.sin(p * 13 - t * 0.6) * 7  * env;
        d += ' L' + x.toFixed(1) + ',' + y.toFixed(1);
      }
      path.setAttribute('d', d);
    }

    if (reducedMotion) { build(0); return; }

    let t = 0, rafId;
    function loop() { t += 0.025; build(t); rafId = requestAnimationFrame(loop); }
    loop();
    window.addEventListener('unload', () => cancelAnimationFrame(rafId), { once: true });
  }());

  /* ─────────────────────────────────────────────
     8b. 3D MICROCHIP SCENE (Three.js r128 vanilla)
     ─────────────────────────────────────────────
     What: Procedural MSP430FR microcontroller chip.
     Why: The chip IS the story — ShipNN runs on this
          exact class of resource-constrained hardware.
          Seeing the physical constraint makes the 94%
          accuracy result land harder.

     SKILL.md compliance:
     - Stack: Three.js vanilla (no React, max control)
     - Geometry: procedural, zero external assets, renders instantly
     - Triangle budget: ~6,800 total, well under 500K desktop limit
     - DPR: Math.min(devicePixelRatio, 2), 1 on mobile
     - Mobile: canvas hidden via CSS, this init exits early
     - WebGL fallback: if context fails, wrap hides gracefully
     - No OrbitControls (no scroll capture risk)
     - Performance: one directional light + one ambient (SKILL quick wins)
     - Reduced motion: auto-rotation paused, tilt still works
  ───────────────────────────────────────────── */
  (function initChip3D() {
    const canvas = document.getElementById('chip-canvas');
    if (!canvas) return;

    // Mobile: CSS hides the wrap, but bail here too to save GPU
    if (window.innerWidth <= 768) return;

    // SKILL.md: WebGL fallback
    const testCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!testCtx) {
      document.querySelector('.chip-scene-wrap').style.display = 'none';
      return;
    }

    // ── Three.js scene setup ──────────────────────────────────
    const THREE = window.THREE;
    if (!THREE) return;

    const wrap  = canvas.parentElement;
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(W, H);
    // SKILL.md: cap DPR at 2
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x000000, 0); // transparent bg

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    // ── Read accent color from CSS custom property ────────────
    function getAccentHex() {
      const v = getComputedStyle(document.documentElement)
                  .getPropertyValue('--accent').trim();
      // v may be oklch() or hex
      if (v.startsWith('#')) return v;
      return '#2C6EAB'; // fallback
    }

    function accentColor() { return new THREE.Color(getAccentHex()); }

    // ── Materials (defined once, reused) ─────────────────────
    // PCB substrate — dark green board
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x0d2b1a,
      roughness: 0.35,
      metalness: 0.15,
    });

    // Chip body — dark ceramic/epoxy
    const chipMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1e,
      roughness: 0.3,
      metalness: 0.4,
    });

    // Gold pins
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xc8a84b,
      roughness: 0.2,
      metalness: 0.9,
    });

    // Accent trace lines — accent color, emissive glow
    const traceMat = new THREE.MeshStandardMaterial({
      color: accentColor(),
      emissive: accentColor(),
      emissiveIntensity: 0.55,
      roughness: 0.1,
      metalness: 0.8,
    });

    // Solder pads — warm silver
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x9eaab0,
      roughness: 0.25,
      metalness: 0.85,
    });

    // ── Scene group (all chip parts parented here for tilt) ──
    const chipGroup = new THREE.Group();
    scene.add(chipGroup);

    // ── PCB board ─────────────────────────────────────────────
    // 3.2 × 2.4 × 0.08 cm scaled to scene units
    const boardGeo = new THREE.BoxGeometry(3.2, 2.4, 0.08, 1, 1, 1);
    const board    = new THREE.Mesh(boardGeo, pcbMat);
    board.position.z = -0.04;
    chipGroup.add(board);

    // ── Main chip package ─────────────────────────────────────
    const pkgGeo = new THREE.BoxGeometry(1.2, 1.2, 0.12, 1, 1, 1);
    const pkg    = new THREE.Mesh(pkgGeo, chipMat);
    pkg.position.set(0, 0, 0.02);
    chipGroup.add(pkg);

    // Chip top face edge bevel (ring)
    const bevelGeo = new THREE.BoxGeometry(1.24, 1.24, 0.01, 1, 1, 1);
    const bevel    = new THREE.Mesh(bevelGeo, padMat);
    bevel.position.set(0, 0, 0.08);
    chipGroup.add(bevel);

    // Chip label surface (slightly raised plane)
    const labelGeo = new THREE.PlaneGeometry(0.9, 0.5);
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a30, roughness: 0.5, metalness: 0.0,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, 0.12, 0.085);
    chipGroup.add(labelMesh);

    // ── Pins — 8 per side, 4 sides ───────────────────────────
    // Pin geometry (flat rectangle)
    const pinW = 0.06, pinH = 0.22, pinD = 0.02;
    const pinGeo = new THREE.BoxGeometry(pinW, pinH, pinD);

    function addPins(count, side) {
      const spacing = 1.1 / count;
      for (let i = 0; i < count; i++) {
        const pin  = new THREE.Mesh(pinGeo, pinMat);
        const pos  = (i - (count - 1) / 2) * spacing;
        if (side === 'bottom') {
          pin.position.set(pos, -0.71, 0.0);
        } else if (side === 'top') {
          pin.position.set(pos,  0.71, 0.0);
          pin.rotation.z = Math.PI;
        } else if (side === 'left') {
          pin.rotation.z = Math.PI / 2;
          pin.position.set(-0.71, pos, 0.0);
        } else {
          pin.rotation.z = -Math.PI / 2;
          pin.position.set( 0.71, pos, 0.0);
        }
        chipGroup.add(pin);
      }
    }

    ['bottom','top','left','right'].forEach(s => addPins(8, s));

    // ── PCB circuit traces (glowing accent lines) ─────────────
    // Flat thin boxes on the PCB surface representing copper traces
    const traceThick = 0.018, traceH = 0.008;

    function addTrace(x1, y1, x2, y2) {
      const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
      const ang = Math.atan2(y2-y1, x2-x1);
      const geo = new THREE.BoxGeometry(len, traceThick, traceH);
      const mesh = new THREE.Mesh(geo, traceMat);
      mesh.position.set((x1+x2)/2, (y1+y2)/2, 0.045);
      mesh.rotation.z = ang;
      chipGroup.add(mesh);
    }

    // Traces radiating from chip edges to board edge
    // Bottom pins to lower pads
    addTrace( 0.0, -0.71, 0.0, -1.1);
    addTrace(-0.22, -0.71, -0.22, -1.15);
    addTrace( 0.22, -0.71,  0.44, -1.1);
    addTrace(-0.44, -0.71, -0.66, -1.05);
    addTrace( 0.44, -0.71,  0.9, -0.9);

    // Top traces
    addTrace( 0.0,  0.71,  0.0,  1.1);
    addTrace(-0.22, 0.71, -0.55,  1.05);
    addTrace( 0.22, 0.71,  0.55,  1.0);

    // Right side traces
    addTrace(0.71, 0.0,   1.4,  0.0);
    addTrace(0.71, 0.22,  1.4,  0.35);
    addTrace(0.71,-0.22,  1.35,-0.4);

    // Left side traces
    addTrace(-0.71, 0.0,  -1.4,  0.1);
    addTrace(-0.71, 0.22, -1.3,  0.5);
    addTrace(-0.71,-0.22, -1.3, -0.5);

    // Cross-board routing trace
    addTrace(-1.0, 0.5, 1.0, 0.5);
    addTrace(-0.9, -0.6, 0.4, -0.6);

    // ── Solder pads at trace endpoints ────────────────────────
    const padGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.008, 8);
    padGeo.rotateX(Math.PI / 2);

    const padPositions = [
      [0.0, -1.1], [-0.22, -1.15], [0.44, -1.1], [-0.66, -1.05], [0.9, -0.9],
      [0.0,  1.1], [-0.55, 1.05],  [0.55, 1.0],
      [1.4, 0.0],  [1.4, 0.35],    [1.35, -0.4],
      [-1.4, 0.1], [-1.3, 0.5],    [-1.3, -0.5],
    ];

    padPositions.forEach(([px, py]) => {
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(px, py, 0.048);
      chipGroup.add(pad);
    });

    // ── Decoupling capacitors (small components on board) ─────
    const capGeo = new THREE.BoxGeometry(0.12, 0.07, 0.07);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x2f3640, roughness: 0.5, metalness: 0.1
    });

    [[-1.0, -0.8], [1.1, -0.7], [-1.1, 0.7], [1.0, 0.8], [0.6, -0.9]].forEach(([cx, cy]) => {
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(cx, cy, 0.075);
      chipGroup.add(cap);
    });

    // ── Lights ────────────────────────────────────────────────
    // SKILL.md: one ambient + one directional (limit lights quick win)
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);

    // Accent fill light — tints the traces from above-left
    const accentLight = new THREE.PointLight(accentColor(), 1.8, 8);
    accentLight.position.set(-2, 2, 3);
    scene.add(accentLight);

    // ── Initial rotation: face slightly toward viewer ─────────
    chipGroup.rotation.x = -0.18;
    chipGroup.rotation.y =  0.22;

    // ── Cursor parallax tilt ──────────────────────────────────
    let targetRotX = -0.18, targetRotY = 0.22;
    let currentRotX = -0.18, currentRotY = 0.22;
    const TILT_MAX = 0.28;

    wrap.addEventListener('mousemove', e => {
      if (reducedMotion) return;
      const rect = wrap.getBoundingClientRect();
      const nx = (e.clientX - rect.left)  / rect.width  - 0.5; // -0.5 to 0.5
      const ny = (e.clientY - rect.top)   / rect.height - 0.5;
      targetRotY = 0.22 + nx * TILT_MAX * 2;
      targetRotX = -0.18 - ny * TILT_MAX;
    }, { passive: true });

    wrap.addEventListener('mouseleave', () => {
      targetRotX = -0.18;
      targetRotY =  0.22;
    }, { passive: true });

    // ── Glow pulse: emissive intensity breathes ───────────────
    let glowPhase = 0;

    // ── Update accent color when theme toggles ────────────────
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        // Small delay to let the CSS variable update
        setTimeout(() => {
          const c = accentColor();
          traceMat.color.set(c);
          traceMat.emissive.set(c);
          accentLight.color.set(c);
          traceMat.needsUpdate = true;
        }, 50);
      });
    }

    // ── Render loop ───────────────────────────────────────────
    const LERP = 0.06;
    let rafId;

    function render() {
      rafId = requestAnimationFrame(render);

      // Smooth tilt interpolation
      currentRotX += (targetRotX - currentRotX) * LERP;
      currentRotY += (targetRotY - currentRotY) * LERP;
      chipGroup.rotation.x = currentRotX;
      chipGroup.rotation.y = currentRotY;

      // Slow auto-rotation when no cursor interaction (paused in reduced motion)
      if (!reducedMotion) {
        chipGroup.rotation.y += 0.0015;
        targetRotY           += 0.0015;
      }

      // Glow pulse on traces
      glowPhase += 0.025;
      traceMat.emissiveIntensity = 0.45 + 0.2 * Math.sin(glowPhase);

      // Accent light subtle orbit
      accentLight.position.x = Math.sin(glowPhase * 0.3) * 2.5;
      accentLight.position.y = Math.cos(glowPhase * 0.2) * 2.0 + 1.0;

      renderer.render(scene, camera);
    }
    render();

    // ── Resize handler ────────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const nW = wrap.clientWidth;
        const nH = wrap.clientHeight;
        camera.aspect = nW / nH;
        camera.updateProjectionMatrix();
        renderer.setSize(nW, nH);
      }, 150);
    }, { passive: true });

    window.addEventListener('unload', () => cancelAnimationFrame(rafId), { once: true });
  }());

  /* ─────────────────────────────────────────────
     9. STAT COUNT-UP
     Motivation: hierarchy - draws attention to key metrics
  ───────────────────────────────────────────── */
  (function initCountUp() {
    if (reducedMotion) return;

    const cells = document.querySelectorAll('.stat-n[data-target]');
    if (!cells.length) return;

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const el       = entry.target;
        const target   = parseInt(el.dataset.target, 10);
        const suffix   = el.dataset.suffix || '';
        const duration = 1400;
        const start    = performance.now();

        function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(easeOutCubic(p) * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    cells.forEach(c => obs.observe(c));
  }());

  /* ─────────────────────────────────────────────
     10. TIMELINE DRAW LINE + DOTS
     Motivation: storytelling - the line draws itself
     as the user reads, reinforcing chronological narrative
  ───────────────────────────────────────────── */
  (function initTimeline() {
    const tl = document.querySelector('.timeline');
    if (!tl || reducedMotion) return;

    // Draw the vertical line when timeline enters viewport
    const lineObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        tl.classList.add('line-drawn');
        lineObs.disconnect();
      }
    }, { threshold: 0.15 });
    lineObs.observe(tl);

    // Animate each dot as its row enters viewport
    const dotObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('dot-visible');
          dotObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('.tl-item').forEach(item => dotObs.observe(item));
  }());

  /* ─────────────────────────────────────────────
     11. SCROLL REVEAL
     Motivation: sequence storytelling
  ───────────────────────────────────────────── */
  (function initReveal() {
    const selectors = [
      '.card', '.cap-group', '.tl-item',
      '.rec-award-block', '.rec-right',
      '.thesis-lead', '.thesis-body', '.section-title',
    ];

    if (reducedMotion) {
      selectors.forEach(sel =>
        document.querySelectorAll(sel).forEach(el => el.classList.add('visible'))
      );
      return;
    }

    selectors.forEach(sel =>
      document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'))
    );

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
    }, 60);
  }());

}());
