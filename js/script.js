/**
 * 家田内科 — script.js（V4）
 * デザインコンセプト：Aloha Lux（案C）
 * ヘッダースクロール検知 / ハンバーガーメニュー /
 * ヒーロースライドショー / スクロールフェードイン / 著作権年
 */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ============================================================
   ヘッダー：スクロールで影を付与
   ============================================================ */
(function initHeaderScroll() {
  const header = $('#siteHeader');
  if (!header) return;

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ============================================================
   ハンバーガーメニュー（ドロワー開閉）
   ============================================================ */
(function initDrawer() {
  const btn     = $('#hamburger');
  const drawer  = $('#drawer');
  const overlay = $('#drawerOverlay');
  const links   = $$('.drawer-link, .drawer-btn', drawer);
  if (!btn || !drawer || !overlay) return;

  const openDrawer = () => {
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () =>
    drawer.classList.contains('is-open') ? closeDrawer() : openDrawer()
  );
  overlay.addEventListener('click', closeDrawer);
  links.forEach(l => l.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
      btn.focus();
    }
  });
})();


/* ============================================================
   ヒーロースライドショー（5秒間隔クロスフェード）
   ============================================================ */
(function initHeroSlider() {
  const slides = $$('.hero-slide');
  if (slides.length < 2) return;

  const INTERVAL = 5000;
  let current = 0;

  setInterval(() => {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }, INTERVAL);
})();


/* ============================================================
   スクロールフェードイン
   .js-fade の要素がビューポートに入ったらフェードイン
   ============================================================ */
(function initScrollFade() {
  const targets = $$('.js-fade');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    // 連続する要素を少しずつ遅延させて上品に見せる
    el.style.transitionDelay = `${Math.min(i * 0.08, 0.30)}s`;
    observer.observe(el);
  });
})();


/* ============================================================
   フッター著作権年（自動更新）
   ============================================================ */
(function initYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ============================================================
   予約テーブル：横スクロール終端でグラデーションを非表示
   ============================================================ */
(function initTableScrollHint() {
  const wraps = $$('.reserve-table-wrap');
  if (!wraps.length) return;

  wraps.forEach(wrap => {
    const scroller = wrap.querySelector('.reserve-table-scroll');
    if (!scroller) return;

    const update = () => {
      const atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2;
      wrap.classList.toggle('is-scrolled-end', atEnd);
    };

    // アコーディオンが開かれたときにも判定（details open直後はwidthが0の場合がある）
    const details = wrap.closest('details');
    if (details) {
      details.addEventListener('toggle', () => {
        if (details.open) requestAnimationFrame(update);
      });
    }

    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    requestAnimationFrame(update);
  });
})();


/* ============================================================
   スムーズスクロール補完（iOS 14以下向け）
   ============================================================ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;

      // #reserve：section-head 下端と reserve-details 上端の中点を
      // getBoundingClientRect() で動的に取得し、ヘッダー直下に配置する
      if (id === '#reserve') {
        e.preventDefault();
        const section    = document.getElementById('reserve');
        const sectionHead    = section?.querySelector('.section-head');
        const reserveDetails = section?.querySelector('.reserve-details');
        if (!section || !sectionHead || !reserveDetails) return;
        const headerH    = document.querySelector('.site-header')?.offsetHeight ?? 0;
        const headBottom = sectionHead.getBoundingClientRect().bottom + window.scrollY;
        const detailsTop = reserveDetails.getBoundingClientRect().top  + window.scrollY;
        const midpoint   = (headBottom + detailsTop) / 2;
        window.scrollTo({ top: midpoint - headerH, behavior: 'smooth' });
        return;
      }

      const target = document.querySelector(id);
      if (!target) return;
      const headerH = document.querySelector('.site-header')?.offsetHeight ?? 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
