/* =========================================================
   BELLO MONTE — Main Script
   GSAP + ScrollTrigger + Canvas particles
   ========================================================= */

(function () {
  'use strict';

  // ---------- Helpers ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const isMobile = window.matchMedia('(max-width: 860px)').matches;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktopHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const waitGSAP = () =>
    new Promise((resolve) => {
      const check = () => {
        if (window.gsap && window.ScrollTrigger) resolve();
        else setTimeout(check, 50);
      };
      check();
    });

  // ---------- Loader ----------
  function initLoader() {
    const loader = $('#loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        if (window.startHeroAnimation) window.startHeroAnimation();
      }, 1800);
    });
    // Fallback
    setTimeout(() => {
      loader.classList.add('hidden');
      if (window.startHeroAnimation) window.startHeroAnimation();
    }, 4000);
  }

  // ---------- Custom Cursor ----------
  function initCursor() {
    if (!isDesktopHover) return;
    const cursor = $('#cursor');
    if (!cursor) return;
    const dot = $('.cursor__dot', cursor) || cursor;
    const ring = $('.cursor__ring');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    });

    function animateRing() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (ring) {
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
      }
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverables = $$('a, button, .detalle, .vida__item');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  // ---------- Progress Bar ----------
  function initProgress() {
    const fill = $('#progressFill');
    if (!fill) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const h = document.documentElement;
        const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
        fill.style.width = pct + '%';
        ticking = false;
      });
    }, { passive: true });
  }

  // ---------- Nav Scroll State ----------
  function initNav() {
    const nav = $('#nav');
    if (!nav) return;
    const burger = $('#navBurger');
    const menu = $('#mobileMenu');

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (window.scrollY > 80) nav.classList.add('is-scrolled');
        else nav.classList.remove('is-scrolled');
        ticking = false;
      });
    }, { passive: true });

    if (burger && menu) {
      burger.addEventListener('click', () => {
        const open = menu.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open);
        menu.setAttribute('aria-hidden', !open);
      });
      $$('a', menu).forEach((a) => {
        a.addEventListener('click', () => {
          menu.classList.remove('is-open');
          burger.classList.remove('is-open');
        });
      });
    }
  }

  // ---------- Smooth Scroll ----------
  function initSmoothScroll() {
    $$('[data-scroll]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = $(href);
        if (!target) return;
        e.preventDefault();
        if (window.gsap && window.ScrollToPlugin) {
          gsap.to(window, {
            duration: 1.4,
            scrollTo: { y: target, offsetY: 60 },
            ease: 'power3.inOut',
          });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ---------- Hero Particles (Canvas 2D) ----------
  function initParticles() {
    const canvas = $('#heroParticles');
    if (!canvas || isReduced) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
      w = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      h = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    }
    resize();
    window.addEventListener('resize', resize);

    const count = isMobile ? 25 : 55;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.3 - 0.1,
        o: Math.random() * 0.5 + 0.2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.o})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ---------- Hero Animation ----------
  function initHeroAnimation() {
    if (!window.gsap) return;
    const tl = gsap.timeline({ delay: 0.2 });
    tl.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
      .to('.hero__title .word', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.12,
      }, '-=0.5')
      .to('.hero__subtitle', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
      .to('.hero__actions', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
      .to('.hero__scroll', { opacity: 0.8, duration: 1, ease: 'power3.out' }, '-=0.5')
      .to('.hero__meta', { opacity: 0.7, duration: 1, ease: 'power3.out' }, '-=0.8');
  }
  window.startHeroAnimation = initHeroAnimation;

  // ---------- ScrollTrigger Scenes ----------
  async function initScrollAnimations() {
    await waitGSAP();
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Reveal lines in chapter titles
    $$('.chapter__title .reveal-line > *').forEach((el) => {
      gsap.to(el, {
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el.closest('.chapter__title'),
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // Reveal up
    $$('.reveal-up').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('is-visible'),
      });
    });

    // Reveal mask images
    $$('.reveal-mask').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('is-visible'),
      });
    });

    // Parallax en imágenes con data-speed
    $$('[data-speed]').forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 1;
      gsap.to(el, {
        y: () => (1 - speed) * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    // Hero parallax
    if (!isMobile) {
      gsap.to('.hero__media', {
        y: 150,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
      gsap.to('.hero__content', {
        y: -60,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Contadores
    $$('.stat__num').forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val) + suffix;
            },
          });
        },
      });
    });

    // Capítulos activos en nav
    const chapters = $$('[data-chapter]');
    chapters.forEach((section) => {
      const id = section.id;
      const chapterNum = section.dataset.chapter;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => setActiveChapter(id, chapterNum),
        onEnterBack: () => setActiveChapter(id, chapterNum),
      });
    });

    // WhatsApp flotante
    const wa = $('#whatsappFloat');
    if (wa) {
      ScrollTrigger.create({
        trigger: '.chapter',
        start: 'top 60%',
        onEnter: () => wa.classList.add('is-visible'),
      });
    }

    // Video naturaleza autoplay al entrar en viewport
    const natVideo = $('.naturaleza__video');
    if (natVideo) {
      ScrollTrigger.create({
        trigger: natVideo,
        start: 'top 70%',
        onEnter: () => natVideo.play().catch(() => {}),
        onLeave: () => natVideo.pause(),
        onEnterBack: () => natVideo.play().catch(() => {}),
        onLeaveBack: () => natVideo.pause(),
      });
    }
  }

  function setActiveChapter(id, num) {
    $$('.nav__chapters a').forEach((a) => {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }

  // ---------- Video Play Button ----------
  function initVideoControls() {
    const btn = $('#playNaturaleza');
    const video = $('.naturaleza__video');
    if (!btn || !video) return;
    btn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        btn.classList.add('is-playing');
      } else {
        video.pause();
        btn.classList.remove('is-playing');
      }
    });
    video.addEventListener('pause', () => btn.classList.remove('is-playing'));
    video.addEventListener('play', () => btn.classList.add('is-playing'));
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    document.body.style.overflow = 'hidden';
    initLoader();
    initCursor();
    initProgress();
    initNav();
    initSmoothScroll();
    initParticles();
    initVideoControls();
    initScrollAnimations();
  });
})();