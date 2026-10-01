/**
 * main.js — Momin Ali Portfolio
 *
 * Animations and motivations (SKILL §5 — motion must be motivated):
 *  1. Custom cursor          — premium tactile feel, consistent with magnetic buttons
 *  2. Particle field         — sonar ping domain signal (ship acoustics)
 *  3. Cursor spotlight       — hierarchy, spotlights user attention in hero
 *  4. Magnetic buttons       — feedback before click
 *  5. Card spotlight border  — feedback, which card is active
 *  6. Nav scroll-hide        — frees viewport real-estate while reading
 *  7. Acoustic wave          — domain signal, ship acoustics
 *  8. ROBOT COMPANION        — character that lives on the page, jumps between
 *                              section headings on scroll. Domain: little AI robot
 *                              matches the ML/Edge AI subject matter. Gives the
 *                              page personality and makes scrolling feel rewarding.
 *  9. Stat count-up          — draws attention to key metrics
 * 10. Scroll reveal          — sequence storytelling
 *
 * Rules:
 *  - prefers-reduced-motion: every animation gated
 *  - No layout-triggering CSS in JS (transform + opacity only). SKILL §6.A
 *  - passive:true + rAF on scroll listeners
 *  - SKILL.md: Three.js vanilla, procedural geometry, DPR capped, mobile fallback
 *  - Triangle budget: robot ~2,400 triangles — well under 500K limit
 */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  /* ─────────────────────────────────────────────
     0. THEME TOGGLE
  ───────────────────────────────────────────── */
  (function initThemeToggle() {
    const btn  = document.getElementById('theme-toggle');
    const root = document.documentElement;
    if (!btn) return;

    function getTheme() { return root.getAttribute('data-theme') || 'light'; }

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      // Notify robot to update colors
      document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    applyTheme(getTheme());
    btn.addEventListener('click', () => applyTheme(getTheme() === 'dark' ? 'light' : 'dark'));

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (localStorage.getItem('theme')) return;
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }());

  /* ─────────────────────────────────────────────
     1. CUSTOM CURSOR
  ───────────────────────────────────────────── */
  (function initCursor() {
    if (reducedMotion || isTouchDevice) return;

    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = -100, my = -100, rx = -100, ry = -100;
    const LERP = 0.12;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('mouseover', e => {
      document.body.classList.toggle('cursor-hover',
        !!e.target.closest('a, button, .pill, .stat-cell, .venue-chip'));
    }, { passive: true });
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-clicking'), { passive: true });
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-clicking'), { passive: true });

    let rafId;
    function tick() {
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      rafId = requestAnimationFrame(tick);
    }
    tick();
    window.addEventListener('unload', () => cancelAnimationFrame(rafId), { once: true });
  }());

  /* ─────────────────────────────────────────────
     2. PARTICLE FIELD — sonar domain signal
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
    let W, H, particles = [], ripples = [], rafId;

    function hexToRgb(hex) {
      return { r: parseInt(hex.slice(1,3),16), g: parseInt(hex.slice(3,5),16), b: parseInt(hex.slice(5,7),16) };
    }
    function getAccent() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      return v.startsWith('#') ? v : '#2C6EAB';
    }

    function resize() {
      const r = hero.getBoundingClientRect();
      W = canvas.width = r.width; H = canvas.height = r.height;
    }
    function makeParticle() {
      return { x: Math.random()*W, y: Math.random()*H, r: Math.random()*2+0.8,
               vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3,
               life: Math.random(), speed: Math.random()*0.004+0.002 };
    }
    function init() {
      resize();
      particles = Array.from({ length: Math.min(60, Math.floor((W*H)/14000)) }, makeParticle);
    }

    let rippleTimer = 0;
    function spawnRipple() {
      if (ripples.length > 4) return;
      const p = particles[Math.floor(Math.random()*particles.length)];
      if (p) ripples.push({ x: p.x, y: p.y, r: 0, maxR: 60+Math.random()*40, alpha: 0.6 });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const hex = getAccent();
      const { r, g, b } = hex.startsWith('#') && hex.length===7 ? hexToRgb(hex) : {r:44,g:110,b:171};

      for (let i=0;i<particles.length;i++) {
        for (let j=i+1;j<particles.length;j++) {
          const a=particles[i], b2=particles[j];
          const d=Math.sqrt((a.x-b2.x)**2+(a.y-b2.y)**2);
          if (d<120) {
            ctx.beginPath();
            ctx.strokeStyle=`rgba(${r},${g},${b},${(1-d/120)*0.12})`;
            ctx.lineWidth=0.5; ctx.moveTo(a.x,a.y); ctx.lineTo(b2.x,b2.y); ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        p.life+=p.speed;
        const pulse=0.3+0.5*Math.sin(p.life*Math.PI*2);
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${r},${g},${b},${pulse*0.7})`; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*2.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(${r},${g},${b},${pulse*0.08})`; ctx.fill();
        p.x+=p.vx; p.y+=p.vy;
        if (p.x<-10) p.x=W+10; if (p.x>W+10) p.x=-10;
        if (p.y<-10) p.y=H+10; if (p.y>H+10) p.y=-10;
      });

      rippleTimer+=0.016;
      if (rippleTimer>2.5) { spawnRipple(); rippleTimer=0; }
      for (let i=ripples.length-1;i>=0;i--) {
        const rp=ripples[i]; rp.r+=0.8; rp.alpha*=0.97;
        ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${r},${g},${b},${rp.alpha*0.5})`; ctx.lineWidth=1; ctx.stroke();
        if (rp.r>rp.maxR||rp.alpha<0.01) ripples.splice(i,1);
      }
      rafId = requestAnimationFrame(draw);
    }

    init(); draw();
    let rt; window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(init,150);},{passive:true});
    window.addEventListener('unload',()=>cancelAnimationFrame(rafId),{once:true});
  }());

  /* ─────────────────────────────────────────────
     3. CURSOR SPOTLIGHT in hero
  ───────────────────────────────────────────── */
  (function initSpotlight() {
    if (reducedMotion || isTouchDevice) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--cursor-x', ((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
      hero.style.setProperty('--cursor-y', ((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
    }, { passive: true });
  }());

  /* ─────────────────────────────────────────────
     4. MAGNETIC BUTTONS
  ───────────────────────────────────────────── */
  (function initMagnetic() {
    if (reducedMotion || isTouchDevice) return;
    document.querySelectorAll('.btn, .btn-ghost-inv').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width/2)  * 0.3;
        const dy = (e.clientY - r.top  - r.height/2) * 0.3;
        btn.style.transform = `translate(${dx}px,${dy}px)`;
      }, { passive: true });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        btn.style.transform  = 'translate(0,0)';
        setTimeout(() => btn.style.transition = '', 500);
      }, { passive: true });
    });
  }());

  /* ─────────────────────────────────────────────
     5. CARD SPOTLIGHT BORDER
  ───────────────────────────────────────────── */
  (function initCardSpotlight() {
    if (reducedMotion || isTouchDevice) return;
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--card-x', (e.clientX-r.left)+'px');
        card.style.setProperty('--card-y', (e.clientY-r.top)+'px');
      }, { passive: true });
    });
  }());

  /* ─────────────────────────────────────────────
     6. NAV scroll-hide + scroll-spy
  ───────────────────────────────────────────── */
  (function initNav() {
    const nav = document.getElementById('nav');
    if (!nav || reducedMotion) return;
    let prevY = window.scrollY, ticking = false;
    document.addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if      (y > prevY && y > 80)  nav.classList.add('hidden');
        else if (y < prevY && y > 80)  nav.classList.remove('hidden');
        else if (y <= 80)              nav.classList.remove('hidden');
        prevY = y; ticking = false;
      });
    }, { passive: true });

    const links = document.querySelectorAll('.nav-links a');
    const ids   = ['work','capabilities','recognition','experience','contact'];
    const spy   = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) links.forEach(l =>
          l.classList.toggle('active', l.getAttribute('href')==='#'+e.target.id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ids.forEach(id => { const el=document.getElementById(id); if(el) spy.observe(el); });

    const toggle = document.querySelector('.nav-toggle');
    const menu   = document.getElementById('mobile-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded')==='true';
        toggle.setAttribute('aria-expanded', String(!open));
        menu.setAttribute('aria-hidden',     String(open));
        menu.classList.toggle('open', !open);
      });
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded','false');
        menu.setAttribute('aria-hidden','true');
        menu.classList.remove('open');
      }));
    }
  }());

  /* ─────────────────────────────────────────────
     7. ACOUSTIC WAVE
  ───────────────────────────────────────────── */
  (function initWave() {
    const path = document.getElementById('wpath');
    if (!path) return;
    const W=1440, H=100, mid=H*0.6, N=180;
    function build(t) {
      let d='M0,'+mid;
      for (let i=0;i<=N;i++) {
        const x=(i/N)*W, p=i/N;
        const env=Math.exp(-1.6*p)*(0.4+0.6*Math.sin(p*Math.PI));
        const y=mid+Math.sin(p*40+t)*28*env+Math.sin(p*13-t*0.6)*7*env;
        d+=' L'+x.toFixed(1)+','+y.toFixed(1);
      }
      path.setAttribute('d', d);
    }
    if (reducedMotion) { build(0); return; }
    let t=0, rafId;
    function loop() { t+=0.025; build(t); rafId=requestAnimationFrame(loop); }
    loop();
    window.addEventListener('unload',()=>cancelAnimationFrame(rafId),{once:true});
  }());

  /* ─────────────────────────────────────────────
     8. ROBOT COMPANION  (Three.js r128 vanilla)
     ─────────────────────────────────────────────
     Architecture: ONE small canvas (72×88px) in #robot-wrap.
     The wrap is positioned via JS to sit just left of each active
     section heading. overflow:hidden on the wrap + CSS translateX
     transition creates the "peek from behind heading" effect:
       hidden: wrap.translateX(-80px) — robot offscreen left
       visible: wrap.translateX(0)    — robot peeks out, clipped by overflow:hidden

     Section tracking: IntersectionObserver on each heading ID.
     When a heading enters the viewport, robot slides in next to it.
     When it leaves, robot slides back and repositions to the next.

     Robot design: compact (0.45 scale), cartoonish, big head, small body.
     Idle: gentle head bob + antenna wobble + visor pulse.
     On peek: happy bounce (scaleY overshoot then settle).
     No jump arc — the CSS spring transition IS the movement. Clean.

     Reduced motion: wrap appears instantly (transition:none override),
     no idle animation, no bounce.

     SKILL.md compliance:
       - Three.js vanilla, procedural geometry, zero external assets
       - ~1,200 triangles (simplified geometry vs previous version)
       - DPR capped at Math.min(devicePixelRatio, 2)
       - Hidden on tablet/mobile (max-width: 1024px)
       - WebGL fallback: display:none on wrap
       - Lights: 1 ambient + 1 directional
  ───────────────────────────────────────────── */
  (function initRobot() {
    // Hidden at tablet and below (CSS also hides it, JS exits early to save GPU)
    if (window.innerWidth <= 1024) return;

    const wrap   = document.getElementById('robot-wrap');
    const canvas = document.getElementById('robot-canvas');
    if (!wrap || !canvas) return;

    // WebGL fallback — hide wrap entirely
    const testCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!testCtx) { wrap.style.display = 'none'; return; }

    const THREE = window.THREE;
    if (!THREE) return;

    // ── Renderer: 72×88px, transparent bg ────────────────────
    const CW = 72, CH = 88;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(CW, CH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ── Scene + orthographic camera (flat cartoon look) ───────
    const scene = new THREE.Scene();
    // viewH controls how much of world space fits in the canvas height
    // Smaller viewH = robot appears larger relative to canvas
    const viewH = 5.5;
    const viewW = viewH * (CW / CH);
    const camera = new THREE.OrthographicCamera(
      -viewW/2, viewW/2, viewH/2, -viewH/2, 0.1, 50
    );
    camera.position.z = 10;

    // ── Color helpers ─────────────────────────────────────────
    function getAccentHex() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      return v.startsWith('#') ? v : '#2C6EAB';
    }

    // ── Materials ─────────────────────────────────────────────
    // Body: dark blue-grey, slightly shiny
    const matBody   = new THREE.MeshStandardMaterial({ color: 0x2a2e3d, roughness: 0.45, metalness: 0.35 });
    const matRim    = new THREE.MeshStandardMaterial({ color: 0x4a5060, roughness: 0.3,  metalness: 0.7  });
    const matVisorBg= new THREE.MeshStandardMaterial({ color: 0x080c14, roughness: 0.9                   });
    const matEye    = new THREE.MeshStandardMaterial({ color: 0xd8eeff, roughness: 0.2                   });
    const matBlush  = new THREE.MeshStandardMaterial({ color: 0xf07070, roughness: 1.0, transparent: true, opacity: 0.4 });

    // Accent: visor frame, antenna tip, chest stripe — theme-reactive
    const matAccent = new THREE.MeshStandardMaterial({
      color:   new THREE.Color(getAccentHex()),
      emissive: new THREE.Color(getAccentHex()),
      emissiveIntensity: 0.55,
      roughness: 0.1, metalness: 0.4,
    });
    const matPupil  = new THREE.MeshStandardMaterial({
      color:   new THREE.Color(getAccentHex()),
      emissive: new THREE.Color(getAccentHex()),
      emissiveIntensity: 1.0, roughness: 0.0,
    });

    // ── Robot group — scale down to fit snugly in 72×88 canvas ─
    const robot = new THREE.Group();
    scene.add(robot);
    robot.scale.setScalar(0.82); // calibrated so full robot fills ~80% of canvas height

    // All geometry built at "1 unit = roughly 1 unit of visual space"
    // then scaled by robot group. This keeps geometry readable.

    // ── BODY (torso) ──────────────────────────────────────────
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.95, 0.55),
      matBody
    );
    robot.add(body);

    // Chest accent stripe
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.15, 0.57),
      matAccent
    );
    stripe.position.set(0, 0.2, 0);
    robot.add(stripe);

    // Two chest buttons
    const btnGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8);
    const btn1 = new THREE.Mesh(btnGeo, matAccent);
    btn1.rotation.x = Math.PI / 2;
    btn1.position.set(-0.15, -0.05, 0.28);
    robot.add(btn1);
    const btn2 = btn1.clone();
    btn2.position.set( 0.1, -0.05, 0.28);
    robot.add(btn2);

    // ── WAIST + HIPS ──────────────────────────────────────────
    const hipMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.22, 0.48),
      new THREE.MeshStandardMaterial({ color: 0x3a3e50, roughness: 0.5, metalness: 0.2 })
    );
    hipMesh.position.y = -0.6;
    robot.add(hipMesh);

    // ── LEGS ──────────────────────────────────────────────────
    const legGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.42, 8);
    const legL   = new THREE.Mesh(legGeo, matBody);
    legL.position.set(-0.2, -0.95, 0);
    robot.add(legL);
    const legR = legL.clone();
    legR.position.set( 0.2, -0.95, 0);
    robot.add(legR);

    // Feet
    const footGeo = new THREE.BoxGeometry(0.26, 0.13, 0.35);
    const footL = new THREE.Mesh(footGeo, matRim);
    footL.position.set(-0.2, -1.22, 0.04);
    robot.add(footL);
    const footR = footL.clone();
    footR.position.set( 0.2, -1.22, 0.04);
    robot.add(footR);

    // ── ARMS ──────────────────────────────────────────────────
    // Arms as groups so we can rotate from shoulder
    const armGroupL = new THREE.Group();
    armGroupL.position.set(-0.6, 0.25, 0);
    robot.add(armGroupL);

    const upperL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.07, 0.38, 8),
      matBody
    );
    upperL.rotation.z = 0.25; // slight outward angle
    upperL.position.set(-0.06, -0.19, 0);
    armGroupL.add(upperL);

    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), matRim);
    handL.position.set(-0.1, -0.4, 0);
    armGroupL.add(handL);

    const armGroupR = new THREE.Group();
    armGroupR.position.set( 0.6, 0.25, 0);
    robot.add(armGroupR);

    const upperR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.07, 0.38, 8),
      matBody
    );
    upperR.rotation.z = -0.25;
    upperR.position.set( 0.06, -0.19, 0);
    armGroupR.add(upperR);

    const handR = handL.clone();
    handR.position.set( 0.1, -0.4, 0);
    armGroupR.add(handR);

    // ── HEAD ──────────────────────────────────────────────────
    // Head is big relative to body — cartoon proportion
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.85;
    robot.add(headGroup);

    const headMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.9, 0.78),
      matBody
    );
    headGroup.add(headMesh);

    // Ear nubs
    const earGeo = new THREE.BoxGeometry(0.09, 0.32, 0.12);
    const earL = new THREE.Mesh(earGeo, new THREE.MeshStandardMaterial({ color: 0x3d4258, roughness: 0.5, metalness: 0.2 }));
    earL.position.set(-0.57, 0, 0);
    headGroup.add(earL);
    const earR = earL.clone();
    earR.position.set( 0.57, 0, 0);
    headGroup.add(earR);

    // Ear accent rings
    const earRingGeo = new THREE.TorusGeometry(0.065, 0.018, 6, 12);
    const earRingL = new THREE.Mesh(earRingGeo, matAccent);
    earRingL.position.set(-0.58, 0, 0);
    earRingL.rotation.y = Math.PI / 2;
    headGroup.add(earRingL);
    const earRingR = earRingL.clone();
    earRingR.position.set( 0.58, 0, 0);
    headGroup.add(earRingR);

    // Visor frame (accent color)
    const visorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.48, 0.04),
      matAccent
    );
    visorFrame.position.set(0, 0.04, 0.41);
    headGroup.add(visorFrame);

    // Visor screen (dark inner)
    const visorScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.38, 0.03),
      matVisorBg
    );
    visorScreen.position.set(0, 0.04, 0.435);
    headGroup.add(visorScreen);

    // Eyes (on visor screen)
    const eyeGeo = new THREE.CircleGeometry(0.075, 12);
    const eyeL = new THREE.Mesh(eyeGeo, matEye);
    eyeL.position.set(-0.17, 0.07, 0.445);
    headGroup.add(eyeL);
    const eyeR = eyeL.clone();
    eyeR.position.set( 0.17, 0.07, 0.445);
    headGroup.add(eyeR);

    // Pupils
    const pupilGeo = new THREE.CircleGeometry(0.04, 10);
    const pupilL = new THREE.Mesh(pupilGeo, matPupil);
    pupilL.position.set(-0.17, 0.07, 0.448);
    headGroup.add(pupilL);
    const pupilR = pupilL.clone();
    pupilR.position.set( 0.17, 0.07, 0.448);
    headGroup.add(pupilR);

    // Blush circles (cute cheeks)
    const blushGeo = new THREE.CircleGeometry(0.07, 10);
    const blushL = new THREE.Mesh(blushGeo, matBlush);
    blushL.position.set(-0.3, -0.1, 0.449);
    headGroup.add(blushL);
    const blushR = blushL.clone();
    blushR.position.set( 0.3, -0.1, 0.449);
    headGroup.add(blushR);

    // Smile (torus segment)
    const smileGeo = new THREE.TorusGeometry(0.1, 0.018, 6, 12, Math.PI);
    const smileMat = new THREE.MeshStandardMaterial({ color: 0xd0e8f8, roughness: 0.5 });
    const smileMesh = new THREE.Mesh(smileGeo, smileMat);
    smileMesh.rotation.z = Math.PI;
    smileMesh.position.set(0, -0.1, 0.45);
    headGroup.add(smileMesh);

    // ── ANTENNA ───────────────────────────────────────────────
    const antennaGroup = new THREE.Group();
    antennaGroup.position.set(0.1, 0.46, 0);
    headGroup.add(antennaGroup);

    const stickMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.38, 8),
      matRim
    );
    stickMesh.position.y = 0.19;
    antennaGroup.add(stickMesh);

    const tipMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 8),
      matAccent
    );
    tipMesh.position.y = 0.42;
    antennaGroup.add(tipMesh);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(1.5, 3, 4);
    scene.add(dirLight);

    // ── Position robot centered in canvas, slightly up ────────
    // Robot total height ≈ 2.45 world units × 0.82 scale ≈ 2.0 units
    // viewH = 5.5, so robot fills ~36% of height — visible but not crammed
    robot.position.set(0, 0.2, 0); // centered, slightly above midpoint

    // Slight initial angle — facing left (toward content)
    robot.rotation.y = 0.25;

    // ── Section heading targets ───────────────────────────────
    const headingIds = [
      'heading-hero', 'heading-work', 'heading-capabilities',
      'heading-recognition', 'heading-experience', 'heading-contact'
    ];

    function positionWrapAtHeading(el) {
      // Place wrap so robot sits just left of the heading's left edge
      const rect    = el.getBoundingClientRect();
      const wrapTop = rect.top + window.scrollY;
      // top: align wrap center with heading's vertical center
      const newTop  = wrapTop + (rect.height / 2) - (CH / 2);
      // left: just left of content — robot peeks from left margin
      const newLeft = Math.max(rect.left - CW - 8, 4);

      // Snap top instantly (no slide), then slide in with CSS
      wrap.style.top      = newTop  + 'px';
      wrap.style.left     = newLeft + 'px';
    }

    let currentHeadingEl = null;
    let pendingVisible    = false;

    function showAtHeading(el) {
      // If already showing somewhere else, hide first then reposition
      if (currentHeadingEl && currentHeadingEl !== el && wrap.classList.contains('robot-visible')) {
        hideRobot(() => {
          positionWrapAtHeading(el);
          // Small delay so the instant reposition finishes before slide-in
          requestAnimationFrame(() => {
            wrap.classList.add('robot-visible');
            currentHeadingEl = el;
            triggerPeekBounce();
          });
        });
      } else {
        positionWrapAtHeading(el);
        wrap.classList.add('robot-visible');
        currentHeadingEl = el;
        triggerPeekBounce();
      }
    }

    function hideRobot(cb) {
      wrap.classList.remove('robot-visible');
      // Wait for transition (550ms) then callback
      setTimeout(() => { if (cb) cb(); }, 560);
    }

    // ── Peek bounce: robot does a happy squash-and-stretch
    //    on arrival — pure Three.js scale animation, not CSS ──
    let peekPhase = 0;  // 0 = idle, 1 = bouncing in
    let peekT     = 0;

    function triggerPeekBounce() {
      if (reducedMotion) return;
      peekPhase = 1;
      peekT     = 0;
    }

    // ── IntersectionObserver: one per heading ─────────────────
    // rootMargin: fires when heading enters the middle band of the viewport
    const headingObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          showAtHeading(el);
        } else {
          // If this was the current heading, slide robot away
          if (currentHeadingEl === el) {
            hideRobot(null);
            currentHeadingEl = null;
          }
        }
      });
    }, {
      // Fire when heading is between 15% from top and 60% from bottom of viewport
      rootMargin: '-15% 0px -35% 0px',
      threshold:  0,
    });

    headingIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) headingObs.observe(el);
    });

    // ── Theme change: update accent materials ─────────────────
    document.addEventListener('themechange', () => {
      setTimeout(() => {
        const c = new THREE.Color(getAccentHex());
        matAccent.color.set(c);   matAccent.emissive.set(c);  matAccent.needsUpdate = true;
        matPupil.color.set(c);    matPupil.emissive.set(c);   matPupil.needsUpdate  = true;
      }, 50);
    });

    // ── Render loop ───────────────────────────────────────────
    let idleT   = 0;
    let lastNow = performance.now();
    let rafId;

    function render(now) {
      rafId = requestAnimationFrame(render);
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow  = now;
      idleT   += dt;

      if (!reducedMotion) {
        // ── Idle animation: very gentle ────────────────────────
        // Head bobs slightly — pivot point is neck
        headGroup.rotation.z = Math.sin(idleT * 1.1) * 0.055;
        headGroup.position.y = 0.85 + Math.sin(idleT * 1.8) * 0.025;

        // Antenna wobbles — lagging the head bob slightly
        antennaGroup.rotation.z = Math.sin(idleT * 1.1 + 0.4) * 0.12;

        // Visor emissive breathes
        matAccent.emissiveIntensity = 0.45 + 0.2 * Math.sin(idleT * 2.5);
        matPupil.emissiveIntensity  = 0.8  + 0.3 * Math.sin(idleT * 2.5 + 0.8);

        // Arms swing very gently (idle breathing feel)
        armGroupL.rotation.z =  Math.sin(idleT * 1.1) * 0.06;
        armGroupR.rotation.z = -Math.sin(idleT * 1.1) * 0.06;

        // Body barely moves (grounded, stable)
        robot.rotation.y = 0.25 + Math.sin(idleT * 0.6) * 0.05;

        // ── Peek bounce animation ──────────────────────────────
        if (peekPhase === 1) {
          peekT += dt * 3.5; // speed of bounce
          // Spring overshoot then settle: scaleY starts low, overshoots 1, settles
          const t     = Math.min(peekT, 1);
          const spring = 1 + Math.sin(t * Math.PI) * 0.18 * (1 - t);
          robot.scale.y = 0.82 * spring;
          robot.scale.x = 0.82 * (2 - spring); // anti-squash: X is inverse
          if (peekT >= 1) {
            peekPhase = 0;
            robot.scale.setScalar(0.82); // reset to base scale
          }
        }
      }

      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);

    // ── Reposition on window resize ───────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (currentHeadingEl) positionWrapAtHeading(currentHeadingEl);
      }, 150);
    }, { passive: true });

    window.addEventListener('unload', () => {
      cancelAnimationFrame(rafId);
      headingObs.disconnect();
    }, { once: true });
  }());

  /* ─────────────────────────────────────────────
     9. STAT COUNT-UP
  ───────────────────────────────────────────── */
  (function initCountUp() {
    if (reducedMotion) return;
    const cells = document.querySelectorAll('.stat-n[data-target]');
    if (!cells.length) return;
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const el = entry.target, target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '', dur = 1400, start = performance.now();
        function easeOut(t) { return 1-Math.pow(1-t,3); }
        function tick(now) {
          const p = Math.min((now-start)/dur,1);
          el.textContent = Math.round(easeOut(p)*target)+suffix;
          if (p<1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    cells.forEach(c => obs.observe(c));
  }());

  /* ─────────────────────────────────────────────
     10. SCROLL REVEAL
  ───────────────────────────────────────────── */
  (function initReveal() {
    const selectors = ['.card','.cap-group','.tl-item','.rec-award-block',
                       '.rec-right','.thesis-lead','.thesis-body','.section-title'];
    if (reducedMotion) {
      selectors.forEach(sel =>
        document.querySelectorAll(sel).forEach(el => el.classList.add('visible')));
      return;
    }
    selectors.forEach(sel =>
      document.querySelectorAll(sel).forEach(el => el.classList.add('reveal')));
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    setTimeout(() => document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el)), 60);
  }());

  /* ─────────────────────────────────────────────
     11. TIMELINE DRAW LINE + DOTS
  ───────────────────────────────────────────── */
  (function initTimeline() {
    const tl = document.querySelector('.timeline');
    if (!tl || reducedMotion) return;
    const lineObs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { tl.classList.add('line-drawn'); lineObs.disconnect(); }
    }, { threshold: 0.15 });
    lineObs.observe(tl);
    const dotObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('dot-visible'); dotObs.unobserve(e.target); } });
    }, { threshold: 0.4 });
    document.querySelectorAll('.tl-item').forEach(item => dotObs.observe(item));
  }());

}());
