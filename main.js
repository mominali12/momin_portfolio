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
     Architecture — "walks across heading text":

     One wide canvas (full content-column width × 100px tall),
     absolutely positioned OVER each active section heading.
     Canvas background is transparent → heading text visible beneath.
     z-index:10 → robot overlays the heading text.
     Robot X-position animated in Three.js world space.

     State machine:
       HIDDEN      — canvas detached / off-left
       WALK_IN     — robot walks from left edge to idle spot
       IDLE        — robot standing, idle breathing animation
       WALK_OUT    — robot walks right off canvas edge
     Transitions are driven by IntersectionObserver (no raw scroll).

     Walk cycle (proper character animation):
       Legs:  legL sin(walkT),  legR sin(walkT+π)  [opposite phase]
       Arms:  armL sin(walkT+π), armR sin(walkT)   [opposite to leg]
       Body:  bobs up |sin(walkT)| * 0.035 per step
       Lean:  slight forward tilt when walking
     All driven by one walkT accumulator, speed proportional to
     actual X velocity so feet never slide.

     Reduced motion: robot appears instantly, no walk cycle.
  ───────────────────────────────────────────── */
  (function initRobot() {
    if (window.innerWidth <= 1024) return;

    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;

    const testCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!testCtx) { canvas.style.display = 'none'; return; }

    const THREE = window.THREE;
    if (!THREE) return;

    // ── Canvas dimensions ─────────────────────────────────────
    // Width: full wrap column (set dynamically when attached to heading)
    // Height: fixed 100px — just enough for the robot character
    const CH = 100;
    let   CW = 800; // will be updated when attached

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Orthographic camera ───────────────────────────────────
    // 1 world unit ≈ 1/scale of robot height
    // Robot character is ~2.4 units tall at base scale
    // We want it to fill ~70% of 100px → viewH tuned accordingly
    const scene = new THREE.Scene();
    let viewH = 4.2;          // world-space height visible
    let viewW = 4.2 * (CW / CH); // updated on resize
    let camera = new THREE.OrthographicCamera(
      -viewW/2, viewW/2, viewH/2, -viewH/2, 0.1, 50
    );
    camera.position.z = 10;

    function updateCamera() {
      viewW = viewH * (CW / CH);
      camera.left   = -viewW/2;
      camera.right  =  viewW/2;
      camera.top    =  viewH/2;
      camera.bottom = -viewH/2;
      camera.updateProjectionMatrix();
    }

    // ── Accent color helper ───────────────────────────────────
    function getAccentHex() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      return v.startsWith('#') ? v : '#2C6EAB';
    }

    // ── Materials ─────────────────────────────────────────────
    const matBody    = new THREE.MeshStandardMaterial({ color: 0x252836, roughness: 0.4, metalness: 0.4 });
    const matRim     = new THREE.MeshStandardMaterial({ color: 0x3e4460, roughness: 0.3, metalness: 0.7 });
    const matHip     = new THREE.MeshStandardMaterial({ color: 0x2e3248, roughness: 0.5, metalness: 0.3 });
    const matVisorBg = new THREE.MeshStandardMaterial({ color: 0x060a12, roughness: 0.9 });
    const matEye     = new THREE.MeshStandardMaterial({ color: 0xdcf0ff, roughness: 0.2 });
    const matBlush   = new THREE.MeshStandardMaterial({ color: 0xee7070, transparent: true, opacity: 0.42, roughness: 1.0 });
    const matSmile   = new THREE.MeshStandardMaterial({ color: 0xc8e8ff, roughness: 0.4 });

    const matAccent  = new THREE.MeshStandardMaterial({
      color:    new THREE.Color(getAccentHex()),
      emissive: new THREE.Color(getAccentHex()),
      emissiveIntensity: 0.5,
      roughness: 0.1, metalness: 0.4,
    });
    const matPupil   = new THREE.MeshStandardMaterial({
      color:    new THREE.Color(getAccentHex()),
      emissive: new THREE.Color(getAccentHex()),
      emissiveIntensity: 1.1, roughness: 0.0,
    });

    // ── Robot geometry ────────────────────────────────────────
    // Scale: built at natural size, then robot.scale = 0.78
    const robot = new THREE.Group();
    scene.add(robot);
    robot.scale.setScalar(0.78);

    // BODY
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.9, 0.52), matBody);
    robot.add(body);

    // Chest stripe
    robot.add(Object.assign(
      new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.14, 0.54), matAccent),
      { position: new THREE.Vector3(0, 0.19, 0) }
    ));

    // Chest button pair
    const btnG = new THREE.CylinderGeometry(0.048, 0.048, 0.055, 8);
    [-0.14, 0.09].forEach(x => {
      const b = new THREE.Mesh(btnG, matAccent);
      b.rotation.x = Math.PI / 2;
      b.position.set(x, -0.04, 0.27);
      robot.add(b);
    });

    // HIPS
    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.20, 0.46), matHip);
    hips.position.y = -0.57;
    robot.add(hips);

    // LEGS — stored for walk animation
    const legGeo  = new THREE.CylinderGeometry(0.13, 0.105, 0.40, 8);
    const legPivL = new THREE.Group(); // pivot at hip joint
    const legPivR = new THREE.Group();
    legPivL.position.set(-0.19, -0.57, 0);
    legPivR.position.set( 0.19, -0.57, 0);
    robot.add(legPivL, legPivR);

    const legMeshL = new THREE.Mesh(legGeo, matBody);
    const legMeshR = new THREE.Mesh(legGeo, matBody);
    legMeshL.position.y = -0.20; // offset from pivot center
    legMeshR.position.y = -0.20;
    legPivL.add(legMeshL);
    legPivR.add(legMeshR);

    // Feet — children of leg pivots so they follow leg rotation
    const footG = new THREE.BoxGeometry(0.24, 0.12, 0.32);
    const footL = new THREE.Mesh(footG, matRim);
    const footR = new THREE.Mesh(footG, matRim);
    footL.position.set(0, -0.41, 0.04);
    footR.position.set(0, -0.41, 0.04);
    legPivL.add(footL);
    legPivR.add(footR);

    // ARMS — pivot at shoulder
    const armGeo  = new THREE.CylinderGeometry(0.082, 0.065, 0.36, 8);
    const armPivL = new THREE.Group();
    const armPivR = new THREE.Group();
    armPivL.position.set(-0.56, 0.22, 0);
    armPivR.position.set( 0.56, 0.22, 0);
    robot.add(armPivL, armPivR);

    const armMeshL = new THREE.Mesh(armGeo, matBody);
    const armMeshR = new THREE.Mesh(armGeo, matBody);
    armMeshL.position.y = -0.18;
    armMeshR.position.y = -0.18;
    armPivL.add(armMeshL);
    armPivR.add(armMeshR);

    // Hands
    const handG = new THREE.SphereGeometry(0.095, 8, 8);
    const handL = new THREE.Mesh(handG, matRim);
    const handR = new THREE.Mesh(handG, matRim);
    handL.position.set(0, -0.38, 0);
    handR.position.set(0, -0.38, 0);
    armPivL.add(handL);
    armPivR.add(handR);

    // HEAD — larger pivot group so head bob works from neck
    const headPiv = new THREE.Group();
    headPiv.position.y = 0.82;
    robot.add(headPiv);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.88, 0.76), matBody);
    headPiv.add(headMesh);

    // Ear nubs
    const earG = new THREE.BoxGeometry(0.08, 0.30, 0.11);
    const earMatDark = new THREE.MeshStandardMaterial({ color: 0x363c54, roughness: 0.5, metalness: 0.2 });
    [-0.55, 0.55].forEach(x => {
      const ear = new THREE.Mesh(earG, earMatDark);
      ear.position.set(x, 0, 0);
      headPiv.add(ear);
      // Ear ring
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.017, 6, 12), matAccent);
      ring.position.set(x, 0, 0);
      ring.rotation.y = Math.PI / 2;
      headPiv.add(ring);
    });

    // Visor frame
    const visorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.46, 0.038), matAccent);
    visorFrame.position.set(0, 0.04, 0.40);
    headPiv.add(visorFrame);

    // Visor screen
    const visorScreen = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.37, 0.028), matVisorBg);
    visorScreen.position.set(0, 0.04, 0.425);
    headPiv.add(visorScreen);

    // Eyes (pairs)
    const eyeG   = new THREE.CircleGeometry(0.072, 12);
    const pupilG  = new THREE.CircleGeometry(0.038, 10);
    [-0.165, 0.165].forEach((x, i) => {
      const eye = new THREE.Mesh(eyeG, matEye);
      eye.position.set(x, 0.07, 0.438);
      headPiv.add(eye);
      const pupil = new THREE.Mesh(pupilG, matPupil);
      pupil.position.set(x, 0.07, 0.441);
      headPiv.add(pupil);
    });

    // Cheeks
    const blushG = new THREE.CircleGeometry(0.065, 10);
    [-0.29, 0.29].forEach(x => {
      const b = new THREE.Mesh(blushG, matBlush);
      b.position.set(x, -0.09, 0.440);
      headPiv.add(b);
    });

    // Smile
    const smileMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.095, 0.017, 6, 12, Math.PI),
      matSmile
    );
    smileMesh.rotation.z = Math.PI;
    smileMesh.position.set(0, -0.09, 0.440);
    headPiv.add(smileMesh);

    // ANTENNA
    const antennaPiv = new THREE.Group();
    antennaPiv.position.set(0.09, 0.45, 0);
    headPiv.add(antennaPiv);

    const antStick = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.36, 8), matRim);
    antStick.position.y = 0.18;
    antennaPiv.add(antStick);

    const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), matAccent);
    antTip.position.y = 0.40;
    antennaPiv.add(antTip);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(2, 4, 5);
    scene.add(dirLight);
    // Soft fill from left
    const fillLight = new THREE.DirectionalLight(0xd0e8ff, 0.25);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    // ── Initial robot position ────────────────────────────────
    // Feet "floor" should be at Y = -viewH/2 + small margin
    // Robot feet bottom ≈ -1.35 world units below robot.position.y at scale 0.78
    // → robot.position.y = -viewH/2 + 1.35*0.78 + margin
    function floorY() {
      return -viewH/2 + 1.05 * 0.78 + 0.1;
    }
    robot.position.y = floorY();
    robot.position.z = 0;

    // ── State machine ─────────────────────────────────────────
    const STATE = { HIDDEN: 0, WALK_IN: 1, IDLE: 2, WALK_OUT: 3 };
    let state    = STATE.HIDDEN;

    // World-space X positions
    // Left edge of canvas in world space = -viewW/2
    // Robot starts just off the left edge
    function leftEdge()  { return -viewW/2 - 1.0; } // start: off left
    function idleX()     { return -viewW/2 + 1.4;  } // rest: 1.4 units in from left
    function rightEdge() { return  viewW/2 + 1.0;  } // walk-out target: off right

    robot.position.x = leftEdge(); // hidden initially

    // ── Walk cycle state ──────────────────────────────────────
    let walkT      = 0;    // ever-accumulating phase (radians * time)
    let walkSpeed  = 0;    // current world-units/sec horizontal speed
    let targetX    = leftEdge(); // where we're heading
    let currentX   = leftEdge();

    // Walk cycle amplitude
    const LEG_AMP  = 0.38; // max leg rotation (radians)
    const ARM_AMP  = 0.28; // max arm rotation
    const HEAD_BOB = 0.028; // head Y offset per step

    // Spring for smooth X movement (critically damped spring)
    // dx_dt tracked for natural deceleration
    let velX = 0;
    const SPRING_K   = 18;  // stiffness
    const SPRING_D   = 7;   // damping (critically damped ~= 2*sqrt(k))

    function springStep(dt) {
      const force = SPRING_K * (targetX - currentX) - SPRING_D * velX;
      velX    += force * dt;
      currentX += velX  * dt;
      walkSpeed = Math.abs(velX);
    }

    // ── Idle breathing state ──────────────────────────────────
    let idleT = 0;

    // ── Heading targets ───────────────────────────────────────
    const headingIds = [
      'heading-hero', 'heading-work', 'heading-capabilities',
      'heading-recognition', 'heading-experience', 'heading-contact'
    ];

    // Map each heading el → its host section/header element
    function getHostSection(headingEl) {
      // Walk up to the nearest section or header
      let el = headingEl.parentElement;
      while (el && el !== document.body) {
        if (el.tagName === 'SECTION' || el.tagName === 'HEADER') return el;
        el = el.parentElement;
      }
      return headingEl.parentElement;
    }

    // ── Attach canvas over a heading ──────────────────────────
    // Canvas is absolutely positioned inside the heading's .wrap div
    // positioned so its bottom edge aligns with the heading's bottom
    let activeHeadingEl   = null;
    let activeWrapEl      = null;

    function attachToHeading(headingEl) {
      if (activeHeadingEl === headingEl) return;

      // Find the .wrap container inside the section
      const section = getHostSection(headingEl);
      const wrapEl  = section.querySelector('.wrap') || section;
      activeWrapEl  = wrapEl;
      activeHeadingEl = headingEl;

      // Make wrap position:relative so canvas absolute works
      wrapEl.style.position = 'relative';

      // Canvas width = wrap width
      const wrapRect    = wrapEl.getBoundingClientRect();
      CW                = wrapRect.width;
      canvas.width      = CW * Math.min(window.devicePixelRatio, 2);
      canvas.height     = CH * Math.min(window.devicePixelRatio, 2);
      canvas.style.width  = CW + 'px';
      canvas.style.height = CH + 'px';
      renderer.setSize(CW, CH);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      updateCamera();

      // Position canvas: top = heading's offsetTop - (canvas_height - heading_height) / 2
      // So robot feet rest on the top of the heading text
      const headingOffsetTop = headingEl.offsetTop;
      const headingH         = headingEl.offsetHeight;
      // Robot feet bottom world Y = floorY() * scale ≈ -viewH/2 * (CH/viewH_px_ratio)
      // We want feet to align with heading top edge → canvas bottom = heading top
      canvas.style.top  = (headingOffsetTop - CH + headingH * 0.55) + 'px';
      canvas.style.left = '0px';

      // Move canvas into this wrap (removes from previous parent automatically)
      wrapEl.appendChild(canvas);
    }

    function detachCanvas() {
      if (canvas.parentElement && canvas.parentElement !== document.body) {
        // Don't remove — just reset active tracking
      }
      activeHeadingEl = null;
    }

    // ── Transition helpers ────────────────────────────────────
    function startWalkIn(headingEl) {
      attachToHeading(headingEl);
      robot.position.x = leftEdge();
      currentX         = leftEdge();
      velX             = 0;
      targetX          = idleX();
      state            = STATE.WALK_IN;
      // Face right (walking toward content)
      robot.rotation.y = -0.15;
    }

    function startWalkOut() {
      targetX  = rightEdge();
      state    = STATE.WALK_OUT;
      robot.rotation.y = -0.15; // still facing right
    }

    function goIdle() {
      state = STATE.IDLE;
      targetX  = idleX();
      // Robot settles, faces viewer slightly
      robot.rotation.y = 0.12;
    }

    // ── IntersectionObserver ──────────────────────────────────
    // Fires when heading enters/leaves a wide central band of viewport
    const headingObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          if (state === STATE.HIDDEN || activeHeadingEl !== el) {
            startWalkIn(el);
          }
        } else {
          if (activeHeadingEl === el && state !== STATE.HIDDEN) {
            startWalkOut();
          }
        }
      });
    }, {
      rootMargin: '-5% 0px -30% 0px',
      threshold:   0,
    });

    headingIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) headingObs.observe(el);
    });

    // ── Theme change ──────────────────────────────────────────
    document.addEventListener('themechange', () => {
      setTimeout(() => {
        const c = new THREE.Color(getAccentHex());
        matAccent.color.set(c); matAccent.emissive.set(c); matAccent.needsUpdate = true;
        matPupil.color.set(c);  matPupil.emissive.set(c);  matPupil.needsUpdate  = true;
      }, 50);
    });

    // ── Render loop ───────────────────────────────────────────
    let lastNow = performance.now();
    let rafId;

    function render(now) {
      rafId = requestAnimationFrame(render);
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow  = now;
      idleT   += dt;

      if (reducedMotion) {
        // Reduced motion: snap to idle position, no animation
        if (state === STATE.WALK_IN) {
          robot.position.x = idleX();
          currentX = idleX();
          goIdle();
        } else if (state === STATE.WALK_OUT) {
          state = STATE.HIDDEN;
          detachCanvas();
        }
        renderer.render(scene, camera);
        return;
      }

      // ── Spring physics for X position ──────────────────────
      springStep(dt);
      robot.position.x = currentX;
      robot.position.y = floorY();

      // ── State transitions ───────────────────────────────────
      const arrivedAtIdle  = state === STATE.WALK_IN  && Math.abs(currentX - idleX())    < 0.08 && Math.abs(velX) < 0.1;
      const arrivedAtRight = state === STATE.WALK_OUT && currentX > rightEdge() - 0.15;

      if (arrivedAtIdle) {
        goIdle();
        velX = 0;
        currentX = idleX();
        robot.position.x = idleX();
      }
      if (arrivedAtRight) {
        state = STATE.HIDDEN;
        velX  = 0;
        robot.position.x = leftEdge();
        currentX = leftEdge();
        detachCanvas();
      }

      // ── Walk cycle (runs whenever moving significantly) ─────
      const isWalking = Math.abs(velX) > 0.05;
      if (isWalking) {
        // walkT advances proportional to |velocity| so feet don't slide
        walkT += dt * Math.abs(velX) * 3.2;
      }

      const legSwing    = isWalking ? LEG_AMP * Math.sin(walkT) : 0;
      const armSwing    = isWalking ? ARM_AMP * Math.sin(walkT) : 0;
      const bodyBob     = isWalking ? Math.abs(Math.sin(walkT)) * HEAD_BOB : 0;

      // Legs: opposite phase
      legPivL.rotation.x =  legSwing;
      legPivR.rotation.x = -legSwing;

      // Arms: opposite to same-side leg (natural walking)
      armPivL.rotation.x = -armSwing; // left arm forward when right leg forward
      armPivR.rotation.x =  armSwing;

      // Body bobs up on each step
      body.position.y = bodyBob;

      // ── Idle animation (when not walking) ──────────────────
      if (!isWalking) {
        // Gentle head tilt
        headPiv.rotation.z = Math.sin(idleT * 0.9) * 0.042;
        // Head bob (independent of walk)
        headPiv.position.y = 0.82 + Math.sin(idleT * 1.6) * 0.018;
        // Antenna sway, slight lag behind head
        antennaPiv.rotation.z = Math.sin(idleT * 0.9 + 0.5) * 0.10;
        // Arms gentle swing
        armPivL.rotation.x = Math.sin(idleT * 0.9) * 0.05;
        armPivR.rotation.x = Math.sin(idleT * 0.9 + Math.PI) * 0.05;
        // Very slight body lean
        robot.rotation.y = 0.12 + Math.sin(idleT * 0.55) * 0.04;
      } else {
        // While walking: head stays relatively stable (looks determined)
        headPiv.rotation.z   = Math.sin(walkT * 0.5) * 0.02;
        headPiv.position.y   = 0.82 + bodyBob;
        antennaPiv.rotation.z = Math.sin(walkT + 0.3) * 0.15;
        // Slight forward lean when walking
        robot.rotation.x = -0.06;
      }

      // ── Visor/pupil glow pulse (always on) ─────────────────
      matAccent.emissiveIntensity = 0.42 + 0.18 * Math.sin(idleT * 2.2);
      matPupil.emissiveIntensity  = 0.80 + 0.28 * Math.sin(idleT * 2.2 + 0.9);

      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);

    // ── Resize handler ────────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (activeWrapEl) {
          const wr = activeWrapEl.getBoundingClientRect();
          CW = wr.width;
          canvas.style.width = CW + 'px';
          renderer.setSize(CW, CH);
          updateCamera();
        }
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
