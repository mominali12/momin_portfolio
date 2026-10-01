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
     What it does:
       - Cute cartoon robot rendered in a fixed canvas on the right edge
       - Idle: body breathes, antenna bobs, visor glows with accent color
       - On scroll: watches each section heading with IntersectionObserver;
         when a heading exits the top of the screen the robot jumps to the
         Y position of the NEXT heading
       - Jump: parabolic arc (real projectile physics feel), squash on land,
         stretch on rise, wave arm animation after landing
       - Reduced motion: robot teleports, no squash/stretch

     SKILL.md:
       - Three.js vanilla (plain HTML, max control)
       - Procedural geometry, zero external assets
       - ~2,400 triangles total (sphere, boxes, cylinders, torus)
       - DPR capped at Math.min(devicePixelRatio, 2)
       - Mobile: early return + CSS display:none
       - WebGL fallback: hides canvas gracefully
       - Lights: 1 ambient + 1 directional (SKILL quick win)
  ───────────────────────────────────────────── */
  (function initRobot() {
    if (window.innerWidth <= 768) return;

    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;

    // WebGL fallback
    const testCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!testCtx) { canvas.style.display = 'none'; return; }

    const THREE = window.THREE;
    if (!THREE) return;

    // Canvas is fixed 110px wide, full viewport height
    const CW = 110;
    const CH = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(CW, CH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    // Orthographic camera: flat, cartoon look, no perspective distortion
    const aspect = CW / CH;
    const viewH  = 10; // 10 world units tall
    const viewW  = viewH * aspect;
    const camera = new THREE.OrthographicCamera(
      -viewW/2, viewW/2, viewH/2, -viewH/2, 0.1, 100
    );
    camera.position.z = 10;

    // ── Accent color helpers ─────────────────────────────────
    function getAccentHex() {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim();
      return v.startsWith('#') ? v : '#2C6EAB';
    }
    function getBgHex() {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue('--surface').trim();
      return v.startsWith('#') ? v : '#FFFFFF';
    }

    // ── Materials ────────────────────────────────────────────
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2e3d, roughness: 0.4, metalness: 0.3 });
    const bodyAccentMat = new THREE.MeshStandardMaterial({ color: 0x3d4258, roughness: 0.5, metalness: 0.2 });
    const rimMat  = new THREE.MeshStandardMaterial({ color: 0x5a6080, roughness: 0.3, metalness: 0.6 });

    // Visor and accent pieces: use accent color, emissive glow
    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(getAccentHex()),
      emissive: new THREE.Color(getAccentHex()),
      emissiveIntensity: 0.6,
      roughness: 0.1, metalness: 0.5,
    });

    // Eye whites
    const eyeMat  = new THREE.MeshStandardMaterial({ color: 0xd0e8f8, roughness: 0.3, metalness: 0.1 });
    // Eye pupils
    const pupilMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(getAccentHex()),
      emissive: new THREE.Color(getAccentHex()),
      emissiveIntensity: 1.0, roughness: 0.0, metalness: 0.0,
    });
    // Cheek blush
    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xf08080, roughness: 1.0, metalness: 0.0,
      transparent: true, opacity: 0.35,
    });

    // ── Robot group ──────────────────────────────────────────
    const robot = new THREE.Group();
    scene.add(robot);

    // Body: rounded box — main torso
    const bodyGeo  = new THREE.BoxGeometry(1.4, 1.6, 0.7, 1,1,1);
    const body     = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0;
    robot.add(body);

    // Body panel stripe (accent)
    const stripeGeo = new THREE.BoxGeometry(0.9, 0.25, 0.72);
    const stripe    = new THREE.Mesh(stripeGeo, accentMat);
    stripe.position.set(0, 0.3, 0);
    robot.add(stripe);

    // Chest button 1
    const btn1Geo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8);
    const btn1    = new THREE.Mesh(btn1Geo, accentMat);
    btn1.rotation.x = Math.PI / 2;
    btn1.position.set(-0.25, -0.1, 0.36);
    robot.add(btn1);
    // Chest button 2
    const btn2 = btn1.clone();
    btn2.position.set(0.05, -0.1, 0.36);
    robot.add(btn2);
    // Chest button 3
    const btn3 = btn1.clone();
    btn3.position.set(0.35, -0.1, 0.36);
    robot.add(btn3);

    // Waist ring
    const waistGeo = new THREE.TorusGeometry(0.72, 0.06, 8, 20);
    const waist    = new THREE.Mesh(waistGeo, rimMat);
    waist.position.y = -0.78;
    robot.add(waist);

    // Hips
    const hipGeo = new THREE.BoxGeometry(1.1, 0.3, 0.6);
    const hips   = new THREE.Mesh(hipGeo, bodyAccentMat);
    hips.position.y = -1.0;
    robot.add(hips);

    // Legs (two)
    const legGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.7, 8);
    const legL   = new THREE.Mesh(legGeo, bodyMat);
    legL.position.set(-0.32, -1.55, 0);
    robot.add(legL);
    const legR   = legL.clone();
    legR.position.set( 0.32, -1.55, 0);
    robot.add(legR);

    // Feet
    const footGeo = new THREE.BoxGeometry(0.42, 0.2, 0.55);
    const footL   = new THREE.Mesh(footGeo, rimMat);
    footL.position.set(-0.32, -2.0, 0.05);
    robot.add(footL);
    const footR   = footL.clone();
    footR.position.set( 0.32, -2.0, 0.05);
    robot.add(footR);

    // HEAD ─────────────────────────────────────────────────────
    const head = new THREE.Group();
    robot.add(head);
    head.position.y = 1.35;

    const headGeo  = new THREE.BoxGeometry(1.3, 1.1, 1.0, 1,1,1);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    head.add(headMesh);

    // Visor: large rounded rectangle on front of head
    const visorGeo  = new THREE.BoxGeometry(1.0, 0.55, 0.05);
    const visor     = new THREE.Mesh(visorGeo, accentMat);
    visor.position.set(0, 0.05, 0.53);
    head.add(visor);

    // Visor inner dark face
    const visorInGeo = new THREE.BoxGeometry(0.88, 0.44, 0.03);
    const visorInMat = new THREE.MeshStandardMaterial({ color: 0x0a0e18, roughness: 0.8 });
    const visorIn    = new THREE.Mesh(visorInGeo, visorInMat);
    visorIn.position.set(0, 0.05, 0.56);
    head.add(visorIn);

    // Eyes (on visor)
    const eyeGeo  = new THREE.CircleGeometry(0.1, 12);
    const eyeL    = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.22, 0.06, 0.575);
    head.add(eyeL);
    const eyeR    = eyeL.clone();
    eyeR.position.set( 0.22, 0.06, 0.575);
    head.add(eyeR);

    // Pupils
    const pupilGeo  = new THREE.CircleGeometry(0.055, 10);
    const pupilL    = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(-0.22, 0.06, 0.578);
    head.add(pupilL);
    const pupilR    = pupilL.clone();
    pupilR.position.set( 0.22, 0.06, 0.578);
    head.add(pupilR);

    // Cheeks
    const cheekGeo = new THREE.CircleGeometry(0.1, 10);
    const cheekL   = new THREE.Mesh(cheekGeo, blushMat);
    cheekL.position.set(-0.38, -0.1, 0.575);
    head.add(cheekL);
    const cheekR   = cheekL.clone();
    cheekR.position.set( 0.38, -0.1, 0.575);
    head.add(cheekR);

    // Smile — thin arc using a torus segment
    const smileGeo = new THREE.TorusGeometry(0.13, 0.025, 6, 12, Math.PI);
    const smileMat = new THREE.MeshStandardMaterial({ color: 0xd0e8f8, roughness: 0.5 });
    const smile    = new THREE.Mesh(smileGeo, smileMat);
    smile.rotation.z = Math.PI; // arc curves up
    smile.position.set(0, -0.15, 0.578);
    head.add(smile);

    // Ear panels
    const earGeo = new THREE.BoxGeometry(0.12, 0.45, 0.15);
    const earL   = new THREE.Mesh(earGeo, bodyAccentMat);
    earL.position.set(-0.71, 0.05, 0);
    head.add(earL);
    const earR   = earL.clone();
    earR.position.set( 0.71, 0.05, 0);
    head.add(earR);

    // Ear detail accent ring
    const earRingGeo = new THREE.TorusGeometry(0.1, 0.025, 6, 12);
    const earRingL   = new THREE.Mesh(earRingGeo, accentMat);
    earRingL.position.set(-0.72, 0.05, 0);
    earRingL.rotation.y = Math.PI / 2;
    head.add(earRingL);
    const earRingR   = earRingL.clone();
    earRingR.position.set( 0.72, 0.05, 0);
    head.add(earRingR);

    // ANTENNA ──────────────────────────────────────────────────
    const antenna = new THREE.Group();
    head.add(antenna);
    antenna.position.set(0, 0.55, 0);

    const stickGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.55, 8);
    const stick    = new THREE.Mesh(stickGeo, rimMat);
    stick.position.y = 0.275;
    antenna.add(stick);

    const tipGeo   = new THREE.SphereGeometry(0.1, 10, 8);
    const tip      = new THREE.Mesh(tipGeo, accentMat);
    tip.position.y = 0.6;
    antenna.add(tip);

    // ARMS ─────────────────────────────────────────────────────
    const armGroup = new THREE.Group(); // parent for wave animation
    robot.add(armGroup);

    const upperArmGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.6, 8);
    const armL         = new THREE.Group();
    armGroup.add(armL);
    armL.position.set(-0.9, 0.5, 0);

    const upperArmL = new THREE.Mesh(upperArmGeo, bodyMat);
    upperArmL.rotation.z = 0.3; // arms angled slightly down
    armL.add(upperArmL);

    const handGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const handL   = new THREE.Mesh(handGeo, rimMat);
    handL.position.set(-0.2, -0.35, 0);
    armL.add(handL);

    const armR = new THREE.Group();
    armGroup.add(armR);
    armR.position.set( 0.9, 0.5, 0);

    const upperArmR = new THREE.Mesh(upperArmGeo, bodyMat);
    upperArmR.rotation.z = -0.3;
    armR.add(upperArmR);

    const handR = handL.clone();
    handR.position.set( 0.2, -0.35, 0);
    armR.add(handR);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(2, 4, 6);
    scene.add(dir);

    // ── Position in world space ───────────────────────────────
    // Robot sits in center of the 110px wide canvas
    // viewW ≈ 1.83 world units (10 * 110/viewport_height)
    // We keep X at 0 (center of canvas)
    robot.position.x = 0;
    robot.position.y = 2; // start near top

    // ── Map screen Y → world Y ────────────────────────────────
    function screenYtoWorldY(screenY) {
      // screenY: pixels from top of viewport
      // canvas fills full viewport height
      const normalized = 1 - (screenY / CH) * 2; // +1 at top, -1 at bottom
      return normalized * (viewH / 2);
    }

    // ── Section headings the robot jumps between ──────────────
    // Collect all h2 section titles + the hero h1
    const jumpTargets = [];

    function collectTargets() {
      jumpTargets.length = 0;
      const h1 = document.querySelector('.hero-headline');
      if (h1) jumpTargets.push(h1);
      document.querySelectorAll('.section-title').forEach(h => jumpTargets.push(h));
      const contact = document.querySelector('.contact-headline');
      if (contact) jumpTargets.push(contact);
    }
    collectTargets();

    let currentTargetIndex = 0;

    function getTargetWorldY(el) {
      const rect = el.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      return screenYtoWorldY(midY);
    }

    // Initial position
    if (jumpTargets.length > 0) {
      robot.position.y = getTargetWorldY(jumpTargets[0]);
    }

    // ── Jump state ────────────────────────────────────────────
    let jumping       = false;
    let jumpFrom      = robot.position.y;
    let jumpTo        = robot.position.y;
    let jumpT         = 0;     // 0→1 progress
    const JUMP_DUR    = 0.55;  // seconds
    let   jumpElapsed = 0;
    let   lastTime    = performance.now();

    // Squash/stretch scale applied to body during jump
    let scaleY = 1.0, scaleX = 1.0;

    function startJump(targetIndex) {
      if (targetIndex < 0 || targetIndex >= jumpTargets.length) return;
      if (jumping) return; // mid-air: queue is ignored (simplicity over complexity)
      const targetEl = jumpTargets[targetIndex];
      jumpFrom  = robot.position.y;
      jumpTo    = getTargetWorldY(targetEl);
      jumpT     = 0;
      jumpElapsed = 0;
      jumping   = true;
      currentTargetIndex = targetIndex;
      // Trigger wave arm animation
      waveProgress = 0;
      waving = false; // will activate on land
    }

    // ── Arm wave state ────────────────────────────────────────
    let waving       = false;
    let waveProgress = 0;
    const WAVE_DUR   = 1.2; // seconds

    // ── Idle animation state ──────────────────────────────────
    let idleT = 0;

    // ── Easing functions ──────────────────────────────────────
    function easeInOutCubic(t) { return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }
    function easeOutBounce(t) {
      const n=7.5625, d=2.75;
      if (t<1/d) return n*t*t;
      if (t<2/d) return n*(t-=1.5/d)*t+0.75;
      if (t<2.5/d) return n*(t-=2.25/d)*t+0.9375;
      return n*(t-=2.625/d)*t+0.984375;
    }

    // ── IntersectionObserver: watch each heading ──────────────
    // When a heading exits the TOP of the screen (rootMargin pushes threshold up),
    // robot jumps to the NEXT heading.
    const headingObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          // Heading scrolled off the top — find which one and jump to next
          const idx = jumpTargets.indexOf(entry.target);
          if (idx !== -1 && idx + 1 < jumpTargets.length) {
            startJump(idx + 1);
          }
        }
      });
    }, {
      // rootMargin: negative top means "fire when element is within 20% of top"
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0,
    });

    jumpTargets.forEach(el => headingObs.observe(el));

    // ── Theme change: update accent materials ─────────────────
    document.addEventListener('themechange', () => {
      setTimeout(() => {
        const c = new THREE.Color(getAccentHex());
        accentMat.color.set(c); accentMat.emissive.set(c); accentMat.needsUpdate = true;
        pupilMat.color.set(c); pupilMat.emissive.set(c); pupilMat.needsUpdate = true;
      }, 50);
    });

    // ── Render loop ───────────────────────────────────────────
    let rafId;
    function render(now) {
      rafId = requestAnimationFrame(render);
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap dt at 50ms
      lastTime = now;
      idleT += dt;

      // Idle: body breathes (Y scale), antenna bobs, visor pulses
      if (!reducedMotion) {
        const breathe = Math.sin(idleT * 1.4) * 0.015;
        body.scale.y = 1 + breathe;
        body.scale.x = 1 - breathe * 0.5;
        antenna.rotation.z = Math.sin(idleT * 2.2) * 0.12;
        accentMat.emissiveIntensity = 0.5 + 0.2 * Math.sin(idleT * 3.0);
        pupilMat.emissiveIntensity  = 0.8 + 0.3 * Math.sin(idleT * 2.8 + 1.0);

        // Subtle left-right lean based on idle time
        robot.rotation.z = Math.sin(idleT * 0.8) * 0.04;
        // Face slightly toward viewer with gentle tilt
        robot.rotation.y = Math.sin(idleT * 0.5) * 0.1;
      }

      // Jump animation
      if (jumping) {
        jumpElapsed += dt;
        jumpT = Math.min(jumpElapsed / JUMP_DUR, 1);

        if (!reducedMotion) {
          // Parabolic arc: X stays fixed, Y follows ease curve
          const ease = easeInOutCubic(jumpT);
          robot.position.y = jumpFrom + (jumpTo - jumpFrom) * ease;

          // Arc height proportional to distance
          const dist = Math.abs(jumpTo - jumpFrom);
          const arcH = Math.min(dist * 0.7, 3.5);
          const arc  = Math.sin(jumpT * Math.PI) * arcH;
          robot.position.y += arc;

          // Squash on take-off and land, stretch mid-air
          const stretchPhase = Math.sin(jumpT * Math.PI);
          scaleY = 1.0 + stretchPhase * 0.28;
          scaleX = 1.0 - stretchPhase * 0.14;
          robot.scale.set(scaleX, scaleY, 1);

          // Lean forward on ascent, backward on descent
          robot.rotation.x = (0.5 - jumpT) * 0.3;
        } else {
          // Reduced motion: instant teleport
          robot.position.y = jumpTo;
          jumpT = 1;
        }

        if (jumpT >= 1) {
          // Landed
          jumping = false;
          robot.position.y = jumpTo;
          robot.scale.set(1, 1, 1);
          robot.rotation.x = 0;
          // Land squash: brief squash then spring back (handled in next idle frames)
          if (!reducedMotion) {
            scaleY = 0.78; scaleX = 1.22;
          }
          waving = true; waveProgress = 0;
        }
      } else {
        // Recover from land squash with spring
        if (!reducedMotion) {
          scaleY += (1 - scaleY) * 0.18;
          scaleX += (1 - scaleX) * 0.18;
          // Only apply if not overridden by idle breathe
          // (breathe is subtle enough to compose)
        }
      }

      // Wave arm after landing
      if (waving && !reducedMotion) {
        waveProgress += dt;
        const wp = Math.min(waveProgress / WAVE_DUR, 1);
        // Right arm waves up and down twice
        armR.rotation.z = -Math.sin(wp * Math.PI * 2) * 0.9;
        if (wp >= 1) { waving = false; armR.rotation.z = 0; }
      }

      // Update canvas size if viewport resized
      // (handled in resize listener below, not here)

      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);

    // ── Resize ────────────────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newCH = window.innerHeight;
        renderer.setSize(CW, newCH);
        camera.top    =  viewH / 2;
        camera.bottom = -viewH / 2;
        camera.updateProjectionMatrix();
        // Re-position robot to current target
        if (jumpTargets[currentTargetIndex]) {
          robot.position.y = getTargetWorldY(jumpTargets[currentTargetIndex]);
        }
      }, 150);
    }, { passive: true });

    window.addEventListener('unload', () => cancelAnimationFrame(rafId), { once: true });
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
