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

            const addHighlight = (el) => {
              if (!el) return;
              el.classList.add('is-highlight');
              el.addEventListener('animationend', () => el.classList.remove('is-highlight'), { once: true });
            };

            const cards   = document.querySelectorAll('.reserve-cards .reserve-card');
            const summary = section.querySelector('.reserve-summary');
            addHighlight(isLine ? cards[0] : cards[1]);
            addHighlight(summary);
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
      e.preventDefault();
      const headerH = document.querySelector('.site-header')?.offsetHeight ?? 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   診療別予約方法：リスト生成 ＋ モーダル制御
   ============================================================ */
(function initReserveDetailModal() {

  const METHOD_COLORS = {
    'LINE予約':  '#2ABFBF',
    'WEB予約':   '#0E8080',
    '電話予約':  '#4A7FA8',
    '窓口受付':  '#6B8C8C',
  };

  const METHOD_SHORT = {
    'LINE予約': 'LINE',
    'WEB予約':  'WEB',
    '電話予約': '電話',
    '窓口受付': '窓口',
  };

  const STATUS_SYMBOL = { ok: '○', cond: '△', ng: '×' };
  const STATUS_LABEL  = { ok: '○ 対応', cond: '△ 条件あり', ng: '× 非対応' };

  const MENUS = [
    {
      id: 'ippan', color: '#2ABFBF', name: '一般診療',
      methods: [
        { name: 'LINE予約', s: 'ok',   time: '24時間',     period: '当日〜3ヶ月先' },
        { name: 'WEB予約',  s: 'ok',   time: '24時間',     period: '当日〜3ヶ月先' },
        { name: '電話予約', s: 'ok',   time: '受付時間内', period: '当日のみ' },
        { name: '窓口受付', s: 'ok',   time: '受付時間内', period: '当日のみ' },
      ],
      notice: '初診の方もお気軽にご予約ください。',
      condNotices: [],
      ctaLead: '以下ボタンよりお進みください',
      actions: [
        { label: 'LINE予約', type: 'line', url: 'https://line.me/R/ti/p/@986eslhe' },
        { label: 'WEB予約',  type: 'web',  url: 'https://ieda-naika.reserve.ne.jp' },
        { label: '電話',     type: 'tel',  url: 'tel:0568-82-4118' },
      ],
      telNote: '',
    },
    {
      id: 'kenshin', color: '#4A9B6A', name: '特定健診・がん検診',
      methods: [
        { name: 'LINE予約', s: 'ng',   time: '—',          period: '—' },
        { name: 'WEB予約',  s: 'ng',   time: '—',          period: '—' },
        { name: '電話予約', s: 'ok',   time: '受付時間内', period: '2週間〜3ヶ月先' },
        { name: '窓口受付', s: 'ok',   time: '受付時間内', period: '2週間〜3ヶ月先' },
      ],
      notice: '公費健診は実施期間・対象が定められています。詳細は受診時またはお問い合わせください。',
      condNotices: [],
      ctaLead: 'お電話または窓口でご予約ください',
      actions: [
        { label: '電話',     type: 'tel',  url: 'tel:0568-82-4118' },
      ],
      telNote: '',
    },
    {
      id: 'kigyou', color: '#B89840', name: '企業健診・就学前検診',
      methods: [
        { name: 'LINE予約', s: 'ok',   time: '24時間',     period: '当日〜3ヶ月先' },
        { name: 'WEB予約',  s: 'ok',   time: '24時間',     period: '当日〜3ヶ月先' },
        { name: '電話予約', s: 'ok',   time: '受付時間内', period: '当日のみ' },
        { name: '窓口受付', s: 'ok',   time: '受付時間内', period: '当日のみ' },
      ],
      notice: '指定項目・指定用紙があれば受診時にお知らせください。',
      condNotices: [],
      ctaLead: '以下ボタンよりお進みください',
      actions: [
        { label: 'LINE予約', type: 'line', url: 'https://line.me/R/ti/p/@986eslhe' },
        { label: 'WEB予約',  type: 'web',  url: 'https://ieda-naika.reserve.ne.jp' },
        { label: '電話',     type: 'tel',  url: 'tel:0568-82-4118' },
      ],
      telNote: '',
    },
    {
      id: 'jiyuu', color: '#7B6FA8', name: '自由診療', hidden: true,
      methods: [
        { name: 'LINE予約', s: 'ok',   time: '24時間',     period: '〜2ヶ月先' },
        { name: 'WEB予約',  s: 'ok',   time: '24時間',     period: '〜2ヶ月先' },
        { name: '電話予約', s: 'ng',   time: '—',          period: '—' },
        { name: '窓口受付', s: 'ng',   time: '—',          period: '—' },
      ],
      notice: '保険外診療のため費用は全額自己負担となります。予約はLINEまたはWEBをご利用ください。',
      condNotices: [],
      ctaLead: '以下ボタンよりお進みください',
      actions: [
        { label: 'LINE予約', type: 'line', url: 'https://line.me/R/ti/p/@986eslhe' },
        { label: 'WEB予約',  type: 'web',  url: 'https://ieda-naika.reserve.ne.jp' },
      ],
      telNote: '',
    },
    {
      id: 'vaccine', color: '#2A7FA8', name: 'ワクチン・予防接種',
      methods: [
        { name: 'LINE予約', s: 'ng',   time: '—',          period: '要相談' },
        { name: 'WEB予約',  s: 'ng',   time: '—',          period: '要相談' },
        { name: '電話予約', s: 'ok',   time: '受付時間内', period: '要相談' },
        { name: '窓口受付', s: 'ok',   time: '受付時間内', period: '要相談' },
      ],
      notice: 'ワクチン接種はお電話または窓口にてご予約ください。在庫確保のためお時間をいただくことがございます。',
      condNotices: [],
      ctaLead: 'お電話または窓口でご予約ください',
      actions: [
        { label: '電話',     type: 'tel',  url: 'tel:0568-82-4118' },
      ],
      telNote: '',
    },
    {
      id: 'sas', color: '#5A8FA8', name: '睡眠時無呼吸',
      methods: [
        { name: 'LINE予約', s: 'ok',   time: '24時間',     period: '当日〜3ヶ月先' },
        { name: 'WEB予約',  s: 'ok',   time: '24時間',     period: '当日〜3ヶ月先' },
        { name: '電話予約', s: 'ok',   time: '受付時間内', period: '当日のみ' },
        { name: '窓口受付', s: 'ok',   time: '受付時間内', period: '当日のみ' },
      ],
      notice: '初診の方もお気軽にご予約ください。',
      condNotices: [],
      ctaLead: '以下ボタンよりお進みください',
      actions: [
        { label: 'LINE予約', type: 'line', url: 'https://line.me/R/ti/p/@986eslhe' },
        { label: 'WEB予約',  type: 'web',  url: 'https://ieda-naika.reserve.ne.jp' },
        { label: '電話',     type: 'tel',  url: 'tel:0568-82-4118' },
      ],
      telNote: '',
    },
  ];

  /* --- リスト生成 --- */
  const list = document.getElementById('rdmList');
  if (!list) return;

  MENUS.filter(menu => !menu.hidden).forEach(menu => {
    const li = document.createElement('li');
    li.className = 'rdm-row';

    const badgesHtml = menu.methods.map(m => {
      const isNg  = m.s === 'ng';
      const style = isNg ? '' : `background:${METHOD_COLORS[m.name]};`;
      return `<span class="rdm-badge rdm-badge--${m.s}" style="${style}">${METHOD_SHORT[m.name]} ${STATUS_SYMBOL[m.s]}</span>`;
    }).join('');

    li.innerHTML = `
      <span class="rdm-dot" style="background:${menu.color}" aria-hidden="true"></span>
      <span class="rdm-name">${menu.name}</span>
      <span class="rdm-badges" aria-hidden="true">${badgesHtml}</span>
      <button class="rdm-detail-btn" data-id="${menu.id}" aria-label="${menu.name}の予約方法を詳しく見る">詳細</button>
    `;
    list.appendChild(li);
  });

  /* --- モーダル制御 --- */
  const overlay   = document.getElementById('rdmOverlay');
  const modalDot  = document.getElementById('rdmModalDot');
  const modalTitle = document.getElementById('rdmModalTitle');
  const modalBd   = document.getElementById('rdmModalBd');
  const closeBtn  = document.getElementById('rdmModalClose');
  if (!overlay) return;

  let lastFocused = null;

  const openModal = (menuId) => {
    const menu = MENUS.find(m => m.id === menuId);
    if (!menu) return;

    modalDot.style.background  = menu.color;
    modalTitle.textContent = menu.name;

    const hasCondition = menu.methods.some(m => m.s === 'cond') && menu.condNotices.length;

    const methodCardsHtml = menu.methods.map(m => {
      const color = m.s !== 'ng' ? METHOD_COLORS[m.name] : '';
      return `
        <li class="rdm-mcard ${m.s === 'ng' ? 'rdm-mcard--ng' : ''}">
          <div class="rdm-mcard-left">
            <span class="rdm-mcard-name"${color ? ` style="color:${color}"` : ''}>${m.name}</span>
            <div class="rdm-mcard-meta">
              <span class="rdm-mcard-meta-item"><span class="rdm-mcard-meta-label">受付</span>${m.time}</span>
              <span class="rdm-mcard-meta-item"><span class="rdm-mcard-meta-label">予約期間</span>${m.period}</span>
            </div>
          </div>
          <span class="rdm-mcard-status rdm-mcard-status--${m.s}">${STATUS_LABEL[m.s]}</span>
        </li>`;
    }).join('');

    const condHtml = hasCondition ? `
      <div class="rdm-cond-notice">
        <span class="rdm-cond-badge">△ 条件あり</span>
        ${menu.condNotices.map(n => `<p>${n.text}</p>`).join('')}
      </div>` : '';

    const telNoteHtml = menu.telNote
      ? `<p class="rdm-tel-note">${menu.telNote}</p>`
      : '';

    const actionsHtml = menu.actions.map(a => {
      const external = a.type !== 'tel' ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a class="rdm-cta-a rdm-cta-a--${a.type}" href="${a.url}"${external}>${a.label}</a>`;
    }).join('');

    modalBd.innerHTML = `
      <ul class="rdm-mcards">${methodCardsHtml}</ul>
      <div class="rdm-notices">
        <p class="rdm-notice">${menu.notice}</p>
        ${condHtml}
      </div>
      <div class="rdm-cta">
        <p class="rdm-cta-lead">${menu.ctaLead}</p>
        <div class="rdm-cta-btns">${actionsHtml}</div>
        ${telNoteHtml}
      </div>`;

    lastFocused = document.activeElement;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeModal = () => {
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.rdm-detail-btn');
    if (btn) openModal(btn.dataset.id);
  });

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') closeModal();
  });
})();


/* ============================================================
   予約ハイライト：クロスページ対応（doctor.html / service-*.html）
   index.html#reserve へ遷移する予約ボタンのハイライト意図を
   sessionStorage 経由で引き渡す
   ============================================================ */
(function initCrossPageReserveHighlight() {
  const LINE_SEL = '.hbtn--line, .fixed-btn--line, .drawer-btn--em, .svcpage-cta-btn--line';
  const WEB_SEL  = '.hbtn--web,  .fixed-btn--web,  .drawer-btn--gold, .svcpage-cta-btn--web';

  // 【送信側】index.html 以外のページ：タイプを記録しハッシュなしで遷移
  // （ブラウザの #reserve スムーズスクロールとの衝突を防ぐ）
  $$(`${LINE_SEL}, ${WEB_SEL}`).forEach(btn => {
    const href = btn.getAttribute('href') || '';
    if (!href.includes('index.html#reserve')) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // 診療案内ページの「予約へ進む」は警告バナーのみハイライト
      const isSvcPage = btn.matches('.svcpage-cta-btn--line, .svcpage-cta-btn--web');
      const type = isSvcPage ? 'summary' : (btn.matches(LINE_SEL) ? 'line' : 'web');
      sessionStorage.setItem('reserveHighlight', type);
      window.location.href = href.replace('#reserve', '');
    });
  });

  // 【受信側】index.html：ページロード時に sessionStorage を確認してハイライト
  const pending = sessionStorage.getItem('reserveHighlight');
  if (!pending) return;
  sessionStorage.removeItem('reserveHighlight');

  const section = document.getElementById('reserve');
  if (!section) return;

  // ハッシュなし遷移のためブラウザスクロールなし→fonts確定後に1回だけスムーズスクロール
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => {
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

        const addHighlight = (el) => {
          if (!el) return;
          el.classList.add('is-highlight');
          el.addEventListener('animationend', () => el.classList.remove('is-highlight'), { once: true });
        };

        const cards   = document.querySelectorAll('.reserve-cards .reserve-card');
        const summary = section.querySelector('.reserve-summary');
        if (pending !== 'summary') {
          addHighlight(pending === 'line' ? cards[0] : cards[1]);
        }
        addHighlight(summary);
      };

      const onScroll = () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(highlight, 150);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      setTimeout(highlight, 1800);
    });
  });
})();
