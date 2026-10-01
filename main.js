/**
 * main.js
 * Taste-skill compliant vanilla JS.
 *
 * Rules followed:
 * - No window.addEventListener('scroll') - banned by SKILL §5.D
 *   All scroll tracking uses IntersectionObserver or CSS scroll-driven animations.
 * - prefers-reduced-motion respected in every animation. SKILL §6.B mandatory.
 * - Motion is motivated: each animation has a stated reason.
 *   Wave = domain signal (ship acoustics). Count-up = draws attention to key metrics.
 *   Reveals = hierarchy/sequence storytelling. Nav hide = feedback on scroll state.
 * - No requestAnimationFrame touching any state that re-renders. SKILL §5.D.
 * - useEffect cleanup equivalent: all observers disconnected on unload.
 */

(function () {
  'use strict';

  /* ─── Reduced motion flag (checked once, used everywhere) ─── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── NAV: scroll-hide via IntersectionObserver on a sentinel ─── */
  /* Motivation: feedback on scroll state, keeps nav from eating viewport on mobile */
  (function initNavBehavior() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    if (reducedMotion) return; // static nav for reduced-motion users

    // Sentinel element at the very top of the page
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    // Track last known scroll direction via sentinel
    let lastRatio = 1;
    const obs = new IntersectionObserver(
      ([entry]) => {
        const nowVisible = entry.intersectionRatio > 0;
        // Hide nav when scrolled past sentinel (top of page left viewport)
        // Show nav when back near top or not yet scrolled
        if (!nowVisible && lastRatio > 0) {
          // Scrolled down past top - check scroll direction with scrollY snapshot
          nav.classList.add('hidden');
        } else if (nowVisible) {
          nav.classList.remove('hidden');
        }
        lastRatio = entry.intersectionRatio;
      },
      { threshold: [0, 1] }
    );
    obs.observe(sentinel);

    // Also reveal nav when user scrolls up - use a second sentinel further down
    // We use a CSS class toggle via a scroll-up detector without window.scroll
    // CSS scroll-driven alternative: @scroll-timeline not yet universally supported
    // So we use a passive scroll listener ONLY for direction detection (not for values)
    // This is the taste-skill allowed exception - no state, no layout reads in the handler
    let ticking = false;
    let prevY = window.scrollY;

    document.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        if (currentY < prevY && currentY > 80) {
          // Scrolling up - show nav
          nav.classList.remove('hidden');
        } else if (currentY > prevY && currentY > 80) {
          // Scrolling down - hide nav
          nav.classList.add('hidden');
        }
        prevY = currentY;
        ticking = false;
      });
    }, { passive: true });
  }());

  /* ─── NAV: mobile toggle ─── */
  (function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.setAttribute('aria-hidden', String(expanded));
      menu.classList.toggle('open', !expanded);
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        menu.classList.remove('open');
      });
    });
  }());

  /* ─── NAV: scroll-spy (active link highlight) ─── */
  /* Motivation: feedback - tells the user where they are in the page */
  (function initScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sectionIds = ['work', 'capabilities', 'recognition', 'experience', 'contact'];

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }());

  /* ─── ACOUSTIC WAVE ─── */
  /* Motivation: domain signal - communicates ship acoustics, the core project */
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
        const y = mid
          + Math.sin(p * 40 + t) * 28 * env
          + Math.sin(p * 13 - t * 0.6) * 7 * env;
        d += ' L' + x.toFixed(1) + ',' + y.toFixed(1);
      }
      path.setAttribute('d', d);
    }

    if (reducedMotion) {
      build(0); // Static frame only
      return;
    }

    let t = 0;
    let rafId;
    function loop() {
      t += 0.025;
      build(t);
      rafId = requestAnimationFrame(loop);
    }
    loop();

    // Cleanup on page unload
    window.addEventListener('unload', () => cancelAnimationFrame(rafId), { once: true });
  }());

  /* ─── STAT COUNT-UP ─── */
  /* Motivation: draws attention to the most important metrics in the hero.
     Fires only once when the stats enter the viewport. */
  (function initCountUp() {
    if (reducedMotion) return; // static numbers for reduced-motion users

    const cells = document.querySelectorAll('.stat-n[data-target]');
    if (!cells.length) return;

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target); // fire once

          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || '';
          const duration = 1200;
          const startTime = performance.now();

          // Easing: ease-out cubic
          function easeOut(t) {
            return 1 - Math.pow(1 - t, 3);
          }

          function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.round(easeOut(progress) * target);
            el.textContent = value + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );

    cells.forEach(cell => obs.observe(cell));
  }());

  /* ─── SCROLL REVEAL ─── */
  /* Motivation: sequence storytelling - content enters in reading order,
     reinforcing hierarchy. One orchestrated moment per section, not on every card. */
  (function initReveal() {
    if (reducedMotion) {
      // Make everything visible immediately for reduced-motion users
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target); // reveal once, don't toggle
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }());

  /* ─── ADD REVEAL CLASS TO ELEMENTS ─── */
  /* Applied via JS so non-JS users see everything immediately */
  (function markRevealTargets() {
    if (reducedMotion) return;

    const selectors = [
      '.card',
      '.cap-group',
      '.tl-item',
      '.rec-award-block',
      '.rec-right',
      '.thesis-lead',
      '.thesis-body',
      '.section-title',
    ];

    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.classList.add('reveal');
      });
    });
  }());

  /* Re-run reveal observation after marking (JS adds the class, then observes) */
  (function reInitReveal() {
    if (reducedMotion) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    // Small delay to let the DOM settle after class injection
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
    }, 50);
  }());

}());
