// Renders insight cards from window.INSIGHTS (built by tools/build-index.ps1 from insights/data/*.json).
(function () {
  const TAGS = {
    my:          { zh: '🌏 马来西亚/东盟', en: '🌏 Malaysia/ASEAN', cls: 'it-my' },
    us:          { zh: '🗽 美国',           en: '🗽 US',              cls: 'it-us' },
    cn:          { zh: '🏮 中国',           en: '🏮 China',           cls: 'it-cn' },
    tech:        { zh: '💻 科技与AI',       en: '💻 Tech & AI',       cls: 'it-tech' },
    commodities: { zh: '🟡 黄金与原油',     en: '🟡 Gold & Oil',      cls: 'it-com' },
    fed:         { zh: '🏦 美联储与宏观',   en: '🏦 Fed & Macro',     cls: 'it-fed' }
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

  // Box text sometimes repeats its own label ("🎯 DDA定期定额:..."); the heading already says it, so drop it.
  const LABEL_PREFIX = /^\s*🎯\s*[^:：。,，]{0,24}[:：]?\s*/u;
  const unlabel = o => o && { zh: String(o.zh || '').replace(LABEL_PREFIX, ''), en: String(o.en || '').replace(LABEL_PREFIX, '') };
  const BOXES = [
    ['dda',  '📈', '长期投资与DDA',     'Long-term investing & DDA'],
    ['prs',  '🌱', '退休规划与PRS',     'Retirement & PRS'],
    ['lump', '💰', 'Lump Sum 单笔投资', 'Lump sum'],
    ['bond', '🏦', '债券基金',          'Bond funds']
  ];
  const isSummary = it => it && it.kind === 'summary';

  window.kpInsights = {
    TAGS, month, isSummary,
    all() { return (window.INSIGHTS || []).slice().sort((a, b) => b.time.localeCompare(a.time) || a.id.localeCompare(b.id)); },
    news() { return this.all().filter(i => !isSummary(i)); },
    latestSummary() { return this.all().find(isSummary) || null; },
    tagHtml(t) { const x = TAGS[t]; return x ? `<span class="itag ${x.cls}"><span class="zh">${x.zh}</span><span class="en">${x.en}</span></span>` : ''; },
    card(it) {
      if (isSummary(it)) return this.summary(it);
      const boxes = BOXES.map(([k, icon, zh, en]) => {
        const o = unlabel(it[k]);
        return o && (o.zh || o.en) ? `
        <div class="ibox"><div class="ibox-h">${icon} <span class="zh">${zh}</span><span class="en">${en}</span></div><p>${bi(o)}</p></div>` : '';
      }).join('');
      return `
<article class="icard" id="${esc(it.id)}">
  <div class="icard-top">
    <div class="itags">${(it.tags || []).map(t => this.tagHtml(t)).join('')}</div>
    <span class="itime">🕒 ${when(it.time)} <span class="zh">马来西亚时间</span><span class="en">MYT</span></span>
  </div>
  <h3 class="ititle">📌 ${bi(it.title)}</h3>
  <p class="ianalysis">💡 ${bi(it.analysis)}</p>
  <div class="iboxes">${boxes}
  </div>
  <div class="ifoot">
    <a href="${esc(it.source && it.source.url)}" target="_blank" rel="noopener">🔗 <span class="zh">来源：</span><span class="en">Source: </span>${esc(it.source && it.source.name)} ↗</a>
  </div>
</article>`;
    },
    // "今日速览" — one per update: key figures, the 2–3 headlines, and Kelly's view.
    summary(it) {
      const figs = (it.figures || []).map(f => `
      <div class="sfig"><div class="sfig-l">${bi(f.label)}</div><div class="sfig-v">${esc(f.value)}</div>${f.change ? `<div class="sfig-c ${f.dir === 'up' ? 'up' : f.dir === 'dn' ? 'dn' : ''}">${typeof f.change === 'object' ? bi(f.change) : esc(f.change)}</div>` : ''}</div>`).join('');
      const pts = (it.points || []).map(p => `<li>${bi(p)}</li>`).join('');
      const srcs = (it.sources || (it.source ? [it.source] : [])).filter(s => s && s.url)
        .map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} ↗</a>`).join(' · ');
      return `
<article class="icard isum" id="${esc(it.id)}">
  <div class="icard-top">
    <span class="isum-badge">📰 <span class="zh">今日速览</span><span class="en">Market snapshot</span></span>
    <span class="itime">🕒 ${when(it.time)} <span class="zh">马来西亚时间</span><span class="en">MYT</span></span>
  </div>
  <h3 class="ititle">${bi(it.title)}</h3>
  ${figs ? `<div class="sfigs">${figs}</div>` : ''}
  ${pts ? `<ul class="spoints">${pts}</ul>` : ''}
  ${it.takeaway && (it.takeaway.zh || it.takeaway.en) ? `<div class="stake"><div class="stake-h">💬 <span class="zh">Kelly 的观点</span><span class="en">Kelly's view</span></div><p>${bi(it.takeaway)}</p></div>` : ''}
  ${srcs ? `<div class="ifoot"><span>🔗 <span class="zh">来源：</span><span class="en">Sources: </span>${srcs}</span></div>` : ''}
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
