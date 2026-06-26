/* =============================================
   PORTFOLIO — script.js
   Semua interaksi & animasi
   ============================================= */

'use strict';

// ─────────────────────────────────────────────
// 1. CUSTOM CURSOR  (non-touch only)
// ─────────────────────────────────────────────
(function initCursor() {
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX - 16) * 0.12;
    ringY += (mouseY - ringY - 16) * 0.12;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Enlarge on interactive elements
  const interactives = document.querySelectorAll('a, button, [role="button"], .project-card, .skill-category');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('is-hover');
      ring.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('is-hover');
      ring.classList.remove('is-hover');
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
})();


// ─────────────────────────────────────────────
// 2. NAVBAR — scroll shrink + active link
// ─────────────────────────────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 50);

    // Hide nav on scroll down, show on scroll up (mobile UX)
    if (window.innerWidth <= 768) {
      if (y > lastScroll && y > 120) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    lastScroll = y;
  }, { passive: true });

  // Active link highlight using IntersectionObserver
  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a, .mobile-nav a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navAnchors.forEach((a) => {
          const match = a.getAttribute('href') === '#' + entry.target.id;
          a.style.color = match ? 'var(--accent)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach((s) => sectionObserver.observe(s));
})();


// ─────────────────────────────────────────────
// 3. HAMBURGER MENU (mobile)
// ─────────────────────────────────────────────
(function initHamburger() {
  const btn       = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.mobile-nav a');
  if (!btn || !mobileNav) return;

  let isOpen = false;

  function toggleMenu(open) {
    isOpen = open;
    btn.classList.toggle('open', isOpen);
    mobileNav.classList.toggle('open', isOpen);
    // Prevent page scroll while menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
    btn.setAttribute('aria-expanded', isOpen);
  }

  btn.addEventListener('click', () => toggleMenu(!isOpen));

  // Close on link click
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) toggleMenu(false);
  });

  // Close when resizing to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isOpen) toggleMenu(false);
  });
})();


// ─────────────────────────────────────────────
// 4. SMOOTH SCROLL (for older browsers)
// ─────────────────────────────────────────────
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 70;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


// ─────────────────────────────────────────────
// 5. SCROLL REVEAL
// ─────────────────────────────────────────────
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // If the browser doesn't support IntersectionObserver, just show everything
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // fire only once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  });

  items.forEach((el) => revealObserver.observe(el));
})();


// ─────────────────────────────────────────────
// 6. ANIMATED COUNTER (stat numbers)
// ─────────────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (!counters.length) return;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseFloat(el.dataset.count);
      const dur = 1800; // ms
      const step = 16;
      const increment = end / (dur / step);
      let current = 0;

      const suffix = el.dataset.suffix || '';
      const timer  = setInterval(() => {
        current += increment;
        if (current >= end) {
          el.textContent = end % 1 === 0 ? end + suffix : end.toFixed(1) + suffix;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current) + suffix;
        }
      }, step);

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => counterObserver.observe(el));
})();


// ─────────────────────────────────────────────
// 7. TYPEWRITER EFFECT (hero role text)
// ─────────────────────────────────────────────
(function initTypewriter() {
  const el = document.getElementById('heroRole');
  if (!el) return;

  const roles   = el.dataset.roles ? el.dataset.roles.split('|') : null;
  if (!roles || roles.length < 2) return; // single role → no typewriter needed

  let roleIndex = 0;
  let charIndex = 0;
  let deleting  = false;
  const SPEED_TYPE   = 80;
  const SPEED_DELETE = 45;
  const PAUSE        = 2200;

  function type() {
    const current = roles[roleIndex];
    if (deleting) {
      el.textContent = current.slice(0, --charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(type, 400);
        return;
      }
    } else {
      el.textContent = current.slice(0, ++charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(type, PAUSE);
        return;
      }
    }
    setTimeout(type, deleting ? SPEED_DELETE : SPEED_TYPE);
  }

  // Start after hero animation
  setTimeout(type, 1400);
})();


// ─────────────────────────────────────────────
// 8. PARALLAX — hero background text (desktop)
// ─────────────────────────────────────────────
(function initParallax() {
  const bgText = document.querySelector('.hero-bg-text');
  if (!bgText) return;
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    bgText.style.transform = `translate(-50%, calc(-50% + ${y * 0.25}px))`;
  }, { passive: true });
})();


// ─────────────────────────────────────────────
// 9. PROJECT CARD — tilt effect (desktop)
// ─────────────────────────────────────────────
(function initTilt() {
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (isTouch) return;

  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 to 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `
        translateY(-8px)
        rotateX(${(-y * 6).toFixed(2)}deg)
        rotateY(${( x * 6).toFixed(2)}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


// ─────────────────────────────────────────────
// 10. BACK TO TOP BUTTON
// ─────────────────────────────────────────────
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.style.opacity  = window.scrollY > 500 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 500 ? 'auto' : 'none';
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// ─────────────────────────────────────────────
// 11. CURRENT YEAR in footer
// ─────────────────────────────────────────────
(function setYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();


// ─────────────────────────────────────────────
// 12. LAZY LOAD images (if any real photos)
// ─────────────────────────────────────────────
(function initLazyImages() {
  if (!('IntersectionObserver' in window)) return;

  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imgObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imgObserver.observe(img));
})();


// ─────────────────────────────────────────────
// 13. CONTACT FORM (jika ada)
// ─────────────────────────────────────────────
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn    = form.querySelector('[type="submit"]');
    const status = document.getElementById('formStatus');

    btn.textContent = 'Mengirim…';
    btn.disabled    = true;

    // Ganti URL ini dengan endpoint FormSpree / EmailJS / dsb.
    const ACTION = form.getAttribute('action') || '#';

    try {
      const res = await fetch(ACTION, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        if (status) {
          status.textContent = '✓ Pesan terkirim! Saya akan segera membalas.';
          status.style.color = 'var(--accent)';
        }
        form.reset();
      } else {
        throw new Error('Gagal mengirim');
      }
    } catch {
      if (status) {
        status.textContent = '✗ Gagal mengirim. Coba lagi atau hubungi lewat email.';
        status.style.color = '#f87171';
      }
    } finally {
      btn.textContent = 'Kirim Pesan';
      btn.disabled    = false;
    }
  });
})();