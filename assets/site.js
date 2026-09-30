// Shared site behaviour: header/footer, language toggle, lead submission.
(function () {
  const cfg = window.SITE_CONFIG || {};
  const root = document.body.getAttribute('data-root') || '';

  // ---------- storage helpers (never throw) ----------
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  window.kpStore = store;

  // ---------- language ----------
  function detectLang() {
    const saved = store.get('kp-lang');
    if (saved === 'zh' || saved === 'en') return saved;
    return 'zh'; // Chinese first; visitors can switch and the choice is remembered
  }
  function applyLang(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
    document.querySelectorAll('[data-ph-zh]').forEach(el => {
      el.placeholder = lang === 'zh' ? el.dataset.phZh : el.dataset.phEn;
    });
    const t = document.querySelector('meta[name="kp-title-' + lang + '"]');
    if (t) document.title = t.content;
    const btn = document.getElementById('langBtn');
    if (btn) btn.textContent = lang === 'zh' ? 'EN' : '中文';
    document.dispatchEvent(new CustomEvent('kp:lang', { detail: lang }));
  }
  window.kpLang = () => document.documentElement.getAttribute('data-lang') || 'zh';
  window.kpSetLang = function (lang) { store.set('kp-lang', lang); applyLang(lang); };

  // ---------- header / footer ----------
  const page = document.body.getAttribute('data-page');
  const cur = p => (p === page ? ' aria-current="page"' : '');
  const header = document.getElementById('site-header');
  if (header) {
    header.outerHTML = `
<header class="site-header">
  <div class="container">
    <a class="brand" href="${root}index.html">
      <span class="brand-name">${cfg.advisorName || 'Kelly Chan'}</span>
      <span class="brand-sub"><span class="zh">${cfg.advisorTitleZh || ''}</span><span class="en">${cfg.advisorTitleEn || ''}</span></span>
    </a>
    <nav class="nav" id="siteNav">
      <a href="${root}briefs/index.html"${cur('briefs')}><span class="zh">市场简报</span><span class="en">Market Briefs</span></a>
      <a href="${root}calculator.html"${cur('calculator')}><span class="zh">退休计算器</span><span class="en">Retirement Calculator</span></a>
      <a href="${root}book.html"${cur('book')}><span class="zh">预约咨询</span><span class="en">Book a Consult</span></a>
    </nav>
    <button class="lang-btn" id="langBtn" type="button" aria-label="Switch language">EN</button>
    <button class="menu-btn" id="menuBtn" type="button" aria-label="Menu" aria-expanded="false">☰</button>
  </div>
</header>`;
    document.getElementById('langBtn').addEventListener('click', () => kpSetLang(kpLang() === 'zh' ? 'en' : 'zh'));
    const mb = document.getElementById('menuBtn');
    mb.addEventListener('click', () => {
      const nav = document.getElementById('siteNav');
      const open = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', open);
    });
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    const year = new Date().getFullYear();
    footer.outerHTML = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <strong style="color:var(--text)">${cfg.advisorName || 'Kelly Chan'}</strong> ·
        <span class="zh">${cfg.advisorTitleZh || ''}</span><span class="en">${cfg.advisorTitleEn || ''}</span>
        ${cfg.licenceLine ? `<div>${cfg.licenceLine}</div>` : ''}
        ${cfg.contactEmail ? `<div><a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a></div>` : ''}
      </div>
      <div>
        <a href="${root}briefs/index.html"><span class="zh">市场简报</span><span class="en">Briefs</span></a>
        <a href="${root}calculator.html"><span class="zh">退休计算器</span><span class="en">Calculator</span></a>
        <a href="${root}book.html"><span class="zh">预约咨询</span><span class="en">Book</span></a>
        <a href="${root}privacy.html"><span class="zh">隐私政策</span><span class="en">Privacy</span></a>
      </div>
    </div>
    <p class="disclaimer zh">本网站内容仅供一般教育及市场参考，不构成任何个性化投资、财务、税务或法律建议，亦不构成购买、出售、转换或持有任何特定基金的建议。信托基金及 PRS 涉及投资风险，包括可能的本金损失。过往表现并不代表未来表现。投资前请参阅相关基金最新的 Prospectus、PHS 及官方资料。</p>
    <p class="disclaimer en">Content on this site is for general education and market reference only. It is not personalised investment, financial, tax or legal advice, nor a recommendation to buy, sell, switch or hold any specific fund. Unit trust and PRS investments carry risk, including possible loss of principal. Past performance is not indicative of future performance. Please read the relevant fund's latest Prospectus, PHS and official materials before investing.</p>
    <p class="disclaimer">© ${year} ${cfg.advisorName || 'Kelly Chan'}</p>
  </div>
</footer>`;
  }

  // ---------- floating WhatsApp ----------
  if (cfg.whatsapp && !document.body.hasAttribute('data-no-wa')) {
    const a = document.createElement('a');
    a.className = 'wa-float';
    a.href = 'https://wa.me/' + cfg.whatsapp;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'WhatsApp');
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>';
    document.body.appendChild(a);
  }

  // ---------- lead submission ----------
  function utm() {
    const p = new URLSearchParams(location.search);
    const saved = JSON.parse(store.get('kp-utm') || '{}');
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => { if (p.get(k)) saved[k] = p.get(k); });
    store.set('kp-utm', JSON.stringify(saved));
    return saved;
  }
  const utmData = utm();

  // Returns { ok, demo }. Uses a "simple request" (text/plain) so Google Apps Script accepts it without CORS preflight.
  window.kpSubmitLead = async function (data) {
    const payload = Object.assign({
      submittedAt: new Date().toISOString(),
      lang: kpLang(),
      page: location.pathname,
      referrer: document.referrer || ''
    }, utmData, data);

    // remember contact details so other forms can prefill
    store.set('kp-contact', JSON.stringify({ name: data.name, phone: data.phone, email: data.email }));

    if (!cfg.leadEndpoint) {
      // Local preview: pretend it worked. Live site: refuse, so a real lead is never silently dropped.
      const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';
      console.warn('leadEndpoint is not set in assets/config.js — lead NOT saved', payload);
      return local ? { ok: true, demo: true } : { ok: false };
    }
    try {
      await fetch(cfg.leadEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return { ok: true, demo: false };
    } catch (e) {
      console.error(e);
      return { ok: false };
    }
  };

  window.kpSavedContact = function () {
    try { return JSON.parse(store.get('kp-contact') || 'null'); } catch (e) { return null; }
  };

  // Basic validators
  window.kpValid = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    phone: v => v.replace(/[^\d]/g, '').length >= 9 && v.replace(/[^\d]/g, '').length <= 15,
    name: v => v.trim().length >= 2
  };

  applyLang(detectLang());
})();
