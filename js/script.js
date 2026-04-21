/**
 * 家田内科 — script.js（V4）
 * デザインコンセプト：Aloha Lux（案C）
 * ヘッダースクロール検知 / ハンバーガーメニュー /
 * ヒーロースライドショー / スクロールフェードイン / 著作権年
 */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// スクロール位置に依存しない絶対Y座標（offsetParent チェーン累積）
const absoluteTop = el => {
  let y = 0;
  while (el) { y += el.offsetTop; el = el.offsetParent; }
  return y;
};


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
        const headBottom = absoluteTop(sectionHead) + sectionHead.offsetHeight;
        const detailsTop = absoluteTop(reserveDetails);
        const midpoint   = (headBottom + detailsTop) / 2;
        window.scrollTo({ top: midpoint - headerH, behavior: 'smooth' });

        const isLine = anchor.matches('.hbtn--line, .fixed-btn--line, .drawer-btn--em');
        const isWeb  = anchor.matches('.hbtn--web,  .fixed-btn--web,  .drawer-btn--gold');

        if (isLine || isWeb) {
          let fired = false;
          let scrollTimer;

          const highlight = () => {
            if (fired) return;
            fired = true;
            window.removeEventListener('scroll', onScroll);
            const cards = document.querySelectorAll('.reserve-cards .reserve-card');
            const card  = isLine ? cards[0] : cards[1];
            if (!card) return;
            card.classList.add('is-highlight');
            card.addEventListener('animationend', () => card.classList.remove('is-highlight'), { once: true });
          };

          const onScroll = () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(highlight, 150);
          };

          window.addEventListener('scroll', onScroll, { passive: true });
          setTimeout(highlight, 1800);
        }

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


/* ============================================================
   予約ハイライト：クロスページ対応（doctor.html / service-*.html）
   index.html#reserve へ遷移する予約ボタンのハイライト意図を
   sessionStorage 経由で引き渡す
   ============================================================ */
(function initCrossPageReserveHighlight() {
  const LINE_SEL = '.hbtn--line, .fixed-btn--line, .drawer-btn--em';
  const WEB_SEL  = '.hbtn--web,  .fixed-btn--web,  .drawer-btn--gold';

  // 【送信側】index.html 以外のページ：ボタンクリック時にタイプを記録
  // ブラウザの通常遷移（index.html#reserve）に任せてレイアウトを安定させる
  $$(`${LINE_SEL}, ${WEB_SEL}`).forEach(btn => {
    const href = btn.getAttribute('href') || '';
    if (!href.includes('index.html#reserve')) return;
    btn.addEventListener('click', () => {
      const type = btn.matches(LINE_SEL) ? 'line' : 'web';
      sessionStorage.setItem('reserveHighlight', type);
    });
  });

  // 【受信側】index.html：ページロード時に sessionStorage を確認してハイライト
  const pending = sessionStorage.getItem('reserveHighlight');
  if (!pending) return;
  sessionStorage.removeItem('reserveHighlight');

  const section = document.getElementById('reserve');
  if (!section) return;

  // ブラウザのハッシュスクロールが落ち着いてからmidpointを再計算して上書きする
  window.addEventListener('load', () => {
    setTimeout(() => {
      const sectionHead    = section.querySelector('.section-head');
      const reserveDetails = section.querySelector('.reserve-details');
      const headerH = document.querySelector('.site-header')?.offsetHeight ?? 0;
      if (!sectionHead || !reserveDetails) return;

      const headBottom = absoluteTop(sectionHead) + sectionHead.offsetHeight;
      const detailsTop = absoluteTop(reserveDetails);
      const midpoint   = (headBottom + detailsTop) / 2;
      window.scrollTo({ top: midpoint - headerH, behavior: 'smooth' });

      let fired = false;
      let scrollTimer;

      const highlight = () => {
        if (fired) return;
        fired = true;
        window.removeEventListener('scroll', onScroll);
        const cards = document.querySelectorAll('.reserve-cards .reserve-card');
        const card  = pending === 'line' ? cards[0] : cards[1];
        if (!card) return;
        card.classList.add('is-highlight');
        card.addEventListener('animationend', () => card.classList.remove('is-highlight'), { once: true });
      };

      const onScroll = () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(highlight, 150);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      setTimeout(highlight, 1800);
    }, 400);
  });
})();
