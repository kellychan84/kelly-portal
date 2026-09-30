// Renders insight cards from window.INSIGHTS (built by tools/build-index.ps1 from insights/data/*.json).
(function () {
  const TAGS = {
    my:          { zh: '🌏 马来西亚/东盟', en: '🌏 Malaysia/ASEAN', cls: 'it-my' },
    tech:        { zh: '💻 科技与AI',       en: '💻 Tech & AI',       cls: 'it-tech' },
    commodities: { zh: '🟡 黄金与原油',     en: '🟡 Gold & Oil',      cls: 'it-com' },
    fed:         { zh: '🏦 美联储与宏观',   en: '🏦 Fed & Macro',     cls: 'it-fed' },
    prs:         { zh: '🌱 PRS退休与养老',  en: '🌱 PRS & Retirement', cls: 'it-prs' }
  };
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bi = (o, cls) => `<span class="zh${cls ? ' ' + cls : ''}">${esc(o && (o.zh || o.en))}</span><span class="en${cls ? ' ' + cls : ''}">${esc(o && (o.en || o.zh))}</span>`;

  function when(iso) {
    const d = new Date(iso);
    // show Malaysia time regardless of the visitor's timezone
    const my = new Date(d.getTime() + (8 * 60 + d.getTimezoneOffset()) * 60000);
    const p = n => String(n).padStart(2, '0');
    return `${my.getFullYear()}-${p(my.getMonth() + 1)}-${p(my.getDate())} ${p(my.getHours())}:${p(my.getMinutes())}`;
  }
  function month(iso) { return when(iso).slice(0, 7); }

  window.kpInsights = {
    TAGS, month,
    all() { return (window.INSIGHTS || []).slice().sort((a, b) => b.time.localeCompare(a.time) || a.id.localeCompare(b.id)); },
    tagHtml(t) { const x = TAGS[t]; return x ? `<span class="itag ${x.cls}"><span class="zh">${x.zh}</span><span class="en">${x.en}</span></span>` : ''; },
    card(it, root) {
      root = root || '';
      const box = (icon, zh, en, o) => o && (o.zh || o.en) ? `
        <div class="ibox"><div class="ibox-h">🎯 <span class="zh">${zh}</span><span class="en">${en}</span></div><p>${bi(o)}</p></div>` : '';
      return `
<article class="icard" id="${esc(it.id)}">
  <div class="icard-top">
    <div class="itags">${(it.tags || []).map(t => this.tagHtml(t)).join('')}</div>
    <span class="itime">🕒 ${when(it.time)} <span class="zh">马来西亚时间</span><span class="en">MYT</span></span>
  </div>
  <h3 class="ititle">📌 ${bi(it.title)}</h3>
  <p class="ianalysis">💡 ${bi(it.analysis)}</p>
  <div class="iboxes">
    ${box('🎯', 'DDA 定期定额', 'DDA · Regular investing', it.dda)}
    ${box('🎯', 'Lump Sum 单笔投资', 'Lump sum', it.lump)}
    ${box('🎯', 'PRS 私人退休计划', 'PRS · Private Retirement Scheme', it.prs)}
  </div>
  <div class="ifoot">
    <a href="${esc(it.source && it.source.url)}" target="_blank" rel="noopener">🔗 <span class="zh">来源：</span><span class="en">Source: </span>${esc(it.source && it.source.name)} ↗</a>
    ${it.brief ? `<a href="${root}briefs/${esc(it.brief)}"><span class="zh">阅读完整简报 →</span><span class="en">Read the full brief →</span></a>` : ''}
  </div>
</article>`;
    },
    mini(it, root) {
      return `
<a class="imini" href="${root || ''}insights.html#${esc(it.id)}">
  <div class="itags">${(it.tags || []).slice(0, 2).map(t => this.tagHtml(t)).join('')}</div>
  <p class="imini-title">${bi(it.title)}</p>
  <span class="imini-time">${when(it.time)}</span>
</a>`;
    }
  };
})();
