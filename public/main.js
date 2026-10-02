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
     Architecture (fixed canvas, correct this time):

     Canvas is position:fixed, full-viewport-width × 110px tall.
     It is always present in the DOM — no moving between sections.
     JS repositions it (top/left via style) to overlap the active
     heading. Because it is fixed, getBoundingClientRect() gives
     exact screen coords at all times.

     Robot walks in world X space. World ↔ screen mapping is
     consistent because we use the same canvas and camera always.

     State machine: HIDDEN → WALK_IN → IDLE → WALK_OUT → HIDDEN
     Spring physics drive X position (critically damped spring).
     Walk cycle drives legs/arms proportional to velocity.

     Bugs fixed vs previous version:
       ✓ Canvas never moves in DOM (no offsetTop drift)
       ✓ renderer.setSize() is the single source of truth for dimensions
       ✓ leftEdge/idleX/rightEdge computed from fresh viewW after camera update
       ✓ Canvas visible immediately (fixed positioning, always rendered)
       ✓ detachCanvas actually hides the canvas
  ───────────────────────────────────────────── */
  (function initRobot() {
    // WebGL robot: desktop only (>1024px). Mobile uses 2D canvas instead.
    const isMobileSize = window.innerWidth <= 1024;
    if (isMobileSize) return;

    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;

    // WebGL check
    const testGL = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!testGL) { canvas.style.display = 'none'; return; }

    const THREE = window.THREE;
    if (!THREE) return;

    // ── Fixed canvas dimensions ───────────────────────────────
    // Width: full viewport width so robot can walk across any heading
    // Height: 110px — tall enough for robot + a little clearance
    const CH = 110;
    let   CW = window.innerWidth;

    // Apply fixed positioning immediately so canvas is always in the right layer
    Object.assign(canvas.style, {
      position:      'fixed',
      left:          '0',
      top:           '-200px',   // parked off screen until first heading is active
      width:         CW + 'px',
      height:        CH + 'px',
      pointerEvents: 'none',
      zIndex:        '35',
      display:       'block',
    });

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);  // fully transparent background
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(CW, CH);             // single source of truth for dimensions

    // ── Orthographic camera ───────────────────────────────────
    // viewH = how many world units fit in CH pixels
    // Robot is ~2.4 units tall at scale 0.78 → fills ~65% of 110px
    const scene = new THREE.Scene();
    const viewH = 4.5;
    let   viewW = viewH * (CW / CH);

    const camera = new THREE.OrthographicCamera(
      -viewW / 2, viewW / 2, viewH / 2, -viewH / 2, 0.1, 50
    );
    camera.position.z = 10;

    function syncCamera() {
      viewW = viewH * (CW / CH);
      camera.left   = -viewW / 2;
      camera.right   =  viewW / 2;
      camera.top     =  viewH / 2;
      camera.bottom  = -viewH / 2;
      camera.updateProjectionMatrix();
    }

    // ── Accent color ──────────────────────────────────────────
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
      color: new THREE.Color(getAccentHex()), emissive: new THREE.Color(getAccentHex()),
      emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.4,
    });
    const matPupil = new THREE.MeshStandardMaterial({
      color: new THREE.Color(getAccentHex()), emissive: new THREE.Color(getAccentHex()),
      emissiveIntensity: 1.1, roughness: 0.0,
    });

    // ── Robot geometry ────────────────────────────────────────
    const robot = new THREE.Group();
    scene.add(robot);
    robot.scale.setScalar(0.78);

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.9, 0.52), matBody);
    robot.add(body);

    // Chest stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.14, 0.54), matAccent);
    stripe.position.set(0, 0.19, 0);
    robot.add(stripe);

    // Chest buttons
    const btnG = new THREE.CylinderGeometry(0.048, 0.048, 0.055, 8);
    [-0.14, 0.09].forEach(x => {
      const b = new THREE.Mesh(btnG, matAccent);
      b.rotation.x = Math.PI / 2;
      b.position.set(x, -0.04, 0.27);
      robot.add(b);
    });

    // Hips
    const hips = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.20, 0.46), matHip);
    hips.position.y = -0.57;
    robot.add(hips);

    // Legs — pivot groups so rotation is from hip joint
    const legGeo  = new THREE.CylinderGeometry(0.13, 0.105, 0.40, 8);
    const footGeo = new THREE.BoxGeometry(0.24, 0.12, 0.32);
    const legPivL = new THREE.Group(); legPivL.position.set(-0.19, -0.57, 0); robot.add(legPivL);
    const legPivR = new THREE.Group(); legPivR.position.set( 0.19, -0.57, 0); robot.add(legPivR);
    [legPivL, legPivR].forEach(piv => {
      const leg  = new THREE.Mesh(legGeo, matBody);  leg.position.y  = -0.20; piv.add(leg);
      const foot = new THREE.Mesh(footGeo, matRim);  foot.position.set(0, -0.41, 0.04); piv.add(foot);
    });

    // Arms — pivot groups from shoulder
    const armGeo  = new THREE.CylinderGeometry(0.082, 0.065, 0.36, 8);
    const handGeo = new THREE.SphereGeometry(0.095, 8, 8);
    const armPivL = new THREE.Group(); armPivL.position.set(-0.56, 0.22, 0); robot.add(armPivL);
    const armPivR = new THREE.Group(); armPivR.position.set( 0.56, 0.22, 0); robot.add(armPivR);
    [armPivL, armPivR].forEach(piv => {
      const arm  = new THREE.Mesh(armGeo, matBody);  arm.position.y  = -0.18; piv.add(arm);
      const hand = new THREE.Mesh(handGeo, matRim);  hand.position.y = -0.38; piv.add(hand);
    });

    // Head — pivot at neck for bob
    const headPiv = new THREE.Group(); headPiv.position.y = 0.82; robot.add(headPiv);
    headPiv.add(new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.88, 0.76), matBody));

    // Ears + ear rings
    const earG = new THREE.BoxGeometry(0.08, 0.30, 0.11);
    const earMatDark = new THREE.MeshStandardMaterial({ color: 0x363c54, roughness: 0.5 });
    [-0.55, 0.55].forEach(x => {
      const ear = new THREE.Mesh(earG, earMatDark); ear.position.x = x; headPiv.add(ear);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.017, 6, 12), matAccent);
      ring.position.x = x; ring.rotation.y = Math.PI / 2; headPiv.add(ring);
    });

    // Visor frame + screen
    const vf = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.46, 0.038), matAccent);
    vf.position.set(0, 0.04, 0.40); headPiv.add(vf);
    const vs = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.37, 0.028), matVisorBg);
    vs.position.set(0, 0.04, 0.425); headPiv.add(vs);

    // Eyes + pupils
    [-0.165, 0.165].forEach(x => {
      const eye = new THREE.Mesh(new THREE.CircleGeometry(0.072, 12), matEye);
      eye.position.set(x, 0.07, 0.438); headPiv.add(eye);
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.038, 10), matPupil);
      pupil.position.set(x, 0.07, 0.441); headPiv.add(pupil);
    });

    // Cheeks + smile
    [-0.29, 0.29].forEach(x => {
      const b = new THREE.Mesh(new THREE.CircleGeometry(0.065, 10), matBlush);
      b.position.set(x, -0.09, 0.440); headPiv.add(b);
    });
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.017, 6, 12, Math.PI), matSmile);
    smile.rotation.z = Math.PI; smile.position.set(0, -0.09, 0.440); headPiv.add(smile);

    // Antenna
    const antPiv = new THREE.Group(); antPiv.position.set(0.09, 0.45, 0); headPiv.add(antPiv);
    const antStick = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.36, 8), matRim);
    antStick.position.y = 0.18; antPiv.add(antStick);
    const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), matAccent);
    antTip.position.y = 0.40; antPiv.add(antTip);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.78));
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(2, 4, 5); scene.add(dir);
    const fill = new THREE.DirectionalLight(0xd0e8ff, 0.25);
    fill.position.set(-3, 1, 2); scene.add(fill);

    // ── World-space helpers ───────────────────────────────────
    // Robot "floor": bottom of canvas in world = -viewH/2
    // Robot feet hang ~(0.41+0.06)*0.78 ≈ 0.37 below robot.position.y
    // So robot.position.y = -viewH/2 + 0.37 + small margin
    const ROBOT_FEET_OFFSET = 0.37; // world units from robot Y to foot bottom
    const FLOOR_MARGIN      = 0.12;
    const FLOOR_Y = -viewH / 2 + ROBOT_FEET_OFFSET + FLOOR_MARGIN;

    robot.position.set(0, FLOOR_Y, 0);

    // X positions — computed fresh after syncCamera()
    // leftEdge: 1 unit past left edge of canvas (off-screen)
    // idleX: just inside left side, about 1.3 world units in
    // rightEdge: 1 unit past right edge
    function leftEdge()  { return -viewW / 2 - 1.2; }
    function idleX()     { return -viewW / 2 + 1.5; }
    function rightEdge() { return  viewW / 2 + 1.2; }

    // ── State machine ─────────────────────────────────────────
    const STATE = { HIDDEN: 0, WALK_IN: 1, IDLE: 2, WALK_OUT: 3 };
    let state = STATE.HIDDEN;

    // ── Spring physics ────────────────────────────────────────
    let currentX = leftEdge();
    let targetX  = leftEdge();
    let velX     = 0;
    robot.position.x = currentX;

    const SPRING_K = 16; // stiffness
    const SPRING_D =  7; // damping (near-critical: 2*sqrt(16)=8)

    function springStep(dt) {
      const f = SPRING_K * (targetX - currentX) - SPRING_D * velX;
      velX     += f * dt;
      currentX += velX * dt;
    }

    // ── Walk cycle ────────────────────────────────────────────
    let walkT = 0;
    const LEG_AMP  = 0.40;
    const ARM_AMP  = 0.30;
    const HEAD_BOB = 0.03;

    // ── Canvas visibility ─────────────────────────────────────
    // Park canvas off-screen when hidden (avoids layout issues)
    function hideCanvas()  { canvas.style.top = '-300px'; }
    function showCanvas(screenTop) {
      // screenTop: pixels from top of viewport where canvas top edge should be
      canvas.style.top = Math.round(screenTop) + 'px';
    }

    // ── Active heading tracking ───────────────────────────────
    let activeEl = null;

    function positionCanvasAtHeading(headingEl) {
      const rect = headingEl.getBoundingClientRect();
      // We want robot feet to stand on the heading's top edge.
      // Canvas bottom = heading top, so canvas top = heading top - CH.
      // Or: center canvas on heading vertically for the "walks on text" feel.
      // "Walks on top of text" → canvas bottom aligns with heading bottom edge,
      // so robot feet are on the bottom of the heading text line.
      const canvasTop = rect.bottom - CH + 10; // 10px overlap so feet touch text top
      showCanvas(canvasTop);
    }

    // ── Transitions ───────────────────────────────────────────
    function startWalkIn(el) {
      activeEl = el;
      positionCanvasAtHeading(el);
      // Reset to left edge — robot enters from left
      currentX = leftEdge();
      velX     = 0;
      robot.position.x = currentX;
      targetX  = idleX();
      state    = STATE.WALK_IN;
      robot.rotation.y = -0.12; // face right (into content)
    }

    function startWalkOut() {
      targetX = rightEdge();
      state   = STATE.WALK_OUT;
      robot.rotation.y = -0.12;
    }

    function arrivedIdle() {
      state    = STATE.IDLE;
      targetX  = idleX();
      velX     = 0;
      currentX = idleX();
      robot.position.x = currentX;
      robot.rotation.y = 0.14; // face viewer
    }

    function arrivedHidden() {
      state    = STATE.HIDDEN;
      velX     = 0;
      currentX = leftEdge();
      robot.position.x = currentX;
      hideCanvas();
      activeEl = null;
    }

    // ── IntersectionObserver ──────────────────────────────────
    const headingIds = [
      'heading-hero', 'heading-work', 'heading-capabilities',
      'heading-recognition', 'heading-experience', 'heading-contact'
    ];

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          // New heading visible: walk in (even if already idle somewhere else)
          startWalkIn(el);
        } else {
          if (activeEl === el && state !== STATE.HIDDEN) {
            startWalkOut();
          }
        }
      });
    }, { rootMargin: '-5% 0px -25% 0px', threshold: 0 });

    headingIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    // ── Update canvas position on scroll ─────────────────────
    // The canvas is fixed but the heading scrolls, so we need to
    // keep recomputing getBoundingClientRect() while active
    let scrollTick = false;
    document.addEventListener('scroll', () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => {
        if (activeEl && state !== STATE.HIDDEN) positionCanvasAtHeading(activeEl);
        scrollTick = false;
      });
    }, { passive: true });

    // ── Pointer tracking for head look-at ────────────────────
    // Mouse position in viewport pixels; converted to world space in render loop.
    // On touch devices, last touch position is used.
    let pointerVX = window.innerWidth  / 2;
    let pointerVY = window.innerHeight / 2;

    document.addEventListener('mousemove', e => {
      pointerVX = e.clientX;
      pointerVY = e.clientY;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (e.touches.length > 0) {
        pointerVX = e.touches[0].clientX;
        pointerVY = e.touches[0].clientY;
      }
    }, { passive: true });

    // ── Theme change ──────────────────────────────────────────
    document.addEventListener('themechange', () => {
      setTimeout(() => {
        const c = new THREE.Color(getAccentHex());
        matAccent.color.set(c); matAccent.emissive.set(c); matAccent.needsUpdate = true;
        matPupil.color.set(c);  matPupil.emissive.set(c);  matPupil.needsUpdate  = true;
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

      // Reduced motion: instant transitions, no walk cycle
      if (reducedMotion) {
        if (state === STATE.WALK_IN)  { arrivedIdle();   }
        if (state === STATE.WALK_OUT) { arrivedHidden(); }
        renderer.render(scene, camera);
        return;
      }

      // ── Spring step ───────────────────────────────────────
      springStep(dt);
      robot.position.x = currentX;

      // ── State transitions ─────────────────────────────────
      if (state === STATE.WALK_IN) {
        const close = Math.abs(currentX - idleX()) < 0.12 && Math.abs(velX) < 0.15;
        if (close) arrivedIdle();
      }
      if (state === STATE.WALK_OUT) {
        if (currentX > rightEdge() - 0.2) arrivedHidden();
      }

      // ── Walk cycle ────────────────────────────────────────
      const isWalking = Math.abs(velX) > 0.08;
      if (isWalking) walkT += dt * Math.abs(velX) * 3.0;

      const legSwing = isWalking ? LEG_AMP * Math.sin(walkT) : 0;
      const armSwing = isWalking ? ARM_AMP * Math.sin(walkT) : 0;
      const bob      = isWalking ? Math.abs(Math.sin(walkT)) * HEAD_BOB : 0;

      // Legs: opposite phase
      legPivL.rotation.x =  legSwing;
      legPivR.rotation.x = -legSwing;
      // Arms: contra-lateral (opposite to same-side leg)
      armPivL.rotation.x = -armSwing;
      armPivR.rotation.x =  armSwing;
      // Body rises on each step
      body.position.y = bob;

      // ── Idle / walk animations ────────────────────────────
      // ── Head look-at pointer (always, walking or idle) ──────
      // Convert pointer viewport position to world space.
      // Canvas is position:fixed, same size as viewport (CW x CH).
      // World X = ((pointerVX / CW) - 0.5) * viewW
      // World Y = (0.5 - (pointerVY - canvasScreenTop) / CH) * viewH
      // We only need the angle from robot head to pointer.
      {
        const canvasTop = parseFloat(canvas.style.top) || 0;
        const worldPX   = ((pointerVX / CW) - 0.5) * viewW;
        const worldPY   = (0.5 - (pointerVY - canvasTop) / CH) * viewH;

        // Head world position (approximate — robot group + headPiv offset)
        const headWorldX = robot.position.x;
        const headWorldY = robot.position.y + headPiv.position.y * robot.scale.y;

        const dx = worldPX - headWorldX;
        const dy = worldPY - headWorldY;

        // Target angles, clamped so neck doesn't overextend
        const maxYaw   = 0.55; // radians horizontal
        const maxPitch = 0.30; // radians vertical

        // atan2 gives raw angle; we clamp before applying
        const rawYaw   = Math.atan2(dx, 5);  // 5 = approx distance to camera plane
        const rawPitch = Math.atan2(dy, 5);

        const targetYaw   = Math.max(-maxYaw,   Math.min(maxYaw,   rawYaw));
        const targetPitch = Math.max(-maxPitch,  Math.min(maxPitch, rawPitch));

        // Lerp current head rotation toward target — smooth but responsive
        const lookLerp = isWalking ? 0.04 : 0.06;
        headPiv.rotation.y += (targetYaw   - headPiv.rotation.y) * lookLerp;
        headPiv.rotation.x += (targetPitch - headPiv.rotation.x) * lookLerp;
      }

      if (!isWalking) {
        // Gentle head tilt (z-axis, layered on top of look-at y/x)
        headPiv.rotation.z   = Math.sin(idleT * 0.85) * 0.04;
        headPiv.position.y   = 0.82 + Math.sin(idleT * 1.5) * 0.016;
        // Antenna sway
        antPiv.rotation.z    = Math.sin(idleT * 0.85 + 0.5) * 0.09;
        // Arms breathe
        armPivL.rotation.x   =  Math.sin(idleT * 0.85) * 0.045;
        armPivR.rotation.x   = -Math.sin(idleT * 0.85) * 0.045;
        // Subtle body sway
        robot.rotation.y     = 0.14 + Math.sin(idleT * 0.5) * 0.035;
        robot.rotation.x     = 0;
      } else {
        // Walking: head relatively steady, slight lean forward
        headPiv.rotation.z   = Math.sin(walkT * 0.5) * 0.018;
        headPiv.position.y   = 0.82 + bob * 0.6;
        antPiv.rotation.z    = Math.sin(walkT + 0.3) * 0.14;
        robot.rotation.x     = -0.055; // lean forward
      }

      // Visor glow always pulses
      matAccent.emissiveIntensity = 0.42 + 0.18 * Math.sin(idleT * 2.1);
      matPupil.emissiveIntensity  = 0.80 + 0.28 * Math.sin(idleT * 2.1 + 0.9);

      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);

    // ── Resize ────────────────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        CW = window.innerWidth;
        canvas.style.width = CW + 'px';
        renderer.setSize(CW, CH);
        syncCamera();
        // Reposition if active
        if (activeEl && state !== STATE.HIDDEN) positionCanvasAtHeading(activeEl);
      }, 150);
    }, { passive: true });

    window.addEventListener('unload', () => {
      cancelAnimationFrame(rafId);
      obs.disconnect();
    }, { once: true });
  }());

  /* ─────────────────────────────────────────────
     8b. MOBILE ROBOT (Canvas 2D — lightweight)
     ─────────────────────────────────────────────
     On mobile/tablet (<=1024px) the Three.js robot is hidden.
     This draws a flat cartoon robot using Canvas 2D API:
     - Zero WebGL overhead — runs at 60fps on any phone
     - Same character design: round head, visor, antenna, body
     - Idle: body bounce, antenna sway, visor pulse
     - Head looks toward last touch position
     - Fixed bottom-right corner, 56×72px
     - Reduced motion: static, no animation
  ───────────────────────────────────────────── */
  (function initMobileRobot() {
    if (window.innerWidth > 1024) return;

    const canvas = document.getElementById('robot-canvas-2d');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 56, H = 72;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    function getAccent() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      return v || '#2C6EAB';
    }
    function getBody() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
      return v || '#ffffff';
    }

    // Touch tracking
    let touchX = W / 2, touchY = H / 2;
    document.addEventListener('touchmove', e => {
      if (e.touches.length) {
        const rect = canvas.getBoundingClientRect();
        touchX = e.touches[0].clientX - rect.left;
        touchY = e.touches[0].clientY - rect.top;
      }
    }, { passive: true });
    // Also track mouse for when tested on desktop with 2D robot forced
    document.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      touchX = e.clientX - rect.left;
      touchY = e.clientY - rect.top;
    }, { passive: true });

    let idleT = 0;
    let lastNow = performance.now();
    let rafId;

    // Smooth head look vars
    let headLookX = 0, headLookY = 0; // offset in pixels

    function draw(now) {
      rafId = requestAnimationFrame(draw);
      const dt = Math.min((now - lastNow) / 1000, 0.05);
      lastNow = now;
      if (!reducedMotion) idleT += dt;

      ctx.clearRect(0, 0, W, H);

      const accent = getAccent();
      const cx = W / 2; // center X

      // Idle bounce: body moves up/down slightly
      const bounce = reducedMotion ? 0 : Math.sin(idleT * 1.8) * 1.2;

      // Body (torso)
      const bodyY = 38 + bounce;
      ctx.fillStyle = '#252836';
      ctx.beginPath();
      ctx.roundRect(cx - 12, bodyY - 8, 24, 18, 3);
      ctx.fill();

      // Chest stripe (accent)
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(cx - 8, bodyY - 4, 16, 4, 1.5);
      ctx.fill();

      // Hips
      ctx.fillStyle = '#2e3248';
      ctx.beginPath();
      ctx.roundRect(cx - 9, bodyY + 10, 18, 5, 2);
      ctx.fill();

      // Legs
      ctx.fillStyle = '#252836';
      ctx.beginPath(); ctx.roundRect(cx - 8, bodyY + 15, 6, 10, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx + 2,  bodyY + 15, 6, 10, 2); ctx.fill();

      // Feet
      ctx.fillStyle = '#3e4460';
      ctx.beginPath(); ctx.roundRect(cx - 9, bodyY + 24, 8, 3, 1); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx + 1,  bodyY + 24, 8, 3, 1); ctx.fill();

      // Arms
      ctx.fillStyle = '#252836';
      ctx.beginPath(); ctx.roundRect(cx - 16, bodyY - 5, 5, 12, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx + 11,  bodyY - 5, 5, 12, 2); ctx.fill();

      // HEAD — look-at applied via offset
      const headCY = 22 + bounce;
      // Target look offset clamped to ±4px
      const targetLookX = Math.max(-4, Math.min(4, (touchX - W/2) * 0.15));
      const targetLookY = Math.max(-3, Math.min(3, (touchY - headCY) * 0.08));
      headLookX += (targetLookX - headLookX) * 0.12;
      headLookY += (targetLookY - headLookY) * 0.12;

      const hx = cx + (reducedMotion ? 0 : headLookX);
      const hy = headCY + (reducedMotion ? 0 : headLookY);

      // Head body
      ctx.fillStyle = '#252836';
      ctx.beginPath();
      ctx.roundRect(hx - 14, hy - 12, 28, 22, 4);
      ctx.fill();

      // Ear nubs
      ctx.fillStyle = '#363c54';
      ctx.fillRect(hx - 16, hy - 6, 3, 10);
      ctx.fillRect(hx + 13,  hy - 6, 3, 10);

      // Visor frame (accent)
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(hx - 11, hy - 7, 22, 12, 2);
      ctx.fill();

      // Visor screen (dark)
      ctx.fillStyle = '#060a12';
      ctx.beginPath();
      ctx.roundRect(hx - 9, hy - 5, 18, 9, 1.5);
      ctx.fill();

      // Eyes
      const glowAlpha = reducedMotion ? 0.9 : 0.7 + 0.3 * Math.sin(idleT * 2.2);
      ctx.fillStyle = `rgba(220,240,255,${glowAlpha})`;
      ctx.beginPath(); ctx.arc(hx - 4, hy - 1, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(hx + 4, hy - 1, 2.5, 0, Math.PI*2); ctx.fill();

      // Pupils (accent, smaller)
      ctx.fillStyle = accent;
      ctx.globalAlpha = glowAlpha;
      ctx.beginPath(); ctx.arc(hx - 4, hy - 1, 1.4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(hx + 4, hy - 1, 1.4, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;

      // Cheeks
      ctx.fillStyle = 'rgba(238,112,112,0.38)';
      ctx.beginPath(); ctx.arc(hx - 9, hy + 3, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(hx + 9, hy + 3, 2.5, 0, Math.PI*2); ctx.fill();

      // ANTENNA
      const antSway = reducedMotion ? 0 : Math.sin(idleT * 1.8 + 0.5) * 2;
      ctx.strokeStyle = '#4a5060';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hx + 2, hy - 12);
      ctx.lineTo(hx + 2 + antSway, hy - 18);
      ctx.stroke();

      // Antenna tip
      ctx.fillStyle = accent;
      ctx.globalAlpha = glowAlpha;
      ctx.beginPath(); ctx.arc(hx + 2 + antSway, hy - 19.5, 2, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(draw);
    window.addEventListener('unload', () => cancelAnimationFrame(rafId), { once: true });

    // Update accent on theme change
    document.addEventListener('themechange', () => { /* accent read live from CSS var */ });
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
